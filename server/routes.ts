import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, loginSchema, forgotPasswordSchema, otpVerificationSchema, resetPasswordSchema } from "@shared/schema";
import bcrypt from "bcrypt";

export async function registerRoutes(app: Express): Promise<Server> {
  // Helper function to generate 6-digit OTP
  const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Register new user (create pending user and send OTP)
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists in main users table
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      const existingUsername = await storage.getUserByUsername(userData.username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username is already taken" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Create pending user (not saved to main users table yet)
      const pendingUser = await storage.createPendingUser({
        ...userData,
        password: hashedPassword,
      });

      // Generate OTP for email verification
      const otpCode = generateOTP();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minutes expiry

      await storage.createOtpCode({
        email: pendingUser.email,
        code: otpCode,
        expiresAt,
      });

      // Console-based OTP for development (Bug 3 fix)
      console.log(`🔐 SIGNUP OTP for ${pendingUser.email}: ${otpCode} (expires in 10 minutes)`);
      console.log(`📧 Email: ${pendingUser.email}`);
      console.log(`👤 Full Name: ${pendingUser.fullName}`);
      console.log(`🆔 Username: ${pendingUser.username}`);

      res.status(201).json({ 
        message: "Registration initiated. Please check your email for verification code.",
        email: pendingUser.email 
      });
    } catch (error: any) {
      if (error.errors) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Login user
  app.post("/api/auth/login", async (req, res) => {
    try {
      const loginData = loginSchema.parse(req.body);
      
      // Find user
      const user = await storage.getUserByEmail(loginData.email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(loginData.password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Admin users bypass verification check
      if (user.role === "admin") {
        (req.session as any).userId = user.id;
        const { password, ...userWithoutPassword } = user;
        console.log(`✅ Admin login successful for: ${user.email}`);
        return res.json({ 
          message: "Admin login successful",
          user: userWithoutPassword 
        });
      }

      // Regular users must verify their email and have VU domain
      if (!loginData.email.endsWith("@vu.edu.pk")) {
        return res.status(403).json({ 
          message: "Only VU students with @vu.edu.pk emails can access this portal"
        });
      }

      if (!user.isVerified) {
        return res.status(403).json({ 
          message: "Please verify your email before logging in",
          requiresVerification: true,
          email: user.email
        });
      }

      // Create session for regular users
      (req.session as any).userId = user.id;
      
      // Return user data (excluding password)
      const { password, ...userWithoutPassword } = user;
      console.log(`✅ Student login successful for: ${user.email}`);
      res.json({ 
        message: "Login successful",
        user: userWithoutPassword 
      });
    } catch (error: any) {
      if (error.errors) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // User profile setup
  app.post("/api/user/setup-profile", async (req: any, res) => {
    try {
      const { degreeProgram, subjects } = req.body;
      
      if (!degreeProgram || !subjects || !Array.isArray(subjects) || subjects.length === 0) {
        return res.status(400).json({ 
          message: "Degree program and at least one subject are required" 
        });
      }

      // Get user ID from session
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const updatedUser = await storage.updateUserProfile(userId, degreeProgram, subjects);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;
      
      res.json({ 
        message: "Profile setup completed successfully",
        user: userWithoutPassword 
      });
    } catch (error) {
      console.error("Error setting up profile:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Forgot password
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = forgotPasswordSchema.parse(req.body);
      
      // Check if user exists
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "No account found with this email address" });
      }

      // Generate OTP
      const otpCode = generateOTP();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minutes expiry

      await storage.createOtpCode({
        email,
        code: otpCode,
        expiresAt,
      });

      // Console-based OTP for development (Bug 3 fix)
      console.log(`🔐 PASSWORD RESET OTP for ${email}: ${otpCode} (expires in 10 minutes)`);

      res.json({ 
        message: "Password reset code sent to your email",
        email 
      });
    } catch (error: any) {
      if (error.errors) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Verify OTP and complete user registration
  app.post("/api/auth/verify-otp", async (req, res) => {
    try {
      const { email, code } = otpVerificationSchema.parse(req.body);
      
      // Find valid OTP
      const otpRecord = await storage.getValidOtpCode(email, code);
      if (!otpRecord) {
        return res.status(400).json({ message: "Invalid or expired verification code" });
      }

      // Check if there's a pending user for this email
      const pendingUser = await storage.getPendingUserByEmail(email);
      if (pendingUser) {
        // Mark OTP as used for signup flow
        await storage.markOtpAsUsed(otpRecord.id);

        // Create the actual user from pending user data
        const user = await storage.createUser({
          username: pendingUser.username,
          fullName: pendingUser.fullName,
          email: pendingUser.email,
          password: pendingUser.password,
        });

        // Set user as verified since they completed OTP
        await storage.updateUser(user.id, { isVerified: true });

        // Clean up pending user data
        await storage.deletePendingUser(email);

        console.log(`✅ User registration completed for: ${user.email}`);
        console.log(`👤 Username: ${user.username}, Full Name: ${user.fullName}`);

        res.json({ 
          message: "Email verified and registration completed successfully",
          user: { id: user.id, username: user.username, email: user.email, fullName: user.fullName }
        });
      } else {
        // For existing users (forgot password flow) - don't mark OTP as used yet
        const user = await storage.getUserByEmail(email);
        if (user) {
          res.json({ 
            message: "OTP verified successfully. You can now reset your password.",
            canResetPassword: true,
            email: user.email
          });
        } else {
          res.status(404).json({ message: "User not found" });
        }
      }
    } catch (error: any) {
      if (error.errors) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Resend OTP
  app.post("/api/auth/resend-otp", async (req, res) => {
    try {
      const { email } = forgotPasswordSchema.parse(req.body);
      
      // Check if user exists
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "No account found with this email address" });
      }

      // Generate new OTP
      const otpCode = generateOTP();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minutes expiry

      await storage.createOtpCode({
        email,
        code: otpCode,
        expiresAt,
      });

      // Console-based OTP for development (Bug 3 fix)
      console.log(`🔐 RESEND OTP for ${email}: ${otpCode} (expires in 10 minutes)`);

      res.json({ 
        message: "New verification code sent to your email",
        email 
      });
    } catch (error: any) {
      if (error.errors) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Cleanup expired OTPs periodically
  setInterval(async () => {
    await storage.cleanupExpiredOtps();
  }, 5 * 60 * 1000); // Every 5 minutes

  // Reset password after OTP verification
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { email, code, newPassword } = resetPasswordSchema.parse(req.body);
      
      // Check if OTP is still valid using the method that doesn't require unused status
      const otpRecord = await storage.checkOtpCodeValidity(email, code);
      if (!otpRecord) {
        return res.status(400).json({ message: "Invalid or expired verification code" });
      }

      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Update user password
      await storage.updateUser(user.id, { password: hashedPassword });

      // Mark OTP as used
      await storage.markOtpAsUsed(otpRecord.id);

      console.log(`🔐 Password reset successful for: ${user.email}`);

      res.json({ 
        message: "Password updated successfully. You can now log in with your new password."
      });
    } catch (error: any) {
      if (error.errors) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get current authenticated user
  app.get("/api/auth/user", async (req: any, res) => {
    try {
      if (!(req.session as any)?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUser((req.session as any).userId);
      if (!user) {
        req.session.destroy(() => {});
        return res.status(401).json({ message: "User not found" });
      }

      // Return user data (excluding password)
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Logout user
  app.post("/api/auth/logout", async (req: any, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}

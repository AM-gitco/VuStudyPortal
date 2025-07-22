import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, loginSchema, forgotPasswordSchema, otpVerificationSchema } from "@shared/schema";
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

      // Check if user is verified
      if (!user.isVerified) {
        return res.status(403).json({ 
          message: "Please verify your email before logging in",
          requiresVerification: true,
          email: user.email
        });
      }

      // Return user data (excluding password)
      const { password, ...userWithoutPassword } = user;
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

      // Mark OTP as used
      await storage.markOtpAsUsed(otpRecord.id);

      // Check if there's a pending user for this email
      const pendingUser = await storage.getPendingUserByEmail(email);
      if (pendingUser) {
        // Create the actual user from pending user data
        const user = await storage.createUser({
          username: pendingUser.username,
          fullName: pendingUser.fullName,
          email: pendingUser.email,
          password: pendingUser.password,
        });

        // Clean up pending user data
        await storage.deletePendingUser(email);

        console.log(`✅ User registration completed for: ${user.email}`);
        console.log(`👤 Username: ${user.username}, Full Name: ${user.fullName}`);

        res.json({ 
          message: "Email verified and registration completed successfully",
          user: { id: user.id, username: user.username, email: user.email, fullName: user.fullName }
        });
      } else {
        // For existing users (forgot password flow)
        const user = await storage.getUserByEmail(email);
        if (user) {
          await storage.updateUser(user.id, { isVerified: true });
          res.json({ message: "Email verified successfully" });
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

  const httpServer = createServer(app);
  return httpServer;
}

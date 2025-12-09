import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, loginSchema, forgotPasswordSchema, otpVerificationSchema, resetPasswordSchema } from "@shared/schema";
import bcrypt from "bcryptjs";
import { signToken, getAuthUserId } from "./auth";

// Extend Express Request to include userId
declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Auth middleware helper - now uses JWT
  const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    const userId = getAuthUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    req.userId = userId;
    next();
  };

  const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const userId = getAuthUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const user = await storage.getUser(userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    req.userId = userId;
    next();
  };

  // ================== AUTH ROUTES ==================

  app.post("/api/auth/signup", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);

      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      const existingUsername = await storage.getUserByUsername(userData.username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username is already taken" });
      }

      const hashedPassword = await bcrypt.hash(userData.password, 10);

      const pendingUser = await storage.createPendingUser({
        ...userData,
        password: hashedPassword,
      });

      const otpCode = generateOTP();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10);

      await storage.createOtpCode({
        email: pendingUser.email,
        code: otpCode,
        expiresAt,
      });

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

  app.post("/api/auth/login", async (req, res) => {
    try {
      const loginData = loginSchema.parse(req.body);

      const user = await storage.getUserByEmail(loginData.email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const isValidPassword = await bcrypt.compare(loginData.password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Generate JWT token
      const token = signToken(user.id);

      if (user.role === "admin") {
        const { password, ...userWithoutPassword } = user;
        console.log(`✅ Admin login successful for: ${user.email}`);
        return res.json({
          message: "Admin login successful",
          token,
          user: userWithoutPassword
        });
      }

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

      const { password, ...userWithoutPassword } = user;
      console.log(`✅ Student login successful for: ${user.email}`);
      res.json({
        message: "Login successful",
        token,
        user: userWithoutPassword
      });
    } catch (error: any) {
      if (error.errors) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/user/setup-profile", requireAuth, async (req: Request, res) => {
    try {
      const { degreeProgram, subjects } = req.body;

      if (!degreeProgram || !subjects || !Array.isArray(subjects) || subjects.length === 0) {
        return res.status(400).json({
          message: "Degree program and at least one subject are required"
        });
      }

      const userId = req.userId!;
      const updatedUser = await storage.updateUserProfile(userId, degreeProgram, subjects);

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

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

  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = forgotPasswordSchema.parse(req.body);

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "No account found with this email address" });
      }

      const otpCode = generateOTP();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10);

      await storage.createOtpCode({
        email,
        code: otpCode,
        expiresAt,
      });

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

  app.post("/api/auth/verify-otp", async (req, res) => {
    try {
      const { email, code } = otpVerificationSchema.parse(req.body);

      const otpRecord = await storage.getValidOtpCode(email, code);
      if (!otpRecord) {
        return res.status(400).json({ message: "Invalid or expired verification code" });
      }

      const pendingUser = await storage.getPendingUserByEmail(email);
      if (pendingUser) {
        await storage.markOtpAsUsed(otpRecord.id);

        const user = await storage.createUser({
          username: pendingUser.username,
          fullName: pendingUser.fullName,
          email: pendingUser.email,
          password: pendingUser.password,
        });

        await storage.updateUser(user.id, { isVerified: true });
        await storage.deletePendingUser(email);

        console.log(`✅ User registration completed for: ${user.email}`);
        console.log(`👤 Username: ${user.username}, Full Name: ${user.fullName}`);

        res.json({
          message: "Email verified and registration completed successfully",
          user: { id: user.id, username: user.username, email: user.email, fullName: user.fullName }
        });
      } else {
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

  app.post("/api/auth/resend-otp", async (req, res) => {
    try {
      const { email } = forgotPasswordSchema.parse(req.body);

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "No account found with this email address" });
      }

      const otpCode = generateOTP();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10);

      await storage.createOtpCode({
        email,
        code: otpCode,
        expiresAt,
      });

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

  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { email, code, newPassword } = resetPasswordSchema.parse(req.body);

      const otpRecord = await storage.checkOtpCodeValidity(email, code);
      if (!otpRecord) {
        return res.status(400).json({ message: "Invalid or expired verification code" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await storage.updateUser(user.id, { password: hashedPassword });
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

  app.get("/api/auth/user", async (req: Request, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/logout", async (req: Request, res) => {
    // With JWT, logout is handled client-side by removing the token
    res.json({ message: "Logged out successfully" });
  });

  // ================== ADMIN ROUTES ==================

  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ================== UPLOAD ROUTES ==================

  app.post("/api/uploads", requireAuth, async (req: Request, res) => {
    try {
      const { subject, uploadType, title, description, textContent, externalLink } = req.body;

      if (!subject || !uploadType || !title) {
        return res.status(400).json({ message: "Subject, upload type, and title are required" });
      }

      const upload = await storage.createUpload({
        userId: req.userId!,
        subject,
        uploadType,
        title,
        description,
        textContent,
        externalLink,
      });

      res.status(201).json(upload);
    } catch (error) {
      console.error("Error creating upload:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/uploads", async (req, res) => {
    try {
      const uploads = await storage.getAllUploads();
      res.json(uploads);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/uploads/my", requireAuth, async (req: Request, res) => {
    try {
      const uploads = await storage.getUploadsByUser(req.userId!);
      res.json(uploads);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/uploads/:id", async (req, res) => {
    try {
      const upload = await storage.getUpload(parseInt(req.params.id));
      if (!upload) {
        return res.status(404).json({ message: "Upload not found" });
      }
      res.json(upload);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/uploads/:id", requireAuth, async (req: Request, res) => {
    try {
      const id = parseInt(req.params.id);
      const upload = await storage.getUpload(id);

      if (!upload) {
        return res.status(404).json({ message: "Upload not found" });
      }

      const user = await storage.getUser(req.userId!);
      if (upload.userId !== req.userId && user?.role !== "admin") {
        return res.status(403).json({ message: "Not authorized to edit this upload" });
      }

      const updated = await storage.updateUpload(id, req.body);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/uploads/:id/approve", requireAdmin, async (req, res) => {
    try {
      const upload = await storage.approveUpload(parseInt(req.params.id));
      if (!upload) {
        return res.status(404).json({ message: "Upload not found" });
      }
      res.json(upload);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/uploads/:id", requireAuth, async (req: Request, res) => {
    try {
      const id = parseInt(req.params.id);
      const upload = await storage.getUpload(id);

      if (!upload) {
        return res.status(404).json({ message: "Upload not found" });
      }

      const user = await storage.getUser(req.userId!);
      if (upload.userId !== req.userId && user?.role !== "admin") {
        return res.status(403).json({ message: "Not authorized to delete this upload" });
      }

      await storage.deleteUpload(id);
      res.json({ message: "Upload deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ================== DISCUSSION ROUTES ==================

  app.post("/api/discussions", requireAuth, async (req: Request, res) => {
    try {
      const { content, subject } = req.body;

      if (!content) {
        return res.status(400).json({ message: "Content is required" });
      }

      const discussion = await storage.createDiscussion({
        userId: req.userId!,
        content,
        subject,
      });

      res.status(201).json(discussion);
    } catch (error) {
      console.error("Error creating discussion:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/discussions", async (req, res) => {
    try {
      const discussions = await storage.getAllDiscussions();
      res.json(discussions);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/discussions/my", requireAuth, async (req: Request, res) => {
    try {
      const discussions = await storage.getDiscussionsByUser(req.userId!);
      res.json(discussions);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/discussions/:id", async (req, res) => {
    try {
      const discussion = await storage.getDiscussion(parseInt(req.params.id));
      if (!discussion) {
        return res.status(404).json({ message: "Discussion not found" });
      }
      res.json(discussion);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/discussions/:id", requireAuth, async (req: Request, res) => {
    try {
      const id = parseInt(req.params.id);
      const discussion = await storage.getDiscussion(id);

      if (!discussion) {
        return res.status(404).json({ message: "Discussion not found" });
      }

      const user = await storage.getUser(req.userId!);
      if (discussion.userId !== req.userId && user?.role !== "admin") {
        return res.status(403).json({ message: "Not authorized to edit this discussion" });
      }

      const updated = await storage.updateDiscussion(id, req.body);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/discussions/:id/like", requireAuth, async (req, res) => {
    try {
      const discussion = await storage.likeDiscussion(parseInt(req.params.id));
      if (!discussion) {
        return res.status(404).json({ message: "Discussion not found" });
      }
      res.json(discussion);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/discussions/:id", requireAuth, async (req: Request, res) => {
    try {
      const id = parseInt(req.params.id);
      const discussion = await storage.getDiscussion(id);

      if (!discussion) {
        return res.status(404).json({ message: "Discussion not found" });
      }

      const user = await storage.getUser(req.userId!);
      if (discussion.userId !== req.userId && user?.role !== "admin") {
        return res.status(403).json({ message: "Not authorized to delete this discussion" });
      }

      await storage.deleteDiscussion(id);
      res.json({ message: "Discussion deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ================== ANNOUNCEMENT ROUTES ==================

  app.post("/api/announcements", requireAdmin, async (req: Request, res) => {
    try {
      const { title, content, isPinned } = req.body;

      if (!title || !content) {
        return res.status(400).json({ message: "Title and content are required" });
      }

      const announcement = await storage.createAnnouncement({
        userId: req.userId!,
        title,
        content,
      });

      // Auto-approve admin-created announcements
      const approved = await storage.approveAnnouncement(announcement.id);
      if (isPinned) {
        await storage.updateAnnouncement(announcement.id, { isPinned: true });
      }

      res.status(201).json(approved);
    } catch (error) {
      console.error("Error creating announcement:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/announcements", async (req, res) => {
    try {
      const announcements = await storage.getApprovedAnnouncements();
      res.json(announcements);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/announcements/all", requireAdmin, async (req, res) => {
    try {
      const announcements = await storage.getAllAnnouncements();
      res.json(announcements);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/announcements/:id/approve", requireAdmin, async (req, res) => {
    try {
      const announcement = await storage.approveAnnouncement(parseInt(req.params.id));
      if (!announcement) {
        return res.status(404).json({ message: "Announcement not found" });
      }
      res.json(announcement);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/announcements/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteAnnouncement(parseInt(req.params.id));
      res.json({ message: "Announcement deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ================== SOLUTION ROUTES ==================

  app.post("/api/solutions", requireAuth, async (req: Request, res) => {
    try {
      const { subject, solutionType, title, description, textContent, externalLink } = req.body;

      if (!subject || !solutionType || !title) {
        return res.status(400).json({ message: "Subject, solution type, and title are required" });
      }

      const solution = await storage.createSolution({
        userId: req.userId!,
        subject,
        solutionType,
        title,
        description,
        textContent,
        externalLink,
      });

      res.status(201).json(solution);
    } catch (error) {
      console.error("Error creating solution:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/solutions", async (req, res) => {
    try {
      const solutions = await storage.getAllSolutions();
      res.json(solutions);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/solutions/my", requireAuth, async (req: Request, res) => {
    try {
      const solutions = await storage.getSolutionsByUser(req.userId!);
      res.json(solutions);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/solutions/:id/vote", requireAuth, async (req, res) => {
    try {
      const solution = await storage.voteSolution(parseInt(req.params.id));
      if (!solution) {
        return res.status(404).json({ message: "Solution not found" });
      }
      res.json(solution);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/solutions/:id", requireAuth, async (req: Request, res) => {
    try {
      const id = parseInt(req.params.id);
      const solution = await storage.getSolution(id);

      if (!solution) {
        return res.status(404).json({ message: "Solution not found" });
      }

      const user = await storage.getUser(req.userId!);
      if (solution.userId !== req.userId && user?.role !== "admin") {
        return res.status(403).json({ message: "Not authorized to delete this solution" });
      }

      await storage.deleteSolution(id);
      res.json({ message: "Solution deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ================== BADGE ROUTES ==================

  app.get("/api/badges/my", requireAuth, async (req: Request, res) => {
    try {
      const badges = await storage.getBadgesByUser(req.userId!);
      res.json(badges);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/badges", async (req, res) => {
    try {
      const badges = await storage.getAllBadges();
      res.json(badges);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

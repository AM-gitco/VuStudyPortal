var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";
import session from "express-session";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  announcements: () => announcements,
  badges: () => badges,
  discussions: () => discussions,
  forgotPasswordSchema: () => forgotPasswordSchema,
  insertOtpSchema: () => insertOtpSchema,
  insertUserSchema: () => insertUserSchema,
  loginSchema: () => loginSchema,
  otpCodes: () => otpCodes,
  otpVerificationSchema: () => otpVerificationSchema,
  pendingUsers: () => pendingUsers,
  resetPasswordSchema: () => resetPasswordSchema,
  solutions: () => solutions,
  systemSettings: () => systemSettings,
  uploads: () => uploads,
  users: () => users
});
import { pgTable, text, serial, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("student"),
  isVerified: boolean("is_verified").default(false),
  degreeProgram: text("degree_program"),
  subjects: text("subjects").array(),
  createdAt: timestamp("created_at").defaultNow()
});
var pendingUsers = pgTable("pending_users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var otpCodes = pgTable("otp_codes", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  code: text("code").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  isUsed: boolean("is_used").default(false),
  createdAt: timestamp("created_at").defaultNow()
});
var insertUserSchema = createInsertSchema(users, {
  email: z.string().email().refine((email) => email.endsWith("@vu.edu.pk"), {
    message: "Email must be from @vu.edu.pk domain"
  }),
  password: z.string().min(8, "Password must be at least 8 characters")
}).pick({
  username: true,
  fullName: true,
  email: true,
  password: true
});
var loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required")
});
var resetPasswordSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6, "OTP must be 6 digits"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters")
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});
var forgotPasswordSchema = z.object({
  email: z.string().email().refine((email) => email.endsWith("@vu.edu.pk"), {
    message: "Email must be from @vu.edu.pk domain"
  })
});
var otpVerificationSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6, "OTP must be 6 digits")
});
var insertOtpSchema = createInsertSchema(otpCodes).pick({
  email: true,
  code: true,
  expiresAt: true
});
var uploads = pgTable("uploads", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").references(() => users.id),
  subject: text("subject").notNull(),
  uploadType: text("upload_type").notNull(),
  // handout, notes, guide, past_paper, guess_paper
  title: text("title").notNull(),
  description: text("description"),
  fileUrl: text("file_url"),
  textContent: text("text_content"),
  externalLink: text("external_link"),
  isApproved: boolean("is_approved").default(false),
  createdAt: timestamp("created_at").defaultNow()
});
var solutions = pgTable("solutions", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").references(() => users.id),
  subject: text("subject").notNull(),
  solutionType: text("solution_type").notNull(),
  // assignment, gdb, quiz
  title: text("title").notNull(),
  description: text("description"),
  fileUrl: text("file_url"),
  textContent: text("text_content"),
  externalLink: text("external_link"),
  helpfulVotes: integer("helpful_votes").default(0),
  isApproved: boolean("is_approved").default(false),
  createdAt: timestamp("created_at").defaultNow()
});
var discussions = pgTable("discussions", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").references(() => users.id),
  subject: text("subject"),
  content: text("content").notNull(),
  likes: integer("likes").default(0),
  helpfulVotes: integer("helpful_votes").default(0),
  createdAt: timestamp("created_at").defaultNow()
});
var announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").references(() => users.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  isApproved: boolean("is_approved").default(false),
  isPinned: boolean("is_pinned").default(false),
  createdAt: timestamp("created_at").defaultNow()
});
var badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").references(() => users.id),
  badgeType: text("badge_type").notNull(),
  // upload_contributor, helpful_solver, community_star
  earnedFor: text("earned_for"),
  // description of what earned the badge
  createdAt: timestamp("created_at").defaultNow()
});
var systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value"),
  updatedAt: timestamp("updated_at").defaultNow()
});

// server/storage.ts
import { eq, and, gt, desc, sql } from "drizzle-orm";

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import bcrypt from "bcryptjs";
var DatabaseStorage = class {
  constructor() {
    this.initializeAdminUser();
  }
  async initializeAdminUser() {
    const adminEmail = "abdulmannan32519@gmail.com";
    const existingAdmin = await this.getUserByEmail(adminEmail);
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("Mannamkhan@786", 10);
      await this.createAdminUser({
        username: "admin",
        fullName: "Admin User",
        email: adminEmail,
        password: hashedPassword
      });
      console.log("\u{1F527} Admin user initialized successfully");
      console.log(`\u{1F4E7} Admin Email: ${adminEmail}`);
    }
  }
  // User operations
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return user;
  }
  async getUserByUsername(username) {
    const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return user;
  }
  async getUserByEmail(email) {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return user;
  }
  async getAllUsers() {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values({
      ...insertUser,
      role: "student",
      isVerified: false
    }).returning();
    return user;
  }
  async createAdminUser(insertUser) {
    const [user] = await db.insert(users).values({
      ...insertUser,
      role: "admin",
      isVerified: true
    }).returning();
    return user;
  }
  async updateUser(id, updates) {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user;
  }
  async updateUserProfile(userId, degreeProgram, subjects) {
    return this.updateUser(userId, { degreeProgram, subjects });
  }
  // Pending user operations
  async createPendingUser(insertPendingUser) {
    await db.delete(pendingUsers).where(eq(pendingUsers.email, insertPendingUser.email));
    const [pendingUser] = await db.insert(pendingUsers).values(insertPendingUser).returning();
    return pendingUser;
  }
  async getPendingUserByEmail(email) {
    const [pendingUser] = await db.select().from(pendingUsers).where(eq(pendingUsers.email, email)).limit(1);
    return pendingUser;
  }
  async deletePendingUser(email) {
    await db.delete(pendingUsers).where(eq(pendingUsers.email, email));
  }
  // OTP operations
  async createOtpCode(insertOtp) {
    const [otp] = await db.insert(otpCodes).values({
      ...insertOtp,
      isUsed: false
    }).returning();
    return otp;
  }
  async getValidOtpCode(email, code) {
    const now = /* @__PURE__ */ new Date();
    const [otp] = await db.select().from(otpCodes).where(
      and(
        eq(otpCodes.email, email),
        eq(otpCodes.code, code),
        eq(otpCodes.isUsed, false),
        gt(otpCodes.expiresAt, now)
      )
    ).limit(1);
    return otp;
  }
  async checkOtpCodeValidity(email, code) {
    const now = /* @__PURE__ */ new Date();
    const [otp] = await db.select().from(otpCodes).where(
      and(
        eq(otpCodes.email, email),
        eq(otpCodes.code, code),
        gt(otpCodes.expiresAt, now)
      )
    ).limit(1);
    return otp;
  }
  async markOtpAsUsed(id) {
    await db.update(otpCodes).set({ isUsed: true }).where(eq(otpCodes.id, id));
  }
  async cleanupExpiredOtps() {
    const now = /* @__PURE__ */ new Date();
    await db.delete(otpCodes).where(sql`${otpCodes.expiresAt} <= ${now}`);
  }
  // Upload operations
  async createUpload(insertUpload) {
    const [upload] = await db.insert(uploads).values({
      ...insertUpload,
      isApproved: false
    }).returning();
    return upload;
  }
  async getUpload(id) {
    const [upload] = await db.select().from(uploads).where(eq(uploads.id, id)).limit(1);
    return upload;
  }
  async getAllUploads() {
    return await db.select().from(uploads).orderBy(desc(uploads.createdAt));
  }
  async getUploadsByUser(userId) {
    return await db.select().from(uploads).where(eq(uploads.userId, userId)).orderBy(desc(uploads.createdAt));
  }
  async getUploadsBySubject(subject) {
    return await db.select().from(uploads).where(eq(uploads.subject, subject)).orderBy(desc(uploads.createdAt));
  }
  async updateUpload(id, updates) {
    const [upload] = await db.update(uploads).set(updates).where(eq(uploads.id, id)).returning();
    return upload;
  }
  async deleteUpload(id) {
    await db.delete(uploads).where(eq(uploads.id, id));
  }
  async approveUpload(id) {
    return this.updateUpload(id, { isApproved: true });
  }
  // Discussion operations
  async createDiscussion(insertDiscussion) {
    const [discussion] = await db.insert(discussions).values({
      ...insertDiscussion,
      likes: 0,
      helpfulVotes: 0
    }).returning();
    return discussion;
  }
  async getDiscussion(id) {
    const [discussion] = await db.select().from(discussions).where(eq(discussions.id, id)).limit(1);
    return discussion;
  }
  async getAllDiscussions() {
    return await db.select().from(discussions).orderBy(desc(discussions.createdAt));
  }
  async getDiscussionsByUser(userId) {
    return await db.select().from(discussions).where(eq(discussions.userId, userId)).orderBy(desc(discussions.createdAt));
  }
  async updateDiscussion(id, updates) {
    const [discussion] = await db.update(discussions).set(updates).where(eq(discussions.id, id)).returning();
    return discussion;
  }
  async deleteDiscussion(id) {
    await db.delete(discussions).where(eq(discussions.id, id));
  }
  async likeDiscussion(id) {
    const discussion = await this.getDiscussion(id);
    if (!discussion) return void 0;
    return this.updateDiscussion(id, { likes: (discussion.likes || 0) + 1 });
  }
  // Announcement operations
  async createAnnouncement(insertAnnouncement) {
    const [announcement] = await db.insert(announcements).values({
      ...insertAnnouncement,
      isApproved: false,
      isPinned: false
    }).returning();
    return announcement;
  }
  async getAnnouncement(id) {
    const [announcement] = await db.select().from(announcements).where(eq(announcements.id, id)).limit(1);
    return announcement;
  }
  async getAllAnnouncements() {
    return await db.select().from(announcements).orderBy(desc(announcements.isPinned), desc(announcements.createdAt));
  }
  async getApprovedAnnouncements() {
    return await db.select().from(announcements).where(eq(announcements.isApproved, true)).orderBy(desc(announcements.isPinned), desc(announcements.createdAt));
  }
  async updateAnnouncement(id, updates) {
    const [announcement] = await db.update(announcements).set(updates).where(eq(announcements.id, id)).returning();
    return announcement;
  }
  async deleteAnnouncement(id) {
    await db.delete(announcements).where(eq(announcements.id, id));
  }
  async approveAnnouncement(id) {
    return this.updateAnnouncement(id, { isApproved: true });
  }
  // Solution operations
  async createSolution(insertSolution) {
    const [solution] = await db.insert(solutions).values({
      ...insertSolution,
      helpfulVotes: 0,
      isApproved: false
    }).returning();
    return solution;
  }
  async getSolution(id) {
    const [solution] = await db.select().from(solutions).where(eq(solutions.id, id)).limit(1);
    return solution;
  }
  async getAllSolutions() {
    return await db.select().from(solutions).orderBy(desc(solutions.createdAt));
  }
  async getSolutionsByUser(userId) {
    return await db.select().from(solutions).where(eq(solutions.userId, userId)).orderBy(desc(solutions.createdAt));
  }
  async getSolutionsBySubject(subject) {
    return await db.select().from(solutions).where(eq(solutions.subject, subject)).orderBy(desc(solutions.createdAt));
  }
  async updateSolution(id, updates) {
    const [solution] = await db.update(solutions).set(updates).where(eq(solutions.id, id)).returning();
    return solution;
  }
  async deleteSolution(id) {
    await db.delete(solutions).where(eq(solutions.id, id));
  }
  async approveSolution(id) {
    return this.updateSolution(id, { isApproved: true });
  }
  async voteSolution(id) {
    const solution = await this.getSolution(id);
    if (!solution) return void 0;
    return this.updateSolution(id, { helpfulVotes: (solution.helpfulVotes || 0) + 1 });
  }
  // Badge operations
  async createBadge(insertBadge) {
    const [badge] = await db.insert(badges).values(insertBadge).returning();
    return badge;
  }
  async getBadgesByUser(userId) {
    return await db.select().from(badges).where(eq(badges.userId, userId)).orderBy(desc(badges.createdAt));
  }
  async getAllBadges() {
    return await db.select().from(badges).orderBy(desc(badges.createdAt));
  }
};
var storage = new DatabaseStorage();

// server/routes.ts
import bcrypt2 from "bcryptjs";

// server/auth.ts
import jwt from "jsonwebtoken";
var JWT_SECRET = process.env.JWT_SECRET || "vu-portal-jwt-secret-change-in-production";
var JWT_EXPIRES_IN = "7d";
function signToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}
function getAuthUserId(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.substring(7);
  const payload = verifyToken(token);
  return payload?.userId ?? null;
}

// server/routes.ts
async function registerRoutes(app2) {
  const generateOTP = () => {
    return Math.floor(1e5 + Math.random() * 9e5).toString();
  };
  const requireAuth = (req, res, next) => {
    const userId = getAuthUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    req.userId = userId;
    next();
  };
  const requireAdmin = async (req, res, next) => {
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
  app2.post("/api/auth/signup", async (req, res) => {
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
      const hashedPassword = await bcrypt2.hash(userData.password, 10);
      const pendingUser = await storage.createPendingUser({
        ...userData,
        password: hashedPassword
      });
      const otpCode = generateOTP();
      const expiresAt = /* @__PURE__ */ new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10);
      await storage.createOtpCode({
        email: pendingUser.email,
        code: otpCode,
        expiresAt
      });
      console.log(`\u{1F510} SIGNUP OTP for ${pendingUser.email}: ${otpCode} (expires in 10 minutes)`);
      console.log(`\u{1F4E7} Email: ${pendingUser.email}`);
      console.log(`\u{1F464} Full Name: ${pendingUser.fullName}`);
      console.log(`\u{1F194} Username: ${pendingUser.username}`);
      res.status(201).json({
        message: "Registration initiated. Please check your email for verification code.",
        email: pendingUser.email
      });
    } catch (error) {
      if (error.errors) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const loginData = loginSchema.parse(req.body);
      const user = await storage.getUserByEmail(loginData.email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      const isValidPassword = await bcrypt2.compare(loginData.password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      const token = signToken(user.id);
      if (user.role === "admin") {
        const { password: password2, ...userWithoutPassword2 } = user;
        console.log(`\u2705 Admin login successful for: ${user.email}`);
        return res.json({
          message: "Admin login successful",
          token,
          user: userWithoutPassword2
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
      console.log(`\u2705 Student login successful for: ${user.email}`);
      res.json({
        message: "Login successful",
        token,
        user: userWithoutPassword
      });
    } catch (error) {
      if (error.errors) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/user/setup-profile", requireAuth, async (req, res) => {
    try {
      const { degreeProgram, subjects } = req.body;
      if (!degreeProgram || !subjects || !Array.isArray(subjects) || subjects.length === 0) {
        return res.status(400).json({
          message: "Degree program and at least one subject are required"
        });
      }
      const userId = req.userId;
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
  app2.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = forgotPasswordSchema.parse(req.body);
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "No account found with this email address" });
      }
      const otpCode = generateOTP();
      const expiresAt = /* @__PURE__ */ new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10);
      await storage.createOtpCode({
        email,
        code: otpCode,
        expiresAt
      });
      console.log(`\u{1F510} PASSWORD RESET OTP for ${email}: ${otpCode} (expires in 10 minutes)`);
      res.json({
        message: "Password reset code sent to your email",
        email
      });
    } catch (error) {
      if (error.errors) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/auth/verify-otp", async (req, res) => {
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
          password: pendingUser.password
        });
        await storage.updateUser(user.id, { isVerified: true });
        await storage.deletePendingUser(email);
        console.log(`\u2705 User registration completed for: ${user.email}`);
        console.log(`\u{1F464} Username: ${user.username}, Full Name: ${user.fullName}`);
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
    } catch (error) {
      if (error.errors) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/auth/resend-otp", async (req, res) => {
    try {
      const { email } = forgotPasswordSchema.parse(req.body);
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "No account found with this email address" });
      }
      const otpCode = generateOTP();
      const expiresAt = /* @__PURE__ */ new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10);
      await storage.createOtpCode({
        email,
        code: otpCode,
        expiresAt
      });
      console.log(`\u{1F510} RESEND OTP for ${email}: ${otpCode} (expires in 10 minutes)`);
      res.json({
        message: "New verification code sent to your email",
        email
      });
    } catch (error) {
      if (error.errors) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/auth/reset-password", async (req, res) => {
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
      const hashedPassword = await bcrypt2.hash(newPassword, 10);
      await storage.updateUser(user.id, { password: hashedPassword });
      await storage.markOtpAsUsed(otpRecord.id);
      console.log(`\u{1F510} Password reset successful for: ${user.email}`);
      res.json({
        message: "Password updated successfully. You can now log in with your new password."
      });
    } catch (error) {
      if (error.errors) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/auth/user", async (req, res) => {
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
  app2.post("/api/auth/logout", async (req, res) => {
    res.json({ message: "Logged out successfully" });
  });
  app2.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const users2 = await storage.getAllUsers();
      const usersWithoutPasswords = users2.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/uploads", requireAuth, async (req, res) => {
    try {
      const { subject, uploadType, title, description, textContent, externalLink } = req.body;
      if (!subject || !uploadType || !title) {
        return res.status(400).json({ message: "Subject, upload type, and title are required" });
      }
      const upload = await storage.createUpload({
        userId: req.userId,
        subject,
        uploadType,
        title,
        description,
        textContent,
        externalLink
      });
      res.status(201).json(upload);
    } catch (error) {
      console.error("Error creating upload:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/uploads", async (req, res) => {
    try {
      const uploads2 = await storage.getAllUploads();
      res.json(uploads2);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/uploads/my", requireAuth, async (req, res) => {
    try {
      const uploads2 = await storage.getUploadsByUser(req.userId);
      res.json(uploads2);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/uploads/:id", async (req, res) => {
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
  app2.patch("/api/uploads/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const upload = await storage.getUpload(id);
      if (!upload) {
        return res.status(404).json({ message: "Upload not found" });
      }
      const user = await storage.getUser(req.userId);
      if (upload.userId !== req.userId && user?.role !== "admin") {
        return res.status(403).json({ message: "Not authorized to edit this upload" });
      }
      const updated = await storage.updateUpload(id, req.body);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.patch("/api/uploads/:id/approve", requireAdmin, async (req, res) => {
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
  app2.delete("/api/uploads/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const upload = await storage.getUpload(id);
      if (!upload) {
        return res.status(404).json({ message: "Upload not found" });
      }
      const user = await storage.getUser(req.userId);
      if (upload.userId !== req.userId && user?.role !== "admin") {
        return res.status(403).json({ message: "Not authorized to delete this upload" });
      }
      await storage.deleteUpload(id);
      res.json({ message: "Upload deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/discussions", requireAuth, async (req, res) => {
    try {
      const { content, subject } = req.body;
      if (!content) {
        return res.status(400).json({ message: "Content is required" });
      }
      const discussion = await storage.createDiscussion({
        userId: req.userId,
        content,
        subject
      });
      res.status(201).json(discussion);
    } catch (error) {
      console.error("Error creating discussion:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/discussions", async (req, res) => {
    try {
      const discussions2 = await storage.getAllDiscussions();
      res.json(discussions2);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/discussions/my", requireAuth, async (req, res) => {
    try {
      const discussions2 = await storage.getDiscussionsByUser(req.userId);
      res.json(discussions2);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/discussions/:id", async (req, res) => {
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
  app2.patch("/api/discussions/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const discussion = await storage.getDiscussion(id);
      if (!discussion) {
        return res.status(404).json({ message: "Discussion not found" });
      }
      const user = await storage.getUser(req.userId);
      if (discussion.userId !== req.userId && user?.role !== "admin") {
        return res.status(403).json({ message: "Not authorized to edit this discussion" });
      }
      const updated = await storage.updateDiscussion(id, req.body);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/discussions/:id/like", requireAuth, async (req, res) => {
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
  app2.delete("/api/discussions/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const discussion = await storage.getDiscussion(id);
      if (!discussion) {
        return res.status(404).json({ message: "Discussion not found" });
      }
      const user = await storage.getUser(req.userId);
      if (discussion.userId !== req.userId && user?.role !== "admin") {
        return res.status(403).json({ message: "Not authorized to delete this discussion" });
      }
      await storage.deleteDiscussion(id);
      res.json({ message: "Discussion deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/announcements", requireAdmin, async (req, res) => {
    try {
      const { title, content, isPinned } = req.body;
      if (!title || !content) {
        return res.status(400).json({ message: "Title and content are required" });
      }
      const announcement = await storage.createAnnouncement({
        userId: req.userId,
        title,
        content
      });
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
  app2.get("/api/announcements", async (req, res) => {
    try {
      const announcements2 = await storage.getApprovedAnnouncements();
      res.json(announcements2);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/announcements/all", requireAdmin, async (req, res) => {
    try {
      const announcements2 = await storage.getAllAnnouncements();
      res.json(announcements2);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.patch("/api/announcements/:id/approve", requireAdmin, async (req, res) => {
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
  app2.delete("/api/announcements/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteAnnouncement(parseInt(req.params.id));
      res.json({ message: "Announcement deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/solutions", requireAuth, async (req, res) => {
    try {
      const { subject, solutionType, title, description, textContent, externalLink } = req.body;
      if (!subject || !solutionType || !title) {
        return res.status(400).json({ message: "Subject, solution type, and title are required" });
      }
      const solution = await storage.createSolution({
        userId: req.userId,
        subject,
        solutionType,
        title,
        description,
        textContent,
        externalLink
      });
      res.status(201).json(solution);
    } catch (error) {
      console.error("Error creating solution:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/solutions", async (req, res) => {
    try {
      const solutions2 = await storage.getAllSolutions();
      res.json(solutions2);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/solutions/my", requireAuth, async (req, res) => {
    try {
      const solutions2 = await storage.getSolutionsByUser(req.userId);
      res.json(solutions2);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/solutions/:id/vote", requireAuth, async (req, res) => {
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
  app2.delete("/api/solutions/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const solution = await storage.getSolution(id);
      if (!solution) {
        return res.status(404).json({ message: "Solution not found" });
      }
      const user = await storage.getUser(req.userId);
      if (solution.userId !== req.userId && user?.role !== "admin") {
        return res.status(403).json({ message: "Not authorized to delete this solution" });
      }
      await storage.deleteSolution(id);
      res.json({ message: "Solution deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/badges/my", requireAuth, async (req, res) => {
    try {
      const badges2 = await storage.getBadgesByUser(req.userId);
      res.json(badges2);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/badges", async (req, res) => {
    try {
      const badges2 = await storage.getAllBadges();
      res.json(badges2);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
var vite_config_default = defineConfig({
  plugins: [
    react()
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use(session({
  secret: process.env.SESSION_SECRET || "vu-portal-secret-key",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1e3
    // 24 hours
  }
}));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0"
  }, () => {
    log(`serving on port ${port}`);
  });
})();

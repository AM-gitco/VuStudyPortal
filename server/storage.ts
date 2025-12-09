import {
  users, otpCodes, pendingUsers, uploads, discussions, announcements, solutions, badges,
  type User, type InsertUser, type InsertOtp, type OtpCode, type PendingUser, type InsertPendingUser,
  type Upload, type InsertUpload, type Discussion, type InsertDiscussion,
  type Announcement, type InsertAnnouncement, type Solution, type InsertSolution,
  type Badge, type InsertBadge
} from "@shared/schema";
import { eq, and, gt, desc, sql } from "drizzle-orm";
import { db } from "./db";
import bcrypt from "bcryptjs";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createAdminUser(user: Omit<InsertUser, 'email'> & { email: string }): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  updateUserProfile(userId: number, degreeProgram: string, subjects: string[]): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;

  // Pending user operations
  createPendingUser(user: InsertPendingUser): Promise<PendingUser>;
  getPendingUserByEmail(email: string): Promise<PendingUser | undefined>;
  deletePendingUser(email: string): Promise<void>;

  // OTP operations
  createOtpCode(otp: InsertOtp): Promise<OtpCode>;
  getValidOtpCode(email: string, code: string): Promise<OtpCode | undefined>;
  checkOtpCodeValidity(email: string, code: string): Promise<OtpCode | undefined>;
  markOtpAsUsed(id: number): Promise<void>;
  cleanupExpiredOtps(): Promise<void>;

  // Upload operations
  createUpload(upload: InsertUpload): Promise<Upload>;
  getUpload(id: number): Promise<Upload | undefined>;
  getAllUploads(): Promise<Upload[]>;
  getUploadsByUser(userId: number): Promise<Upload[]>;
  getUploadsBySubject(subject: string): Promise<Upload[]>;
  updateUpload(id: number, updates: Partial<Upload>): Promise<Upload | undefined>;
  deleteUpload(id: number): Promise<void>;
  approveUpload(id: number): Promise<Upload | undefined>;

  // Discussion operations
  createDiscussion(discussion: InsertDiscussion): Promise<Discussion>;
  getDiscussion(id: number): Promise<Discussion | undefined>;
  getAllDiscussions(): Promise<Discussion[]>;
  getDiscussionsByUser(userId: number): Promise<Discussion[]>;
  updateDiscussion(id: number, updates: Partial<Discussion>): Promise<Discussion | undefined>;
  deleteDiscussion(id: number): Promise<void>;
  likeDiscussion(id: number): Promise<Discussion | undefined>;

  // Announcement operations
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  getAnnouncement(id: number): Promise<Announcement | undefined>;
  getAllAnnouncements(): Promise<Announcement[]>;
  getApprovedAnnouncements(): Promise<Announcement[]>;
  updateAnnouncement(id: number, updates: Partial<Announcement>): Promise<Announcement | undefined>;
  deleteAnnouncement(id: number): Promise<void>;
  approveAnnouncement(id: number): Promise<Announcement | undefined>;

  // Solution operations
  createSolution(solution: InsertSolution): Promise<Solution>;
  getSolution(id: number): Promise<Solution | undefined>;
  getAllSolutions(): Promise<Solution[]>;
  getSolutionsByUser(userId: number): Promise<Solution[]>;
  getSolutionsBySubject(subject: string): Promise<Solution[]>;
  updateSolution(id: number, updates: Partial<Solution>): Promise<Solution | undefined>;
  deleteSolution(id: number): Promise<void>;
  approveSolution(id: number): Promise<Solution | undefined>;
  voteSolution(id: number): Promise<Solution | undefined>;

  // Badge operations
  createBadge(badge: InsertBadge): Promise<Badge>;
  getBadgesByUser(userId: number): Promise<Badge[]>;
  getAllBadges(): Promise<Badge[]>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    // Initialize admin user on startup
    this.initializeAdminUser();
  }

  private async initializeAdminUser() {
    const adminEmail = "abdulmannan32519@gmail.com";
    const existingAdmin = await this.getUserByEmail(adminEmail);

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("Mannamkhan@786", 10);

      await this.createAdminUser({
        username: "admin",
        fullName: "Admin User",
        email: adminEmail,
        password: hashedPassword,
      });

      console.log("🔧 Admin user initialized successfully");
      console.log(`📧 Admin Email: ${adminEmail}`);
    }
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values({
      ...insertUser,
      role: "student",
      isVerified: false,
    }).returning();
    return user;
  }

  async createAdminUser(insertUser: Omit<InsertUser, 'email'> & { email: string }): Promise<User> {
    const [user] = await db.insert(users).values({
      ...insertUser,
      role: "admin",
      isVerified: true,
    }).returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user;
  }

  async updateUserProfile(userId: number, degreeProgram: string, subjects: string[]): Promise<User | undefined> {
    return this.updateUser(userId, { degreeProgram, subjects });
  }

  // Pending user operations
  async createPendingUser(insertPendingUser: InsertPendingUser): Promise<PendingUser> {
    // Delete any existing pending user with same email first
    await db.delete(pendingUsers).where(eq(pendingUsers.email, insertPendingUser.email));
    const [pendingUser] = await db.insert(pendingUsers).values(insertPendingUser).returning();
    return pendingUser;
  }

  async getPendingUserByEmail(email: string): Promise<PendingUser | undefined> {
    const [pendingUser] = await db.select().from(pendingUsers).where(eq(pendingUsers.email, email)).limit(1);
    return pendingUser;
  }

  async deletePendingUser(email: string): Promise<void> {
    await db.delete(pendingUsers).where(eq(pendingUsers.email, email));
  }

  // OTP operations
  async createOtpCode(insertOtp: InsertOtp): Promise<OtpCode> {
    const [otp] = await db.insert(otpCodes).values({
      ...insertOtp,
      isUsed: false,
    }).returning();
    return otp;
  }

  async getValidOtpCode(email: string, code: string): Promise<OtpCode | undefined> {
    const now = new Date();
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

  async checkOtpCodeValidity(email: string, code: string): Promise<OtpCode | undefined> {
    const now = new Date();
    const [otp] = await db.select().from(otpCodes).where(
      and(
        eq(otpCodes.email, email),
        eq(otpCodes.code, code),
        gt(otpCodes.expiresAt, now)
      )
    ).limit(1);
    return otp;
  }

  async markOtpAsUsed(id: number): Promise<void> {
    await db.update(otpCodes).set({ isUsed: true }).where(eq(otpCodes.id, id));
  }

  async cleanupExpiredOtps(): Promise<void> {
    const now = new Date();
    await db.delete(otpCodes).where(sql`${otpCodes.expiresAt} <= ${now}`);
  }

  // Upload operations
  async createUpload(insertUpload: InsertUpload): Promise<Upload> {
    const [upload] = await db.insert(uploads).values({
      ...insertUpload,
      isApproved: false,
    }).returning();
    return upload;
  }

  async getUpload(id: number): Promise<Upload | undefined> {
    const [upload] = await db.select().from(uploads).where(eq(uploads.id, id)).limit(1);
    return upload;
  }

  async getAllUploads(): Promise<Upload[]> {
    return await db.select().from(uploads).orderBy(desc(uploads.createdAt));
  }

  async getUploadsByUser(userId: number): Promise<Upload[]> {
    return await db.select().from(uploads).where(eq(uploads.userId, userId)).orderBy(desc(uploads.createdAt));
  }

  async getUploadsBySubject(subject: string): Promise<Upload[]> {
    return await db.select().from(uploads).where(eq(uploads.subject, subject)).orderBy(desc(uploads.createdAt));
  }

  async updateUpload(id: number, updates: Partial<Upload>): Promise<Upload | undefined> {
    const [upload] = await db.update(uploads).set(updates).where(eq(uploads.id, id)).returning();
    return upload;
  }

  async deleteUpload(id: number): Promise<void> {
    await db.delete(uploads).where(eq(uploads.id, id));
  }

  async approveUpload(id: number): Promise<Upload | undefined> {
    return this.updateUpload(id, { isApproved: true });
  }

  // Discussion operations
  async createDiscussion(insertDiscussion: InsertDiscussion): Promise<Discussion> {
    const [discussion] = await db.insert(discussions).values({
      ...insertDiscussion,
      likes: 0,
      helpfulVotes: 0,
    }).returning();
    return discussion;
  }

  async getDiscussion(id: number): Promise<Discussion | undefined> {
    const [discussion] = await db.select().from(discussions).where(eq(discussions.id, id)).limit(1);
    return discussion;
  }

  async getAllDiscussions(): Promise<Discussion[]> {
    return await db.select().from(discussions).orderBy(desc(discussions.createdAt));
  }

  async getDiscussionsByUser(userId: number): Promise<Discussion[]> {
    return await db.select().from(discussions).where(eq(discussions.userId, userId)).orderBy(desc(discussions.createdAt));
  }

  async updateDiscussion(id: number, updates: Partial<Discussion>): Promise<Discussion | undefined> {
    const [discussion] = await db.update(discussions).set(updates).where(eq(discussions.id, id)).returning();
    return discussion;
  }

  async deleteDiscussion(id: number): Promise<void> {
    await db.delete(discussions).where(eq(discussions.id, id));
  }

  async likeDiscussion(id: number): Promise<Discussion | undefined> {
    const discussion = await this.getDiscussion(id);
    if (!discussion) return undefined;
    return this.updateDiscussion(id, { likes: (discussion.likes || 0) + 1 });
  }

  // Announcement operations
  async createAnnouncement(insertAnnouncement: InsertAnnouncement): Promise<Announcement> {
    const [announcement] = await db.insert(announcements).values({
      ...insertAnnouncement,
      isApproved: false,
      isPinned: false,
    }).returning();
    return announcement;
  }

  async getAnnouncement(id: number): Promise<Announcement | undefined> {
    const [announcement] = await db.select().from(announcements).where(eq(announcements.id, id)).limit(1);
    return announcement;
  }

  async getAllAnnouncements(): Promise<Announcement[]> {
    return await db.select().from(announcements).orderBy(desc(announcements.isPinned), desc(announcements.createdAt));
  }

  async getApprovedAnnouncements(): Promise<Announcement[]> {
    return await db.select().from(announcements)
      .where(eq(announcements.isApproved, true))
      .orderBy(desc(announcements.isPinned), desc(announcements.createdAt));
  }

  async updateAnnouncement(id: number, updates: Partial<Announcement>): Promise<Announcement | undefined> {
    const [announcement] = await db.update(announcements).set(updates).where(eq(announcements.id, id)).returning();
    return announcement;
  }

  async deleteAnnouncement(id: number): Promise<void> {
    await db.delete(announcements).where(eq(announcements.id, id));
  }

  async approveAnnouncement(id: number): Promise<Announcement | undefined> {
    return this.updateAnnouncement(id, { isApproved: true });
  }

  // Solution operations
  async createSolution(insertSolution: InsertSolution): Promise<Solution> {
    const [solution] = await db.insert(solutions).values({
      ...insertSolution,
      helpfulVotes: 0,
      isApproved: false,
    }).returning();
    return solution;
  }

  async getSolution(id: number): Promise<Solution | undefined> {
    const [solution] = await db.select().from(solutions).where(eq(solutions.id, id)).limit(1);
    return solution;
  }

  async getAllSolutions(): Promise<Solution[]> {
    return await db.select().from(solutions).orderBy(desc(solutions.createdAt));
  }

  async getSolutionsByUser(userId: number): Promise<Solution[]> {
    return await db.select().from(solutions).where(eq(solutions.userId, userId)).orderBy(desc(solutions.createdAt));
  }

  async getSolutionsBySubject(subject: string): Promise<Solution[]> {
    return await db.select().from(solutions).where(eq(solutions.subject, subject)).orderBy(desc(solutions.createdAt));
  }

  async updateSolution(id: number, updates: Partial<Solution>): Promise<Solution | undefined> {
    const [solution] = await db.update(solutions).set(updates).where(eq(solutions.id, id)).returning();
    return solution;
  }

  async deleteSolution(id: number): Promise<void> {
    await db.delete(solutions).where(eq(solutions.id, id));
  }

  async approveSolution(id: number): Promise<Solution | undefined> {
    return this.updateSolution(id, { isApproved: true });
  }

  async voteSolution(id: number): Promise<Solution | undefined> {
    const solution = await this.getSolution(id);
    if (!solution) return undefined;
    return this.updateSolution(id, { helpfulVotes: (solution.helpfulVotes || 0) + 1 });
  }

  // Badge operations
  async createBadge(insertBadge: InsertBadge): Promise<Badge> {
    const [badge] = await db.insert(badges).values(insertBadge).returning();
    return badge;
  }

  async getBadgesByUser(userId: number): Promise<Badge[]> {
    return await db.select().from(badges).where(eq(badges.userId, userId)).orderBy(desc(badges.createdAt));
  }

  async getAllBadges(): Promise<Badge[]> {
    return await db.select().from(badges).orderBy(desc(badges.createdAt));
  }
}

export const storage = new DatabaseStorage();

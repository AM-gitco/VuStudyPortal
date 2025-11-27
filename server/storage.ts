import { 
  users, otpCodes, pendingUsers, uploads, discussions, announcements, solutions, badges,
  type User, type InsertUser, type InsertOtp, type OtpCode, type PendingUser, type InsertPendingUser,
  type Upload, type InsertUpload, type Discussion, type InsertDiscussion,
  type Announcement, type InsertAnnouncement, type Solution, type InsertSolution,
  type Badge, type InsertBadge
} from "@shared/schema";
import { eq, and, gt } from "drizzle-orm";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private pendingUsers: Map<string, PendingUser>;
  private otpCodes: Map<number, OtpCode>;
  private uploads: Map<number, Upload>;
  private discussions: Map<number, Discussion>;
  private announcements: Map<number, Announcement>;
  private solutions: Map<number, Solution>;
  private badges: Map<number, Badge>;
  private currentUserId: number;
  private currentPendingUserId: number;
  private currentOtpId: number;
  private currentUploadId: number;
  private currentDiscussionId: number;
  private currentAnnouncementId: number;
  private currentSolutionId: number;
  private currentBadgeId: number;

  constructor() {
    this.users = new Map();
    this.pendingUsers = new Map();
    this.otpCodes = new Map();
    this.uploads = new Map();
    this.discussions = new Map();
    this.announcements = new Map();
    this.solutions = new Map();
    this.badges = new Map();
    this.currentUserId = 1;
    this.currentPendingUserId = 1;
    this.currentOtpId = 1;
    this.currentUploadId = 1;
    this.currentDiscussionId = 1;
    this.currentAnnouncementId = 1;
    this.currentSolutionId = 1;
    this.currentBadgeId = 1;
    
    this.initializeAdminUser();
  }

  private async initializeAdminUser() {
    const adminEmail = "abdulmannan32519@gmail.com";
    const existingAdmin = await this.getUserByEmail(adminEmail);
    
    if (!existingAdmin) {
      const bcrypt = await import("bcrypt");
      const hashedPassword = await bcrypt.hash("Mannamkhan@786", 10);
      
      await this.createAdminUser({
        username: "admin",
        fullName: "Admin User",
        email: adminEmail,
        password: hashedPassword,
      });
      
      console.log("🔧 Admin user initialized successfully");
      console.log(`📧 Admin Email: ${adminEmail}`);
      console.log(`🔑 Admin Password: Mannamkhan@786`);
    }
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      role: "student",
      isVerified: false,
      degreeProgram: null,
      subjects: null,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async createAdminUser(insertUser: Omit<InsertUser, 'email'> & { email: string }): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      role: "admin",
      isVerified: true,
      degreeProgram: null,
      subjects: null,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async updateUserProfile(userId: number, degreeProgram: string, subjects: string[]): Promise<User | undefined> {
    return this.updateUser(userId, { degreeProgram, subjects });
  }

  // Pending user operations
  async createPendingUser(insertPendingUser: InsertPendingUser): Promise<PendingUser> {
    const id = this.currentPendingUserId++;
    const pendingUser: PendingUser = {
      ...insertPendingUser,
      id,
      createdAt: new Date(),
    };
    this.pendingUsers.set(pendingUser.email, pendingUser);
    return pendingUser;
  }

  async getPendingUserByEmail(email: string): Promise<PendingUser | undefined> {
    return this.pendingUsers.get(email);
  }

  async deletePendingUser(email: string): Promise<void> {
    this.pendingUsers.delete(email);
  }

  // OTP operations
  async createOtpCode(insertOtp: InsertOtp): Promise<OtpCode> {
    const id = this.currentOtpId++;
    const otpCode: OtpCode = {
      ...insertOtp,
      id,
      isUsed: false,
      createdAt: new Date(),
    };
    this.otpCodes.set(id, otpCode);
    return otpCode;
  }

  async getValidOtpCode(email: string, code: string): Promise<OtpCode | undefined> {
    const now = new Date();
    return Array.from(this.otpCodes.values()).find(
      (otp) => 
        otp.email === email && 
        otp.code === code && 
        !otp.isUsed && 
        otp.expiresAt > now
    );
  }

  async checkOtpCodeValidity(email: string, code: string): Promise<OtpCode | undefined> {
    const now = new Date();
    return Array.from(this.otpCodes.values()).find(
      (otp) => otp.email === email && otp.code === code && otp.expiresAt > now,
    );
  }

  async markOtpAsUsed(id: number): Promise<void> {
    const otp = this.otpCodes.get(id);
    if (otp) {
      this.otpCodes.set(id, { ...otp, isUsed: true });
    }
  }

  async cleanupExpiredOtps(): Promise<void> {
    const now = new Date();
    for (const [id, otp] of Array.from(this.otpCodes.entries())) {
      if (otp.expiresAt <= now) {
        this.otpCodes.delete(id);
      }
    }
  }

  // Upload operations
  async createUpload(insertUpload: InsertUpload): Promise<Upload> {
    const id = this.currentUploadId++;
    const upload: Upload = {
      id,
      userId: insertUpload.userId ?? 0,
      subject: insertUpload.subject,
      uploadType: insertUpload.uploadType,
      title: insertUpload.title,
      description: insertUpload.description ?? null,
      fileUrl: insertUpload.fileUrl ?? null,
      textContent: insertUpload.textContent ?? null,
      externalLink: insertUpload.externalLink ?? null,
      isApproved: false,
      createdAt: new Date(),
    };
    this.uploads.set(id, upload);
    return upload;
  }

  async getUpload(id: number): Promise<Upload | undefined> {
    return this.uploads.get(id);
  }

  async getAllUploads(): Promise<Upload[]> {
    return Array.from(this.uploads.values()).sort((a, b) => 
      (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }

  async getUploadsByUser(userId: number): Promise<Upload[]> {
    return Array.from(this.uploads.values())
      .filter(upload => upload.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getUploadsBySubject(subject: string): Promise<Upload[]> {
    return Array.from(this.uploads.values())
      .filter(upload => upload.subject === subject)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async updateUpload(id: number, updates: Partial<Upload>): Promise<Upload | undefined> {
    const upload = this.uploads.get(id);
    if (!upload) return undefined;
    const updatedUpload = { ...upload, ...updates };
    this.uploads.set(id, updatedUpload);
    return updatedUpload;
  }

  async deleteUpload(id: number): Promise<void> {
    this.uploads.delete(id);
  }

  async approveUpload(id: number): Promise<Upload | undefined> {
    return this.updateUpload(id, { isApproved: true });
  }

  // Discussion operations
  async createDiscussion(insertDiscussion: InsertDiscussion): Promise<Discussion> {
    const id = this.currentDiscussionId++;
    const discussion: Discussion = {
      id,
      userId: insertDiscussion.userId ?? 0,
      subject: insertDiscussion.subject ?? null,
      content: insertDiscussion.content,
      likes: 0,
      helpfulVotes: 0,
      createdAt: new Date(),
    };
    this.discussions.set(id, discussion);
    return discussion;
  }

  async getDiscussion(id: number): Promise<Discussion | undefined> {
    return this.discussions.get(id);
  }

  async getAllDiscussions(): Promise<Discussion[]> {
    return Array.from(this.discussions.values()).sort((a, b) => 
      (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }

  async getDiscussionsByUser(userId: number): Promise<Discussion[]> {
    return Array.from(this.discussions.values())
      .filter(discussion => discussion.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async updateDiscussion(id: number, updates: Partial<Discussion>): Promise<Discussion | undefined> {
    const discussion = this.discussions.get(id);
    if (!discussion) return undefined;
    const updatedDiscussion = { ...discussion, ...updates };
    this.discussions.set(id, updatedDiscussion);
    return updatedDiscussion;
  }

  async deleteDiscussion(id: number): Promise<void> {
    this.discussions.delete(id);
  }

  async likeDiscussion(id: number): Promise<Discussion | undefined> {
    const discussion = this.discussions.get(id);
    if (!discussion) return undefined;
    return this.updateDiscussion(id, { likes: (discussion.likes || 0) + 1 });
  }

  // Announcement operations
  async createAnnouncement(insertAnnouncement: InsertAnnouncement): Promise<Announcement> {
    const id = this.currentAnnouncementId++;
    const announcement: Announcement = {
      id,
      userId: insertAnnouncement.userId ?? 0,
      title: insertAnnouncement.title,
      content: insertAnnouncement.content,
      isApproved: false,
      isPinned: false,
      createdAt: new Date(),
    };
    this.announcements.set(id, announcement);
    return announcement;
  }

  async getAnnouncement(id: number): Promise<Announcement | undefined> {
    return this.announcements.get(id);
  }

  async getAllAnnouncements(): Promise<Announcement[]> {
    return Array.from(this.announcements.values()).sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0);
    });
  }

  async getApprovedAnnouncements(): Promise<Announcement[]> {
    return Array.from(this.announcements.values())
      .filter(announcement => announcement.isApproved)
      .sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0);
      });
  }

  async updateAnnouncement(id: number, updates: Partial<Announcement>): Promise<Announcement | undefined> {
    const announcement = this.announcements.get(id);
    if (!announcement) return undefined;
    const updatedAnnouncement = { ...announcement, ...updates };
    this.announcements.set(id, updatedAnnouncement);
    return updatedAnnouncement;
  }

  async deleteAnnouncement(id: number): Promise<void> {
    this.announcements.delete(id);
  }

  async approveAnnouncement(id: number): Promise<Announcement | undefined> {
    return this.updateAnnouncement(id, { isApproved: true });
  }

  // Solution operations
  async createSolution(insertSolution: InsertSolution): Promise<Solution> {
    const id = this.currentSolutionId++;
    const solution: Solution = {
      id,
      userId: insertSolution.userId ?? 0,
      subject: insertSolution.subject,
      solutionType: insertSolution.solutionType,
      title: insertSolution.title,
      description: insertSolution.description ?? null,
      fileUrl: insertSolution.fileUrl ?? null,
      textContent: insertSolution.textContent ?? null,
      externalLink: insertSolution.externalLink ?? null,
      helpfulVotes: 0,
      isApproved: false,
      createdAt: new Date(),
    };
    this.solutions.set(id, solution);
    return solution;
  }

  async getSolution(id: number): Promise<Solution | undefined> {
    return this.solutions.get(id);
  }

  async getAllSolutions(): Promise<Solution[]> {
    return Array.from(this.solutions.values()).sort((a, b) => 
      (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }

  async getSolutionsByUser(userId: number): Promise<Solution[]> {
    return Array.from(this.solutions.values())
      .filter(solution => solution.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getSolutionsBySubject(subject: string): Promise<Solution[]> {
    return Array.from(this.solutions.values())
      .filter(solution => solution.subject === subject)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async updateSolution(id: number, updates: Partial<Solution>): Promise<Solution | undefined> {
    const solution = this.solutions.get(id);
    if (!solution) return undefined;
    const updatedSolution = { ...solution, ...updates };
    this.solutions.set(id, updatedSolution);
    return updatedSolution;
  }

  async deleteSolution(id: number): Promise<void> {
    this.solutions.delete(id);
  }

  async approveSolution(id: number): Promise<Solution | undefined> {
    return this.updateSolution(id, { isApproved: true });
  }

  async voteSolution(id: number): Promise<Solution | undefined> {
    const solution = this.solutions.get(id);
    if (!solution) return undefined;
    return this.updateSolution(id, { helpfulVotes: (solution.helpfulVotes || 0) + 1 });
  }

  // Badge operations
  async createBadge(insertBadge: InsertBadge): Promise<Badge> {
    const id = this.currentBadgeId++;
    const badge: Badge = {
      id,
      userId: insertBadge.userId ?? 0,
      badgeType: insertBadge.badgeType,
      earnedFor: insertBadge.earnedFor ?? null,
      createdAt: new Date(),
    };
    this.badges.set(id, badge);
    return badge;
  }

  async getBadgesByUser(userId: number): Promise<Badge[]> {
    return Array.from(this.badges.values())
      .filter(badge => badge.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getAllBadges(): Promise<Badge[]> {
    return Array.from(this.badges.values()).sort((a, b) => 
      (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }
}

export const storage = new MemStorage();

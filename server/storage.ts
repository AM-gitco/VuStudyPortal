import { users, otpCodes, pendingUsers, type User, type InsertUser, type InsertOtp, type OtpCode, type PendingUser, type InsertPendingUser } from "@shared/schema";
import { eq, and, gt } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createAdminUser(user: Omit<InsertUser, 'email'> & { email: string }): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  
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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private pendingUsers: Map<string, PendingUser>;
  private otpCodes: Map<number, OtpCode>;
  private currentUserId: number;
  private currentPendingUserId: number;
  private currentOtpId: number;

  constructor() {
    this.users = new Map();
    this.pendingUsers = new Map();
    this.otpCodes = new Map();
    this.currentUserId = 1;
    this.currentPendingUserId = 1;
    this.currentOtpId = 1;
    
    // Initialize admin user
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
    // Check OTP validity without marking as used - for password reset validation
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

  async updateUserProfile(id: number, degreeProgram: string, subjects: string[]): Promise<User | undefined> {
    const user = this.users.get(id);
    if (user) {
      const updatedUser = { 
        ...user, 
        degreeProgram,
        subjects
      };
      this.users.set(id, updatedUser);
      return updatedUser;
    }
    return undefined;
  }
}

export const storage = new MemStorage();

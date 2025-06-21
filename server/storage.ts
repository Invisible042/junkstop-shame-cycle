import { users, type User, type InsertUser, type JunkFoodLog, type InsertJunkFoodLog, type CommunityPost, type InsertCommunityPost } from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserStreak(userId: number, streakCount: number, bestStreak: number): Promise<User>;
  
  // Junk food log operations
  createJunkFoodLog(log: InsertJunkFoodLog): Promise<JunkFoodLog>;
  getUserJunkFoodLogs(userId: number, limit: number, offset: number): Promise<JunkFoodLog[]>;
  
  // Community operations
  getCommunityPosts(limit: number, offset: number): Promise<CommunityPost[]>;
  createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost>;
  
  // Analytics
  getUserAnalytics(userId: number): Promise<{
    totalLogs: number;
    avgGuiltScore: number;
    avgRegretScore: number;
    totalCost: number;
    totalCalories: number;
    totalSaved: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private junkFoodLogs: Map<number, JunkFoodLog>;
  private communityPosts: Map<number, CommunityPost>;
  private currentUserId: number;
  private currentLogId: number;
  private currentPostId: number;

  constructor() {
    this.users = new Map();
    this.junkFoodLogs = new Map();
    this.communityPosts = new Map();
    this.currentUserId = 1;
    this.currentLogId = 1;
    this.currentPostId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      streak_count: 0,
      best_streak: 0,
      total_guilt_score: "0",
      accountability_partner_id: null,
      ai_coaching_enabled: true,
      created_at: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserStreak(userId: number, streakCount: number, bestStreak: number): Promise<User> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error("User not found");
    }
    const updatedUser = { ...user, streak_count: streakCount, best_streak: bestStreak };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async createJunkFoodLog(log: InsertJunkFoodLog): Promise<JunkFoodLog> {
    const id = this.currentLogId++;
    const junkFoodLog: JunkFoodLog = {
      id,
      user_id: log.user_id,
      photo_url: log.photo_url || null,
      food_type: log.food_type,
      guilt_rating: log.guilt_rating,
      regret_rating: log.regret_rating,
      estimated_cost: log.estimated_cost || "0",
      estimated_calories: log.estimated_calories || 0,
      location: log.location || null,
      created_at: new Date()
    };
    this.junkFoodLogs.set(id, junkFoodLog);
    return junkFoodLog;
  }

  async getUserJunkFoodLogs(userId: number, limit: number, offset: number): Promise<JunkFoodLog[]> {
    const userLogs = Array.from(this.junkFoodLogs.values())
      .filter(log => log.user_id === userId)
      .sort((a, b) => (b.created_at?.getTime() || 0) - (a.created_at?.getTime() || 0))
      .slice(offset, offset + limit);
    return userLogs;
  }

  async getCommunityPosts(limit: number, offset: number): Promise<CommunityPost[]> {
    const posts = Array.from(this.communityPosts.values())
      .sort((a, b) => (b.created_at?.getTime() || 0) - (a.created_at?.getTime() || 0))
      .slice(offset, offset + limit);
    return posts;
  }

  async createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost> {
    const id = this.currentPostId++;
    const communityPost: CommunityPost = {
      id,
      user_id: post.user_id,
      content: post.content,
      photo_url: post.photo_url || null,
      is_anonymous: post.is_anonymous ?? true,
      likes_count: 0,
      created_at: new Date()
    };
    this.communityPosts.set(id, communityPost);
    return communityPost;
  }

  async getUserAnalytics(userId: number): Promise<{
    totalLogs: number;
    avgGuiltScore: number;
    avgRegretScore: number;
    totalCost: number;
    totalCalories: number;
    totalSaved: number;
  }> {
    const userLogs = Array.from(this.junkFoodLogs.values())
      .filter(log => log.user_id === userId);
    
    const totalLogs = userLogs.length;
    const avgGuiltScore = totalLogs > 0 ? userLogs.reduce((sum, log) => sum + log.guilt_rating, 0) / totalLogs : 0;
    const avgRegretScore = totalLogs > 0 ? userLogs.reduce((sum, log) => sum + log.regret_rating, 0) / totalLogs : 0;
    const totalCost = userLogs.reduce((sum, log) => sum + parseFloat(log.estimated_cost || "0"), 0);
    const totalCalories = userLogs.reduce((sum, log) => sum + (log.estimated_calories || 0), 0);
    const totalSaved = totalCost; // Assuming saved money equals what would have been spent

    return {
      totalLogs,
      avgGuiltScore,
      avgRegretScore,
      totalCost,
      totalCalories,
      totalSaved
    };
  }
}

export const storage = new MemStorage();

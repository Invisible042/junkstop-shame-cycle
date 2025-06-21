import { users, junkFoodLogs, communityPosts, type User, type InsertUser, type JunkFoodLog, type InsertJunkFoodLog, type CommunityPost, type InsertCommunityPost } from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";

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

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserStreak(userId: number, streakCount: number, bestStreak: number): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ streak_count: streakCount, best_streak: bestStreak })
      .where(eq(users.id, userId))
      .returning();
    
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }

  async createJunkFoodLog(log: InsertJunkFoodLog): Promise<JunkFoodLog> {
    const [junkFoodLog] = await db
      .insert(junkFoodLogs)
      .values(log)
      .returning();
    return junkFoodLog;
  }

  async getUserJunkFoodLogs(userId: number, limit: number, offset: number): Promise<JunkFoodLog[]> {
    const logs = await db
      .select()
      .from(junkFoodLogs)
      .where(eq(junkFoodLogs.user_id, userId))
      .orderBy(desc(junkFoodLogs.created_at))
      .limit(limit)
      .offset(offset);
    return logs;
  }

  async getCommunityPosts(limit: number, offset: number): Promise<CommunityPost[]> {
    const posts = await db
      .select()
      .from(communityPosts)
      .orderBy(desc(communityPosts.created_at))
      .limit(limit)
      .offset(offset);
    return posts;
  }

  async createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost> {
    const [communityPost] = await db
      .insert(communityPosts)
      .values(post)
      .returning();
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
    const [analytics] = await db
      .select({
        totalLogs: sql<number>`count(*)`,
        avgGuiltScore: sql<number>`avg(${junkFoodLogs.guilt_rating})`,
        avgRegretScore: sql<number>`avg(${junkFoodLogs.regret_rating})`,
        totalCost: sql<number>`sum(${junkFoodLogs.estimated_cost}::numeric)`,
        totalCalories: sql<number>`sum(${junkFoodLogs.estimated_calories})`,
      })
      .from(junkFoodLogs)
      .where(eq(junkFoodLogs.user_id, userId));

    return {
      totalLogs: Number(analytics.totalLogs) || 0,
      avgGuiltScore: Number(analytics.avgGuiltScore) || 0,
      avgRegretScore: Number(analytics.avgRegretScore) || 0,
      totalCost: Number(analytics.totalCost) || 0,
      totalCalories: Number(analytics.totalCalories) || 0,
      totalSaved: Number(analytics.totalCost) || 0,
    };
  }
}

export const storage = new DatabaseStorage();

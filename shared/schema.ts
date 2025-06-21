import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  username: text("username").notNull(),
  password_hash: text("password_hash").notNull(),
  streak_count: integer("streak_count").default(0),
  best_streak: integer("best_streak").default(0),
  total_guilt_score: decimal("total_guilt_score", { precision: 5, scale: 2 }).default("0"),
  accountability_partner_id: integer("accountability_partner_id"),
  ai_coaching_enabled: boolean("ai_coaching_enabled").default(true),
  created_at: timestamp("created_at").defaultNow(),
});

// Junk food logs table
export const junkFoodLogs = pgTable("junk_food_logs", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull().references(() => users.id),
  photo_url: text("photo_url"),
  food_type: text("food_type").notNull(),
  guilt_rating: integer("guilt_rating").notNull(),
  regret_rating: integer("regret_rating").notNull(),
  estimated_cost: decimal("estimated_cost", { precision: 10, scale: 2 }).default("0"),
  estimated_calories: integer("estimated_calories").default(0),
  location: text("location"),
  created_at: timestamp("created_at").defaultNow(),
});

// Achievements table
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull().references(() => users.id),
  badge_type: text("badge_type").notNull(),
  badge_name: text("badge_name").notNull(),
  description: text("description"),
  earned_date: timestamp("earned_date").defaultNow(),
});

// Community posts table
export const communityPosts = pgTable("community_posts", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  photo_url: text("photo_url"),
  is_anonymous: boolean("is_anonymous").default(true),
  likes_count: integer("likes_count").default(0),
  created_at: timestamp("created_at").defaultNow(),
});

// AI insights table
export const aiInsights = pgTable("ai_insights", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull().references(() => users.id),
  insight_text: text("insight_text").notNull(),
  insight_type: text("insight_type"),
  generated_date: timestamp("generated_date").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  username: true,
  password_hash: true,
});

export const insertJunkFoodLogSchema = createInsertSchema(junkFoodLogs).pick({
  user_id: true,
  photo_url: true,
  food_type: true,
  guilt_rating: true,
  regret_rating: true,
  estimated_cost: true,
  estimated_calories: true,
  location: true,
});

export const insertCommunityPostSchema = createInsertSchema(communityPosts).pick({
  user_id: true,
  content: true,
  photo_url: true,
  is_anonymous: true,
});

export const insertAchievementSchema = createInsertSchema(achievements).pick({
  user_id: true,
  badge_type: true,
  badge_name: true,
  description: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertJunkFoodLog = z.infer<typeof insertJunkFoodLogSchema>;
export type JunkFoodLog = typeof junkFoodLogs.$inferSelect;
export type InsertCommunityPost = z.infer<typeof insertCommunityPostSchema>;
export type CommunityPost = typeof communityPosts.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type Achievement = typeof achievements.$inferSelect;
export type AiInsight = typeof aiInsights.$inferSelect;

import { pgTable, text, serial, integer, decimal, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const junkFoodLogs = pgTable("junk_food_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  photoUrl: text("photo_url").notNull(),
  guiltRating: integer("guilt_rating").notNull(),
  regretRating: integer("regret_rating").notNull(),
  estimatedCalories: integer("estimated_calories").notNull(),
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }),
  location: text("location"), // JSON string
  aiMessage: text("ai_message"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const confessions = pgTable("confessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  text: text("text").notNull(),
  anonymous: text("anonymous").default("true"),
  likes: integer("likes").default(0),
  replies: integer("replies").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userStreaks = pgTable("user_streaks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  currentStreak: integer("current_streak").default(0),
  bestStreak: integer("best_streak").default(0),
  lastJunkFoodDate: timestamp("last_junk_food_date"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Schemas for validation
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  displayName: true,
});

export const insertJunkFoodLogSchema = createInsertSchema(junkFoodLogs).pick({
  userId: true,
  photoUrl: true,
  guiltRating: true,
  regretRating: true,
  estimatedCalories: true,
  estimatedCost: true,
  location: true,
  aiMessage: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type JunkFoodLog = typeof junkFoodLogs.$inferSelect;
export type InsertJunkFoodLog = z.infer<typeof insertJunkFoodLogSchema>;
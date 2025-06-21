import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";
import { z } from "zod";
import { insertUserSchema, insertJunkFoodLogSchema, insertCommunityPostSchema } from "@shared/schema";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key";
const upload = multer({ dest: "uploads/" });

// Ensure uploads directory exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// Auth middleware
const authenticateToken = async (req: Request, res: Response, next: any) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { sub: string };
    const user = await storage.getUserByEmail(decoded.sub);
    if (!user) {
      return res.status(401).json({ error: "Invalid token" });
    }
    (req as any).user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

// Auth schemas
const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const junkFoodLogSchema = z.object({
  food_type: z.string(),
  guilt_rating: z.number().min(1).max(10),
  regret_rating: z.number().min(1).max(10),
  estimated_cost: z.number().optional(),
  location: z.string().optional(),
});

const communityPostSchema = z.object({
  content: z.string().min(1),
  is_anonymous: z.boolean().optional(),
});

const chatSchema = z.object({
  message: z.string(),
  guilt_level: z.number().optional(),
  regret_level: z.number().optional(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  app.use("/uploads", (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
  });

  // Health check
  app.get("/health", (req, res) => {
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
  });

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, username, password } = registerSchema.parse(req.body);
      
      // Check if user exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }

      // Hash password
      const password_hash = await bcrypt.hash(password, 10);
      
      // Create user
      const user = await storage.createUser({ email, username, password_hash });
      
      // Generate token
      const access_token = jwt.sign({ sub: user.email }, JWT_SECRET, { expiresIn: "7d" });
      
      res.json({
        id: user.id,
        email: user.email,
        username: user.username,
        streak_count: user.streak_count,
        best_streak: user.best_streak,
        access_token,
        token_type: "bearer"
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      // Get user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Verify password
      const isValid = await bcrypt.compare(password, user.password_hash);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Generate token
      const access_token = jwt.sign({ sub: user.email }, JWT_SECRET, { expiresIn: "7d" });
      
      res.json({
        id: user.id,
        email: user.email,
        username: user.username,
        streak_count: user.streak_count,
        best_streak: user.best_streak,
        access_token,
        token_type: "bearer"
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // User profile
  app.get("/api/user/profile", authenticateToken, async (req, res) => {
    try {
      const user = (req as any).user;
      const analytics = await storage.getUserAnalytics(user.id);
      
      res.json({
        id: user.id,
        email: user.email,
        username: user.username,
        streak_count: user.streak_count,
        best_streak: user.best_streak,
        total_saved: analytics.totalSaved,
        avg_guilt_score: analytics.avgGuiltScore,
        total_logs: analytics.totalLogs,
        created_at: user.created_at.toISOString()
      });
    } catch (error) {
      console.error("Profile error:", error);
      res.status(500).json({ error: "Failed to get profile" });
    }
  });

  // Junk food logs
  app.post("/api/logs", authenticateToken, upload.single("photo"), async (req, res) => {
    try {
      const user = (req as any).user;
      const { food_type, guilt_rating, regret_rating, estimated_cost, location } = req.body;
      
      const logData = junkFoodLogSchema.parse({
        food_type,
        guilt_rating: parseInt(guilt_rating),
        regret_rating: parseInt(regret_rating),
        estimated_cost: estimated_cost ? parseFloat(estimated_cost) : undefined,
        location
      });

      let photo_url = null;
      if (req.file) {
        const filename = `${Date.now()}-${req.file.originalname}`;
        const filepath = path.join("uploads", filename);
        fs.renameSync(req.file.path, filepath);
        photo_url = `/uploads/${filename}`;
      }

      // Simple calorie estimation
      const estimated_calories = Math.floor(Math.random() * 500) + 200; // 200-700 calories

      const log = await storage.createJunkFoodLog({
        user_id: user.id,
        photo_url,
        food_type: logData.food_type,
        guilt_rating: logData.guilt_rating,
        regret_rating: logData.regret_rating,
        estimated_cost: logData.estimated_cost?.toString() || "0",
        estimated_calories,
        location: logData.location
      });

      // Generate AI motivation message
      const ai_motivation = `You rated your guilt as ${logData.guilt_rating}/10 and regret as ${logData.regret_rating}/10. Remember, acknowledging these feelings is the first step toward building healthier habits. Every setback is a setup for a comeback!`;

      res.json({
        id: log.id,
        photo_url: log.photo_url,
        food_type: log.food_type,
        guilt_rating: log.guilt_rating,
        regret_rating: log.regret_rating,
        estimated_cost: parseFloat(log.estimated_cost || "0"),
        estimated_calories: log.estimated_calories,
        location: log.location,
        created_at: log.created_at?.toISOString() || new Date().toISOString(),
        ai_motivation
      });
    } catch (error) {
      console.error("Log creation error:", error);
      res.status(500).json({ error: "Failed to create log" });
    }
  });

  app.get("/api/logs", authenticateToken, async (req, res) => {
    try {
      const user = (req as any).user;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const logs = await storage.getUserJunkFoodLogs(user.id, limit, offset);
      
      const formattedLogs = logs.map(log => ({
        id: log.id,
        photo_url: log.photo_url,
        food_type: log.food_type,
        guilt_rating: log.guilt_rating,
        regret_rating: log.regret_rating,
        estimated_cost: parseFloat(log.estimated_cost || "0"),
        estimated_calories: log.estimated_calories,
        location: log.location,
        created_at: log.created_at?.toISOString() || new Date().toISOString(),
        ai_motivation: `Great job logging this! Awareness is the first step to change.`
      }));
      
      res.json(formattedLogs);
    } catch (error) {
      console.error("Get logs error:", error);
      res.status(500).json({ error: "Failed to get logs" });
    }
  });

  // Streak management
  app.post("/api/streak/increment", authenticateToken, async (req, res) => {
    try {
      const user = (req as any).user;
      const newStreak = user.streak_count + 1;
      const newBest = Math.max(user.best_streak, newStreak);
      
      const updatedUser = await storage.updateUserStreak(user.id, newStreak, newBest);
      
      res.json({
        streak_count: updatedUser.streak_count,
        best_streak: updatedUser.best_streak
      });
    } catch (error) {
      console.error("Streak increment error:", error);
      res.status(500).json({ error: "Failed to increment streak" });
    }
  });

  // Analytics
  app.get("/api/analytics/weekly", authenticateToken, async (req, res) => {
    try {
      const user = (req as any).user;
      const analytics = await storage.getUserAnalytics(user.id);
      
      // Generate mock daily breakdown for the past 7 days
      const daily_breakdown = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        daily_breakdown.push({
          date: date.toISOString().split('T')[0],
          count: Math.floor(Math.random() * 3),
          avg_guilt: Math.floor(Math.random() * 10) + 1,
          avg_regret: Math.floor(Math.random() * 10) + 1,
          total_cost: Math.floor(Math.random() * 50),
          total_calories: Math.floor(Math.random() * 1000) + 200
        });
      }
      
      res.json({
        total_logs: analytics.totalLogs,
        avg_guilt_score: analytics.avgGuiltScore,
        avg_regret_score: analytics.avgRegretScore,
        total_cost: analytics.totalCost,
        total_calories: analytics.totalCalories,
        daily_breakdown
      });
    } catch (error) {
      console.error("Analytics error:", error);
      res.status(500).json({ error: "Failed to get analytics" });
    }
  });

  // Daily insight
  app.get("/api/insights/daily", authenticateToken, async (req, res) => {
    try {
      const user = (req as any).user;
      const analytics = await storage.getUserAnalytics(user.id);
      
      let insight = "Welcome to JunkStop! Start logging your junk food to get personalized insights.";
      
      if (analytics.totalLogs > 0) {
        if (analytics.avgGuiltScore > 7) {
          insight = "You're experiencing high guilt levels. Remember, self-compassion is key to lasting change. Consider exploring healthier alternatives that satisfy your cravings.";
        } else if (analytics.avgGuiltScore < 4) {
          insight = "Your guilt levels are relatively low. This could indicate either good self-acceptance or perhaps minimizing the impact. Stay mindful of your goals.";
        } else {
          insight = "You're maintaining a balanced perspective on your eating habits. Keep building awareness and celebrating small wins!";
        }
      }
      
      res.json({ insight });
    } catch (error) {
      console.error("Insight error:", error);
      res.status(500).json({ error: "Failed to get insight" });
    }
  });

  // AI Chat
  app.post("/api/chat", authenticateToken, async (req, res) => {
    try {
      const { message, guilt_level, regret_level } = chatSchema.parse(req.body);
      
      let response = "I understand you're reaching out. Remember, every step towards awareness is progress. ";
      
      if (guilt_level && guilt_level > 7) {
        response += "High guilt can be overwhelming. Try to be kind to yourself - you're human and learning. ";
      }
      
      if (regret_level && regret_level > 7) {
        response += "Regret shows you care about your health. Channel that energy into planning your next healthy choice. ";
      }
      
      response += "What's one small step you can take right now towards a healthier choice?";
      
      res.json({
        response,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ error: "Failed to process chat" });
    }
  });

  // Community posts
  app.get("/api/community/posts", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const posts = await storage.getCommunityPosts(limit, offset);
      
      const formattedPosts = posts.map(post => ({
        id: post.id,
        content: post.content,
        photo_url: post.photo_url,
        likes_count: post.likes_count,
        created_at: post.created_at?.toISOString() || new Date().toISOString()
      }));
      
      res.json(formattedPosts);
    } catch (error) {
      console.error("Get community posts error:", error);
      res.status(500).json({ error: "Failed to get community posts" });
    }
  });

  app.post("/api/community/posts", authenticateToken, async (req, res) => {
    try {
      const user = (req as any).user;
      const { content, is_anonymous } = communityPostSchema.parse(req.body);
      
      const post = await storage.createCommunityPost({
        user_id: user.id,
        content,
        photo_url: null,
        is_anonymous: is_anonymous ?? true
      });
      
      res.json({
        id: post.id,
        content: post.content,
        photo_url: post.photo_url,
        likes_count: post.likes_count,
        created_at: post.created_at?.toISOString() || new Date().toISOString()
      });
    } catch (error) {
      console.error("Create community post error:", error);
      res.status(500).json({ error: "Failed to create post" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

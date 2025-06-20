import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { junkFoodLogs, users } from '../schema';
import { eq, desc, and, gte } from 'drizzle-orm';

const router = Router();

// User authentication endpoints
router.post('/auth/register', async (req, res) => {
  try {
    const { email, password, displayName } = req.body;
    
    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    // Check if user exists
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }
    
    // Create user (in production, hash the password)
    const [newUser] = await db.insert(users).values({
      email,
      password, // Hash this in production
      displayName: displayName || email.split('@')[0],
    }).returning();
    
    res.status(201).json({ 
      user: { 
        id: newUser.id, 
        email: newUser.email, 
        displayName: newUser.displayName 
      } 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    
    if (!user || user.password !== password) { // Use proper password comparison in production
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    res.json({ 
      user: { 
        id: user.id, 
        email: user.email, 
        displayName: user.displayName 
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Junk food log endpoints
router.post('/logs', async (req, res) => {
  try {
    const { userId, photoUrl, guiltRating, regretRating, estimatedCalories, estimatedCost, location, aiMessage } = req.body;
    
    const [newLog] = await db.insert(junkFoodLogs).values({
      userId,
      photoUrl,
      guiltRating,
      regretRating,
      estimatedCalories,
      estimatedCost,
      location: location ? JSON.stringify(location) : null,
      aiMessage,
    }).returning();
    
    res.status(201).json(newLog);
  } catch (error) {
    console.error('Error creating log:', error);
    res.status(500).json({ error: 'Failed to create log' });
  }
});

router.get('/logs/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = '50', offset = '0' } = req.query;
    
    const logs = await db
      .select()
      .from(junkFoodLogs)
      .where(eq(junkFoodLogs.userId, parseInt(userId)))
      .orderBy(desc(junkFoodLogs.createdAt))
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));
    
    const formattedLogs = logs.map(log => ({
      ...log,
      location: log.location ? JSON.parse(log.location) : null,
    }));
    
    res.json(formattedLogs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// Statistics endpoints
router.get('/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const weeklyLogs = await db
      .select()
      .from(junkFoodLogs)
      .where(
        and(
          eq(junkFoodLogs.userId, parseInt(userId)),
          gte(junkFoodLogs.createdAt, oneWeekAgo)
        )
      );
    
    const stats = {
      totalLogs: weeklyLogs.length,
      totalCalories: weeklyLogs.reduce((sum, log) => sum + log.estimatedCalories, 0),
      totalCost: weeklyLogs.reduce((sum, log) => sum + (log.estimatedCost || 0), 0),
      avgGuilt: weeklyLogs.length > 0 
        ? weeklyLogs.reduce((sum, log) => sum + log.guiltRating, 0) / weeklyLogs.length 
        : 0,
      avgRegret: weeklyLogs.length > 0 
        ? weeklyLogs.reduce((sum, log) => sum + log.regretRating, 0) / weeklyLogs.length 
        : 0,
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
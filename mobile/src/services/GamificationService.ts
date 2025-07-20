import { Achievement } from '../components/AchievementBadge';
import { ACHIEVEMENTS, getAchievementById } from '../data/achievements';

export interface UserStats {
  totalLogs: number;
  currentStreak: number;
  bestStreak: number;
  totalSaved: number;
  totalCaloriesAvoided: number;
  totalLikesGiven: number;
  totalLikesReceived: number;
  totalPosts: number;
  averageGuiltScore: number;
  joinDate: Date;
}

export interface LevelInfo {
  level: number;
  currentXP: number;
  xpToNextLevel: number;
  totalXP: number;
}

export class GamificationService {
  private static instance: GamificationService;
  private userStats: UserStats;
  private achievements: Achievement[];

  private constructor() {
    this.achievements = [...ACHIEVEMENTS];
    this.userStats = {
      totalLogs: 0,
      currentStreak: 0,
      bestStreak: 0,
      totalSaved: 0,
      totalCaloriesAvoided: 0,
      totalLikesGiven: 0,
      totalLikesReceived: 0,
      totalPosts: 0,
      averageGuiltScore: 0,
      joinDate: new Date(),
    };
  }

  static getInstance(): GamificationService {
    if (!GamificationService.instance) {
      GamificationService.instance = new GamificationService();
    }
    return GamificationService.instance;
  }

  // Update user stats and check for achievements
  updateStats(newStats: Partial<UserStats>): Achievement[] {
    this.userStats = { ...this.userStats, ...newStats };
    return this.checkAchievements();
  }

  // Check for newly unlocked achievements
  private checkAchievements(): Achievement[] {
    const newlyUnlocked: Achievement[] = [];

    this.achievements.forEach(achievement => {
      if (!achievement.unlocked && this.shouldUnlockAchievement(achievement)) {
        achievement.unlocked = true;
        achievement.unlockedAt = new Date();
        newlyUnlocked.push(achievement);
      }
    });

    return newlyUnlocked;
  }

  // Determine if an achievement should be unlocked
  private shouldUnlockAchievement(achievement: Achievement): boolean {
    switch (achievement.id) {
      // Streak achievements
      case 'first_day':
        return this.userStats.currentStreak >= 1;
      case 'three_day_streak':
        return this.userStats.currentStreak >= 3;
      case 'week_warrior':
        return this.userStats.currentStreak >= 7;
      case 'month_master':
        return this.userStats.currentStreak >= 30;
      case 'century_club':
        return this.userStats.currentStreak >= 100;

      // Milestone achievements
      case 'first_log':
        return this.userStats.totalLogs >= 1;
      case 'ten_logs':
        return this.userStats.totalLogs >= 10;
      case 'hundred_logs':
        return this.userStats.totalLogs >= 100;
      case 'money_saver':
        return this.userStats.totalSaved >= 100;
      case 'calorie_conscious':
        return this.userStats.totalCaloriesAvoided >= 10000;

      // Social achievements
      case 'first_post':
        return this.userStats.totalPosts >= 1;
      case 'supportive_friend':
        return this.userStats.totalLikesGiven >= 10;
      case 'inspiration':
        return this.userStats.totalLikesReceived >= 10;

      // Special achievements
      case 'weekend_warrior':
        return this.hasCompletedWeekendStreak();
      case 'guilt_free_week':
        return this.hasLowGuiltWeek();

      default:
        return false;
    }
  }

  // Check for weekend streak (Friday to Sunday)
  private hasCompletedWeekendStreak(): boolean {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
    
    // Check if we're past the weekend and had a streak during it
    if (dayOfWeek === 1) { // Monday
      // Check if user had a streak during the weekend
      return this.userStats.currentStreak >= 3; // At least 3 days including weekend
    }
    return false;
  }

  // Check for low guilt week (average guilt < 3)
  private hasLowGuiltWeek(): boolean {
    return this.userStats.averageGuiltScore < 3;
  }

  // Calculate level based on total XP
  calculateLevel(totalXP: number): LevelInfo {
    let level = 1;
    let xpForCurrentLevel = 0;
    let xpForNextLevel = 100;

    // Calculate level based on XP
    while (totalXP >= xpForNextLevel) {
      xpForCurrentLevel = xpForNextLevel;
      level++;
      xpForNextLevel = this.getXPForLevel(level);
    }

    const currentXP = totalXP - xpForCurrentLevel;
    const xpToNextLevel = xpForNextLevel - xpForCurrentLevel;

    return {
      level,
      currentXP,
      xpToNextLevel,
      totalXP,
    };
  }

  // Get XP required for a specific level
  private getXPForLevel(level: number): number {
    // Exponential growth: each level requires more XP
    return Math.floor(100 * Math.pow(1.2, level - 1));
  }

  // Get all achievements
  getAchievements(): Achievement[] {
    return this.achievements;
  }

  // Get unlocked achievements
  getUnlockedAchievements(): Achievement[] {
    return this.achievements.filter(a => a.unlocked);
  }

  // Get locked achievements
  getLockedAchievements(): Achievement[] {
    return this.achievements.filter(a => !a.unlocked);
  }

  // Get achievements by category
  getAchievementsByCategory(category: string): Achievement[] {
    return this.achievements.filter(a => a.type === category);
  }

  // Get total XP from unlocked achievements
  getTotalXP(): number {
    return this.getUnlockedAchievements().reduce((total, achievement) => total + achievement.xpReward, 0);
  }

  // Get completion percentage
  getCompletionPercentage(): number {
    const unlocked = this.getUnlockedAchievements().length;
    return Math.round((unlocked / this.achievements.length) * 100);
  }

  // Get user stats
  getUserStats(): UserStats {
    return this.userStats;
  }

  // Check for special time-based achievements
  checkTimeBasedAchievements(logTime: Date): Achievement[] {
    const newlyUnlocked: Achievement[] = [];
    const hour = logTime.getHours();

    // Early bird achievement (before 9 AM)
    if (hour < 9) {
      const earlyBird = getAchievementById('early_bird');
      if (earlyBird && !earlyBird.unlocked) {
        earlyBird.unlocked = true;
        earlyBird.unlockedAt = new Date();
        newlyUnlocked.push(earlyBird);
      }
    }

    // Night owl achievement (after 10 PM)
    if (hour >= 22) {
      const nightOwl = getAchievementById('night_owl');
      if (nightOwl && !nightOwl.unlocked) {
        nightOwl.unlocked = true;
        nightOwl.unlockedAt = new Date();
        newlyUnlocked.push(nightOwl);
      }
    }

    return newlyUnlocked;
  }

  // Get achievement progress for progress-based achievements
  getAchievementProgress(achievementId: string): { current: number; max: number } | null {
    const achievement = getAchievementById(achievementId);
    if (!achievement || !achievement.maxProgress) return null;

    let current = 0;
    switch (achievementId) {
      case 'first_day':
      case 'three_day_streak':
      case 'week_warrior':
      case 'month_master':
      case 'century_club':
        current = Math.min(this.userStats.currentStreak, achievement.maxProgress);
        break;
      case 'first_log':
      case 'ten_logs':
      case 'hundred_logs':
        current = Math.min(this.userStats.totalLogs, achievement.maxProgress);
        break;
      case 'money_saver':
        current = Math.min(this.userStats.totalSaved, achievement.maxProgress);
        break;
      case 'calorie_conscious':
        current = Math.min(this.userStats.totalCaloriesAvoided, achievement.maxProgress);
        break;
      case 'first_post':
      case 'supportive_friend':
        current = Math.min(this.userStats.totalLikesGiven, achievement.maxProgress);
        break;
      case 'inspiration':
        current = Math.min(this.userStats.totalLikesReceived, achievement.maxProgress);
        break;
      default:
        return null;
    }

    return { current, max: achievement.maxProgress };
  }

  // Update achievement progress
  updateAchievementProgress(): void {
    this.achievements.forEach(achievement => {
      if (achievement.maxProgress) {
        const progress = this.getAchievementProgress(achievement.id);
        if (progress) {
          achievement.progress = progress.current;
        }
      }
    });
  }
}

export default GamificationService; 
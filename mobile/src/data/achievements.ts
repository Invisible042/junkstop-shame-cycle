import { Achievement } from '../components/AchievementBadge';

export const ACHIEVEMENTS: Achievement[] = [
  // Streak Achievements
  {
    id: 'first_day',
    title: 'First Step',
    description: 'Complete your first day without junk food',
    icon: 'footsteps',
    type: 'streak',
    rarity: 'common',
    unlocked: false,
    xpReward: 10,
    progress: 0,
    maxProgress: 1,
  },
  {
    id: 'three_day_streak',
    title: 'Getting Started',
    description: 'Maintain a 3-day clean eating streak',
    icon: 'trending-up',
    type: 'streak',
    rarity: 'common',
    unlocked: false,
    xpReward: 25,
    progress: 0,
    maxProgress: 3,
  },
  {
    id: 'week_warrior',
    title: 'Week Warrior',
    description: 'Complete a full week without junk food',
    icon: 'calendar',
    type: 'streak',
    rarity: 'rare',
    unlocked: false,
    xpReward: 50,
    progress: 0,
    maxProgress: 7,
  },
  {
    id: 'month_master',
    title: 'Month Master',
    description: 'Achieve a 30-day clean eating streak',
    icon: 'trophy',
    type: 'streak',
    rarity: 'epic',
    unlocked: false,
    xpReward: 200,
    progress: 0,
    maxProgress: 30,
  },
  {
    id: 'century_club',
    title: 'Century Club',
    description: 'Reach 100 days without junk food',
    icon: 'diamond',
    type: 'streak',
    rarity: 'legendary',
    unlocked: false,
    xpReward: 500,
    progress: 0,
    maxProgress: 100,
  },

  // Milestone Achievements
  {
    id: 'first_log',
    title: 'Honest Logger',
    description: 'Log your first junk food item',
    icon: 'camera',
    type: 'milestone',
    rarity: 'common',
    unlocked: false,
    xpReward: 5,
    progress: 0,
    maxProgress: 1,
  },
  {
    id: 'ten_logs',
    title: 'Transparency',
    description: 'Log 10 junk food items',
    icon: 'list',
    type: 'milestone',
    rarity: 'common',
    unlocked: false,
    xpReward: 20,
    progress: 0,
    maxProgress: 10,
  },
  {
    id: 'hundred_logs',
    title: 'Self-Awareness',
    description: 'Log 100 junk food items',
    icon: 'analytics',
    type: 'milestone',
    rarity: 'rare',
    unlocked: false,
    xpReward: 100,
    progress: 0,
    maxProgress: 100,
  },
  {
    id: 'money_saver',
    title: 'Money Saver',
    description: 'Save $100 by avoiding junk food',
    icon: 'wallet',
    type: 'milestone',
    rarity: 'rare',
    unlocked: false,
    xpReward: 75,
    progress: 0,
    maxProgress: 100,
  },
  {
    id: 'calorie_conscious',
    title: 'Calorie Conscious',
    description: 'Avoid 10,000 calories of junk food',
    icon: 'fitness',
    type: 'milestone',
    rarity: 'epic',
    unlocked: false,
    xpReward: 150,
    progress: 0,
    maxProgress: 10000,
  },

  // Social Achievements
  {
    id: 'first_post',
    title: 'Community Member',
    description: 'Share your first post in the community',
    icon: 'people',
    type: 'social',
    rarity: 'common',
    unlocked: false,
    xpReward: 15,
    progress: 0,
    maxProgress: 1,
  },
  {
    id: 'supportive_friend',
    title: 'Supportive Friend',
    description: 'Like 10 community posts',
    icon: 'heart',
    type: 'social',
    rarity: 'common',
    unlocked: false,
    xpReward: 20,
    progress: 0,
    maxProgress: 10,
  },
  {
    id: 'inspiration',
    title: 'Inspiration',
    description: 'Get 10 likes on your community posts',
    icon: 'star',
    type: 'social',
    rarity: 'rare',
    unlocked: false,
    xpReward: 50,
    progress: 0,
    maxProgress: 10,
  },

  // Special Achievements
  {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Log junk food before 9 AM',
    icon: 'sunny',
    type: 'special',
    rarity: 'rare',
    unlocked: false,
    xpReward: 30,
  },
  {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'Log junk food after 10 PM',
    icon: 'moon',
    type: 'special',
    rarity: 'rare',
    unlocked: false,
    xpReward: 30,
  },
  {
    id: 'weekend_warrior',
    title: 'Weekend Warrior',
    description: 'Maintain a streak through the weekend',
    icon: 'calendar-outline',
    type: 'special',
    rarity: 'epic',
    unlocked: false,
    xpReward: 75,
    progress: 0,
    maxProgress: 1,
  },
  {
    id: 'holiday_hero',
    title: 'Holiday Hero',
    description: 'Stay clean during a major holiday',
    icon: 'gift',
    type: 'special',
    rarity: 'legendary',
    unlocked: false,
    xpReward: 200,
  },

  // Challenge Achievements
  {
    id: 'no_sweets_week',
    title: 'Sweet Freedom',
    description: 'Go a week without any sweets',
    icon: 'ice-cream',
    type: 'challenge',
    rarity: 'rare',
    unlocked: false,
    xpReward: 100,
    progress: 0,
    maxProgress: 7,
  },
  {
    id: 'no_fast_food_month',
    title: 'Fast Food Free',
    description: 'Avoid fast food for a month',
    icon: 'restaurant',
    type: 'challenge',
    rarity: 'epic',
    unlocked: false,
    xpReward: 150,
    progress: 0,
    maxProgress: 30,
  },
  {
    id: 'guilt_free_week',
    title: 'Guilt Free',
    description: 'Have a week with average guilt rating under 3',
    icon: 'happy',
    type: 'challenge',
    rarity: 'epic',
    unlocked: false,
    xpReward: 125,
    progress: 0,
    maxProgress: 7,
  },
];

// Achievement categories for filtering
export const ACHIEVEMENT_CATEGORIES = {
  streak: ACHIEVEMENTS.filter(a => a.type === 'streak'),
  milestone: ACHIEVEMENTS.filter(a => a.type === 'milestone'),
  social: ACHIEVEMENTS.filter(a => a.type === 'social'),
  special: ACHIEVEMENTS.filter(a => a.type === 'special'),
  challenge: ACHIEVEMENTS.filter(a => a.type === 'challenge'),
};

// Helper functions
export const getAchievementById = (id: string): Achievement | undefined => {
  return ACHIEVEMENTS.find(a => a.id === id);
};

export const getUnlockedAchievements = (): Achievement[] => {
  return ACHIEVEMENTS.filter(a => a.unlocked);
};

export const getLockedAchievements = (): Achievement[] => {
  return ACHIEVEMENTS.filter(a => !a.unlocked);
};

export const getTotalXP = (): number => {
  return getUnlockedAchievements().reduce((total, achievement) => total + achievement.xpReward, 0);
};

export const getCompletionPercentage = (): number => {
  const unlocked = getUnlockedAchievements().length;
  return Math.round((unlocked / ACHIEVEMENTS.length) * 100);
}; 
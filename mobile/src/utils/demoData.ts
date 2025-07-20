// Demo data for showcasing app features to potential buyers
export const DEMO_MODE = __DEV__; // Only enable in development

export const DEMO_USER = {
  id: 1,
  email: 'demo@junkstop.com',
  username: 'DemoUser',
  streak_count: 12,
  best_streak: 15,
  total_saved: 67.50,
  avg_guilt_score: 3.2,
  total_logs: 28,
  created_at: '2024-01-15T10:00:00Z',
};

export const DEMO_FOOD_LOGS = [
  {
    id: '1',
    name: 'Pizza Slice',
    category: 'Fast Food',
    shameRating: 7,
    guiltRating: 8,
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    notes: 'Late night craving',
    photo: null,
  },
  {
    id: '2',
    name: 'Chocolate Bar',
    category: 'Candy',
    shameRating: 5,
    guiltRating: 6,
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    notes: 'Stress eating',
    photo: null,
  },
  {
    id: '3',
    name: 'Burger & Fries',
    category: 'Fast Food',
    shameRating: 8,
    guiltRating: 9,
    timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
    notes: 'Lunch break',
    photo: null,
  },
  {
    id: '4',
    name: 'Ice Cream',
    category: 'Dessert',
    shameRating: 4,
    guiltRating: 5,
    timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
    notes: 'Celebration treat',
    photo: null,
  },
  {
    id: '5',
    name: 'Soda',
    category: 'Beverage',
    shameRating: 3,
    guiltRating: 4,
    timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    notes: 'Movie theater',
    photo: null,
  },
];

export const DEMO_ACHIEVEMENTS = [
  {
    id: 'first_day',
    title: 'First Day',
    description: 'Complete your first day without junk food',
    icon: 'calendar-outline',
    type: 'streak',
    xpReward: 50,
    unlocked: true,
    unlockedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    maxProgress: 1,
  },
  {
    id: 'three_day_streak',
    title: 'Three Day Warrior',
    description: 'Maintain a 3-day streak',
    icon: 'flame-outline',
    type: 'streak',
    xpReward: 100,
    unlocked: true,
    unlockedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    maxProgress: 3,
  },
  {
    id: 'week_warrior',
    title: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: 'trophy-outline',
    type: 'streak',
    xpReward: 200,
    unlocked: true,
    unlockedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    maxProgress: 7,
  },
  {
    id: 'first_log',
    title: 'First Log',
    description: 'Log your first junk food item',
    icon: 'document-text-outline',
    type: 'milestone',
    xpReward: 25,
    unlocked: true,
    unlockedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    maxProgress: 1,
  },
  {
    id: 'ten_logs',
    title: 'Consistent Logger',
    description: 'Log 10 junk food items',
    icon: 'list-outline',
    type: 'milestone',
    xpReward: 75,
    unlocked: true,
    unlockedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    maxProgress: 10,
  },
  {
    id: 'money_saver',
    title: 'Money Saver',
    description: 'Save $100 by avoiding junk food',
    icon: 'wallet-outline',
    type: 'milestone',
    xpReward: 150,
    unlocked: false,
    maxProgress: 100,
  },
];

export const DEMO_INSIGHTS = [
  "You're on a great 12-day streak! Keep it up!",
  "You've saved $67.50 this month by avoiding junk food.",
  "Your average guilt score has decreased by 40% this week.",
  "You're most likely to eat junk food on weekends.",
  "Try replacing your 3 PM snack with a healthy alternative.",
];

export const DEMO_LEVEL_INFO = {
  level: 8,
  currentXP: 450,
  xpToNextLevel: 100,
  totalXP: 750,
};

export const DEMO_STATS = {
  totalLogs: 28,
  currentStreak: 12,
  bestStreak: 15,
  totalSaved: 67.50,
  totalCaloriesAvoided: 8500,
  averageGuiltScore: 3.2,
  joinDate: new Date('2024-01-15'),
};

// Demo analytics data for progress screen
export const DEMO_ANALYTICS = {
  total_logs: 28,
  avg_guilt_score: 3.2,
  avg_regret_score: 4.1,
  total_cost: 67.50,
  total_calories: 8500,
  streak_count: 12,
  best_streak: 15,
  daily_breakdown: [
    { date: '2024-01-15', count: 2, avg_guilt: 3.5, avg_regret: 4.0, total_cost: 8.50, total_calories: 600 },
    { date: '2024-01-16', count: 1, avg_guilt: 2.0, avg_regret: 3.0, total_cost: 5.00, total_calories: 400 },
    { date: '2024-01-17', count: 0, avg_guilt: 0, avg_regret: 0, total_cost: 0, total_calories: 0 },
    { date: '2024-01-18', count: 1, avg_guilt: 4.0, avg_regret: 5.0, total_cost: 6.00, total_calories: 500 },
    { date: '2024-01-19', count: 0, avg_guilt: 0, avg_regret: 0, total_cost: 0, total_calories: 0 },
    { date: '2024-01-20', count: 2, avg_guilt: 3.0, avg_regret: 4.0, total_cost: 12.00, total_calories: 800 },
    { date: '2024-01-21', count: 0, avg_guilt: 0, avg_regret: 0, total_cost: 0, total_calories: 0 },
  ]
};

// Demo next achievement progress
export const DEMO_NEXT_ACHIEVEMENT = {
  title: 'Money Saver',
  icon: 'wallet-outline',
  message: 'Save $32.50 more to earn this achievement!',
  current: 67.50,
  max: 100,
};

// Demo mode utilities
export const isDemoMode = () => DEMO_MODE;

// Function to add new demo log
export const addDemoLog = (logData: {
  foodType: string;
  guiltRating: number;
  regretRating: number;
  estimatedCost?: string;
  location?: string;
  photo?: string;
  estimatedCalories?: number;
}) => {
  const newLog = {
    id: (DEMO_FOOD_LOGS.length + 1).toString(),
    name: logData.foodType,
    category: 'Fast Food', // Default category
    shameRating: logData.regretRating,
    guiltRating: logData.guiltRating,
    timestamp: new Date(), // Current time
    notes: logData.location || 'Logged via app',
    photo: null, // Demo data doesn't support photos yet
    estimatedCalories: logData.estimatedCalories || 250, // Default calories
  };
  
  // Add to demo logs array
  DEMO_FOOD_LOGS.unshift(newLog); // Add to beginning of array
  
  // Update demo stats
  DEMO_USER.total_logs += 1;
  DEMO_ANALYTICS.total_logs += 1;
  
  return newLog;
};

export const getDemoData = (type: 'user' | 'logs' | 'achievements' | 'insights' | 'level' | 'stats' | 'analytics' | 'nextAchievement') => {
  switch (type) {
    case 'user':
      return DEMO_USER;
    case 'logs':
      return DEMO_FOOD_LOGS;
    case 'achievements':
      return DEMO_ACHIEVEMENTS;
    case 'insights':
      return DEMO_INSIGHTS;
    case 'level':
      return DEMO_LEVEL_INFO;
    case 'stats':
      return DEMO_STATS;
    case 'analytics':
      return DEMO_ANALYTICS;
    case 'nextAchievement':
      return DEMO_NEXT_ACHIEVEMENT;
    default:
      return null;
  }
}; 
// AI Configuration for OpenRouter
// This file allows easy swapping between free and paid models

export const AI_CONFIG = {
  // OpenRouter API Configuration
  OPENROUTER_BASE_URL: 'https://openrouter.ai/api/v1',
  
  // Model Configuration - Easy to swap between free and paid models
  MODEL: {
    // Free model (for development/testing)
    FREE: 'meta-llama/llama-3.1-8b-instruct:free',
    
    // Paid models (for production) - uncomment and use one of these:
    // PAID_GPT4: 'openai/gpt-4',
    // PAID_CLAUDE: 'anthropic/claude-3-opus',
    // PAID_GEMINI: 'google/gemini-pro',
    
    // Current active model - change this to switch between free/paid
    ACTIVE: 'meta-llama/llama-3.1-8b-instruct:free',
  },
  
  // API Key - Set this in your environment or .env file
  // For development, you can use a free OpenRouter account
  // For production, use a paid account with credits
  OPENROUTER_API_KEY: process.env.EXPO_PUBLIC_OPENROUTER_API_KEY || '',
  
  // Chat Configuration
  CHAT: {
    MAX_TOKENS: 150,
    TEMPERATURE: 0.7,
    SYSTEM_PROMPT: `You are a supportive and motivating junk food addiction coach. Your role is to help users break their junk food habits through:

1. **Empathetic Support**: Understand their struggles without judgment
2. **Practical Advice**: Provide actionable strategies for avoiding junk food
3. **Motivation**: Encourage them to stay on track with their goals
4. **Accountability**: Help them reflect on their choices constructively
5. **Education**: Share insights about healthy eating habits

Keep responses concise (under 100 words), encouraging, and focused on moving forward rather than dwelling on past mistakes. Be direct but caring.`,
  },
  
  // Daily Insight Configuration
  INSIGHT: {
    MAX_TOKENS: 120,
    TEMPERATURE: 0.6,
    SYSTEM_PROMPT: `You are a behavioral analyst specializing in eating habits. Provide brief, actionable insights about junk food patterns. Focus on:

1. **Pattern Recognition**: Identify triggers and timing
2. **Actionable Advice**: Suggest specific strategies
3. **Positive Reinforcement**: Acknowledge progress
4. **Future Planning**: Help prevent future relapses

Keep insights under 80 words and make them immediately actionable.`,
  },
  
  // Calorie Estimation Configuration
  CALORIES: {
    MAX_TOKENS: 50,
    TEMPERATURE: 0.3,
    SYSTEM_PROMPT: `You are a nutrition expert. Estimate calories for junk food items. Respond with only a number (no text or explanation). Provide reasonable estimates based on typical serving sizes.`,
  },
};

// Helper function to get the current model
export const getCurrentModel = () => AI_CONFIG.MODEL.ACTIVE;

// Helper function to check if using free model
export const isUsingFreeModel = () => AI_CONFIG.MODEL.ACTIVE === AI_CONFIG.MODEL.FREE;

// Helper function to get API key
export const getApiKey = () => AI_CONFIG.OPENROUTER_API_KEY;

// Helper function to check if AI is available
export const isAIAvailable = () => !!AI_CONFIG.OPENROUTER_API_KEY; 
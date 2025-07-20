import { AI_CONFIG, getCurrentModel, getApiKey, isAIAvailable } from '../config/ai';

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  max_tokens: number;
  temperature: number;
}

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

// Fallback responses when AI is not available
const FALLBACK_RESPONSES = {
  chat: [
    "I understand you're struggling with junk food cravings. Remember, every healthy choice you make is a step in the right direction. What's one small thing you can do right now to stay on track?",
    "It's okay to have setbacks - they're part of the journey. Focus on what you can control: your next meal, your next choice. You've got this!",
    "Breaking habits takes time and patience. Instead of dwelling on what you ate, think about what you'll do differently next time. Progress, not perfection!",
    "You're showing real commitment by reaching out for support. That's a sign of strength! Let's focus on your next healthy choice.",
    "Remember why you started this journey. Your health and well-being are worth the effort. Take it one day, one meal at a time."
  ],
  insight: [
    "You're making progress by being aware of your patterns. Keep tracking and you'll see improvement over time.",
    "Every day is a new opportunity to make healthier choices. Focus on building positive habits.",
    "Your commitment to change is the most important factor. Keep going!",
    "Small changes add up to big results. Stay consistent with your goals.",
    "You're stronger than your cravings. Each healthy choice builds your confidence."
  ]
};

// Get a random fallback response
const getRandomFallback = (type: 'chat' | 'insight' | 'calories'): string => {
  if (type === 'calories') {
    return '300'; // Default calorie estimate
  }
  const responses = FALLBACK_RESPONSES[type];
  return responses[Math.floor(Math.random() * responses.length)];
};

// Make a call to OpenRouter API
export const callOpenRouter = async (
  messages: OpenRouterMessage[],
  config: {
    maxTokens?: number;
    temperature?: number;
    type: 'chat' | 'insight' | 'calories';
  }
): Promise<string> => {
  // Check if AI is available
  if (!isAIAvailable()) {
    console.log('OpenRouter API key not available, using fallback response');
    return getRandomFallback(config.type);
  }

  const apiKey = getApiKey();
  const model = getCurrentModel();

  // Get configuration based on type
  const typeConfig = AI_CONFIG[config.type.toUpperCase() as keyof typeof AI_CONFIG];
  const maxTokens = config.maxTokens || typeConfig.MAX_TOKENS;
  const temperature = config.temperature || typeConfig.TEMPERATURE;

  const requestBody: OpenRouterRequest = {
    model,
    messages,
    max_tokens: maxTokens,
    temperature,
  };

  try {
    const response = await fetch(`${AI_CONFIG.OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://junkstop.app', // Your app's domain
        'X-Title': 'JunkStop', // Your app's name
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
    }

    const data: OpenRouterResponse = await response.json();
    const content = data.choices[0]?.message?.content?.trim();

    if (!content) {
      throw new Error('No content received from OpenRouter');
    }

    return content;

  } catch (error) {
    console.error('OpenRouter API call failed:', error);
    return getRandomFallback(config.type);
  }
};

// Convenience function for chat messages
export const sendChatMessage = async (
  userMessage: string,
  context?: {
    guiltLevel?: number;
    regretLevel?: number;
    recentPatterns?: string;
  }
): Promise<string> => {
  const messages: OpenRouterMessage[] = [
    {
      role: 'system',
      content: AI_CONFIG.CHAT.SYSTEM_PROMPT,
    },
  ];

  // Add context if available
  if (context) {
    let contextMessage = userMessage;
    if (context.guiltLevel || context.regretLevel) {
      contextMessage += `\n\nContext: Guilt level: ${context.guiltLevel || 'N/A'}/10, Regret level: ${context.regretLevel || 'N/A'}/10`;
    }
    if (context.recentPatterns) {
      contextMessage += `\n\nRecent patterns: ${context.recentPatterns}`;
    }
    messages.push({
      role: 'user',
      content: contextMessage,
    });
  } else {
    messages.push({
      role: 'user',
      content: userMessage,
    });
  }

  return callOpenRouter(messages, { type: 'chat' });
};

// Convenience function for daily insights
export const generateDailyInsight = async (
  userPatterns: string
): Promise<string> => {
  const messages: OpenRouterMessage[] = [
    {
      role: 'system',
      content: AI_CONFIG.INSIGHT.SYSTEM_PROMPT,
    },
    {
      role: 'user',
      content: userPatterns,
    },
  ];

  return callOpenRouter(messages, { type: 'insight' });
};

// Convenience function for calorie estimation
export const estimateCalories = async (
  foodDescription: string
): Promise<number> => {
  const messages: OpenRouterMessage[] = [
    {
      role: 'system',
      content: AI_CONFIG.CALORIES.SYSTEM_PROMPT,
    },
    {
      role: 'user',
      content: `Estimate calories for: ${foodDescription}`,
    },
  ];

  try {
    const response = await callOpenRouter(messages, { type: 'calories' });
    // Extract number from response
    const calories = parseInt(response.replace(/[^0-9]/g, ''));
    return isNaN(calories) ? 300 : Math.min(Math.max(calories, 50), 2000); // Reasonable bounds
  } catch (error) {
    console.error('Calorie estimation failed:', error);
    return 300; // Default fallback
  }
}; 
interface UserPattern {
  frequency: number;
  avgGuilt: number;
  avgRegret: number;
  totalCalories: number;
}

import { generateRealMotivation } from './realAiService';

export const generateMotivation = async (userPattern: UserPattern): Promise<string> => {
  return await generateRealMotivation(userPattern);
  // This function now calls the real AI service
  // which handles both OpenRouter API and enhanced fallbacks
};
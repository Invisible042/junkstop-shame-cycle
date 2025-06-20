interface UserPattern {
  frequency: number;
  avgGuilt: number;
  avgRegret: number;
  totalCalories: number;
}

export const generateRealMotivation = async (userPattern: UserPattern): Promise<string> => {
  const OPENROUTER_API_KEY = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY;
  
  if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === 'demo-key') {
    // Fallback to enhanced pattern-based responses
    return generateEnhancedMotivation(userPattern);
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://junkstop.app",
        "X-Title": "JunkStop App"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.1-8b-instruct:free",
        messages: [
          { 
            role: "system", 
            content: "You are a compassionate but firm junk food coach. Give motivational messages that are honest, encouraging, and focused on behavioral psychology. Keep responses under 150 words and avoid being preachy. Use a supportive tone that acknowledges struggles while inspiring change." 
          },
          { 
            role: "user", 
            content: `User ate junk food ${userPattern.frequency} times this week, average guilt ${userPattern.avgGuilt.toFixed(1)}/10, average regret ${userPattern.avgRegret.toFixed(1)}/10, total calories ${userPattern.totalCalories}. Give a personalized motivational message that acknowledges their pattern and provides actionable advice.` 
          }
        ],
        max_tokens: 200,
        temperature: 0.7,
      })
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    return data.choices[0]?.message?.content || generateEnhancedMotivation(userPattern);
    
  } catch (error) {
    console.error('Error generating AI motivation:', error);
    return generateEnhancedMotivation(userPattern);
  }
};

const generateEnhancedMotivation = (userPattern: UserPattern): string => {
  const { frequency, avgGuilt, avgRegret, totalCalories } = userPattern;
  
  // High frequency (4+ times this week)
  if (frequency >= 4) {
    if (avgGuilt >= 7) {
      return `You've logged ${frequency} items this week with high guilt (${avgGuilt.toFixed(1)}/10). That guilt is your inner wisdom speaking - it means you care about your health. Let's channel that awareness into action. What triggers can you identify and plan for differently tomorrow?`;
    }
    return `${frequency} times this week, ${totalCalories} calories total. I see a pattern that needs attention. But you're here, tracking honestly - that's brave. What's one small change you can make to your environment or routine that would make healthy choices easier?`;
  }
  
  // Medium frequency (2-3 times)
  if (frequency >= 2) {
    if (avgRegret >= 6) {
      return `Two to three slip-ups this week, with regret averaging ${avgRegret.toFixed(1)}/10. That regret shows you know what you want - a healthier relationship with food. Progress isn't perfection; it's learning. What did these moments teach you about your triggers?`;
    }
    return `${frequency} logs this week isn't terrible, but let's aim higher. You consumed ${totalCalories} calories in junk food - imagine if those were nutritious calories instead. What healthy foods do you actually enjoy that could crowd out the junk?`;
  }
  
  // Low frequency (1 time)
  if (frequency === 1) {
    return `One slip-up this week - that's actually progress for many people! Your guilt level of ${avgGuilt.toFixed(1)}/10 shows you're developing awareness. The goal isn't perfection; it's building sustainable habits. How can you extend your clean streak from here?`;
  }
  
  // No logs this week
  return `No junk food logged this week - that's fantastic! You're proving that change is possible. Keep building on this momentum. What strategies are working for you that you can double down on?`;
};

export { generateEnhancedMotivation };
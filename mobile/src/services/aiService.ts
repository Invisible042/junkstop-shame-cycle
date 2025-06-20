interface UserPattern {
  frequency: number;
  avgGuilt: number;
  avgRegret: number;
  totalCalories: number;
}

export const generateMotivation = async (userPattern: UserPattern): Promise<string> => {
  try {
    // For demo purposes, return motivational messages based on patterns
    // In production, this would call OpenRouter API
    
    const motivationalMessages = [
      `You've eaten junk food ${userPattern.frequency} times this week. Your average guilt level is ${userPattern.avgGuilt.toFixed(1)}/10. Remember, every moment is a chance to start fresh. You have the power to break this cycle!`,
      
      `${userPattern.totalCalories} calories of junk food this week... that's like running for ${Math.round(userPattern.totalCalories / 100)} hours to burn off! Your body deserves better fuel. What healthy choice will you make next?`,
      
      `I see guilt level ${userPattern.avgGuilt.toFixed(1)}/10. That guilt is your inner wisdom speaking. Listen to it. Your future self is counting on the choices you make today.`,
      
      `${userPattern.frequency} times this week you chose temporary pleasure over long-term health. But here's the thing - you're here, tracking it, being honest. That awareness is the first step to change.`,
      
      `Your regret level is ${userPattern.avgRegret.toFixed(1)}/10. Channel that regret into determination. Every time you feel tempted, remember this feeling and choose differently.`
    ];

    // Return a random motivational message
    return motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];

    /* Production OpenRouter API call:
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.1-8b-instruct:free",
        messages: [
          { 
            role: "system", 
            content: "You are a tough-love junk food coach. Give motivational messages that are honest but encouraging. Focus on behavioral psychology and habit formation." 
          },
          { 
            role: "user", 
            content: `User ate junk food ${userPattern.frequency} times this week, avg guilt ${userPattern.avgGuilt}/10, avg regret ${userPattern.avgRegret}/10, total calories ${userPattern.totalCalories}. Give a motivational message.` 
          }
        ]
      })
    });
    
    const data = await response.json();
    return data.choices[0].message.content;
    */
    
  } catch (error) {
    console.error('Error generating motivation:', error);
    return "Every setback is a setup for a comeback. You've got this! Take it one healthy choice at a time.";
  }
};
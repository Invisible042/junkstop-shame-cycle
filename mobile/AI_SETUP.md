# AI Setup Guide for JunkStop

## OpenRouter Configuration

JunkStop uses OpenRouter for AI-powered coaching and insights. Here's how to set it up:

### 1. Get an OpenRouter API Key

1. Go to [OpenRouter](https://openrouter.ai/keys)
2. Sign up for a free account
3. Create an API key
4. Copy your API key

### 2. Configure the API Key

Create a `.env` file in the `mobile` directory:

```bash
# mobile/.env
EXPO_PUBLIC_OPENROUTER_API_KEY=your_actual_api_key_here
```

### 3. Model Configuration

The app is configured to use a free model by default. You can easily switch to paid models for production:

**Current Configuration** (`mobile/src/config/ai.ts`):
```typescript
MODEL: {
  // Free model (for development/testing)
  FREE: 'meta-llama/llama-3.1-8b-instruct:free',
  
  // Paid models (for production) - uncomment and use one of these:
  // PAID_GPT4: 'openai/gpt-4',
  // PAID_CLAUDE: 'anthropic/claude-3-opus',
  // PAID_GEMINI: 'google/gemini-pro',
  
  // Current active model - change this to switch between free/paid
  ACTIVE: 'meta-llama/llama-3.1-8b-instruct:free',
}
```

**To switch to a paid model:**
1. Update `ACTIVE` to use a paid model (e.g., `AI_CONFIG.MODEL.PAID_GPT4`)
2. Make sure you have credits in your OpenRouter account

### 4. Features

With OpenRouter configured, you get:

- **AI Chat Coach**: Personalized responses based on your guilt/regret levels
- **Daily Insights**: AI-generated insights about your eating patterns
- **Calorie Estimation**: AI-powered calorie estimates for logged foods
- **Fallback Responses**: Intelligent fallback responses when AI is unavailable

### 5. Development vs Production

**Development:**
- Use free model: `meta-llama/llama-3.1-8b-instruct:free`
- Limited but functional responses
- No cost

**Production:**
- Use paid model: `openai/gpt-4` or `anthropic/claude-3-opus`
- Higher quality, more nuanced responses
- Requires OpenRouter credits

### 6. Troubleshooting

**"API key not available" message:**
- Check that your `.env` file exists in the `mobile` directory
- Verify the API key is correct
- Restart your development server

**Poor response quality:**
- Switch to a paid model for better responses
- Check your OpenRouter account for remaining credits

**No responses:**
- The app will use intelligent fallback responses
- Check your internet connection
- Verify your OpenRouter API key is valid

### 7. Cost Management

- Free model: No cost, limited responses
- Paid models: Pay per token used
- Monitor usage in your OpenRouter dashboard
- Set up usage limits to control costs

### 8. Security

- Never commit your `.env` file to version control
- The `.env` file is already in `.gitignore`
- API keys are only used client-side for OpenRouter calls
- No sensitive data is stored on your device 
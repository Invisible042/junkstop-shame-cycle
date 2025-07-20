# LiveKit Voice Call Setup Guide

## 🎙️ Voice Call Feature Implementation

This guide explains how to set up LiveKit for real-time voice calls with your AI assistant.

## 📦 Installed Packages

- `livekit-client@^2.0.0` - Core LiveKit client library

## 🚀 Setup Instructions

### 1. LiveKit Server Setup

You'll need to set up a LiveKit server. You can use:

**Option A: LiveKit Cloud (Recommended)**
- Sign up at [livekit.io](https://livekit.io)
- Get your API keys and server URL
- Update `mobile/src/config/livekit.ts` with your credentials

**Option B: Self-hosted LiveKit**
- Deploy LiveKit server on your infrastructure
- Configure with your domain and SSL certificates

### 2. Update Configuration

Edit `mobile/src/config/livekit.ts`:

```typescript
export const LIVEKIT_CONFIG = {
  url: 'wss://your-livekit-server.com', // Your LiveKit server URL
  roomName: 'junk-food-assistant',
  tokenEndpoint: 'https://your-backend.com/api/livekit/token',
};
```

### 3. Backend Token Generation

You need a backend endpoint to generate LiveKit tokens. Example implementation:

```javascript
// Node.js/Express example
const { AccessToken } = require('livekit-server-sdk');

app.post('/api/livekit/token', (req, res) => {
  const { userId, roomName } = req.body;
  
  const token = new AccessToken(
    'your-api-key',
    'your-api-secret',
    {
      identity: userId,
      name: `User ${userId}`,
    }
  );
  
  token.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
  });
  
  res.json({ token: token.toJwt() });
});
```

### 4. Environment Variables

Create `.env` file in your mobile app:

```env
LIVEKIT_URL=wss://your-livekit-server.com
LIVEKIT_API_KEY=your-api-key
LIVEKIT_API_SECRET=your-api-secret
```

## 🎯 Features Implemented

### ✅ Voice Call Screen
- Full-screen voice call interface
- Real-time connection status
- Call duration timer
- Participant management
- Mute/unmute controls

### ✅ LiveKit Service
- Room connection management
- Audio controls (mute/unmute)
- Event handling (participant join/leave)
- Connection state monitoring

### ✅ Chat Integration
- Voice call button in chat header
- Seamless transition to voice call
- Call status indicators

## 🔧 Usage

1. **Start Voice Call**: Tap the call button in the chat header
2. **Mute/Unmute**: Use the microphone button during the call
3. **End Call**: Tap the red end call button
4. **Speaker**: Toggle speaker mode (coming soon)

## 🎨 UI Features

- **Modern Design**: Clean, professional voice call interface
- **Status Indicators**: Real-time connection and call status
- **Call Controls**: Easy-to-use mute, speaker, and end call buttons
- **Participant Display**: Shows who's in the call
- **Call Duration**: Live timer showing call length

## 🚀 Next Steps

1. **Set up LiveKit server** (cloud or self-hosted)
2. **Implement token generation** on your backend
3. **Update configuration** with your server details
4. **Test voice calls** with real audio
5. **Add AI voice synthesis** for assistant responses

## 💡 Value for MVP

This voice call feature significantly increases your MVP's value:

- **Premium Feature**: Voice calls are a premium differentiator
- **Better UX**: More natural interaction than text-only
- **Higher Engagement**: Voice calls increase user retention
- **Competitive Advantage**: Fewer apps offer AI voice calls
- **Justifies $5K Price**: Advanced features command higher prices

## 🔒 Security Notes

- Never expose API secrets in client code
- Always generate tokens on your backend
- Implement proper user authentication
- Use HTTPS/WSS for all connections
- Validate room access permissions

## 🐛 Troubleshooting

**Connection Issues:**
- Check LiveKit server URL and credentials
- Verify network connectivity
- Ensure proper token generation

**Audio Issues:**
- Check microphone permissions
- Verify audio device selection
- Test with different browsers/devices

**Performance:**
- Monitor server resources
- Optimize audio quality settings
- Implement connection fallbacks 
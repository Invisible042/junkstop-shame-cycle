// LiveKit Configuration
// Replace these values with your actual LiveKit server details

export const LIVEKIT_CONFIG = {
  // Your LiveKit server URL (e.g., wss://your-livekit-server.com)
  url: 'wss://your-livekit-server.com',
  
  // Room name for the AI assistant
  roomName: 'junk-food-assistant',
  
  // Token generation endpoint (you'll need to implement this on your backend)
  tokenEndpoint: 'https://your-backend.com/api/livekit/token',
};

// Helper function to get LiveKit token from your backend
export const getLiveKitToken = async (userId: string, roomName: string): Promise<string> => {
  try {
    const response = await fetch(LIVEKIT_CONFIG.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        roomName,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get LiveKit token');
    }

    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error('Error getting LiveKit token:', error);
    throw error;
  }
};

// For development/testing, you can use a placeholder token
export const getDevelopmentToken = (): string => {
  // This is just for development - replace with actual token generation
  return 'placeholder-token-for-development';
}; 
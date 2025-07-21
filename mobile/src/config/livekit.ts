// LiveKit Configuration
// Replace these values with your actual LiveKit server details

export const LIVEKIT_CONFIG = {
  // Your LiveKit server URL (e.g., wss://your-livekit-server.com)
  url: 'wss://your-livekit-server.com',
  
  // Room name for the AI assistant
  roomName: 'junk-food-assistant',
  
  // Token generation endpoint (should match backend)
  tokenEndpoint: 'http://localhost:8000/api/livekit/token', // Update this to your backend URL in production
};

// Helper function to get LiveKit token from your backend
export const getLiveKitToken = async (userId: string, roomName: string, isAgent: boolean = false): Promise<string> => {
  try {
    const response = await fetch(LIVEKIT_CONFIG.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        room_name: roomName,
        is_agent: isAgent,
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
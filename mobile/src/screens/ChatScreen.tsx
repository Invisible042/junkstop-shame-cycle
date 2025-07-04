import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { apiRequest } from '../utils/api';
import { colors, spacing, fontSizes, cardStyle, buttonStyle } from '../styles/theme';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function ChatScreen({ navigation }: { navigation: any }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: "Hi! I'm here to help you on your journey to healthier eating habits. How are you feeling today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [guiltLevel, setGuiltLevel] = useState<number | null>(null);
  const [regretLevel, setRegretLevel] = useState<number | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await apiRequest('/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: inputText,
          guilt_level: guiltLevel,
          regret_level: regretLevel,
        }),
      });

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response.response,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      Alert.alert('Error', 'Failed to get response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const quickResponses = [
    'I just ate junk food',
    'I\'m feeling guilty',
    'Help me stay motivated',
    'I want to break this habit',
    'I\'m struggling today',
  ];

  const sendQuickResponse = (text: string) => {
    setInputText(text);
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient
        colors={['#181c2f', '#23263a']}
        style={{ paddingTop: spacing.xl, paddingBottom: spacing.md, alignItems: 'center', borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}
      >
        <Text style={{ color: colors.accent, fontSize: fontSizes.heading, fontWeight: 'bold', letterSpacing: 2 }}>Junk Stop</Text>
        <Text style={{ color: colors.text, fontSize: fontSizes.body, marginTop: spacing.xs }}>Chat Support</Text>
      </LinearGradient>
      <FlatList
        data={messages}
        renderItem={({ item }) => (
          <View style={[cardStyle, { marginVertical: spacing.xs, alignSelf: item.isUser ? 'flex-end' : 'flex-start', backgroundColor: item.isUser ? colors.accent : colors.card }]}> 
            <Text style={{ color: item.isUser ? '#fff' : colors.text }}>{item.text}</Text>
          </View>
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: spacing.lg }}
      />
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: spacing.md }}>
        <TextInput
          style={{ flex: 1, backgroundColor: colors.card, color: colors.text, borderRadius: 16, padding: spacing.sm, marginRight: spacing.sm }}
          placeholder="Type your message..."
          placeholderTextColor={colors.textSecondary}
          value={inputText}
          onChangeText={setInputText}
        />
        <TouchableOpacity style={[buttonStyle, { backgroundColor: colors.accent }]} onPress={sendMessage}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerRight: {
    width: 34,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  messageWrapper: {
    marginBottom: 15,
  },
  userMessageWrapper: {
    alignItems: 'flex-end',
  },
  aiMessageWrapper: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userMessage: {
    backgroundColor: '#9b59b6',
  },
  aiMessage: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#fff',
  },
  aiMessageText: {
    color: '#333',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  userMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  aiMessageTime: {
    color: '#999',
  },
  loadingMessage: {
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  loadingDots: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 2,
  },
  dot1: {
    // Animation would be added here in a real implementation
  },
  dot2: {
    // Animation would be added here in a real implementation
  },
  dot3: {
    // Animation would be added here in a real implementation
  },
  quickResponsesContainer: {
    paddingVertical: 10,
  },
  quickResponses: {
    paddingHorizontal: 20,
  },
  quickResponseButton: {
    backgroundColor: '#e8e8e8',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
  },
  quickResponseText: {
    fontSize: 14,
    color: '#333',
  },
  feelingsContainer: {
    backgroundColor: '#fff',
    margin: 20,
    marginBottom: 10,
    padding: 15,
    borderRadius: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  feelingsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  feelingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  feelingGroup: {
    flex: 1,
    marginHorizontal: 5,
  },
  feelingLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  ratingButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ratingButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedRating: {
    backgroundColor: '#9b59b6',
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
  },
  selectedRatingText: {
    color: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#9b59b6',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
});
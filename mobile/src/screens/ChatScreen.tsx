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
import { Ionicons } from '@expo/vector-icons';
import { sendChatMessage } from '../utils/openrouter';
import { useTheme } from '../contexts/ThemeContext';
import VoiceCallScreen from './VoiceCallScreen';
import { useAuth } from '../contexts/AuthContext';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isVoice?: boolean;
}

export default function ChatScreen({ navigation }: { navigation: any }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: "Hi! I'm your AI junk food assistant. I'm here to help you on your journey to healthier eating habits. How are you feeling today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isVoiceCall, setIsVoiceCall] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const { theme } = useTheme();
  const { user } = useAuth(); // Get user from AuthContext

  // TODO: Replace with actual user ID from auth context
  const userId = 'user123';

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText('');
    setIsLoading(true);

    try {
      const aiResponse = await sendChatMessage(currentInput);
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      Alert.alert('Error', 'Failed to get response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const startVoiceCall = () => {
    if (!user) {
      Alert.alert('Please Log In', 'You must be logged in to start a voice call.');
      return;
    }
    setIsVoiceCall(true);
  };

  const startVoiceRecording = () => {
    setIsRecording(true);
    // Simulate voice recording
    setTimeout(() => {
      setIsRecording(false);
      Alert.alert('Voice Message', 'Voice recording feature is coming soon!');
    }, 2000);
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
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View style={[
      styles.messageContainer,
      item.isUser ? styles.userMessageContainer : styles.aiMessageContainer
    ]}>
      <View style={[
        styles.messageBubble,
        item.isUser ? [styles.userBubble, { backgroundColor: theme.accent }] : [styles.aiBubble, { backgroundColor: theme.cardBg }]
      ]}>
        {item.isVoice ? (
          <View style={styles.voiceMessageContainer}>
            <Ionicons name="play-circle" size={24} color={item.isUser ? '#fff' : theme.accent} />
            <View style={styles.voiceWaveform}>
              <View style={[styles.voiceBar, { backgroundColor: item.isUser ? '#fff' : theme.accent }]} />
              <View style={[styles.voiceBar, { backgroundColor: item.isUser ? '#fff' : theme.accent }]} />
              <View style={[styles.voiceBar, { backgroundColor: item.isUser ? '#fff' : theme.accent }]} />
            </View>
            <Text style={[styles.voiceDuration, { color: item.isUser ? 'rgba(255,255,255,0.8)' : theme.textSecondary }]}>
              0:15
            </Text>
          </View>
        ) : (
          <Text style={[
            styles.messageText,
            item.isUser ? styles.userMessageText : { color: theme.text }
          ]}>
            {item.text}
          </Text>
        )}
        <Text style={[
          styles.messageTime,
          item.isUser ? styles.userMessageTime : { color: theme.textSecondary }
        ]}>
          {formatTime(item.timestamp)}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Enhanced Header with Voice Call */}
        <View style={[styles.header, { backgroundColor: theme.cardBg }]}>
          <View style={styles.headerContent}>
            <View style={[styles.aiAvatar, { backgroundColor: theme.accent + '20' }]}>
              <Ionicons name="chatbubble-ellipses" size={24} color={theme.accent} />
            </View>
            <View style={styles.headerText}>
              <Text style={[styles.headerTitle, { color: theme.text }]}>AI Assistant</Text>
              <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
                {isLoading ? 'Typing...' : isVoiceCall ? 'Voice Call Active' : 'Online'}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.voiceCallButton, { backgroundColor: isVoiceCall ? '#e74c3c' : theme.accent }]}
              onPress={startVoiceCall}
            >
              <Ionicons 
                name={isVoiceCall ? "call" : "call-outline"} 
                size={20} 
                color="#fff" 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
        />

        {/* Quick Responses */}
        {messages.length === 1 && (
          <View style={styles.quickResponsesContainer}>
            <Text style={[styles.quickResponsesTitle, { color: theme.textSecondary }]}>
              Quick responses:
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickResponsesScroll}>
              {quickResponses.map((response, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.quickResponseButton, { backgroundColor: theme.cardBg }]}
                  onPress={() => sendQuickResponse(response)}
                >
                  <Text style={[styles.quickResponseText, { color: theme.text }]}>{response}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Modern Input Area */}
        <View style={[styles.inputContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.inputWrapper, { backgroundColor: theme.cardBg }]}>
            <TouchableOpacity
              style={[styles.voiceButton, { backgroundColor: isRecording ? '#e74c3c' : theme.accent + '20' }]}
              onPress={startVoiceRecording}
            >
              <Ionicons 
                name={isRecording ? "stop" : "mic"} 
                size={20} 
                color={isRecording ? "#fff" : theme.accent} 
              />
            </TouchableOpacity>
            
            <View style={[styles.textInputContainer, { backgroundColor: theme.inputBg }]}>
              <TextInput
                style={[styles.textInput, { color: theme.text }]}
                placeholder="Type your message..."
                placeholderTextColor={theme.textSecondary}
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={500}
              />
            </View>
            
            <TouchableOpacity
              style={[
                styles.sendButton,
                { backgroundColor: inputText.trim() && !isLoading ? theme.accent : theme.textSecondary }
              ]}
              onPress={sendMessage}
              disabled={!inputText.trim() || isLoading}
            >
              {isLoading ? (
                <Ionicons name="ellipsis-horizontal" size={20} color="#fff" />
              ) : (
                <Ionicons name="send" size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Voice Call Screen */}
      <VoiceCallScreen
        visible={isVoiceCall}
        onClose={() => setIsVoiceCall(false)}
        userId={user?.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 56,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  voiceCallButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  aiMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userBubble: {
    borderBottomRightRadius: 6,
  },
  aiBubble: {
    borderBottomLeftRadius: 6,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 4,
  },
  userMessageText: {
    color: '#fff',
  },
  messageTime: {
    fontSize: 12,
    alignSelf: 'flex-end',
  },
  userMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  voiceMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  voiceWaveform: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  voiceBar: {
    width: 3,
    height: 20,
    marginHorizontal: 1,
    borderRadius: 2,
  },
  voiceDuration: {
    fontSize: 12,
  },
  quickResponsesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  quickResponsesTitle: {
    fontSize: 14,
    marginBottom: 8,
  },
  quickResponsesScroll: {
    flexDirection: 'row',
  },
  quickResponseButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  quickResponseText: {
    fontSize: 14,
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  voiceButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInputContainer: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  textInput: {
    fontSize: 16,
    maxHeight: 100,
    paddingVertical: 4,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
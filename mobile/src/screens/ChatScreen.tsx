import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '../context/DataContext';
import { generateMotivation } from '../services/aiService';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: number;
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const { getWeekStats, currentStreak, logs } = useData();

  useEffect(() => {
    // Initialize with welcome message
    const welcomeMessage: Message = {
      id: '0',
      text: `Hi! I'm your personal junk food coach. I'm here to help you build better eating habits and stay motivated on your journey. How are you feeling about your progress today?`,
      isBot: true,
      timestamp: Date.now(),
    };
    setMessages([welcomeMessage]);
  }, []);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isBot: false,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      // Generate AI response based on user's data and message
      const weekStats = getWeekStats();
      const response = await generateCoachResponse(inputText, weekStats, currentStreak, logs.length);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        isBot: true,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error generating response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm having trouble responding right now, but I'm here for you! Keep pushing forward with your healthy choices.",
        isBot: true,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const generateCoachResponse = async (userInput: string, weekStats: any, streak: number, totalLogs: number): Promise<string> => {
    const input = userInput.toLowerCase();
    
    // Pattern matching for common questions/concerns
    if (input.includes('craving') || input.includes('want') || input.includes('tempted')) {
      return `I understand cravings can be tough! You've shown strength by maintaining a ${streak}-day streak. Try these strategies: drink a glass of water, take 5 deep breaths, or do 10 jumping jacks. The craving will pass in 3-5 minutes. What healthy alternative could you choose instead?`;
    }
    
    if (input.includes('failed') || input.includes('gave in') || input.includes('ate')) {
      return `It's okay - setbacks happen to everyone building new habits. You've logged ${totalLogs} items, which shows you're committed to awareness. The fact that you're here talking to me means you haven't given up. What did you learn from this experience that can help you next time?`;
    }
    
    if (input.includes('motivat') || input.includes('encourage') || input.includes('help')) {
      if (streak > 0) {
        return `You're doing amazing with your ${streak}-day streak! That's ${streak} days of choosing health over impulse. Remember why you started this journey. Your future self is thanking you for every healthy choice you make today. What's your next healthy goal?`;
      } else {
        return `Every journey starts with a single step, and you're here - that's what matters! You've tracked ${totalLogs} items, showing incredible self-awareness. Today is a fresh start. What's one small healthy choice you can make right now?`;
      }
    }
    
    if (input.includes('progress') || input.includes('how am i doing')) {
      const avgGuilt = weekStats.avgGuilt || 0;
      if (weekStats.frequency === 0) {
        return `You haven't logged any junk food this week - that's fantastic! Your ${streak}-day clean streak shows real progress. Keep building these healthy momentum. What strategies are working best for you?`;
      } else {
        return `This week you've logged ${weekStats.frequency} items with an average guilt of ${avgGuilt.toFixed(1)}/10. Your awareness is growing! Current streak: ${streak} days. Focus on extending that streak - you've got this!`;
      }
    }
    
    if (input.includes('tip') || input.includes('advice') || input.includes('strategy')) {
      const tips = [
        'Try the "10-minute rule" - when you crave junk food, wait 10 minutes and reassess.',
        'Keep healthy snacks visible and junk food out of sight (or out of the house).',
        'Before eating, ask yourself: "Will this move me closer to or further from my goals?"',
        'Replace the habit loop: same cue, better reward. Stressed? Try a walk instead of chips.',
        'Plan your meals ahead of time so you\'re never making decisions when hungry.',
      ];
      return tips[Math.floor(Math.random() * tips.length)] + ' What challenges are you facing that I can help with?';
    }
    
    // Default response using AI service
    return await generateMotivation({
      frequency: weekStats.frequency,
      avgGuilt: weekStats.avgGuilt,
      avgRegret: weekStats.avgRegret,
      totalCalories: weekStats.totalCalories,
    });
  };

  const quickResponses = [
    "I'm feeling tempted",
    "How am I doing?",
    "I need motivation",
    "Give me a tip",
    "I failed today",
  ];

  return (
    <LinearGradient
      colors={['#7C3AED', '#3B82F6', '#1E40AF']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Ionicons name="chatbubble-ellipses" size={24} color="white" />
          <Text style={styles.title}>Coach Chat</Text>
          <View style={styles.placeholder} />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.chatContainer}
        >
          <ScrollView 
            style={styles.messagesContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.messagesContent}
          >
            {messages.map((message) => (
              <View
                key={message.id}
                style={[
                  styles.messageContainer,
                  message.isBot ? styles.botMessage : styles.userMessage,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    message.isBot ? styles.botText : styles.userText,
                  ]}
                >
                  {message.text}
                </Text>
                <Text
                  style={[
                    styles.timestamp,
                    message.isBot ? styles.botTimestamp : styles.userTimestamp,
                  ]}
                >
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            ))}
            
            {loading && (
              <View style={[styles.messageContainer, styles.botMessage]}>
                <View style={styles.typingIndicator}>
                  <View style={styles.typingDot} />
                  <View style={styles.typingDot} />
                  <View style={styles.typingDot} />
                </View>
              </View>
            )}
          </ScrollView>

          {/* Quick Responses */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.quickResponsesContainer}
            contentContainerStyle={styles.quickResponsesContent}
          >
            {quickResponses.map((response, index) => (
              <TouchableOpacity
                key={index}
                style={styles.quickResponse}
                onPress={() => setInputText(response)}
              >
                <Text style={styles.quickResponseText}>{response}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Input Area */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask your coach anything..."
              placeholderTextColor="#94A3B8"
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
              onPress={sendMessage}
              disabled={!inputText.trim() || loading}
            >
              <Ionicons name="send" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
  },
  placeholder: {
    width: 24,
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  messagesContent: {
    paddingBottom: 20,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  botMessage: {
    alignSelf: 'flex-start',
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    padding: 16,
    borderRadius: 20,
  },
  botText: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    color: '#374151',
  },
  userText: {
    backgroundColor: '#8B5CF6',
    color: 'white',
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
    paddingHorizontal: 8,
  },
  botTimestamp: {
    color: '#94A3B8',
    textAlign: 'left',
  },
  userTimestamp: {
    color: '#E2E8F0',
    textAlign: 'right',
  },
  typingIndicator: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#94A3B8',
    marginHorizontal: 2,
  },
  quickResponsesContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  quickResponsesContent: {
    paddingRight: 20,
  },
  quickResponse: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  quickResponseText: {
    color: 'white',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 10,
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: 'white',
    fontSize: 16,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  sendButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
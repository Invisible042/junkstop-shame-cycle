import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { liveKitService, LiveKitConfig } from '../services/LiveKitService';
import { ConnectionState } from 'livekit-client';
import { LIVEKIT_CONFIG, getDevelopmentToken } from '../config/livekit';

interface VoiceCallScreenProps {
  visible: boolean;
  onClose: () => void;
}

export default function VoiceCallScreen({ visible, onClose }: VoiceCallScreenProps) {
  const { theme } = useTheme();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [participants, setParticipants] = useState<string[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isConnected) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isConnected]);

  useEffect(() => {
    if (visible) {
      startCall();
    } else {
      endCall();
    }
  }, [visible]);

  const startCall = async () => {
    setIsConnecting(true);
    try {
      // Use LiveKit configuration
      const config: LiveKitConfig = {
        url: LIVEKIT_CONFIG.url,
        token: getDevelopmentToken(), // Replace with actual token generation
        roomName: LIVEKIT_CONFIG.roomName,
      };

      // Set up event handlers
      liveKitService.setEventHandlers({
        onParticipantJoined: (participant) => {
          setParticipants(prev => [...prev, participant.identity]);
        },
        onParticipantLeft: (participant) => {
          setParticipants(prev => prev.filter(p => p !== participant.identity));
        },
        onConnectionStateChanged: (state) => {
          if (state === ConnectionState.Connected) {
            setIsConnected(true);
            setIsConnecting(false);
          } else if (state === ConnectionState.Disconnected) {
            setIsConnected(false);
            setIsConnecting(false);
            onClose();
          }
        },
      });

      await liveKitService.connect(config);
      await liveKitService.enableMicrophone();
    } catch (error) {
      console.error('Failed to start call:', error);
      Alert.alert('Call Failed', 'Unable to connect to voice call. Please try again.');
      setIsConnecting(false);
      onClose();
    }
  };

  const endCall = async () => {
    try {
      await liveKitService.disconnect();
    } catch (error) {
      console.error('Error ending call:', error);
    }
    setIsConnected(false);
    setIsConnecting(false);
    setCallDuration(0);
    setParticipants([]);
  };

  const toggleMute = async () => {
    try {
      if (isMuted) {
        await liveKitService.unmuteMicrophone();
        setIsMuted(false);
      } else {
        await liveKitService.muteMicrophone();
        setIsMuted(true);
      }
    } catch (error) {
      console.error('Error toggling mute:', error);
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.cardBg }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Voice Call</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Call Status */}
        <View style={styles.statusContainer}>
          <View style={[styles.aiAvatar, { backgroundColor: theme.accent + '20' }]}>
            <Ionicons name="chatbubble-ellipses" size={48} color={theme.accent} />
          </View>
          
          <Text style={[styles.aiName, { color: theme.text }]}>AI Assistant</Text>
          
          <Text style={[styles.callStatus, { color: theme.textSecondary }]}>
            {isConnecting ? 'Connecting...' : isConnected ? 'Connected' : 'Disconnected'}
          </Text>

          {isConnected && (
            <Text style={[styles.callDuration, { color: theme.accent }]}>
              {formatDuration(callDuration)}
            </Text>
          )}

          {participants.length > 0 && (
            <Text style={[styles.participantsText, { color: theme.textSecondary }]}>
              {participants.length} participant(s) in call
            </Text>
          )}
        </View>

        {/* Call Controls */}
        <View style={styles.controlsContainer}>
          <View style={styles.controlsRow}>
            {/* Mute Button */}
            <TouchableOpacity
              style={[
                styles.controlButton,
                { backgroundColor: isMuted ? '#e74c3c' : theme.cardBg }
              ]}
              onPress={toggleMute}
              disabled={!isConnected}
            >
              <Ionicons 
                name={isMuted ? "mic-off" : "mic"} 
                size={24} 
                color={isMuted ? "#fff" : theme.accent} 
              />
            </TouchableOpacity>

            {/* End Call Button */}
            <TouchableOpacity
              style={[styles.endCallButton, { backgroundColor: '#e74c3c' }]}
              onPress={endCall}
            >
              <Ionicons name="call" size={24} color="#fff" />
            </TouchableOpacity>

            {/* Speaker Button */}
            <TouchableOpacity
              style={[styles.controlButton, { backgroundColor: theme.cardBg }]}
              onPress={() => Alert.alert('Speaker', 'Speaker toggle coming soon!')}
              disabled={!isConnected}
            >
              <Ionicons name="volume-high" size={24} color={theme.accent} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Call Info */}
        <View style={[styles.infoContainer, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.infoTitle, { color: theme.text }]}>Voice Call Features</Text>
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>
            • Real-time voice conversation with AI assistant
          </Text>
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>
            • Mute/unmute your microphone
          </Text>
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>
            • High-quality audio with LiveKit
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSpacer: {
    width: 40,
  },
  statusContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  aiAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  aiName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  callStatus: {
    fontSize: 16,
    marginBottom: 16,
  },
  callDuration: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  participantsText: {
    fontSize: 14,
  },
  controlsContainer: {
    paddingHorizontal: 32,
    paddingBottom: 32,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  endCallButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 4,
  },
}); 
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { liveKitService, LiveKitConfig } from '../services/LiveKitService';
import { ConnectionState, RemoteParticipant } from 'livekit-client';
import { LIVEKIT_CONFIG, getLiveKitToken } from '../config/livekit';

interface VoiceCallScreenProps {
  visible: boolean;
  onClose: () => void;
  userId: number | null;
}

export default function VoiceCallScreen({ visible, onClose, userId }: VoiceCallScreenProps) {
  const { theme } = useTheme();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [participants, setParticipants] = useState<string[]>([]);

  useEffect(() => {
    if (visible) {
      if (!userId) {
        Alert.alert('Authentication Error', 'You must be logged in to start a voice call.');
        onClose();
        return;
      }
      startCall();
    } else {
      endCall();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, userId]);

  const startCall = async () => {
    if (!userId) return;
    setIsConnecting(true);
    try {
      const token = await getLiveKitToken(String(userId), LIVEKIT_CONFIG.roomName);
      const config: LiveKitConfig = {
        url: LIVEKIT_CONFIG.url,
        token,
        roomName: LIVEKIT_CONFIG.roomName,
      };

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
            // Add self to participants
            setParticipants(prev => {
              if (!prev.includes(String(userId))) return [String(userId), ...prev];
              return prev;
            });
          } else if (state === ConnectionState.Disconnected) {
            setIsConnected(false);
            setIsConnecting(false);
            setParticipants([]);
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
    setParticipants([]);
    onClose();
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

  const renderParticipant = ({ item }: { item: string }) => (
    <View style={styles.participantItem}>
      <Ionicons
        name={item.startsWith('agent_') ? 'robot' : 'person'}
        size={20}
        color={item.startsWith('agent_') ? theme.accent : theme.text}
        style={{ marginRight: 8 }}
      />
      <Text style={{ color: theme.text }}>
        {item.startsWith('agent_') ? 'AI Assistant' : item}
      </Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <View style={[styles.container, { backgroundColor: theme.background }]}>        
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.cardBg }]}>          
          <Text style={[styles.headerTitle, { color: theme.text }]}>Voice Call</Text>
          <TouchableOpacity onPress={endCall} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>

        {/* Call Status */}
        <View style={styles.statusContainer}>
          <Text style={[styles.statusText, { color: theme.textSecondary }]}>            
            {isConnecting ? 'Connecting...' : isConnected ? 'Connected' : 'Disconnected'}
          </Text>
        </View>

        {/* Participants */}
        <View style={styles.participantsContainer}>
          <Text style={[styles.participantsTitle, { color: theme.text }]}>Participants</Text>
          <FlatList
            data={participants}
            renderItem={renderParticipant}
            keyExtractor={item => item}
            contentContainerStyle={styles.participantsList}
          />
        </View>

        {/* Call Controls */}
        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={[styles.controlButton, { backgroundColor: isMuted ? '#e74c3c' : theme.cardBg }]}
            onPress={toggleMute}
            disabled={!isConnected}
          >
            <Ionicons
              name={isMuted ? 'mic-off' : 'mic'}
              size={24}
              color={isMuted ? '#fff' : theme.accent}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.endCallButton, { backgroundColor: '#e74c3c' }]}
            onPress={endCall}
          >
            <Ionicons name="call" size={24} color="#fff" />
          </TouchableOpacity>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  statusContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  statusText: {
    fontSize: 16,
  },
  participantsContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  participantsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  participantsList: {
    paddingBottom: 8,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 32,
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
}); 
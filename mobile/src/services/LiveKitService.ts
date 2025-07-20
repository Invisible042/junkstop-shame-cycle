import {
  Room,
  RoomEvent,
  RemoteParticipant,
  LocalParticipant,
  ConnectionState,
  DisconnectReason,
  Track,
  RemoteTrackPublication,
  LocalTrackPublication,
  Participant,
  DataPacket_Kind,
  RoomConnectOptions,
} from 'livekit-client';

export interface LiveKitConfig {
  url: string;
  token: string;
  roomName: string;
}

export interface LiveKitEventHandlers {
  onParticipantJoined?: (participant: RemoteParticipant) => void;
  onParticipantLeft?: (participant: RemoteParticipant) => void;
  onConnectionStateChanged?: (state: ConnectionState) => void;
  onTrackSubscribed?: (track: Track, publication: RemoteTrackPublication, participant: RemoteParticipant) => void;
  onTrackUnsubscribed?: (track: Track, publication: RemoteTrackPublication, participant: RemoteParticipant) => void;
  onDataReceived?: (payload: Uint8Array, participant?: RemoteParticipant) => void;
  onLocalTrackPublished?: (publication: LocalTrackPublication) => void;
  onLocalTrackUnpublished?: (publication: LocalTrackPublication) => void;
}

class LiveKitServiceClass {
  private room: Room | null = null;
  private eventHandlers: LiveKitEventHandlers = {};
  private connecting = false;

  constructor() {
    this.setupRoom();
  }

  private setupRoom() {
    this.room = new Room({
      adaptiveStream: true,
      dynacast: true,
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.room) return;

    // Connection state changes
    this.room.on(RoomEvent.ConnectionStateChanged, (state: ConnectionState) => {
      console.log('Connection state changed:', state);
      this.eventHandlers.onConnectionStateChanged?.(state);
    });

    // Participant events
    this.room.on(RoomEvent.ParticipantConnected, (participant: RemoteParticipant) => {
      console.log('Participant joined:', participant.identity);
      this.eventHandlers.onParticipantJoined?.(participant);
    });

    this.room.on(RoomEvent.ParticipantDisconnected, (participant: RemoteParticipant) => {
      console.log('Participant left:', participant.identity);
      this.eventHandlers.onParticipantLeft?.(participant);
    });

    // Track events
    this.room.on(RoomEvent.TrackSubscribed, (track: Track, publication: RemoteTrackPublication, participant: RemoteParticipant) => {
      console.log('Track subscribed:', track.kind, 'from', participant.identity);
      this.eventHandlers.onTrackSubscribed?.(track, publication, participant);
    });

    this.room.on(RoomEvent.TrackUnsubscribed, (track: Track, publication: RemoteTrackPublication, participant: RemoteParticipant) => {
      console.log('Track unsubscribed:', track.kind, 'from', participant.identity);
      this.eventHandlers.onTrackUnsubscribed?.(track, publication, participant);
    });

    // Local track events
    this.room.on(RoomEvent.LocalTrackPublished, (publication: LocalTrackPublication) => {
      console.log('Local track published:', publication.track?.kind);
      this.eventHandlers.onLocalTrackPublished?.(publication);
    });

    this.room.on(RoomEvent.LocalTrackUnpublished, (publication: LocalTrackPublication) => {
      console.log('Local track unpublished:', publication.track?.kind);
      this.eventHandlers.onLocalTrackUnpublished?.(publication);
    });

    // Data events
    this.room.on(RoomEvent.DataReceived, (payload: Uint8Array, participant?: RemoteParticipant) => {
      console.log('Data received from:', participant?.identity);
      this.eventHandlers.onDataReceived?.(payload, participant);
    });

    // Disconnect events
    this.room.on(RoomEvent.Disconnected, (reason?: DisconnectReason) => {
      console.log('Disconnected from room:', reason);
    });
  }

  setEventHandlers(handlers: LiveKitEventHandlers) {
    this.eventHandlers = { ...this.eventHandlers, ...handlers };
  }

  async connect(config: LiveKitConfig): Promise<void> {
    if (!this.room || this.connecting) {
      throw new Error('Already connecting or room not initialized');
    }

    this.connecting = true;

    try {
      const connectOptions: RoomConnectOptions = {
        autoSubscribe: true,
        rtcConfig: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
          ],
        },
      };

      await this.room.connect(config.url, config.token, connectOptions);
      console.log('Successfully connected to room:', config.roomName);
    } catch (error) {
      console.error('Failed to connect to room:', error);
      throw error;
    } finally {
      this.connecting = false;
    }
  }

  async disconnect(): Promise<void> {
    if (!this.room) return;

    try {
      await this.room.disconnect();
      console.log('Disconnected from room');
    } catch (error) {
      console.error('Error disconnecting from room:', error);
      throw error;
    }
  }

  async enableMicrophone(): Promise<void> {
    if (!this.room) {
      throw new Error('Not connected to room');
    }

    try {
      await this.room.localParticipant.setMicrophoneEnabled(true);
      console.log('Microphone enabled');
    } catch (error) {
      console.error('Failed to enable microphone:', error);
      throw error;
    }
  }

  async disableMicrophone(): Promise<void> {
    if (!this.room) {
      throw new Error('Not connected to room');
    }

    try {
      await this.room.localParticipant.setMicrophoneEnabled(false);
      console.log('Microphone disabled');
    } catch (error) {
      console.error('Failed to disable microphone:', error);
      throw error;
    }
  }

  async muteMicrophone(): Promise<void> {
    if (!this.room) {
      throw new Error('Not connected to room');
    }

    try {
      await this.room.localParticipant.setMicrophoneEnabled(false);
      console.log('Microphone muted');
    } catch (error) {
      console.error('Failed to mute microphone:', error);
      throw error;
    }
  }

  async unmuteMicrophone(): Promise<void> {
    if (!this.room) {
      throw new Error('Not connected to room');
    }

    try {
      await this.room.localParticipant.setMicrophoneEnabled(true);
      console.log('Microphone unmuted');
    } catch (error) {
      console.error('Failed to unmute microphone:', error);
      throw error;
    }
  }

  async enableCamera(): Promise<void> {
    if (!this.room) {
      throw new Error('Not connected to room');
    }

    try {
      await this.room.localParticipant.setCameraEnabled(true);
      console.log('Camera enabled');
    } catch (error) {
      console.error('Failed to enable camera:', error);
      throw error;
    }
  }

  async disableCamera(): Promise<void> {
    if (!this.room) {
      throw new Error('Not connected to room');
    }

    try {
      await this.room.localParticipant.setCameraEnabled(false);
      console.log('Camera disabled');
    } catch (error) {
      console.error('Failed to disable camera:', error);
      throw error;
    }
  }

  async publishData(data: Uint8Array, topic?: string): Promise<void> {
    if (!this.room) {
      throw new Error('Not connected to room');
    }

    try {
      await this.room.localParticipant.publishData(data);
      console.log('Data published');
    } catch (error) {
      console.error('Failed to publish data:', error);
      throw error;
    }
  }

  getConnectionState(): ConnectionState | null {
    return this.room?.state || null;
  }

  getLocalParticipant(): LocalParticipant | null {
    return this.room?.localParticipant || null;
  }

  getRemoteParticipants(): RemoteParticipant[] {
    return this.room ? Array.from(this.room.remoteParticipants.values()) : [];
  }

  getAllParticipants(): Participant[] {
    if (!this.room) return [];
    
    const participants: Participant[] = [this.room.localParticipant];
    participants.push(...this.getRemoteParticipants());
    return participants;
  }

  isConnected(): boolean {
    return this.room?.state === ConnectionState.Connected;
  }

  isConnecting(): boolean {
    return this.connecting;
  }

  getRoom(): Room | null {
    return this.room;
  }

  // Cleanup method
  destroy() {
    if (this.room) {
      this.room.disconnect();
      this.room = null;
    }
  }
}

// Export singleton instance
export const liveKitService = new LiveKitServiceClass(); 
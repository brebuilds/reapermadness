import osc from 'osc';

export interface ReaperOSCConfig {
  host: string;
  port: number;
  listenPort: number;
}

export interface LoopTrack {
  id: number;
  state: 'empty' | 'recording' | 'playing' | 'stopped';
  hasContent: boolean;
}

export interface ReaperState {
  tempo: number;
  isPlaying: boolean;
  isRecording: boolean;
  repeatEnabled: boolean;
  looperTracks: LoopTrack[];
  timestamp: number;
}

type StateChangeListener = (state: ReaperState) => void;

const DEFAULT_CONFIG: ReaperOSCConfig = {
  host: process.env.OSC_HOST || '127.0.0.1',
  port: parseInt(process.env.OSC_PORT || '8000'),
  listenPort: parseInt(process.env.OSC_LISTEN_PORT || '9000'),
};

// MIDI note mappings for Super8 looper
const SUPER8_NOTES = {
  track1: 36, // C2
  track2: 37, // C#2
  track3: 38, // D2
  track4: 39, // D#2
  track5: 40, // E2
  track6: 41, // F2
  track7: 42, // F#2
  track8: 43, // G2
  stopAll: 44, // G#2
  clearAll: 46, // A#2
};

export class ReaperOSCClient {
  private udpPort: osc.UDPPort | null = null;
  private config: ReaperOSCConfig;
  private connected: boolean = false;
  private state: ReaperState;
  private listeners: StateChangeListener[] = [];

  constructor(config: Partial<ReaperOSCConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    // Initialize default state
    this.state = {
      tempo: 120,
      isPlaying: false,
      isRecording: false,
      repeatEnabled: false,
      looperTracks: Array.from({ length: 8 }, (_, i) => ({
        id: i + 1,
        state: 'empty',
        hasContent: false,
      })),
      timestamp: Date.now(),
    };
  }

  /**
   * Initialize the OSC connection
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.udpPort = new osc.UDPPort({
          localAddress: '0.0.0.0',
          localPort: this.config.listenPort,
          remoteAddress: this.config.host,
          remotePort: this.config.port,
        });

        this.udpPort.on('ready', () => {
          this.connected = true;
          console.log(`OSC connected: sending to ${this.config.host}:${this.config.port}`);
          resolve();
        });

        this.udpPort.on('error', (err: Error) => {
          console.error('OSC error:', err);
          reject(err);
        });

        this.udpPort.on('message', (oscMsg: any) => {
          console.log('OSC received:', oscMsg);
          this.parseOSCMessage(oscMsg);
        });

        this.udpPort.open();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Send an OSC message
   */
  private send(address: string, args: any[] = []): void {
    if (!this.udpPort) {
      // Create a one-shot UDP connection if not connected
      const udp = new osc.UDPPort({
        localAddress: '0.0.0.0',
        localPort: 0,
        remoteAddress: this.config.host,
        remotePort: this.config.port,
      });

      udp.on('ready', () => {
        udp.send({ address, args });
        setTimeout(() => udp.close(), 100);
      });

      udp.open();
    } else {
      this.udpPort.send({ address, args });
    }
  }

  // Transport controls
  play(): void {
    this.send('/play', [{ type: 'i', value: 1 }]);
  }

  stop(): void {
    this.send('/stop', [{ type: 'i', value: 1 }]);
  }

  pause(): void {
    this.send('/pause', [{ type: 'i', value: 1 }]);
  }

  record(): void {
    this.send('/record', [{ type: 'i', value: 1 }]);
  }

  toggleRepeat(): void {
    this.send('/repeat', [{ type: 'i', value: 1 }]);
  }

  toggleMetronome(): void {
    this.send('/click', [{ type: 'i', value: 1 }]);
  }

  // Position controls
  goToStart(): void {
    this.send('/time', [{ type: 'f', value: 0 }]);
  }

  rewind(): void {
    this.send('/rewind', [{ type: 'i', value: 1 }]);
  }

  forward(): void {
    this.send('/forward', [{ type: 'i', value: 1 }]);
  }

  // Tempo control
  setTempo(bpm: number): void {
    this.send('/tempo/raw', [{ type: 'f', value: bpm }]);
  }

  // Action trigger
  triggerAction(actionId: number | string): void {
    this.send(`/action/${actionId}`, [{ type: 'i', value: 1 }]);
  }

  // Track controls
  setTrackVolume(trackNum: number, volume: number): void {
    this.send(`/track/${trackNum}/volume`, [{ type: 'f', value: volume }]);
  }

  setTrackPan(trackNum: number, pan: number): void {
    this.send(`/track/${trackNum}/pan`, [{ type: 'f', value: pan }]);
  }

  setTrackMute(trackNum: number, muted: boolean): void {
    this.send(`/track/${trackNum}/mute`, [{ type: 'i', value: muted ? 1 : 0 }]);
  }

  setTrackSolo(trackNum: number, soloed: boolean): void {
    this.send(`/track/${trackNum}/solo`, [{ type: 'i', value: soloed ? 1 : 0 }]);
  }

  setTrackRecordArm(trackNum: number, armed: boolean): void {
    this.send(`/track/${trackNum}/recarm`, [{ type: 'i', value: armed ? 1 : 0 }]);
  }

  selectTrack(trackNum: number): void {
    this.send(`/track/${trackNum}/select`, [{ type: 'i', value: 1 }]);
  }

  // Super8 Looper controls (via MIDI notes)
  private sendMidiNote(note: number, velocity: number = 127): void {
    // Send MIDI via OSC virtual keyboard
    this.send(`/vkb_midi/0/${note}/${velocity}`, []);
  }

  loopTrack(track: number): void {
    if (track >= 1 && track <= 8) {
      const noteKey = `track${track}` as keyof typeof SUPER8_NOTES;
      this.sendMidiNote(SUPER8_NOTES[noteKey]);
    }
  }

  loopStopAll(): void {
    this.sendMidiNote(SUPER8_NOTES.stopAll);
  }

  loopClearAll(): void {
    this.sendMidiNote(SUPER8_NOTES.clearAll);
  }

  // Parse incoming OSC messages to update state
  private parseOSCMessage(msg: any): void {
    if (!msg || !msg.address) return;

    const address = msg.address;
    const args = msg.args || [];
    const value = args[0]?.value;

    let stateChanged = false;

    try {
      // Transport state
      if (address === '/play') {
        if (this.state.isPlaying !== (value === 1)) {
          this.state.isPlaying = value === 1;
          stateChanged = true;
        }
      } else if (address === '/record') {
        if (this.state.isRecording !== (value === 1)) {
          this.state.isRecording = value === 1;
          stateChanged = true;
        }
      } else if (address === '/repeat') {
        if (this.state.repeatEnabled !== (value === 1)) {
          this.state.repeatEnabled = value === 1;
          stateChanged = true;
        }
      }
      // Tempo
      else if (address === '/tempo/raw' || address === '/tempo') {
        const newTempo = Math.round(parseFloat(value) * 10) / 10;
        if (this.state.tempo !== newTempo) {
          this.state.tempo = newTempo;
          stateChanged = true;
        }
      }
      // Track states (for looper tracking)
      else if (address.startsWith('/track/') && address.includes('/recarm')) {
        const trackMatch = address.match(/\/track\/(\d+)\//);
        if (trackMatch) {
          const trackNum = parseInt(trackMatch[1]);
          if (trackNum >= 1 && trackNum <= 8) {
            const track = this.state.looperTracks[trackNum - 1];
            const armed = value === 1;
            if (armed && track.state === 'empty') {
              track.state = 'recording';
              track.hasContent = true;
              stateChanged = true;
            }
          }
        }
      }

      if (stateChanged) {
        this.state.timestamp = Date.now();
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Error parsing OSC message:', error);
    }
  }

  // Notify all listeners of state change
  private notifyListeners(): void {
    const stateCopy = JSON.parse(JSON.stringify(this.state));
    this.listeners.forEach(listener => {
      try {
        listener(stateCopy);
      } catch (error) {
        console.error('Error in state change listener:', error);
      }
    });
  }

  // Get current REAPER state
  getState(): ReaperState {
    return JSON.parse(JSON.stringify(this.state));
  }

  // Subscribe to state changes
  onStateChange(listener: StateChangeListener): () => void {
    this.listeners.push(listener);
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Disconnect
  disconnect(): void {
    if (this.udpPort) {
      this.udpPort.close();
      this.udpPort = null;
      this.connected = false;
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  getConfig(): ReaperOSCConfig {
    return { ...this.config };
  }

  updateConfig(config: Partial<ReaperOSCConfig>): void {
    this.config = { ...this.config, ...config };
    if (this.connected) {
      this.disconnect();
    }
  }
}

// Singleton instance for shared use
export const reaperClient = new ReaperOSCClient();

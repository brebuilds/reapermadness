import osc from 'osc';

export interface ReaperOSCConfig {
  host: string;
  port: number;
  listenPort: number;
}

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

  constructor(config: Partial<ReaperOSCConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
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

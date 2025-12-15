import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type View = 'dashboard' | 'chat' | 'settings';
export type LoopTrackState = 'empty' | 'recording' | 'playing' | 'stopped';

interface LoopTrack {
  id: number;
  state: LoopTrackState;
  hasContent: boolean;
}

interface AppState {
  // View state
  currentView: View;
  performanceMode: boolean;

  // Connection state
  serverUrl: string;
  isConnected: boolean;

  // Transport state
  isPlaying: boolean;
  isRecording: boolean;
  repeatEnabled: boolean;
  tempo: number;

  // Looper state
  loopTracks: LoopTrack[];

  // Settings
  oscHost: string;
  oscPort: number;
  apiKey: string;

  // Actions
  setView: (view: View) => void;
  togglePerformanceMode: () => void;
  setServerUrl: (url: string) => void;
  setConnected: (connected: boolean) => void;
  setTransportState: (state: Partial<Pick<AppState, 'isPlaying' | 'isRecording' | 'repeatEnabled' | 'tempo'>>) => void;
  setLoopTrackState: (trackId: number, state: LoopTrackState, hasContent?: boolean) => void;
  setSettings: (settings: Partial<Pick<AppState, 'oscHost' | 'oscPort' | 'apiKey' | 'serverUrl'>>) => void;
}

const initialLoopTracks: LoopTrack[] = Array.from({ length: 8 }, (_, i) => ({
  id: i + 1,
  state: 'empty',
  hasContent: false,
}));

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state
      currentView: 'dashboard',
      performanceMode: false,
      serverUrl: 'http://localhost:3001',
      isConnected: false,
      isPlaying: false,
      isRecording: false,
      repeatEnabled: false,
      tempo: 120,
      loopTracks: initialLoopTracks,
      oscHost: '127.0.0.1',
      oscPort: 8000,
      apiKey: '',

      // Actions
      setView: (view) => set({ currentView: view }),

      togglePerformanceMode: () =>
        set((state) => ({ performanceMode: !state.performanceMode })),

      setServerUrl: (serverUrl) => set({ serverUrl }),

      setConnected: (isConnected) => set({ isConnected }),

      setTransportState: (transportState) => set(transportState),

      setLoopTrackState: (trackId, state, hasContent) =>
        set((appState) => ({
          loopTracks: appState.loopTracks.map((track) =>
            track.id === trackId
              ? { ...track, state, hasContent: hasContent ?? track.hasContent }
              : track
          ),
        })),

      setSettings: (settings) => set(settings),
    }),
    {
      name: 'reaper-assistant-settings',
      partialize: (state) => ({
        serverUrl: state.serverUrl,
        oscHost: state.oscHost,
        oscPort: state.oscPort,
        apiKey: state.apiKey,
        performanceMode: state.performanceMode,
      }),
    }
  )
);

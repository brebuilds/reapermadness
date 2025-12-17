import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type View = 'dashboard' | 'chat' | 'settings';
export type LoopTrackState = 'empty' | 'recording' | 'playing' | 'stopped';

interface LoopTrack {
  id: number;
  state: LoopTrackState;
  hasContent: boolean;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolCalls?: { name: string; result: string }[];
}

export interface UserProfile {
  name: string;
  experience: 'beginner' | 'intermediate' | 'advanced';
  gear: {
    audioInterface?: string;
    footController?: string;
    instruments: string[];
  };
  preferences: {
    preferredTempo?: number;
    genres: string[];
  };
  goals: string[];
  notes?: string;
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

  // Chat messages
  messages: Message[];

  // User profile
  userProfile: UserProfile | null;

  // Actions
  setView: (view: View) => void;
  togglePerformanceMode: () => void;
  setServerUrl: (url: string) => void;
  setConnected: (connected: boolean) => void;
  setTransportState: (state: Partial<Pick<AppState, 'isPlaying' | 'isRecording' | 'repeatEnabled' | 'tempo'>>) => void;
  setLoopTrackState: (trackId: number, state: LoopTrackState, hasContent?: boolean) => void;
  setSettings: (settings: Partial<Pick<AppState, 'oscHost' | 'oscPort' | 'apiKey' | 'serverUrl'>>) => void;
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
  clearMessages: () => void;
  setUserProfile: (profile: UserProfile) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
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
      apiKey: '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',
      messages: [],
      userProfile: null,

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

      addMessage: (message) =>
        set((state) => ({ messages: [...state.messages, message] })),

      setMessages: (messages) => set((state) => ({
        messages: typeof messages === 'function' ? messages(state.messages) : messages
      })),

      clearMessages: () => set({ messages: [] }),

      setUserProfile: (profile) => set({ userProfile: profile }),

      updateUserProfile: (updates) =>
        set((state) => ({
          userProfile: state.userProfile
            ? { ...state.userProfile, ...updates }
            : null,
        })),
    }),
    {
      name: 'reaper-assistant-settings',
      partialize: (state) => ({
        serverUrl: state.serverUrl,
        oscHost: state.oscHost,
        oscPort: state.oscPort,
        apiKey: state.apiKey,
        performanceMode: state.performanceMode,
        messages: state.messages,
        userProfile: state.userProfile,
      }),
    }
  )
);

// Detect if running in Electron
const isElectron = typeof window !== 'undefined' && 
  window.location.protocol === 'file:';

// Get server URL from localStorage or default
function getServerUrl(): string {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('reaper-assistant-settings');
    if (stored) {
      try {
        const settings = JSON.parse(stored);
        if (settings.state?.serverUrl) {
          return settings.state.serverUrl;
        }
      } catch (e) {
        // ignore parse errors
      }
    }
  }
  
  // In Electron (file:// protocol), always use localhost:3001
  if (isElectron) {
    return 'http://localhost:3001';
  }
  
  // Default: same origin (for local dev) or env variable
  return import.meta.env.VITE_API_URL || '';
}

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const serverUrl = getServerUrl();
  const response = await fetch(`${serverUrl}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

// ==================== Knowledge API ====================

export async function searchKnowledge(query: string) {
  return fetchAPI<{ results: Array<{ path: string; content: string; score: number }> }>(
    `/api/search?q=${encodeURIComponent(query)}`
  );
}

export async function getSuper8Info() {
  return fetchAPI('/api/knowledge/super8');
}

export async function getLiveLoopingInfo() {
  return fetchAPI('/api/knowledge/live-looping');
}

export async function getLinuxSetup() {
  return fetchAPI('/api/knowledge/linux');
}

export async function getTroubleshooting(issue?: string) {
  const endpoint = issue
    ? `/api/knowledge/troubleshooting/${encodeURIComponent(issue)}`
    : '/api/knowledge/troubleshooting';
  return fetchAPI(endpoint);
}

// ==================== Transport API ====================

export async function transportPlay() {
  return fetchAPI('/api/transport/play', { method: 'POST' });
}

export async function transportStop() {
  return fetchAPI('/api/transport/stop', { method: 'POST' });
}

export async function transportRecord() {
  return fetchAPI('/api/transport/record', { method: 'POST' });
}

export async function transportToggleRepeat() {
  return fetchAPI('/api/transport/repeat', { method: 'POST' });
}

export async function transportToggleMetronome() {
  return fetchAPI('/api/transport/metronome', { method: 'POST' });
}

export async function transportGoToStart() {
  return fetchAPI('/api/transport/goto-start', { method: 'POST' });
}

export async function setTempo(bpm: number) {
  return fetchAPI('/api/tempo', {
    method: 'POST',
    body: JSON.stringify({ bpm }),
  });
}

export async function triggerAction(actionId: number) {
  return fetchAPI(`/api/action/${actionId}`, { method: 'POST' });
}

// ==================== Looper API ====================

export async function looperTriggerTrack(track: number) {
  return fetchAPI(`/api/looper/track/${track}`, { method: 'POST' });
}

export async function looperStopAll() {
  return fetchAPI('/api/looper/stop-all', { method: 'POST' });
}

export async function looperClearAll() {
  return fetchAPI('/api/looper/clear-all', { method: 'POST' });
}

// ==================== Track API ====================

export async function setTrackVolume(trackNum: number, volume: number) {
  return fetchAPI(`/api/track/${trackNum}/volume`, {
    method: 'POST',
    body: JSON.stringify({ volume }),
  });
}

export async function setTrackMute(trackNum: number, muted: boolean) {
  return fetchAPI(`/api/track/${trackNum}/mute`, {
    method: 'POST',
    body: JSON.stringify({ muted }),
  });
}

export async function setTrackSolo(trackNum: number, soloed: boolean) {
  return fetchAPI(`/api/track/${trackNum}/solo`, {
    method: 'POST',
    body: JSON.stringify({ soloed }),
  });
}

// ==================== Config API ====================

export async function getOSCConfig() {
  return fetchAPI<{ host: string; port: number; listenPort: number }>('/api/osc/config');
}

export async function updateOSCConfig(config: { host?: string; port?: number; listenPort?: number }) {
  return fetchAPI('/api/osc/config', {
    method: 'POST',
    body: JSON.stringify(config),
  });
}

export async function healthCheck(serverUrl?: string) {
  const url = serverUrl || getServerUrl();
  const response = await fetch(`${url}/health`, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return response.json() as Promise<{ status: string; osc: { host: string; port: number } }>;
}

// ==================== Chat API (Streaming) ====================

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface StreamChatOptions {
  message: string;
  conversationHistory: Message[];
  apiKey: string;
  reaperState?: any;
  userProfile?: any;
  onChunk: (chunk: string) => void;
  onFollowUps?: (followUps: string[]) => void;
  onError: (error: string) => void;
  onComplete: () => void;
}

export async function streamChat(options: StreamChatOptions): Promise<void> {
  const {
    message,
    conversationHistory,
    apiKey,
    reaperState,
    userProfile,
    onChunk,
    onFollowUps,
    onError,
    onComplete,
  } = options;

  try {
    const serverUrl = getServerUrl();
    const response = await fetch(`${serverUrl}/api/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        conversationHistory,
        apiKey,
        reaperState,
        userProfile,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error('No response body');
    }

    // Process SSE stream
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      // Decode and add to buffer
      buffer += decoder.decode(value, { stream: true });

      // Process complete lines
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);

          try {
            const parsed = JSON.parse(data);

            if (parsed.type === 'chunk' && parsed.content) {
              onChunk(parsed.content);
            } else if (parsed.type === 'followups' && parsed.followups) {
              if (onFollowUps) {
                onFollowUps(parsed.followups);
              }
            } else if (parsed.type === 'error') {
              onError(parsed.error || 'Unknown error');
              return;
            } else if (parsed.type === 'complete') {
              onComplete();
              return;
            }
          } catch (e) {
            console.warn('Failed to parse SSE data:', data);
          }
        }
      }
    }

    // Stream ended without explicit completion
    onComplete();

  } catch (error: any) {
    onError(error.message || 'Failed to connect to streaming API');
  }
}

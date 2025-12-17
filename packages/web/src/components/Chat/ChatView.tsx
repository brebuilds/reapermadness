import { useState, useRef, useEffect } from 'react';
import { useAppStore, Message } from '../../stores/appStore';
import { streamChat } from '../../api/client';
import { Send, Loader2, Sparkles, Zap, Wrench, Mic, AlertCircle, User, Copy, Trash2, Check } from 'lucide-react';
import { useVoiceRecognition } from '../../hooks/useVoiceRecognition';
import { ProfileDialog } from '../Profile/ProfileDialog';

const WELCOME_MESSAGE = `Hey Marc! 👋 I'm **Reapermadness**, your personal REAPER expert!

I'm here to help you with everything REAPER, especially **live looping** - that's my jam!

## 🎯 What I Can Do (40 Tools at My Disposal!)

### 📚 **Answer Any REAPER Question**
I have deep knowledge about:
• Super8 looper (MIDI mappings, sync modes, everything!)
• All ReaPlugs & extensions (SWS, ReaPack, ReaLearn)
• Live looping hardware & workflows
• ASIO setup & latency optimization
• Keyboard shortcuts & action IDs
• Troubleshooting any issue

### 🎮 **Control REAPER For You**
Just tell me what to do:
• *"Start recording"* - I'll hit record
• *"Set tempo to 85"* - Done!
• *"Arm track 2"* - Armed!
• *"Zoom in"* - Zoomed!
• *"Stop all loops"* - Super8 cleared!
• *"Go to next marker"* - Jumped!

### 🔧 **Create Complete Setups**
Ask me to design workflows:
• *"Set up REAPER for live looping"*
• *"Configure Super8 with a foot controller"*
• *"Optimize my system for low latency"*

💡 **Pro Tip**: Make sure REAPER has OSC enabled (Preferences → Control/OSC) and check Settings here!

What can I help you with today? 🎸`;

const WELCOME_MESSAGE_NO_API = `Hey! 👋 I'm **Reapermadness**, your REAPER knowledge assistant.

I can search through comprehensive info about:
• Super8 looper & live looping workflows
• All ReaPlugs, extensions, and actions
• Windows audio (ASIO setup & optimization)
• Troubleshooting guides

🎮 **Control REAPER via the Looper Tab**
Visual controls for Super8 tracks, transport, and tempo!

⚡ **Unlock the Full Experience!**
Add your Anthropic API key in Settings to get:
✅ **40 powerful tools** - I can answer questions AND control REAPER for you
✅ **Conversational expert** - Smart, contextual responses
✅ **Setup workflows** - I'll guide you through complete configurations
✅ **Direct REAPER control** - Just tell me what to do!

Try asking: "How do I set up Super8?" or "What's the best foot controller?"`;

export function ChatView() {
  const { apiKey, messages, addMessage, setMessages, userProfile } = useAppStore();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);
  const [isGeneratingFollowUps, setIsGeneratingFollowUps] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [profilePromptDismissed, setProfilePromptDismissed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with welcome message if no messages exist
  useEffect(() => {
    if (messages.length === 0) {
      addMessage({
        id: '1',
        role: 'assistant',
        content: apiKey ? WELCOME_MESSAGE : WELCOME_MESSAGE_NO_API,
      });
    }
  }, []);

  // Voice recognition hook
  const { isRecording, isSupported, transcript, error: voiceError, startRecording, stopRecording } = useVoiceRecognition();

  // Update input when transcript changes
  useEffect(() => {
    if (transcript && !isRecording) {
      setInput(transcript);
    }
  }, [transcript, isRecording]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    if (!apiKey) {
      const errorMessage: Message = {
        id: (Date.now()).toString(),
        role: 'assistant',
        content: "Please add your Anthropic API key in Settings to start chatting! I'll be able to provide intelligent, conversational expert answers once you do. 🚀",
      };
      addMessage(errorMessage);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    addMessage(userMessage);
    setInput('');
    setFollowUpQuestions([]); // Clear previous follow-ups
    setIsLoading(true);

    // Create placeholder assistant message for streaming
    const assistantId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
    };
    addMessage(assistantMessage);

    let accumulatedText = '';

    try {
      // Get REAPER state from app store (tempo, looper tracks, etc.)
      const appStore = useAppStore.getState();
      const reaperState = {
        tempo: appStore.tempo,
        isPlaying: appStore.isPlaying,
        isRecording: appStore.isRecording,
        looperTracks: appStore.loopTracks,
      };

      // User profile if available (will be added in Phase 2)
      const userProfile = (appStore as any).userProfile || undefined;

      // Prepare conversation history (simple format for API)
      const conversationHistory = messages.map(m => ({
        role: m.role,
        content: m.content,
      }));

      // Call streaming API
      await streamChat({
        message: input,
        conversationHistory,
        apiKey,
        reaperState,
        userProfile,
        onChunk: (chunk: string) => {
          accumulatedText += chunk;
          // Update the assistant message with accumulated text
          setMessages((prevMessages: Message[]) => prevMessages.map((m: Message) =>
            m.id === assistantId ? { ...m, content: accumulatedText } : m
          ));
        },
        onFollowUps: (followUps: string[]) => {
          setFollowUpQuestions(followUps);
          setIsGeneratingFollowUps(false);
        },
        onError: (error: string) => {
          console.error('Streaming error:', error);
          let helpText = 'Check your API key in Settings or try again!';
          if (error.includes('401') || error.includes('authentication')) {
            helpText = 'Invalid API key. Please update it in Settings.';
          } else if (error.includes('429') || error.includes('rate limit')) {
            helpText = 'Rate limit exceeded. Please wait a moment and try again.';
          } else if (error.includes('connect') || error.includes('ECONNREFUSED')) {
            helpText = 'Cannot connect to server. Make sure it\'s running with `pnpm dev:server`.';
          }
          setMessages((prevMessages: Message[]) => prevMessages.map((m: Message) =>
            m.id === assistantId
              ? { ...m, content: `Error: ${error}\n\n💡 ${helpText}` }
              : m
          ));
        },
        onComplete: () => {
          setIsLoading(false);
          setIsGeneratingFollowUps(true); // Show loading while generating follow-ups
          // Auto-clear loading state after 5s if no follow-ups arrive
          setTimeout(() => {
            setIsGeneratingFollowUps(false);
          }, 5000);
        },
      });

    } catch (error: any) {
      console.error('Chat error:', error);
      let helpText = 'Make sure the server is running and your API key is correct!';
      const errorMsg = error.message || 'Unknown error';
      if (errorMsg.includes('fetch') || errorMsg.includes('network')) {
        helpText = 'Network error. Check that the server is running with `pnpm dev:server`.';
      }
      setMessages((prevMessages: Message[]) => prevMessages.map((m: Message) =>
        m.id === assistantId
          ? { ...m, content: `Error: ${errorMsg}\n\n💡 ${helpText}` }
          : m
      ));
      setIsLoading(false);
    }
  };

  const handleCopyMessage = async (messageId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleClearConversation = () => {
    if (confirm('Clear all messages? This cannot be undone.')) {
      const { clearMessages } = useAppStore.getState();
      clearMessages();
      setFollowUpQuestions([]);
      setIsGeneratingFollowUps(false);
    }
  };

  const quickQueries = [
    { label: '🎸 Super8 setup', query: 'How do I set up Super8 for live looping?' },
    { label: '🎹 MIDI mapping', query: 'What MIDI notes control Super8 tracks?' },
    { label: '🎚️ ASIO setup', query: 'How do I set up ASIO for low latency in REAPER?' },
    { label: '🦶 Foot controllers', query: 'What foot controller do you recommend for looping?' },
    { label: '⚡ Fix latency', query: 'How do I reduce latency for live performance?' },
    { label: '🔌 Best VSTs', query: 'What are the best free VST plugins for live looping?' },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-280px)] min-h-[400px]">
      {/* API Key Notice */}
      {!apiKey && (
        <div className="mb-4 p-3 bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/50 rounded-lg flex items-start gap-2">
          <Zap className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-purple-200">
            <span className="font-medium">Unlock full power:</span> Add your Anthropic API key in Settings for intelligent, conversational expert answers!
          </div>
        </div>
      )}

      {/* Profile Setup Prompt */}
      {apiKey && !userProfile && !profilePromptDismissed && messages.length > 2 && (
        <div className="mb-4 p-3 bg-gradient-to-r from-green-900/30 to-teal-900/30 border border-green-500/50 rounded-lg">
          <div className="flex items-start gap-2">
            <User className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="text-sm text-green-200 mb-2">
                <span className="font-medium">👋 Hey Marc!</span> Want to set up your profile? I can give better advice if I know your gear and goals.
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowProfileDialog(true)}
                  className="px-3 py-1.5 text-xs bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors"
                >
                  Set up profile
                </button>
                <button
                  onClick={() => setProfilePromptDismissed(true)}
                  className="px-3 py-1.5 text-xs text-gray-400 hover:text-gray-200 transition-colors"
                >
                  Maybe later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clear conversation button */}
      {messages.length > 1 && (
        <div className="flex justify-end mb-2">
          <button
            onClick={handleClearConversation}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
            title="Clear conversation"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-reaper-accent text-white rounded-br-md'
                  : 'bg-reaper-surface border border-reaper-border rounded-bl-md'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 text-reaper-accent text-xs font-medium">
                    <Sparkles className="w-3 h-3" />
                    Reapermadness
                  </div>
                  <button
                    onClick={() => handleCopyMessage(message.id, message.content)}
                    className="p-1 hover:bg-reaper-hover rounded transition-colors"
                    title="Copy message"
                  >
                    {copiedMessageId === message.id ? (
                      <Check className="w-3.5 h-3.5 text-green-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-gray-400 hover:text-gray-200" />
                    )}
                  </button>
                </div>
              )}
              {message.toolCalls && message.toolCalls.length > 0 && (
                <div className="mb-3 space-y-1">
                  {message.toolCalls.map((tc, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-green-400 bg-green-900/20 px-2 py-1 rounded">
                      <Wrench className="w-3 h-3" />
                      <span className="font-mono">{tc.name.replace('reaper_', '')}</span>
                      <span className="text-green-300">✓</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-reaper-surface border border-reaper-border rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex items-center gap-2 text-reaper-accent">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Follow-up Questions */}
      {(followUpQuestions.length > 0 || isGeneratingFollowUps) && (
        <div className="mb-3 p-3 bg-reaper-surface/50 rounded-lg border border-reaper-border">
          <div className="flex flex-wrap gap-2 items-center justify-between">
            <div className="flex flex-wrap gap-2 items-center flex-1">
              {isGeneratingFollowUps && followUpQuestions.length === 0 ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin text-purple-400" />
                  <span className="text-xs text-purple-400 font-medium">✨ Generating suggestions...</span>
                </>
              ) : (
                <>
                  <span className="text-xs text-gray-400 font-medium">💡 Try asking:</span>
                  {followUpQuestions.map((question, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setInput(question);
                        setFollowUpQuestions([]);
                        setIsGeneratingFollowUps(false);
                      }}
                      className="px-3 py-1.5 text-sm rounded-full bg-purple-900/30 border border-purple-500/50 hover:bg-purple-900/50 hover:border-purple-400 transition-colors"
                    >
                      {question}
                    </button>
                  ))}
                </>
              )}
            </div>
            <button
              onClick={() => {
                setFollowUpQuestions([]);
                setIsGeneratingFollowUps(false);
              }}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
              title="Dismiss suggestions"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Quick queries */}
      <div className="flex flex-wrap gap-2 mb-3">
        {quickQueries.map(({ label, query }) => (
          <button
            key={label}
            onClick={() => setInput(query)}
            className="px-3 py-1.5 text-xs rounded-full bg-reaper-surface border border-reaper-border hover:border-reaper-accent hover:text-reaper-accent transition-colors"
          >
            {label}
          </button>
        ))}
      </div>

      {/* Voice error display */}
      {voiceError && (
        <div className="mb-2 p-2 bg-red-900/30 border border-red-500/50 rounded text-sm text-red-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {voiceError}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder={isRecording ? "🎤 Listening... (speak now)" : "Ask Reapermadness anything about REAPER..."}
          className={`flex-1 px-4 py-3 rounded-xl bg-reaper-surface border focus:outline-none transition-colors ${
            isRecording
              ? 'border-reaper-accent border-2 bg-reaper-accent/5'
              : 'border-reaper-border focus:border-reaper-accent'
          }`}
          disabled={isLoading || isRecording}
        />

        {/* Microphone button */}
        {isSupported && (
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isLoading}
            className={`px-5 py-3 rounded-xl transition-all touch-target ${
              isRecording
                ? 'bg-reaper-accent text-white voice-recording-pulse'
                : 'bg-reaper-surface border border-reaper-border hover:border-reaper-accent hover:text-reaper-accent'
            }`}
            title={isRecording ? 'Stop recording' : 'Start voice input'}
          >
            <Mic className="w-5 h-5" />
          </button>
        )}

        {/* Profile button */}
        <button
          onClick={() => setShowProfileDialog(true)}
          disabled={isLoading}
          className="px-5 py-3 rounded-xl bg-reaper-surface border border-reaper-border hover:border-reaper-accent hover:text-reaper-accent transition-all touch-target"
          title={userProfile ? `Profile: ${userProfile.name}` : 'Setup your profile'}
        >
          <User className={`w-5 h-5 ${userProfile ? 'text-green-400' : ''}`} />
        </button>

        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="px-5 py-3 rounded-xl bg-reaper-accent hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>

      {/* Profile Dialog */}
      <ProfileDialog
        isOpen={showProfileDialog}
        onClose={() => setShowProfileDialog(false)}
      />
    </div>
  );
}



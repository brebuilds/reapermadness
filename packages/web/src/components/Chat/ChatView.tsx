import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../stores/appStore';
import { searchKnowledge } from '../../api/client';
import { Send, Loader2, Sparkles, Zap, Wrench } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolCalls?: { name: string; result: string }[];
}

// Complete set of 40 REAPER tools - synced with MCP server
const REAPER_TOOLS = [
  // Knowledge Tools
  {
    name: 'reaper_search',
    description: 'Search the REAPER knowledge base for any topic. Use natural language queries.',
    input_schema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query - natural language' },
      },
      required: ['query'],
    },
  },
  {
    name: 'reaper_get_overview',
    description: 'Get general information about REAPER DAW',
    input_schema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'reaper_get_pricing',
    description: 'Get REAPER licensing and pricing information',
    input_schema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'reaper_get_features',
    description: "Get REAPER's core features and v7 highlights",
    input_schema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'reaper_get_plugin',
    description: 'Get information about built-in plugins (ReaPlugs)',
    input_schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Plugin name (e.g., ReaComp, ReaEQ)' },
      },
      required: [],
    },
  },
  {
    name: 'reaper_get_extension',
    description: 'Get information about REAPER extensions (SWS, ReaPack, Playtime, ReaLearn)',
    input_schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Extension name' },
      },
      required: [],
    },
  },
  {
    name: 'reaper_get_action',
    description: 'Find REAPER action by ID or name search',
    input_schema: {
      type: 'object',
      properties: {
        search: { type: 'string', description: 'Action ID number or name to search' },
      },
      required: ['search'],
    },
  },
  {
    name: 'reaper_get_shortcuts',
    description: 'Get keyboard shortcuts by category',
    input_schema: {
      type: 'object',
      properties: {
        category: { type: 'string', description: 'Category: transport, editing, navigation, tracks, markers, views' },
      },
      required: [],
    },
  },
  {
    name: 'reaper_get_super8',
    description: 'Get complete Super8 looper documentation including MIDI mappings',
    input_schema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'reaper_get_live_looping',
    description: 'Get information about live looping setups, hardware, and workflows',
    input_schema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'reaper_get_linux_setup',
    description: 'Get Linux audio setup guide (JACK, PipeWire, yabridge)',
    input_schema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'reaper_get_osc',
    description: 'Get OSC setup and control information for REAPER',
    input_schema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'reaper_get_workflow',
    description: 'Get workflow guide for specific use cases',
    input_schema: {
      type: 'object',
      properties: {
        type: { type: 'string', description: 'Workflow: podcast, audiobook, filmScoring, livePerformance' },
      },
      required: [],
    },
  },
  {
    name: 'reaper_get_troubleshooting',
    description: 'Get troubleshooting help for common issues',
    input_schema: {
      type: 'object',
      properties: {
        issue: { type: 'string', description: 'Issue: latency, dropouts, midi, sync, vst, sound' },
      },
      required: [],
    },
  },
  // Transport Control Tools
  {
    name: 'reaper_play',
    description: 'Start REAPER playback',
    input_schema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'reaper_stop',
    description: 'Stop REAPER playback',
    input_schema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'reaper_record',
    description: 'Toggle REAPER recording',
    input_schema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'reaper_toggle_repeat',
    description: 'Toggle loop/repeat mode',
    input_schema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'reaper_set_tempo',
    description: 'Set REAPER project tempo',
    input_schema: {
      type: 'object',
      properties: {
        bpm: { type: 'number', description: 'Tempo in BPM (20-400)' },
      },
      required: ['bpm'],
    },
  },
  {
    name: 'reaper_trigger_action',
    description: 'Trigger any REAPER action by ID number',
    input_schema: {
      type: 'object',
      properties: {
        actionId: { type: 'number', description: 'REAPER action ID number' },
      },
      required: ['actionId'],
    },
  },
  // Super8 Looper Control
  {
    name: 'reaper_loop_track',
    description: 'Control Super8 looper track (record/play/overdub)',
    input_schema: {
      type: 'object',
      properties: {
        track: { type: 'number', description: 'Track number 1-8' },
      },
      required: ['track'],
    },
  },
  {
    name: 'reaper_loop_stop_all',
    description: 'Stop all Super8 looper tracks',
    input_schema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'reaper_loop_clear_all',
    description: 'Clear all Super8 looper tracks',
    input_schema: { type: 'object', properties: {}, required: [] },
  },
  // Project Management
  {
    name: 'reaper_undo',
    description: 'Undo the last action in REAPER',
    input_schema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'reaper_redo',
    description: 'Redo the last undone action in REAPER',
    input_schema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'reaper_save_project',
    description: 'Save the current REAPER project',
    input_schema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'reaper_insert_track',
    description: 'Insert a new track in REAPER',
    input_schema: { type: 'object', properties: {}, required: [] },
  },
  // Navigation Tools
  {
    name: 'reaper_add_marker',
    description: 'Add a marker at the current playback position',
    input_schema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'reaper_goto_marker',
    description: 'Jump to a specific marker number (1-10)',
    input_schema: {
      type: 'object',
      properties: {
        marker: { type: 'number', description: 'Marker number 1-10' },
      },
      required: ['marker'],
    },
  },
  {
    name: 'reaper_next_marker',
    description: 'Jump to the next marker',
    input_schema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'reaper_prev_marker',
    description: 'Jump to the previous marker',
    input_schema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'reaper_goto_start',
    description: 'Go to the beginning of the project',
    input_schema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'reaper_goto_end',
    description: 'Go to the end of the project',
    input_schema: { type: 'object', properties: {}, required: [] },
  },
  // Track Tools
  {
    name: 'reaper_select_track',
    description: 'Select a track by number',
    input_schema: {
      type: 'object',
      properties: {
        track: { type: 'number', description: 'Track number (1-based)' },
      },
      required: ['track'],
    },
  },
  {
    name: 'reaper_arm_track',
    description: 'Arm or disarm a track for recording',
    input_schema: {
      type: 'object',
      properties: {
        track: { type: 'number', description: 'Track number (1-based)' },
        armed: { type: 'boolean', description: 'True to arm, false to disarm' },
      },
      required: ['track', 'armed'],
    },
  },
  {
    name: 'reaper_mute_track',
    description: 'Mute or unmute a track',
    input_schema: {
      type: 'object',
      properties: {
        track: { type: 'number', description: 'Track number (1-based)' },
        muted: { type: 'boolean', description: 'True to mute, false to unmute' },
      },
      required: ['track', 'muted'],
    },
  },
  {
    name: 'reaper_solo_track',
    description: 'Solo or unsolo a track',
    input_schema: {
      type: 'object',
      properties: {
        track: { type: 'number', description: 'Track number (1-based)' },
        soloed: { type: 'boolean', description: 'True to solo, false to unsolo' },
      },
      required: ['track', 'soloed'],
    },
  },
  // Zoom & View Tools
  {
    name: 'reaper_zoom_in',
    description: 'Zoom in on the timeline',
    input_schema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'reaper_zoom_out',
    description: 'Zoom out on the timeline',
    input_schema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'reaper_zoom_fit',
    description: 'Zoom to fit all items in view',
    input_schema: { type: 'object', properties: {}, required: [] },
  },
];

const SYSTEM_PROMPT = `You are Reapermadness - a friendly, passionate REAPER DAW expert who LIVES for live looping and helping musicians get the most out of REAPER. You're like that experienced friend who's been gigging with REAPER for years and knows all the tricks.

## 🎛️ YOU HAVE 40 POWERFUL TOOLS!

You have TWO types of tools - use them intelligently:

### 📚 KNOWLEDGE TOOLS (Use when answering questions or creating setups)
When the user asks "how do I...", "what is...", "tell me about...", USE THESE FIRST:
- reaper_search - Search anything in the knowledge base
- reaper_get_super8 - Complete Super8 looper docs with MIDI mappings
- reaper_get_plugin - Info about ReaPlugs (ReaComp, ReaEQ, etc.)
- reaper_get_extension - SWS, ReaPack, Playtime, ReaLearn info
- reaper_get_action - Find action IDs by name
- reaper_get_shortcuts - Keyboard shortcuts by category
- reaper_get_live_looping - Live looping hardware, workflows, techniques
- reaper_get_linux_setup - JACK, PipeWire, yabridge (Marc uses Windows, but you know Linux too!)
- reaper_get_workflow - Workflow guides (podcast, live performance, etc.)
- reaper_get_troubleshooting - Fix latency, dropouts, MIDI, VST issues
- reaper_get_osc - OSC control setup
- reaper_get_overview, reaper_get_features, reaper_get_pricing

### 🎚️ CONTROL TOOLS (Use when the user wants you to DO something)
When the user says "start recording", "play", "arm track 2", "zoom in" - USE THESE:

**Transport:** play, stop, record, toggle_repeat, set_tempo, goto_start, goto_end
**Navigation:** add_marker, goto_marker, next_marker, prev_marker
**Tracks:** select_track, arm_track, mute_track, solo_track
**View:** zoom_in, zoom_out, zoom_fit
**Super8 Looper:** loop_track (1-8), loop_stop_all, loop_clear_all
**Project:** undo, redo, save_project, insert_track
**Generic:** trigger_action (any REAPER action ID)

## 🧠 HOW TO USE YOUR TOOLS:

**When asked a question:**
1. First use knowledge tools to get accurate info (reaper_get_super8, reaper_search, etc.)
2. Then explain it clearly with specific details from the tool results
3. Mention MIDI notes, shortcuts, action IDs from the knowledge

**When asked to do something:**
1. Just DO IT with control tools - don't ask permission!
2. Use multiple tools in sequence if needed
3. Confirm what you did afterward

**When creating a setup or workflow:**
1. Use knowledge tools to gather info about plugins, extensions, actions needed
2. Explain the complete setup step-by-step
3. Offer to execute steps if they can be done via OSC

## Your Deep Expertise:

### Live Looping (YOUR SPECIALTY!)
- Super8 Looper is the centerpiece - know every detail
- MIDI mappings: C2-G2 (tracks 1-8), G#2 (stop all), A#2 (clear all)
- Sync modes, overdub techniques, performance workflows
- Alternative loopers: Playtime 2, Mobius, MSuperLooper

### MIDI & Controllers
- Foot controllers: FCB1010, Morningstar MC6/MC8, Boss ES-8
- Hands-free operation strategies
- ReaLearn for complex mappings

### Windows Audio
- ASIO setup for low latency
- Buffer size optimization
- Interface configuration

### REAPER Mastery
- Shortcuts, action IDs, routing, ReaPlugs, JSFX, SWS
- Custom actions and macros

## Your Personality:
- Enthusiastic and encouraging - Marc will crush it!
- Practical - specific steps, shortcuts, settings
- Experienced - real gig wisdom
- Use music terminology naturally

## Important:
- Marc is a Windows user into live looping and jambands
- **USE KNOWLEDGE TOOLS** to get accurate info before explaining
- **USE CONTROL TOOLS** to actually DO things in REAPER
- Always cite specific MIDI notes, shortcuts, action IDs

Let's help Marc create amazing live loops! 🎸🔥`;

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
  const { apiKey, serverUrl } = useAppStore();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: apiKey ? WELCOME_MESSAGE : WELCOME_MESSAGE_NO_API,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // First, search the knowledge base for context
      let knowledgeContext = '';
      try {
        const searchResult = await searchKnowledge(input);
        if (searchResult.results.length > 0) {
          knowledgeContext = searchResult.results
            .slice(0, 8)
            .map((r) => `[${r.path}]: ${r.content}`)
            .join('\n\n');
        }
      } catch (e) {
        console.log('Knowledge search failed, continuing without context');
      }

      let responseText: string;
      let toolCalls: { name: string; result: string }[] | undefined;

      if (apiKey) {
        // Use Claude API for intelligent responses with tool support
        const result = await callClaude(input, knowledgeContext, messages, apiKey, serverUrl);
        responseText = result.text;
        toolCalls = result.toolCalls;
      } else {
        // Fallback to knowledge base only
        responseText = knowledgeContext
          ? formatKnowledgeResponse(knowledgeContext)
          : "I couldn't find specific info on that. Try asking about Super8 looper, ASIO setup, REAPER shortcuts, or troubleshooting. Or add your API key in Settings for smarter answers!";
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseText,
        toolCalls,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Oops, hit a snag there! Make sure your API key is correct in Settings and the server is running. Or try rephrasing your question!",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
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
                <div className="flex items-center gap-2 mb-2 text-reaper-accent text-xs font-medium">
                  <Sparkles className="w-3 h-3" />
                  Reapermadness
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

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="Ask Reapermadness anything about REAPER..."
          className="flex-1 px-4 py-3 rounded-xl bg-reaper-surface border border-reaper-border focus:border-reaper-accent focus:outline-none"
          disabled={isLoading}
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="px-5 py-3 rounded-xl bg-reaper-accent hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// Execute a tool call via the server API
async function executeToolCall(toolName: string, toolInput: any, serverUrl: string): Promise<string> {
  try {
    let endpoint = '';
    let body: any = {};
    let method = 'POST';

    switch (toolName) {
      // ==================== Knowledge Tools ====================
      case 'reaper_search':
        method = 'GET';
        endpoint = `/api/search?q=${encodeURIComponent(toolInput.query || '')}`;
        break;
      case 'reaper_get_overview':
        method = 'GET';
        endpoint = '/api/knowledge/overview';
        break;
      case 'reaper_get_pricing':
        method = 'GET';
        endpoint = '/api/knowledge/pricing';
        break;
      case 'reaper_get_features':
        method = 'GET';
        endpoint = '/api/knowledge/features';
        break;
      case 'reaper_get_plugin':
        method = 'GET';
        endpoint = toolInput.name
          ? `/api/knowledge/plugins/${encodeURIComponent(toolInput.name)}`
          : '/api/knowledge/plugins';
        break;
      case 'reaper_get_extension':
        method = 'GET';
        endpoint = toolInput.name
          ? `/api/knowledge/extensions/${encodeURIComponent(toolInput.name)}`
          : '/api/knowledge/extensions';
        break;
      case 'reaper_get_action':
        method = 'GET';
        endpoint = `/api/knowledge/actions/search/${encodeURIComponent(toolInput.search || '')}`;
        break;
      case 'reaper_get_shortcuts':
        method = 'GET';
        endpoint = toolInput.category
          ? `/api/knowledge/shortcuts/${encodeURIComponent(toolInput.category)}`
          : '/api/knowledge/shortcuts';
        break;
      case 'reaper_get_super8':
        method = 'GET';
        endpoint = '/api/knowledge/super8';
        break;
      case 'reaper_get_live_looping':
        method = 'GET';
        endpoint = '/api/knowledge/live-looping';
        break;
      case 'reaper_get_linux_setup':
        method = 'GET';
        endpoint = '/api/knowledge/linux';
        break;
      case 'reaper_get_osc':
        method = 'GET';
        endpoint = '/api/knowledge/osc';
        break;
      case 'reaper_get_workflow':
        method = 'GET';
        endpoint = toolInput.type
          ? `/api/knowledge/workflows/${encodeURIComponent(toolInput.type)}`
          : '/api/knowledge/workflows';
        break;
      case 'reaper_get_troubleshooting':
        method = 'GET';
        endpoint = toolInput.issue
          ? `/api/knowledge/troubleshooting/${encodeURIComponent(toolInput.issue)}`
          : '/api/knowledge/troubleshooting';
        break;

      // ==================== Transport Controls ====================
      case 'reaper_play':
        endpoint = '/api/transport/play';
        break;
      case 'reaper_stop':
        endpoint = '/api/transport/stop';
        break;
      case 'reaper_record':
        endpoint = '/api/transport/record';
        break;
      case 'reaper_toggle_repeat':
        endpoint = '/api/transport/repeat';
        break;
      case 'reaper_goto_start':
        endpoint = '/api/transport/goto-start';
        break;
      case 'reaper_set_tempo':
        endpoint = '/api/tempo';
        body = { bpm: toolInput.bpm };
        break;

      // ==================== Project Management ====================
      case 'reaper_undo':
        endpoint = '/api/action/40029';
        break;
      case 'reaper_redo':
        endpoint = '/api/action/40030';
        break;
      case 'reaper_save_project':
        endpoint = '/api/action/40026';
        break;
      case 'reaper_insert_track':
        endpoint = '/api/action/40001';
        break;

      // ==================== Navigation ====================
      case 'reaper_add_marker':
        endpoint = '/api/action/40157';
        break;
      case 'reaper_goto_marker':
        const marker = toolInput.marker;
        if (marker >= 1 && marker <= 10) {
          endpoint = `/api/action/${40160 + marker}`;
        } else {
          return JSON.stringify({ error: 'Marker must be between 1 and 10' });
        }
        break;
      case 'reaper_next_marker':
        endpoint = '/api/action/40173';
        break;
      case 'reaper_prev_marker':
        endpoint = '/api/action/40172';
        break;
      case 'reaper_goto_end':
        endpoint = '/api/action/40043';
        break;

      // ==================== Track Controls ====================
      case 'reaper_select_track':
        endpoint = `/api/action/40285`; // Track: Go to track ${toolInput.track}
        // Note: REAPER action 40285 selects track, but track number is tricky
        // For now we'll use the generic action trigger
        break;
      case 'reaper_arm_track':
        endpoint = `/api/track/${toolInput.track}/arm`;
        body = { armed: toolInput.armed };
        break;
      case 'reaper_mute_track':
        endpoint = `/api/track/${toolInput.track}/mute`;
        body = { muted: toolInput.muted };
        break;
      case 'reaper_solo_track':
        endpoint = `/api/track/${toolInput.track}/solo`;
        body = { soloed: toolInput.soloed };
        break;

      // ==================== Super8 Looper ====================
      case 'reaper_loop_track':
        endpoint = `/api/looper/track/${toolInput.track}`;
        break;
      case 'reaper_loop_stop_all':
        endpoint = '/api/looper/stop-all';
        break;
      case 'reaper_loop_clear_all':
        endpoint = '/api/looper/clear-all';
        break;

      // ==================== Zoom & View ====================
      case 'reaper_zoom_in':
        endpoint = '/api/action/1012';
        break;
      case 'reaper_zoom_out':
        endpoint = '/api/action/1011';
        break;
      case 'reaper_zoom_fit':
        endpoint = '/api/action/40295';
        break;

      // ==================== Generic Action ====================
      case 'reaper_trigger_action':
        endpoint = `/api/action/${toolInput.actionId}`;
        break;

      default:
        return JSON.stringify({ error: `Unknown tool: ${toolName}` });
    }

    const response = await fetch(`${serverUrl}${endpoint}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: method === 'POST' ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return JSON.stringify({ error: `Server error: ${response.status}`, details: errorText });
    }

    const result = await response.json();
    return JSON.stringify(result);
  } catch (error) {
    return JSON.stringify({
      error: 'Failed to connect to server',
      details: error instanceof Error ? error.message : 'Unknown error',
      hint: 'Make sure the server is running and OSC is configured in Settings'
    });
  }
}

// Call Claude API with tool support
async function callClaude(
  userMessage: string,
  knowledgeContext: string,
  conversationHistory: Message[],
  apiKey: string,
  serverUrl: string
): Promise<{ text: string; toolCalls?: { name: string; result: string }[] }> {
  const contextMessage = knowledgeContext
    ? `\n\nRelevant information from the REAPER knowledge base:\n${knowledgeContext}`
    : '';

  const messages: any[] = [
    ...conversationHistory.slice(-10).map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    {
      role: 'user' as const,
      content: userMessage + contextMessage,
    },
  ];

  // Initial request with tools
  let response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      tools: REAPER_TOOLS,
      messages,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Claude API error:', error);
    throw new Error(`API error: ${response.status}`);
  }

  let data = await response.json();
  const toolCalls: { name: string; result: string }[] = [];
  
  // Handle tool use loop (Claude may want to call multiple tools)
  while (data.stop_reason === 'tool_use') {
    const toolUseBlocks = data.content.filter((block: any) => block.type === 'tool_use');
    const toolResults: any[] = [];
    
    for (const toolUse of toolUseBlocks) {
      console.log(`Executing tool: ${toolUse.name}`, toolUse.input);
      const result = await executeToolCall(toolUse.name, toolUse.input, serverUrl);
      toolCalls.push({ name: toolUse.name, result });
      toolResults.push({
        type: 'tool_result',
        tool_use_id: toolUse.id,
        content: result,
      });
    }

    // Send tool results back to Claude
    messages.push({ role: 'assistant', content: data.content });
    messages.push({ role: 'user', content: toolResults });

    response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        tools: REAPER_TOOLS,
        messages,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Claude API error:', error);
      throw new Error(`API error: ${response.status}`);
    }

    data = await response.json();
  }

  // Extract final text response
  const textBlock = data.content.find((block: any) => block.type === 'text');
  return { 
    text: textBlock?.text || 'Done!',
    toolCalls: toolCalls.length > 0 ? toolCalls : undefined
  };
}

// Format knowledge base results when no API key
function formatKnowledgeResponse(context: string): string {
  const lines = context.split('\n\n').slice(0, 4);
  let response = "Here's what I found:\n\n";

  for (const line of lines) {
    const match = line.match(/\[([^\]]+)\]: (.+)/);
    if (match) {
      response += `**${match[1]}**\n${match[2]}\n\n`;
    } else {
      response += line + '\n\n';
    }
  }

  response += "\n💡 *Add your API key in Settings for more detailed, conversational answers!*";

  return response.trim();
}

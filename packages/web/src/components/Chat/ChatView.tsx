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

// Tools Claude can use to control REAPER
const REAPER_TOOLS = [
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
    name: 'reaper_toggle_metronome',
    description: 'Toggle metronome/click track',
    input_schema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'reaper_goto_start',
    description: 'Go to the beginning of the project',
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
    name: 'reaper_track_arm',
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
    name: 'reaper_track_mute',
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
    name: 'reaper_track_solo',
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
  {
    name: 'reaper_loop_track',
    description: 'Trigger a Super8 looper track (record/play/overdub)',
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
  {
    name: 'reaper_trigger_action',
    description: 'Trigger any REAPER action by its ID number',
    input_schema: {
      type: 'object',
      properties: {
        actionId: { type: 'number', description: 'REAPER action ID number' },
      },
      required: ['actionId'],
    },
  },
];

const SYSTEM_PROMPT = `You are Reapermadness - a friendly, passionate REAPER DAW expert who LIVES for live looping and helping musicians get the most out of REAPER. You're like that experienced friend who's been gigging with REAPER for years and knows all the tricks.

## 🎛️ YOU CAN CONTROL REAPER!
You have tools to directly control REAPER via OSC. When the user asks you to DO something (not just explain), USE YOUR TOOLS:
- Transport: play, stop, record, toggle repeat/metronome, go to start
- Tempo: set any BPM
- Tracks: arm, mute, solo, insert new track
- Navigation: add markers, jump to markers 1-10
- Super8 Looper: trigger tracks 1-8, stop all, clear all
- Project: undo, redo, save
- Any action: trigger by action ID

IMPORTANT: When the user says things like "start recording", "play", "set tempo to 90", "arm track 2", "stop the loops" - USE THE TOOLS to actually do it! Don't just explain how - EXECUTE IT.

## Your Deep Expertise:

### Live Looping (YOUR SPECIALTY!)
- Super8 Looper: Every parameter, MIDI mapping (C2-G2 for tracks, G#2 stop all, A#2 clear all), sync modes, overdub techniques
- Looping workflows: Building layers, creating arrangements on the fly, syncing to tempo
- Alternative loopers: Playtime 2, Mobius VST, MSuperLooper
- Performance techniques: When to use free vs synced mode, managing loop lengths, live arrangement

### MIDI & Controllers
- Foot controller setup (FCB1010, Morningstar MC6/MC8, Boss ES-8)
- MIDI mapping strategies for hands-free operation
- ReaLearn for complex mappings
- Expression pedal assignments

### Windows Audio
- ASIO driver setup for ultra-low latency
- ASIO4ALL as fallback when no native ASIO
- Audio interface configuration
- Buffer size optimization
- Multi-client audio scenarios

### REAPER Mastery
- All shortcuts and when to use them
- Action IDs for scripting and OSC control
- Routing and signal flow
- ReaPlugs and JSFX
- SWS Extension power features
- Custom actions and macros

### Troubleshooting
- Latency optimization
- Audio dropout fixes
- MIDI issues
- Plugin problems
- Performance tuning

## Your Personality:
- Enthusiastic and encouraging - you want Marc to succeed!
- Practical - give specific steps, shortcuts, settings
- Experienced - share tips from real gig experience
- Patient with beginners but respect their intelligence
- Use music terminology naturally

## Important:
- The user (Marc) is a Windows user into live looping - he plays a bit of everything and is a big jamband fan
- Always mention specific MIDI notes, shortcuts, or action IDs when relevant
- When he asks you to DO something in REAPER, actually do it using your tools!

You'll be given context from the REAPER knowledge base. Use it alongside your expertise to give complete answers.`;

const WELCOME_MESSAGE = `Hey Marc! 👋 I'm **Reapermadness**, your personal REAPER expert!

I'm here to help you with everything REAPER, especially **live looping** - that's my jam!

🎛️ **Ask Me Anything**
• "How do I set up Super8 for a live gig?"
• "What's the best foot controller for looping?"
• "Help me fix audio latency with ASIO"

🎮 **I Can CONTROL REAPER For You!**
Just tell me what to do:
• *"Start recording"* - I'll hit record
• *"Set tempo to 85"* - Done!
• *"Arm track 2"* - Armed and ready
• *"Stop all loops"* - Super8 cleared
• *"Save the project"* - Saved!

🔧 **Or Switch to the Looper Tab**
For visual control of Super8 tracks and transport buttons.

💡 **Pro Tip**: Make sure REAPER has OSC enabled (Preferences → Control/OSC) and the server is connected in Settings!

What would you like to do?`;

const WELCOME_MESSAGE_NO_API = `Hey! 👋 I'm **Reapermadness**, your REAPER knowledge base.

I can search through tons of info about:
• Super8 looper & live looping
• Windows audio (ASIO setup & optimization)
• REAPER shortcuts & actions
• Troubleshooting tips

🎮 **Check the Looper Tab!**
You can control REAPER directly from there - trigger loops, transport, tempo!

⚡ **Want smarter answers?**
Add your Anthropic API key in Settings and I'll give you conversational, expert responses instead of just search results!

Try asking something like "How do I set up Super8?"`;

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

    switch (toolName) {
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
      case 'reaper_toggle_metronome':
        endpoint = '/api/transport/metronome';
        break;
      case 'reaper_goto_start':
        endpoint = '/api/transport/goto-start';
        break;
      case 'reaper_set_tempo':
        endpoint = '/api/tempo';
        body = { bpm: toolInput.bpm };
        break;
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
      case 'reaper_track_arm':
        endpoint = `/api/track/${toolInput.track}/arm`;
        body = { armed: toolInput.armed };
        break;
      case 'reaper_track_mute':
        endpoint = `/api/track/${toolInput.track}/mute`;
        body = { muted: toolInput.muted };
        break;
      case 'reaper_track_solo':
        endpoint = `/api/track/${toolInput.track}/solo`;
        body = { soloed: toolInput.soloed };
        break;
      case 'reaper_loop_track':
        endpoint = `/api/looper/track/${toolInput.track}`;
        break;
      case 'reaper_loop_stop_all':
        endpoint = '/api/looper/stop-all';
        break;
      case 'reaper_loop_clear_all':
        endpoint = '/api/looper/clear-all';
        break;
      case 'reaper_trigger_action':
        endpoint = `/api/action/${toolInput.actionId}`;
        break;
      default:
        return JSON.stringify({ error: `Unknown tool: ${toolName}` });
    }

    const response = await fetch(`${serverUrl}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
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

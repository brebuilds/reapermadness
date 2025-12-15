import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../stores/appStore';
import { searchKnowledge } from '../../api/client';
import { Send, Loader2, Sparkles, AlertCircle, Zap } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const SYSTEM_PROMPT = `You are Reapermadness - a friendly, passionate REAPER DAW expert who LIVES for live looping and helping musicians get the most out of REAPER. You're like that experienced friend who's been gigging with REAPER for years and knows all the tricks.

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

### Linux Audio (Critical for the user!)
- JACK configuration for ultra-low latency
- PipeWire as modern JACK replacement
- yabridge for Windows VST/VST3 plugins
- Troubleshooting xruns, permissions, realtime priority
- Recommended distros and setups

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
- The user (Marc) is a Linux user into live looping - he plays a bit of everything and is a big jamband fan
- He's new to this assistant, so be welcoming and show what you can do
- Always mention specific MIDI notes, shortcuts, or action IDs when relevant
- If he asks about controlling REAPER, remind him about the Looper tab where he can control Super8 directly!

You'll be given context from the REAPER knowledge base. Use it alongside your expertise to give complete answers.`;

const WELCOME_MESSAGE = `Hey Marc! 👋 I'm **Reapermadness**, your personal REAPER expert!

I'm here to help you with everything REAPER, especially **live looping** - that's my jam! Here's what I can do for you:

🎛️ **Ask Me Anything**
• "How do I set up Super8 for a live gig?"
• "What's the best foot controller for looping?"
• "Help me fix audio latency on Linux"
• "What shortcuts should I memorize?"

🔧 **I Know Your Setup**
• Linux audio (JACK, PipeWire, yabridge)
• Super8 looper inside and out
• MIDI mapping for hands-free control
• Low-latency performance tuning

🎮 **Check Out the Looper Tab!**
I can also CONTROL your REAPER directly! Switch to the **Looper** tab to:
• Trigger Super8 tracks 1-8
• Control transport (play/stop/record)
• Set tempo on the fly
• Stop/clear all loops instantly

💡 **Pro Tip**: Connect your server in Settings, and you can control REAPER from your phone during a gig!

What would you like to dive into first?`;

const WELCOME_MESSAGE_NO_API = `Hey! 👋 I'm **Reapermadness**, your REAPER knowledge base.

I can search through tons of info about:
• Super8 looper & live looping
• Linux audio (JACK, PipeWire, yabridge)
• REAPER shortcuts & actions
• Troubleshooting tips

🎮 **Check the Looper Tab!**
You can control REAPER directly from there - trigger loops, transport, tempo!

⚡ **Want smarter answers?**
Add your Anthropic API key in Settings and I'll give you conversational, expert responses instead of just search results!

Try asking something like "How do I set up Super8?"`;

export function ChatView() {
  const { apiKey } = useAppStore();
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

      let response: string;

      if (apiKey) {
        // Use Claude API for intelligent responses
        response = await callClaude(input, knowledgeContext, messages, apiKey);
      } else {
        // Fallback to knowledge base only
        response = knowledgeContext
          ? formatKnowledgeResponse(knowledgeContext)
          : "I couldn't find specific info on that. Try asking about Super8 looper, JACK/PipeWire setup, REAPER shortcuts, or troubleshooting. Or add your API key in Settings for smarter answers!";
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Oops, hit a snag there! Make sure your API key is correct in Settings. Or try rephrasing your question!",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickQueries = [
    { label: '🎸 Super8 setup', query: 'How do I set up Super8 for live looping?' },
    { label: '🎹 MIDI mapping', query: 'What MIDI notes control Super8 tracks?' },
    { label: '🐧 Linux audio', query: 'How do I set up JACK for low latency on Linux?' },
    { label: '🦶 Foot controllers', query: 'What foot controller do you recommend for looping?' },
    { label: '⚡ Fix latency', query: 'How do I reduce latency for live performance?' },
    { label: '🔌 Windows VSTs', query: 'How do I run Windows VST plugins on Linux with yabridge?' },
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

// Call Claude API directly from client
async function callClaude(
  userMessage: string,
  knowledgeContext: string,
  conversationHistory: Message[],
  apiKey: string
): Promise<string> {
  const contextMessage = knowledgeContext
    ? `\n\nRelevant information from the REAPER knowledge base:\n${knowledgeContext}`
    : '';

  const messages = [
    ...conversationHistory.slice(-10).map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    {
      role: 'user' as const,
      content: userMessage + contextMessage,
    },
  ];

  const response = await fetch('https://api.anthropic.com/v1/messages', {
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
      messages,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Claude API error:', error);
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  return data.content[0].text;
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

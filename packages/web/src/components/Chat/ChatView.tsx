import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../stores/appStore';
import { searchKnowledge } from '../../api/client';
import { Send, Loader2, Sparkles, AlertCircle } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const SYSTEM_PROMPT = `You are Reapermadness - a friendly, knowledgeable REAPER DAW expert who specializes in live looping, Linux audio, and music production. You have deep expertise in:

- REAPER DAW (all features, shortcuts, actions, routing)
- Super8 looper and live looping techniques
- Linux audio setup (JACK, PipeWire, yabridge for Windows VSTs)
- MIDI controllers and foot pedal setups for live performance
- ReaPlugs (ReaEQ, ReaComp, ReaDelay, etc.)
- SWS Extension, ReaPack, ReaLearn, Playtime 2
- Audio troubleshooting (latency, dropouts, MIDI issues)

Your personality:
- Enthusiastic about REAPER and helping musicians
- Give practical, actionable advice
- Include specific shortcuts, action IDs, or settings when relevant
- Focus on live performance and looping since that's the user's main interest
- Keep responses concise but thorough
- Use occasional music/audio terminology naturally

When you don't know something specific, be honest but helpful. Always try to point users in the right direction.

You'll be given context from the REAPER knowledge base to help answer questions. Use this context but also draw on your general knowledge to give complete, helpful answers.`;

export function ChatView() {
  const { apiKey } = useAppStore();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: apiKey
        ? "Hey! I'm Reapermadness, your REAPER expert. Ask me anything about REAPER, live looping, Super8, Linux audio setup, or troubleshooting. I've got you covered! 🎛️"
        : "Hey! I'm Reapermadness. I can search the knowledge base for REAPER info. For smarter conversational answers, add your Anthropic API key in Settings!",
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
          : "I couldn't find specific info on that. Try asking about Super8 looper, JACK/PipeWire setup, REAPER shortcuts, or troubleshooting latency issues. Or add your API key in Settings for smarter answers!";
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
        content: "Sorry, I hit a snag there. Make sure your API key is correct in Settings, or try asking something else!",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickQueries = [
    'How do I set up Super8 for live looping?',
    'Best JACK settings for low latency?',
    'How do I use yabridge for Windows VSTs?',
    'What MIDI notes control Super8?',
    "What's the shortcut to split items?",
    'Help with audio dropouts',
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-280px)] min-h-[400px]">
      {/* API Key Notice */}
      {!apiKey && (
        <div className="mb-4 p-3 bg-yellow-900/30 border border-yellow-600/50 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-200">
            <span className="font-medium">Limited mode:</span> Add your Anthropic API key in Settings for intelligent, conversational answers from Reapermadness!
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
                <div className="flex items-center gap-2 mb-1 text-reaper-accent text-xs font-medium">
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
        {quickQueries.map((query) => (
          <button
            key={query}
            onClick={() => setInput(query)}
            className="px-3 py-1.5 text-xs rounded-full bg-reaper-surface border border-reaper-border hover:border-reaper-accent hover:text-reaper-accent transition-colors"
          >
            {query}
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
  let response = "Here's what I found in the knowledge base:\n\n";

  for (const line of lines) {
    const match = line.match(/\[([^\]]+)\]: (.+)/);
    if (match) {
      response += `**${match[1]}**\n${match[2]}\n\n`;
    } else {
      response += line + '\n\n';
    }
  }

  return response.trim();
}

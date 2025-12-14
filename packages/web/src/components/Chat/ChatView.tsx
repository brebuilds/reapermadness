import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchKnowledge } from '../../api/client';
import { Send, Search, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function ChatView() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        "Hi! I'm your REAPER assistant. Ask me anything about REAPER, live looping, Linux audio setup, or troubleshooting. Try searching for topics like \"Super8 looper\", \"JACK setup\", or \"latency issues\".",
    },
  ]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsSearching(true);

    try {
      const result = await searchKnowledge(input);

      const formattedResults = result.results
        .slice(0, 5)
        .map((r) => `**${r.path}**\n${r.content}`)
        .join('\n\n---\n\n');

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          result.results.length > 0
            ? `Here's what I found:\n\n${formattedResults}`
            : "I couldn't find specific information about that. Try different keywords or check the knowledge base sections for Super8, Linux setup, or troubleshooting.",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          'Sorry, there was an error searching the knowledge base. Make sure the server is running.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsSearching(false);
    }
  };

  const quickQueries = [
    'How do I set up Super8 looper?',
    'JACK audio setup Linux',
    'Fix high latency',
    'MIDI foot controller setup',
    'yabridge Windows VST',
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-280px)] min-h-[400px]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-reaper-accent text-white'
                  : 'bg-reaper-surface border border-reaper-border'
              }`}
            >
              <div className="whitespace-pre-wrap text-sm">{message.content}</div>
            </div>
          </div>
        ))}
        {isSearching && (
          <div className="flex justify-start">
            <div className="bg-reaper-surface border border-reaper-border rounded-lg p-4">
              <Loader2 className="w-5 h-5 animate-spin text-reaper-accent" />
            </div>
          </div>
        )}
      </div>

      {/* Quick queries */}
      <div className="flex flex-wrap gap-2 mb-4">
        {quickQueries.map((query) => (
          <button
            key={query}
            onClick={() => setInput(query)}
            className="px-3 py-1 text-sm rounded-full bg-reaper-surface border border-reaper-border hover:border-reaper-accent transition-colors"
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
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Ask about REAPER, looping, Linux audio..."
          className="flex-1 px-4 py-3 rounded-lg bg-reaper-surface border border-reaper-border focus:border-reaper-accent focus:outline-none"
        />
        <button
          onClick={handleSearch}
          disabled={isSearching || !input.trim()}
          className="px-6 py-3 rounded-lg bg-reaper-accent hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Search className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

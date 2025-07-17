'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, User } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'שלום! אני הנציג הדיגיטלי של ארז. אשמח לענות על שאלות לגבי הניסיון שלו, הפרויקטים ב-GitHub, והכישורים הטכניים. במה אוכל לעזור?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      });

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsStreaming(true);
      
      while (true) {
        setIsStreaming(true);

        const { value, done } = await reader.read();
        if (done) {
          setIsStreaming(false);
          break;
        };

        const chunk = decoder.decode(value, { stream: true });

        setMessages(prevMessages => {
          const updated = [...prevMessages];
          const lastMsgIndex = updated.findIndex(msg => msg.id === assistantMessage.id);
          if (lastMsgIndex !== -1) {
            updated[lastMsgIndex] = {
              ...updated[lastMsgIndex],
              content: updated[lastMsgIndex].content + chunk,
            };
          }
          return updated;
        });
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: 'מצטער, נתקלתי בבעיה. אנא נסה שוב.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
        <h1 className="text-2xl font-bold">צ&apos;אט עם נציג AI של ארז</h1>
        <p className="text-blue-100 mt-2">שאל/י אותי על הניסיון, הפרויקטים והכישורים הטכניים</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 text-gray-400 ${
              message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-600 text-white'
              }`}
            >
              {message.role === 'user' ? <User size={20} /> : <Bot size={20} />}
            </div>
            <div
              className={`max-w-[70%] rounded-lg px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              <p
                className={`text-xs mt-2 ${
                  message.role === 'user' ? 'text-blue-100' : 'text-gray-400'
                }`}
              >
                {message.timestamp.toLocaleTimeString('he-IL', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}
        {isLoading && !isStreaming && (
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-600 text-white flex items-center justify-center">
              <Bot size={20} />
            </div>
            <div className="bg-white border border-gray-200 rounded-lg px-4 py-3">
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="הקלידי את השאלה שלך..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
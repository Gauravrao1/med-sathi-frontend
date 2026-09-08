import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, AlertTriangle } from 'lucide-react';
import { apiClient } from '../api/client';
import { useTranslation } from '../i18n/I18nProvider';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

export const Chat: React.FC = () => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: input.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await apiClient.request<{session_id: string, response: string}>('/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: userMessage.text,
          session_id: sessionId,
        }),
      });

      if (response.session_id) {
        setSessionId(response.session_id);
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: response.response,
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: 'Sorry, I encountered an error processing your request.',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 pb-[72px]">
      <div className="bg-teal-600 text-white p-4 shadow-md flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Bot size={24} />
          <h1 className="text-xl font-bold">AI Assistant</h1>
        </div>
      </div>
      
      <div className="bg-amber-50 border-b border-amber-200 p-2 flex items-center gap-2 justify-center text-amber-800 text-xs font-medium shrink-0">
        <AlertTriangle size={14} />
        <p>Not medical advice. Consult a doctor for medical decisions.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-10">
            <Bot size={48} className="mx-auto text-gray-300 mb-4" />
            <p>How can I help you today?</p>
          </div>
        )}
        
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl p-3 flex gap-2 ${
              msg.sender === 'user' 
                ? 'bg-teal-600 text-white rounded-br-sm' 
                : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm'
            }`}>
              {msg.sender === 'ai' && <Bot size={18} className="mt-0.5 flex-shrink-0 text-teal-600" />}
              <p className="text-sm leading-relaxed whitespace-pre-line">{msg.text}</p>
              {msg.sender === 'user' && <User size={18} className="mt-0.5 flex-shrink-0 text-teal-200" />}
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm p-4 flex gap-1 items-center">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white border-t border-gray-200 p-3 flex gap-2 shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask me anything..."
          className="flex-1 bg-gray-100 border-transparent rounded-full px-4 py-2 text-sm focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || loading}
          className="bg-teal-600 text-white w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-50 active:bg-teal-700"
        >
          <Send size={18} className="ml-0.5" />
        </button>
      </div>
    </div>
  );
};

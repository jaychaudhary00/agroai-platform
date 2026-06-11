import { useTranslation } from 'react-i18next';
import { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { RootState } from '../store';
import { aiAPI } from '../services/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const SUGGESTIONS = [
  'My wheat leaves are turning yellow. What should I do?',
  'What is the best fertilizer for cotton on black soil?',
  'How can I protect my crops from pests organically?',
  'When should I harvest soybean for best price?',
  'What are symptoms of late blight in tomatoes?',
  'How much water does rice need per acre?',
];

const LANGUAGES: Record<string, string> = { en: 'English', hi: 'Hindi', gu: 'Gujarati', pa: 'Punjabi', mr: 'Marathi' };

export function AIChatPage() {
  const { t } = useTranslation();
  const { user } = useSelector((s: RootState) => s.auth);
  const { language } = useSelector((s: RootState) => s.ui);

  const [messages, setMessages] = useState<Message[]>([{
    id: '0', role: 'assistant', content: `Namaste ${user?.name?.split(' ')[0] || ''}! 🌱 I'm your AgroAI assistant. I can help you with:\n\n• Crop disease diagnosis\n• Fertilizer recommendations\n• Weather-based advice\n• Market prices & trends\n• Farming best practices\n\nAsk me anything in English, Hindi, or Gujarati!`,
    timestamp: new Date(),
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: msg, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role === 'user' ? 'user' : 'model', content: m.content }));
      const res = await aiAPI.chat(msg, language, history);
      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: res.data.data.reply, timestamp: new Date() };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      toast.error('AI response failed. Please try again.');
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(), role: 'assistant',
        content: 'Sorry, I encountered an error. Please check your connection and try again.',
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const startVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { toast.error('Voice not supported in this browser'); return; }
    const recognition = new SR();
    const langMap: Record<string,string> = { en:'en-IN', hi:'hi-IN', gu:'gu-IN', pa:'pa-IN', mr:'mr-IN' };
    recognition.lang = langMap[language] || 'hi-IN';
    recognition.interimResults = false;
    setIsListening(true);
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => { setIsListening(false); toast.error('Voice recognition failed'); };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const clearChat = () => {
    setMessages([{ id: '0', role: 'assistant', content: `Chat cleared. How can I help you? 🌱`, timestamp: new Date() }]);
  };

  const formatContent = (content: string) => {
    return content.split('\n').map((line, i) => (
      <span key={i}>
        {line.startsWith('•') ? <span className="block ml-2">{line}</span> : line}
        {i < content.split('\n').length - 1 && '\n'}
      </span>
    ));
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col" style={{ height: "100%" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white text-lg">🤖</div>
          <div>
            <h1 className="font-display font-semibold text-gray-900 dark:text-white">AgroAI assistant</h1>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-gray-500 dark:text-gray-400">Online · {LANGUAGES[language] || 'English'}</span>
            </div>
          </div>
        </div>
        <button onClick={clearChat} className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-lg transition-colors">
          Clear chat
        </button>
      </div>

      {/* Chat window */}
      <div className="flex-1 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden" style={{ minHeight: 0 }}>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center text-sm mr-2 flex-shrink-0 mt-0.5">🌱</div>
              )}
              <div className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                msg.role === 'user'
                  ? 'bg-primary-600 text-white rounded-br-sm'
                  : 'bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-sm'
              }`}>
                {formatContent(msg.content)}
                <div className={`text-xs mt-1.5 ${msg.role === 'user' ? 'text-primary-200' : 'text-gray-400'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              {msg.role === 'user' && (
                <div className="w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs font-medium ml-2 flex-shrink-0 mt-0.5">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
            </div>
          ))}

          {/* Loading indicator */}
          {loading && (
            <div className="flex items-start gap-2">
              <div className="w-7 h-7 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center text-sm">🌱</div>
              <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-sm">
                <div className="flex gap-1.5 items-center">
                  <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && (
          <div className="px-4 pb-3">
            <p className="text-xs text-gray-400 mb-2">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.slice(0, 4).map(s => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 px-3 py-1.5 rounded-full hover:border-primary-400 hover:text-primary-600 transition-colors text-left"
                >
                  {s.length > 45 ? s.slice(0, 45) + '…' : s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input bar */}
        <div className="border-t border-gray-100 dark:border-gray-800 p-3 flex items-center gap-2">
          <button
            onClick={startVoice}
            disabled={loading}
            className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
              isListening
                ? 'bg-red-100 dark:bg-red-900/30 text-red-600 animate-pulse'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
            title={isListening ? 'Listening...' : 'Voice input'}
          >
            🎙️
          </button>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder={isListening ? 'Listening...' : `Ask in ${LANGUAGES[language] || 'English'}, Hindi, or Gujarati...`}
            disabled={loading || isListening}
            className="flex-1 px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-transparent focus:border-primary-400 rounded-xl focus:outline-none dark:text-white transition-colors disabled:opacity-50"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="w-9 h-9 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-200 dark:disabled:bg-gray-700 text-white rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
          >
            {loading ? <span className="animate-spin text-xs">⟳</span> : '↑'}
          </button>
        </div>
      </div>

      {/* Quick prompts below */}
      <div className="mt-4 grid grid-cols-2 lg:grid-cols-3 gap-2">
        {SUGGESTIONS.slice(4).concat(SUGGESTIONS.slice(0,1)).map(s => (
          <button
            key={s}
            onClick={() => sendMessage(s)}
            className="text-left text-xs bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-2.5 rounded-xl text-gray-600 dark:text-gray-400 hover:border-primary-300 hover:text-primary-600 transition-colors line-clamp-2"
          >
            💬 {s}
          </button>
        ))}
      </div>
    </div>
  );
}

import { useState, useRef, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { ThemeContext } from '../contexts/ThemeContext';
import { MessageSquare, X, Send, User, Bot, Sparkles, Zap } from 'lucide-react';

/* ── hide on these route prefixes ── */
const HIDDEN_ROUTES = ['/chat', '/admin', '/meeting'];

export default function SkillMentor() {
  const { theme } = useContext(ThemeContext);
  const d = theme === 'dark';
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'model',
      content:
        "Hi 👋 I'm your **AI Skill Mentor**.\n\nI can help you:\n- 🎯 Find skill gaps\n- 🗺️ Plan your learning roadmap\n- 🤝 Suggest skill exchanges\n- 💡 Answer career questions\n\nTell me your current skills and your career goal!",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  /* ── All hooks must be called unconditionally (Rules of Hooks) ── */
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  /* hide on chat routes — after all hooks */
  const isHidden = HIDDEN_ROUTES.some((r) => location.pathname.startsWith(r));
  if (isHidden) return null;

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const history = messages.filter((_, idx) => idx > 0);
      const apiUrl = "https://skill-barter-kspn.vercel.app/api" || 'http://localhost:5000/api';
      const res = await fetch(`${apiUrl}/mentor/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message: userMessage, history }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          content: res.ok ? data.reply : `Error: ${data.message || 'Something went wrong.'}`,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'model', content: 'Connection failed. Please try again later.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  /* ── style tokens ── */
  const panelBg    = d ? 'bg-[#0d1525] border-indigo-500/20'       : 'bg-white border-indigo-200';
  const msgAreaBg  = d ? 'bg-[#080c17]'                             : 'bg-slate-50';
  const inputBg    = d
    ? 'bg-[#0b1020] border-indigo-500/25 text-white placeholder-slate-500 focus:ring-indigo-500/30 focus:border-indigo-500'
    : 'bg-white border-indigo-200 text-slate-800 placeholder-slate-400 focus:ring-indigo-300 focus:border-indigo-400';
  const userBubble = 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white';
  const botBubble  = d
    ? 'bg-slate-800/80 border border-indigo-500/10 text-slate-200'
    : 'bg-white border border-indigo-100 text-slate-700 shadow-sm';
  const avatarBot  = d ? 'bg-indigo-500/20 text-indigo-400'  : 'bg-indigo-100 text-indigo-600';
  const avatarUser = 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white';

  return (
    <>
      {/* ── Floating FAB ── */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open AI Skill Mentor"
          className={`
            fixed bottom-[5.5rem] md:bottom-6 right-4 md:right-6 z-[9999] group
            w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center
            bg-gradient-to-br from-indigo-500 to-violet-600
            hover:from-indigo-400 hover:to-violet-500
            shadow-xl shadow-indigo-500/40 hover:shadow-indigo-500/60
            transition-all duration-300 hover:scale-110
          `}
        >
          {/* pulse ring */}
          <span className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 animate-ping opacity-20 pointer-events-none" />
          <Bot className="w-6 h-6 md:w-7 md:h-7 text-white relative z-10" />
          <Sparkles className="w-3 h-3 md:w-3.5 md:h-3.5 text-amber-300 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </button>
      )}

      {/* ── Chat Panel ── */}
      {isOpen && (
        <div
          className={`
            fixed z-[9999]
            bottom-[5rem] md:bottom-6
            left-2 right-2 md:left-auto md:right-6
            md:w-[360px] lg:w-[410px]
            h-[70vh] md:h-[580px] max-h-[88vh]
            flex flex-col rounded-2xl overflow-hidden
            border shadow-2xl shadow-indigo-500/20
            transition-all duration-300
            ${panelBg}
          `}
          style={{ animation: 'skillMentorSlideIn 0.25s cubic-bezier(0.34,1.56,0.64,1) both' }}
        >
          {/* ── Header ── */}
          <div className="relative flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600 flex-shrink-0 overflow-hidden">
            {/* shimmer */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/8 to-white/0 pointer-events-none" />

            <div className="flex items-center gap-3 relative">
              {/* Bot avatar */}
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 border border-white/20">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white leading-tight">AI Skill Mentor</h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <p className="text-indigo-100 text-xs">Powered by Gemini AI</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 relative">
              {/* Clear chat */}
              <button
                onClick={() =>
                  setMessages([
                    {
                      role: 'model',
                      content:
                        "Hi 👋 I'm your **AI Skill Mentor**.\n\nTell me your current skills and your career goal!",
                    },
                  ])
                }
                title="Clear chat"
                className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white/15 transition-colors text-white/70 hover:text-white"
              >
                <Zap className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white/15 transition-colors text-white/70 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* top accent line below header */}
          <div className="h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent flex-shrink-0" />

          {/* ── Messages ── */}
          <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${msgAreaBg}`}>
            {messages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              return (
                <div key={idx} className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
                  {/* Bot avatar */}
                  {!isUser && (
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${avatarBot}`}>
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  {/* Bubble */}
                  <div
                    className={`
                      px-4 py-2.5 rounded-2xl leading-relaxed
                      ${isUser
                        ? `max-w-[75%] ${userBubble} rounded-br-sm`
                        : `max-w-[85%] ${botBubble} rounded-bl-sm
                           prose prose-sm max-w-none
                           ${d
                             ? 'prose-invert prose-p:text-slate-200 prose-li:text-slate-200 prose-headings:text-white prose-strong:text-indigo-300 prose-code:text-indigo-300'
                             : 'prose-p:text-slate-700 prose-li:text-slate-700 prose-headings:text-slate-800 prose-strong:text-indigo-600 prose-code:text-indigo-600'
                           }`
                      }
                    `}
                  >
                    {isUser ? (
                      <span className="whitespace-pre-wrap">{msg.content}</span>
                    ) : (
                      <ReactMarkdown rehypePlugins={[rehypeRaw]}>{msg.content}</ReactMarkdown>
                    )}
                  </div>

                  {/* User avatar */}
                  {isUser && (
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${avatarUser}`}>
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex gap-2.5 justify-start">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${avatarBot}`}>
                  <Bot className="w-4 h-4" />
                </div>
                <div className={`px-4 py-3 rounded-2xl rounded-bl-sm ${botBubble}`}>
                  <div className="flex gap-1 items-center">
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ── Input ── */}
          <div className={`flex-shrink-0 border-t ${d ? 'border-indigo-500/15 bg-[#0d1525]' : 'border-indigo-100 bg-white'} p-3`}>
            <form onSubmit={handleSend} className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me about skills, careers…"
                disabled={isLoading}
                className={`w-full pl-4 pr-12 py-3 rounded-xl border outline-none transition-all duration-200 focus:ring-2 ${inputBg}`}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-105 shadow-md shadow-indigo-500/30"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
            <p className={`text-center mt-2 ${d ? 'text-slate-600' : 'text-slate-300'}`}>
              AI · Skill Mentor
            </p>
          </div>
        </div>
      )}

      {/* keyframe */}
      <style>{`
        @keyframes skillMentorSlideIn {
          from { opacity: 0; transform: translateY(24px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
      `}</style>
    </>
  );
}

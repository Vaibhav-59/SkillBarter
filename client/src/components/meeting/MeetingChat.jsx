import { useState, useEffect, useRef, useContext } from "react";
import { ThemeContext } from "../../contexts/ThemeContext";

const STORAGE_KEY_PREFIX = "meetingChat_";

export default function MeetingChat({ socket, meetingId, userName, onClose }) {
  const [messages, setMessages] = useState(() => {
    const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${meetingId}`);
    return stored ? JSON.parse(stored) : [];
  });
  const [input, setInput] = useState("");
  const endRef = useRef(null);
  const { theme } = useContext(ThemeContext) || { theme: "dark" };
  const isDark = theme === "dark";

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${meetingId}`, JSON.stringify(messages));
  }, [messages, meetingId]);

  useEffect(() => {
    if (!socket) return;
    const handler = ({ from, text, timestamp }) => {
      setMessages((prev) => [...prev, { from, text, timestamp, own: false }]);
    };
    socket.on("meetingChat", handler);
    return () => socket.off("meetingChat", handler);
  }, [socket]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const msg = { from: userName, text: input.trim(), timestamp: Date.now(), own: true };
    setMessages((prev) => [...prev, msg]);
    socket?.emit("meetingChat", { meetingId, from: userName, text: input.trim(), timestamp: msg.timestamp });
    setInput("");
  };

  const formatTime = (ts) =>
    new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const panel   = isDark ? "bg-[#11152a]/95 border-white/8"   : "bg-white border-slate-200";
  const hdr     = isDark ? "border-white/8"                   : "border-slate-100";
  const msgArea = isDark ? ""                                  : "";

  return (
    <div className={`flex flex-col h-full w-full sm:w-80 backdrop-blur-xl border-l shadow-2xl absolute sm:relative inset-0 z-30 sm:z-auto ${panel}`}
      style={{ minHeight: 0 }}>

      {/* Header */}
      <div className={`flex items-center justify-between px-5 py-4 border-b ${hdr}`}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <h3 className={`font-semibold text-sm leading-tight ${isDark ? "text-white" : "text-slate-800"}`}>
              Meeting Chat
            </h3>
            <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              {messages.length} messages
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110 ${
            isDark
              ? "bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-white/8"
              : "bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-500 border border-slate-200"
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className={`flex-1 overflow-y-auto p-4 space-y-3 ${msgArea}`}
        style={{ scrollbarWidth: "thin", scrollbarColor: isDark ? "#312e81 transparent" : "#c7d2fe transparent" }}>
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 py-8">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
              isDark ? "bg-white/5" : "bg-slate-100"
            }`}>
              <svg className={`w-6 h-6 ${isDark ? "text-slate-500" : "text-slate-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className={`text-sm text-center ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              No messages yet.<br />Say hello! 👋
            </p>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col gap-1 ${m.own ? "items-end" : "items-start"}`}>
            {!m.own && (
              <span className="text-xs font-semibold text-indigo-400 ml-1">{m.from}</span>
            )}
            <div className={`max-w-[88%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
              m.own
                ? "bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600 text-white rounded-br-sm shadow-lg shadow-indigo-500/20"
                : isDark
                  ? "bg-white/8 text-slate-100 rounded-bl-sm border border-white/8"
                  : "bg-slate-100 text-slate-800 rounded-bl-sm border border-slate-200"
            }`}>
              {m.text}
            </div>
            <span className={`text-xs px-1 ${isDark ? "text-slate-600" : "text-slate-400"}`}>
              {formatTime(m.timestamp)}
            </span>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <form onSubmit={send} className={`p-4 border-t ${hdr}`}>
        <div className={`flex items-center gap-2 rounded-2xl border px-3 py-2 transition-all duration-200 ${
          isDark
            ? "bg-white/5 border-white/10 focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/15"
            : "bg-slate-50 border-slate-200 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100"
        }`}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message…"
            className={`flex-1 bg-transparent text-sm outline-none ${
              isDark ? "text-white placeholder-slate-500" : "text-slate-800 placeholder-slate-400"
            }`}
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-violet-600
              hover:from-indigo-400 hover:to-violet-500
              rounded-xl flex items-center justify-center transition-all duration-200
              disabled:opacity-40 disabled:cursor-not-allowed hover:scale-110 active:scale-95
              shadow-md shadow-indigo-500/20 flex-shrink-0"
          >
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}

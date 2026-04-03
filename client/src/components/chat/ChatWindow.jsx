// components/chat/ChatWindow.jsx
import { useState, useRef, useEffect } from "react";
import MessageBubble from "./MessageBubble";
import { Send, Paperclip, Smile, Phone, Video, MoreVertical, Info } from "lucide-react";

/* ── sample data (when used standalone/for preview) ─────── */
const SAMPLE_MESSAGES = [
  {
    _id: "1", messageType: "text", text: "Hey! Ready to start our session?",
    sender: { _id: "other", name: "Anika Sharma" },
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    _id: "2", messageType: "text", text: "Absolutely! I've prepared some notes on React hooks.",
    sender: { _id: "me" },
    createdAt: new Date(Date.now() - 7000000).toISOString(),
  },
  {
    _id: "3", messageType: "text", text: "Perfect 🙌 Let's do 4 PM then?",
    sender: { _id: "other", name: "Anika Sharma" },
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    _id: "4", messageType: "text", text: "4 PM works great for me!",
    sender: { _id: "me" },
    createdAt: new Date(Date.now() - 3500000).toISOString(),
  },
];

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function formatDate(dateStr) {
  const d = new Date(dateStr), today = new Date(), yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString();
}

/**
 * ChatWindow — renders messages + input bar.
 *
 * Standalone usage (with sample data) or fully controlled:
 *
 * Props (all optional — falls back to sample data if omitted):
 *   messages           — array of message objects
 *   currentUserId      — logged-in user's _id
 *   remoteUser         — { name, profileImage } of the other participant
 *   isConnected        — socket status
 *   isDarkMode         — theme flag
 *   sending            — boolean (send in progress)
 *   onSendText(text)   — called when user submits a text message
 *   onAttachFile()     — called when attach button clicked
 *   onVideoCall()      — called when video icon clicked
 *   headerActions      — optional ReactNode for extra header controls
 */
export default function ChatWindow({
  messages: propMessages,
  currentUserId = "me",
  remoteUser,
  isConnected,
  isDarkMode,
  sending,
  onSendText,
  onAttachFile,
  onVideoCall,
  headerActions,
  onDocumentDownload,
}) {
  const messages = propMessages ?? SAMPLE_MESSAGES;
  const [draft, setDraft] = useState("");
  const endRef = useRef(null);
  const taRef  = useRef(null);

  /* auto-scroll on new messages */
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e?.preventDefault();
    if (!draft.trim() || sending) return;
    onSendText?.(draft.trim());
    setDraft("");
  };

  /* ── theme tokens ─────────────────────────────────────── */
  const wrap      = isDarkMode ? "bg-slate-900/70 border-slate-700/40"  : "bg-white/95 border-indigo-100 shadow-xl shadow-indigo-100/20";
  const hdrBg     = isDarkMode ? "rgba(15,23,42,0.4)"                    : "rgba(238,242,255,0.4)";
  const footBg    = isDarkMode ? "rgba(15,23,42,0.3)"                    : "rgba(238,242,255,0.3)";
  const hdrBorder = isDarkMode ? "border-slate-700/30"                   : "border-indigo-100/80";
  const textMain  = isDarkMode ? "text-white"                            : "text-gray-900";
  const textSub   = isDarkMode ? "text-slate-400"                        : "text-gray-500";
  const msgBg     = isDarkMode ? ""                                      : "";

  const inputCls = isDarkMode
    ? "bg-slate-800/60 border-slate-600/50 text-white placeholder-slate-500 focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20"
    : "bg-indigo-50/40 border-indigo-100 text-gray-900 placeholder-gray-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20";

  const iconBtn = `p-2 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 ${
    isDarkMode ? "text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10" : "text-gray-400 hover:text-indigo-600 hover:bg-indigo-50"
  }`;

  return (
    <div className={`flex flex-col h-full backdrop-blur-xl border rounded-3xl overflow-hidden ${wrap}`}>

      {/* ── Chat Header ──────────────────────────────────── */}
      <div className={`flex-shrink-0 flex items-center justify-between px-6 py-4 border-b ${hdrBorder}`}
        style={{ background: hdrBg }}>
        <div className="flex items-center gap-3">
          {/* Remote user avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-11 h-11 rounded-xl overflow-hidden ring-2 ring-indigo-500/30 shadow-md"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
              {remoteUser?.profileImage ? (
                <img src={remoteUser.profileImage} alt={remoteUser.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                  {remoteUser?.name?.charAt(0)?.toUpperCase() || "?"}
                </div>
              )}
            </div>
            <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 ${
              isDarkMode ? "border-slate-900" : "border-white"
            } ${isConnected !== false ? "bg-emerald-400 animate-pulse" : "bg-gray-400"}`} />
          </div>

          <div>
            <h3 className={`text-base font-black ${textMain}`}>
              {remoteUser?.name || "Conversation"}
            </h3>
            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${isConnected !== false ? "bg-emerald-400" : "bg-gray-400"}`} />
              <p className={`text-xs font-semibold ${
                isConnected !== false
                  ? isDarkMode ? "text-emerald-400" : "text-emerald-600"
                  : textSub
              }`}>
                {isConnected !== false ? "Active now" : "Offline"}
              </p>
            </div>
          </div>
        </div>

        {/* Header actions */}
        <div className="flex items-center gap-1">
          {onVideoCall && (
            <button onClick={onVideoCall} className={iconBtn} title="Video call">
              <Video className="w-5 h-5" />
            </button>
          )}
          {headerActions}
        </div>
      </div>

      {/* ── Messages ─────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3"
        style={{ scrollbarWidth: "thin", scrollbarColor: isDarkMode ? "#6366f1 transparent" : "#a5b4fc transparent" }}>

        {messages.map((message, index) => {
          const isOwn    = message.sender?._id === currentUserId || message.sender?._id === "me";
          const showDate = index === 0 || formatDate(messages[index - 1].createdAt) !== formatDate(message.createdAt);

          return (
            <div key={message._id || index}>
              {/* Date separator */}
              {showDate && (
                <div className="flex items-center justify-center my-4">
                  <div className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                    isDarkMode ? "bg-slate-800/70 border border-slate-700/40 text-slate-400" : "bg-indigo-50 border border-indigo-100 text-indigo-500"
                  }`}>
                    {formatDate(message.createdAt)}
                  </div>
                </div>
              )}

              {/* Call event pill */}
              {message.messageType === "call" ? (
                <div className="flex justify-center my-3">
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold border ${
                    isDarkMode ? "bg-slate-800/60 border-slate-700/40 text-slate-400" : "bg-indigo-50/80 border-indigo-100 text-indigo-600"
                  }`}>
                    <Video className="w-3.5 h-3.5 text-indigo-400" />
                    {message.text}
                    <span className="opacity-60 text-[10px]">{formatTime(message.createdAt)}</span>
                  </div>
                </div>
              ) : (
                <MessageBubble
                  message={message}
                  isOwn={isOwn}
                  isDarkMode={isDarkMode}
                  formatTime={formatTime}
                  onDocumentDownload={onDocumentDownload}
                />
              )}
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {/* ── Input bar ────────────────────────────────────── */}
      <div className={`flex-shrink-0 px-5 py-4 border-t ${hdrBorder}`} style={{ background: footBg }}>
        <form onSubmit={handleSend}>
          <div className="flex items-center gap-2.5">

            {/* Attach */}
            {onAttachFile && (
              <button type="button" onClick={onAttachFile}
                className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl border transition-all hover:scale-105 active:scale-95 ${
                  isDarkMode ? "bg-slate-800/60 border-slate-600/50 text-slate-400 hover:text-indigo-300 hover:border-indigo-500/40" : "bg-indigo-50/60 border-indigo-100 text-gray-400 hover:text-indigo-600 hover:border-indigo-200"
                }`}>
                <Paperclip className="w-4 h-4" />
              </button>
            )}

            {/* Textarea */}
            <div className="flex-1">
              <textarea
                ref={taRef}
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Type your message…"
                rows={1}
                disabled={sending || isConnected === false}
                className={`w-full px-4 py-3 border rounded-2xl text-sm outline-none resize-none transition-all ${inputCls}`}
                style={{ minHeight: "44px", maxHeight: "120px", fieldSizing: "content" }}
              />
            </div>

            {/* Send */}
            <button
              type="submit"
              disabled={!draft.trim() || sending || isConnected === false}
              className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 3px 12px rgba(99,102,241,0.3)" }}
            >
              {sending ? (
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Hint row */}
          <div className="flex items-center justify-between mt-2 px-1">
            <span className={`text-[10px] font-semibold ${textSub}`}>
              {isConnected === false && (
                <span className="text-red-400 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse inline-block" /> Reconnecting…
                </span>
              )}
              {sending && (
                <span className={`flex items-center gap-1 ${isDarkMode ? "text-indigo-400" : "text-indigo-600"}`}>
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse inline-block" /> Sending…
                </span>
              )}
            </span>
            <span className={`text-[10px] font-semibold ${textSub}`}>Enter to send · Shift+Enter newline</span>
          </div>
        </form>
      </div>
    </div>
  );
}

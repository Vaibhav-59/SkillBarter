// components/chat/ChatList.jsx
import { useState } from "react";
import { MessageSquare, Search, X, Circle } from "lucide-react";

/* ── helpers ────────────────────────────────────────────── */
function timeAgo(dateStr) {
  if (!dateStr) return "";
  const s = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (s < 60)    return `${s}s`;
  if (s < 3600)  return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

function getLastMsgPreview(conv) {
  const lm = conv.lastMessage;
  if (!lm) return null;
  if (lm.messageType === "image")    return "📷 Image";
  if (lm.messageType === "video")    return "🎬 Video";
  if (lm.messageType === "document") return "📄 Document";
  if (lm.messageType === "voice")    return "🎙️ Voice note";
  return lm.text || "";
}

function Avatar({ user, isSelected, isOnline, size = "md" }) {
  const sz = size === "sm" ? "w-9 h-9" : "w-11 h-11";
  const dotSz = size === "sm" ? "w-2.5 h-2.5" : "w-3 h-3";

  return (
    <div className="relative flex-shrink-0">
      <div
        className={`${sz} rounded-xl overflow-hidden flex items-center justify-center font-bold text-sm text-white ${
          isSelected ? "ring-2 ring-indigo-400" : "ring-1 ring-indigo-500/20"
        }`}
        style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
      >
        {user?.profileImage ? (
          <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
        ) : (
          <span>{user?.name?.charAt(0)?.toUpperCase() || "U"}</span>
        )}
      </div>
      <div
        className={`absolute -bottom-0.5 -right-0.5 ${dotSz} rounded-full border-2 border-white ${
          isOnline ? "bg-emerald-400" : "bg-gray-300"
        }`}
      />
    </div>
  );
}

/**
 * ChatList — standalone, themeable conversation sidebar
 *
 * Props:
 *   conversations       — array of conversation objects
 *   selectedId          — currently selected conversation._id
 *   currentUserId       — logged-in user's _id
 *   isConnected         — socket connection status
 *   isDarkMode          — theme flag
 *   onSelect(conv)      — called when user clicks a conversation
 *   onFindMatches()     — called when "Find Matches" CTA is clicked
 *   formatTime(date)    — optional custom formatter; falls back to timeAgo
 */
export default function ChatList({
  conversations = [],
  selectedId,
  currentUserId,
  isConnected,
  isDarkMode,
  onSelect,
  onFindMatches,
  formatTime,
}) {
  const [search, setSearch] = useState("");

  const filtered = conversations.filter(conv => {
    const other = conv.participants?.find(p => p._id !== currentUserId);
    return (other?.name || "").toLowerCase().includes(search.toLowerCase());
  });

  /* ── theme ─────────────────────────────────────────── */
  const wrap      = isDarkMode ? "bg-slate-900/80 border-slate-700/40"  : "bg-white/90 border-indigo-100 shadow-xl shadow-indigo-100/20";
  const hdrBorder = isDarkMode ? "border-slate-700/30"                   : "border-indigo-100";
  const textMain  = isDarkMode ? "text-white"                            : "text-gray-900";
  const textSub   = isDarkMode ? "text-slate-400"                        : "text-gray-500";
  const inputCls  = isDarkMode
    ? "bg-slate-800/60 border-slate-600/50 text-white placeholder-slate-500 focus:border-indigo-500/60"
    : "bg-indigo-50/40 border-indigo-100 text-gray-900 placeholder-gray-400 focus:border-indigo-400";
  const activeRow = isDarkMode ? "bg-indigo-500/15 border-indigo-500/30" : "bg-indigo-50 border-indigo-200";
  const hoverRow  = isDarkMode ? "hover:bg-slate-800/60 hover:border-slate-700/40" : "hover:bg-indigo-50/60 hover:border-indigo-100";

  const fmt = formatTime ?? timeAgo;

  return (
    <div className={`flex flex-col h-full backdrop-blur-xl border rounded-3xl overflow-hidden ${wrap}`}>

      {/* ── Header ─────────────────────────────────────── */}
      <div className={`px-5 py-4 border-b flex-shrink-0 ${hdrBorder}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className={`text-lg font-black leading-tight ${textMain}`}>Messages</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`} />
                <span className={`text-xs font-semibold ${isConnected ? "text-emerald-500" : "text-red-400"}`}>
                  {isConnected ? "Online" : "Offline"}
                </span>
              </div>
            </div>
          </div>

          {/* Chat count badge */}
          <div className={`px-2.5 py-1 rounded-xl text-xs font-black ${
            isDarkMode ? "bg-indigo-500/15 text-indigo-300" : "bg-indigo-50 text-indigo-700 border border-indigo-100"
          }`}>
            {conversations.length}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDarkMode ? "text-slate-500" : "text-gray-400"}`} />
          <input
            type="text"
            placeholder="Search conversations…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={`w-full pl-9 pr-8 py-2.5 rounded-xl border text-sm outline-none transition-all ${inputCls}`}
          />
          {search && (
            <button onClick={() => setSearch("")}
              className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${isDarkMode ? "text-slate-500 hover:text-white" : "text-gray-400 hover:text-gray-700"}`}>
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Conversation list ──────────────────────────── */}
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-6 py-10 text-center">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${
              isDarkMode ? "bg-indigo-500/10 border border-indigo-500/20" : "bg-indigo-50 border border-indigo-100"
            }`}>
              <MessageSquare className={`w-8 h-8 ${isDarkMode ? "text-indigo-400" : "text-indigo-500"}`} />
            </div>
            <p className={`text-sm font-black mb-1 ${textMain}`}>
              {search ? "No results found" : "No conversations"}
            </p>
            <p className={`text-xs leading-relaxed mb-4 ${textSub}`}>
              {search ? `Nothing matches "${search}"` : "Start connecting with other learners"}
            </p>
            {!search && onFindMatches && (
              <button
                onClick={onFindMatches}
                className="px-4 py-2 text-white text-xs font-bold rounded-xl transition-all hover:opacity-90 active:scale-95"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 2px 10px rgba(99,102,241,0.3)" }}
              >
                Find Matches
              </button>
            )}
          </div>
        ) : (
          <div className="p-3 space-y-1">
            {filtered.map(conv => {
              const other      = conv.participants?.find(p => p._id !== currentUserId);
              const isSelected = selectedId === conv._id;
              const preview    = getLastMsgPreview(conv);
              const timeStr    = conv.lastMessageAt ? fmt(conv.lastMessageAt) : "";

              return (
                <button
                  key={conv._id}
                  onClick={() => onSelect?.(conv)}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all duration-200 border text-left group ${
                    isSelected ? activeRow : `border-transparent ${hoverRow}`
                  }`}
                >
                  <Avatar
                    user={other}
                    isSelected={isSelected}
                    isOnline={isConnected}
                    size="md"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className={`font-bold text-sm truncate ${
                        isSelected
                          ? isDarkMode ? "text-indigo-200" : "text-indigo-700"
                          : textMain
                      }`}>
                        {other?.name || "Unknown User"}
                      </p>
                      {timeStr && (
                        <span className={`text-[10px] font-semibold flex-shrink-0 ${
                          isSelected
                            ? isDarkMode ? "text-indigo-300" : "text-indigo-500"
                            : textSub
                        }`}>
                          {timeStr}
                        </span>
                      )}
                    </div>
                    {preview && (
                      <p className={`text-xs truncate mt-0.5 ${
                        isSelected
                          ? isDarkMode ? "text-indigo-300/80" : "text-indigo-600/80"
                          : textSub
                      }`}>
                        {preview}
                      </p>
                    )}
                  </div>

                  {/* Active indicator dot */}
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }} />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Footer hint ────────────────────────────────── */}
      <div className={`px-4 py-2.5 border-t flex-shrink-0 ${hdrBorder}`}>
        <p className={`text-[10px] text-center font-semibold ${textSub}`}>
          {conversations.length} conversation{conversations.length !== 1 ? "s" : ""} · Skill Barter
        </p>
      </div>
    </div>
  );
}

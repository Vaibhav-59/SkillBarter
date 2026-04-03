// components/chat/MessageBubble.jsx
import { useState } from "react";

/* ── helpers ─────────────────────────────────────────────── */
function fmt(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, "0");
  const s = String(sec % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function MicIcon({ className }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2a3 3 0 013 3v6a3 3 0 01-6 0V5a3 3 0 013-3zM5.5 10.5a6.5 6.5 0 0013 0H20a8 8 0 01-7 7.93V21h-2v-2.57A8 8 0 014 10.5H5.5z" />
    </svg>
  );
}
function DocIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  );
}
function ExtLinkIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  );
}
function CheckIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

/**
 * MessageBubble — renders a single chat message bubble.
 *
 * Props:
 *   message            — message object from API / socket
 *   isOwn              — boolean (is current user's message)
 *   isDarkMode         — theme flag
 *   formatTime(date)   — optional time formatter
 *   onDocumentDownload(url, fileName, isPdf) — callback for docs
 */
export default function MessageBubble({
  message,
  isOwn,
  isDarkMode,
  formatTime,
  onDocumentDownload,
  // Legacy simple-usage support (from ChatWindow placeholder)
  from,
  text,
}) {
  const [imgError, setImgError] = useState(false);

  /* backward-compat: when used with simple `from` / `text` props */
  const isMe = isOwn ?? (from === "me");
  const content = message?.text ?? text;
  const msgType = message?.messageType ?? "text";
  const createdAt = message?.createdAt;
  const isTemp = message?.isTemporary;
  const timeStr = createdAt && formatTime ? formatTime(createdAt) : "";

  /* ── own bubble style ──────────────────────────────────── */
  const ownBubble = {
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    boxShadow: "0 4px 16px rgba(99,102,241,0.25)",
  };

  /* ── other bubble style ─────────────────────────────────── */
  const otherBubble = isDarkMode
    ? "bg-slate-800/70 border border-slate-700/40 text-white"
    : "bg-white border border-indigo-100 text-gray-900 shadow-sm shadow-indigo-50";

  /* ── document handler ───────────────────────────────────── */
  const handleDoc = () => {
    if (!message?.media) return;
    const isPdf = message.mimeType === "application/pdf"
      || message.fileName?.toLowerCase().endsWith(".pdf");
    onDocumentDownload?.(message.media, message.fileName, isPdf);
  };

  /* ── avatar (other user only) ───────────────────────────── */
  const sender = message?.sender;
  const avatarSrc = sender?.profileImage || sender?.avatar;
  const avatarInitial = sender?.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
      <div className={`group flex items-end gap-2.5 max-w-[72%] ${isMe ? "flex-row-reverse" : "flex-row"}`}>

        {/* Avatar — other user only */}
        {!isMe && (
          <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 ring-1 ring-indigo-500/20 flex-shrink-0 self-end"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
            {avatarSrc ? (
              <img src={avatarSrc} alt={sender?.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                {avatarInitial}
              </div>
            )}
          </div>
        )}

        {/* ── Bubble ─────────────────────────────────────── */}
        <div
          className={`relative px-4 py-3 rounded-2xl transition-all duration-200 ${
            isTemp ? "opacity-70" : "opacity-100"
          } ${isMe ? `text-white ${isTemp ? "opacity-60" : ""} ${isMe && "rounded-tr-sm"}` : `${otherBubble} ${!isMe && "rounded-tl-sm"}`}`}
          style={isMe ? ownBubble : {}}
        >
          {/* Shimmer on hover for own messages */}
          {isMe && (
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/8 to-white/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          )}

          {/* ── Image ──────────────────────────────────────── */}
          {msgType === "image" && message?.media && !imgError && (
            <div className="mb-2">
              <img
                src={message.media}
                alt="Shared image"
                className="max-w-[240px] max-h-[280px] rounded-xl object-cover cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => window.open(message.media, "_blank")}
                onError={() => setImgError(true)}
                loading="lazy"
                crossOrigin="anonymous"
              />
            </div>
          )}
          {msgType === "image" && imgError && (
            <div className={`mb-2 flex items-center gap-2 px-3 py-2 rounded-xl text-xs ${isMe ? "bg-white/10" : isDarkMode ? "bg-slate-700/40" : "bg-indigo-50"}`}>
              ⚠️ Image failed to load
            </div>
          )}

          {/* ── Video ──────────────────────────────────────── */}
          {msgType === "video" && message?.media && (
            <div className="mb-2">
              <video
                src={message.media} controls preload="metadata" crossOrigin="anonymous"
                className="max-w-[240px] max-h-[280px] rounded-xl"
                onError={e => { e.target.style.display = "none"; }}
              />
            </div>
          )}

          {/* ── Document ───────────────────────────────────── */}
          {msgType === "document" && message?.media && (() => {
            const isPdf = message.mimeType === "application/pdf" || message.fileName?.toLowerCase().endsWith(".pdf");
            const ext   = message.fileName?.split(".").pop()?.toUpperCase() || "FILE";
            return (
              <div className="mb-2">
                <button
                  onClick={handleDoc}
                  className={`flex items-center gap-3 p-3 rounded-xl w-full text-left transition-all hover:opacity-80 ${
                    isMe
                      ? "bg-white/10 hover:bg-white/15"
                      : isDarkMode ? "bg-slate-700/40 hover:bg-slate-700/60" : "bg-indigo-50/80 hover:bg-indigo-50"
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isPdf
                      ? isMe ? "bg-red-400/20" : "bg-red-500/15"
                      : isMe ? "bg-indigo-400/20" : "bg-indigo-500/15"
                  }`}>
                    <DocIcon className={`w-5 h-5 ${isPdf ? "text-red-400" : isMe ? "text-indigo-200" : "text-indigo-400"}`} />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-bold truncate">{message.fileName || "Document"}</p>
                    <p className={`text-[10px] mt-0.5 ${isMe ? "text-indigo-200" : isDarkMode ? "text-slate-400" : "text-gray-400"}`}>
                      {message.fileSize ? `${(message.fileSize / (1024*1024)).toFixed(2)} MB · ` : ""}{ext} · Click to open
                    </p>
                  </div>
                  <ExtLinkIcon className={`w-4 h-4 flex-shrink-0 ${isMe ? "text-indigo-200" : isDarkMode ? "text-slate-500" : "text-gray-400"}`} />
                </button>
              </div>
            );
          })()}

          {/* ── Voice Note ─────────────────────────────────── */}
          {msgType === "voice" && message?.media && (
            <div className="mb-2">
              <div className={`flex items-center gap-3 p-3 rounded-xl min-w-[200px] ${
                isMe
                  ? "bg-white/10"
                  : isDarkMode ? "bg-slate-700/30" : "bg-indigo-50/60"
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isMe
                    ? "bg-white/20"
                    : isDarkMode ? "bg-indigo-500/20" : "bg-indigo-100"
                }`}>
                  <MicIcon className={`w-4 h-4 ${isMe ? "text-white" : "text-indigo-500"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <audio
                    src={message.media} controls preload="metadata"
                    className="w-full h-8"
                    style={{ filter: isMe ? "invert(1) hue-rotate(180deg) brightness(1.2)" : "none" }}
                  />
                </div>
                {message.duration > 0 && (
                  <span className={`text-[10px] font-mono flex-shrink-0 ${isMe ? "text-indigo-200" : isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
                    {fmt(message.duration)}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* ── Plain text ─────────────────────────────────── */}
          {(msgType === "text" || !msgType) && content && (
            <p className="text-sm leading-relaxed">{content}</p>
          )}

          {/* ── Timestamp + status ─────────────────────────── */}
          {timeStr && (
            <div className={`flex items-center gap-1 mt-1.5 ${isMe ? "justify-end" : "justify-start"}`}>
              <span className={`text-[10px] font-medium ${isMe ? "text-indigo-200" : isDarkMode ? "text-slate-500" : "text-gray-400"}`}>
                {timeStr}
              </span>
              {isTemp && (
                <div className="w-3 h-3 border border-current rounded-full animate-spin opacity-50" />
              )}
              {isMe && !isTemp && (
                <CheckIcon className="w-3.5 h-3.5 text-indigo-200" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

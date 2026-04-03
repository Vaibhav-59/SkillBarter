import { useEffect, useRef, useContext } from "react";
import { ThemeContext } from "../../contexts/ThemeContext";

// Gradient palettes for avatar initials
const AVATAR_GRADIENTS = [
  "from-indigo-500 to-violet-600",
  "from-violet-500 to-purple-600",
  "from-purple-500 to-pink-600",
  "from-blue-500 to-indigo-600",
  "from-teal-500 to-cyan-600",
];
const getGradient = (name) => {
  const idx = (name?.charCodeAt(0) || 0) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[idx];
};

export default function VideoCard({
  stream,
  name,
  isMuted,
  isCamOff,
  isLocal,
  isScreenShare,
}) {
  const videoRef = useRef(null);
  const cardRef = useRef(null);
  const { theme } = useContext(ThemeContext) || { theme: "dark" };
  const isDark = theme === "dark";

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream || null;
    }
  }, [stream]);

  const grad = getGradient(name);

  const handleDoubleClick = () => {
    if (!cardRef.current) return;
    if (!document.fullscreenElement) {
      cardRef.current.requestFullscreen().catch((err) => console.error(err));
    } else {
      document.exitFullscreen().catch((err) => console.error(err));
    }
  };

  return (
    <div
      ref={cardRef}
      onDoubleClick={handleDoubleClick}
      className={`relative rounded-2xl overflow-hidden flex items-center justify-center w-full h-full
      shadow-xl border transition-all duration-300 group
      ${isDark
        ? "bg-[#1a1f35] border-white/8 hover:border-indigo-500/40 hover:shadow-indigo-500/10"
        : "bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md"
      }
    `}>
      {/*
        CRITICAL: Always keep <video> in DOM so audio track stays live.
        Hide it visually when cam is off rather than unmounting.
      */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal}
        className={`w-full h-full object-cover transition-opacity duration-300
          ${isLocal && !isScreenShare ? "scale-x-[-1]" : ""}
          ${(!stream || isCamOff) ? "opacity-0 absolute inset-0" : "opacity-100"}`}
      />

      {/* Avatar overlay when cam is off */}
      {(!stream || isCamOff) && (
        <div className={`absolute inset-0 z-10 flex flex-col items-center justify-center gap-3
          ${isDark ? "bg-gradient-to-br from-[#0c0f1a] to-[#121629]" : "bg-gradient-to-br from-slate-50 to-slate-100"}`}>
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${grad}
            flex items-center justify-center shadow-xl text-white font-bold text-2xl select-none
            ring-4 ${isDark ? "ring-white/10" : "ring-slate-900/5"}`}>
            {name?.[0]?.toUpperCase() || "?"}
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className={`text-sm font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
              {isLocal ? "You" : name}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              isCamOff
                ? isDark ? "bg-slate-700/80 text-slate-400" : "bg-slate-200 text-slate-600"
                : isDark ? "bg-indigo-500/20 text-indigo-300" : "bg-indigo-100 text-indigo-700"
            }`}>
              {isCamOff ? "Camera off" : "Connecting…"}
            </span>
          </div>
        </div>
      )}

      {/* Bottom gradient for name legibility */}
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/80 to-transparent pointer-events-none z-20" />

      {/* Name tag */}
      <div className="absolute bottom-2.5 left-3 flex items-center gap-2 pointer-events-none z-30">
        <div className={`w-5 h-5 rounded-lg bg-gradient-to-br ${grad} flex items-center justify-center text-white font-bold text-xs flex-shrink-0`}>
          {name?.[0]?.toUpperCase() || "?"}
        </div>
        <span className="text-white text-xs font-semibold drop-shadow-lg">
          {isLocal ? `${name} (You)` : name}
        </span>
        {isScreenShare && (
          <span className="text-xs bg-blue-500/80 backdrop-blur-sm text-white px-2 py-0.5 rounded-full font-medium border border-blue-400/30">
            Screen
          </span>
        )}
        {isLocal && (
          <span className="text-xs bg-indigo-500/70 backdrop-blur-sm text-white px-1.5 py-0.5 rounded-full font-medium">
            You
          </span>
        )}
      </div>

      {/* Muted indicator */}
      {isMuted && (
        <div className="absolute top-2.5 right-2.5 z-30 w-7 h-7 bg-red-500/90 backdrop-blur-md
          rounded-xl flex items-center justify-center shadow-lg shadow-red-500/30 border border-red-400/30">
          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
        </div>
      )}

      {/* Hover / speaking border ring */}
      <div className="absolute inset-0 rounded-2xl border-2 border-transparent
        group-hover:border-indigo-400/25 transition-colors duration-300 pointer-events-none z-40" />
    </div>
  );
}

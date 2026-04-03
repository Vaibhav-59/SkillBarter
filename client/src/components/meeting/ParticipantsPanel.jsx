import { useContext } from "react";
import { ThemeContext } from "../../contexts/ThemeContext";

const AVATAR_GRADS = [
  "from-indigo-500 to-violet-600",
  "from-violet-500 to-purple-600",
  "from-blue-500 to-indigo-600",
  "from-teal-500 to-cyan-600",
  "from-purple-500 to-pink-600",
];
const getGrad = (name) => AVATAR_GRADS[(name?.charCodeAt(0) || 0) % AVATAR_GRADS.length];

export default function ParticipantsPanel({ participants, onClose }) {
  const { theme } = useContext(ThemeContext) || { theme: "dark" };
  const isDark = theme === "dark";

  const panel = isDark ? "bg-[#11152a]/95 border-white/8" : "bg-white border-slate-200";
  const hdr   = isDark ? "border-white/8"                 : "border-slate-100";
  const row   = isDark ? "hover:bg-white/5 border-white/5" : "hover:bg-slate-50 border-slate-100";

  return (
    <div className={`flex flex-col h-full w-full sm:w-80 backdrop-blur-xl border-l shadow-2xl absolute sm:relative inset-0 z-30 sm:z-auto ${panel}`}
      style={{ minHeight: 0 }}>

      {/* Header */}
      <div className={`flex items-center justify-between px-5 py-4 border-b ${hdr}`}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h3 className={`font-semibold text-sm leading-tight ${isDark ? "text-white" : "text-slate-800"}`}>
              Participants
            </h3>
            <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              {participants.length} in call
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

      {/* Live indicator */}
      <div className={`mx-4 my-3 flex items-center gap-2 px-3 py-2 rounded-xl border ${
        isDark ? "bg-indigo-500/8 border-indigo-500/20" : "bg-indigo-50 border-indigo-100"
      }`}>
        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse flex-shrink-0" />
        <p className={`text-xs font-medium ${isDark ? "text-indigo-300" : "text-indigo-600"}`}>
          Meeting in progress
        </p>
      </div>

      {/* Participant list */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2"
        style={{ scrollbarWidth: "thin", scrollbarColor: isDark ? "#312e81 transparent" : "#c7d2fe transparent" }}>
        {participants.map((p, i) => {
          const grad = getGrad(p.name || "?");
          return (
            <div
              key={p.id || i}
              className={`group flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 cursor-default ${row}`}
            >
              {/* Avatar */}
              <div className={`relative w-10 h-10 rounded-xl bg-gradient-to-br ${grad}
                flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md`}>
                {p.name?.[0]?.toUpperCase() || "?"}
                {/* Online dot */}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#11152a]" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className={`text-sm font-semibold truncate ${isDark ? "text-white" : "text-slate-800"}`}>
                    {p.isLocal ? `${p.name} (You)` : p.name}
                  </p>
                  {p.isHost && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium flex-shrink-0 ${
                      isDark ? "bg-indigo-500/20 text-indigo-300" : "bg-indigo-100 text-indigo-600"
                    }`}>
                      Host
                    </span>
                  )}
                </div>
                <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                  {p.isLocal ? "You" : "Participant"}
                </p>
              </div>

              {/* Status icons */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {p.isMuted ? (
                  <div className="w-7 h-7 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center justify-center" title="Muted">
                    <svg className="w-3.5 h-3.5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                    </svg>
                  </div>
                ) : (
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    isDark ? "bg-white/5 border border-white/8" : "bg-slate-100 border border-slate-200"
                  }`} title="Mic on">
                    <svg className={`w-3.5 h-3.5 ${isDark ? "text-slate-500" : "text-slate-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                )}
                {p.isCamOff ? (
                  <div className="w-7 h-7 bg-red-500/15 border border-red-500/25 rounded-lg flex items-center justify-center" title="Camera off">
                    <svg className="w-3.5 h-3.5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.362a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8M3 8v8a2 2 0 002 2h8M3 8l18 8" />
                    </svg>
                  </div>
                ) : (
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    isDark ? "bg-white/5 border border-white/8" : "bg-slate-100 border border-slate-200"
                  }`} title="Camera on">
                    <svg className={`w-3.5 h-3.5 ${isDark ? "text-slate-500" : "text-slate-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.362a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { useSocket } from "../../contexts/SocketContext";
import { toast } from "react-toastify";
import { LucideBellRing, LucideVideo, LucideX } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";

const SessionReminder = () => {
  const { socket } = useSocket();
  const { isDarkMode: d } = useTheme();
  const [reminders, setReminders] = useState([]);

  useEffect(() => {
    if (!socket) return;

    const handleReminder = (data) => {
      const { session, type } = data;
      toast.info(
        `Session "${session.skillTeach} ↔ ${session.skillLearn}" starts in ${type}!`,
        { icon: "🔔", autoClose: false }
      );
      setReminders((prev) => [...prev, data]);
    };

    socket.on("session-reminder", handleReminder);
    return () => socket.off("session-reminder", handleReminder);
  }, [socket]);

  const dismiss = (idx) =>
    setReminders((prev) => prev.filter((_, i) => i !== idx));

  if (reminders.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      {reminders.map((r, idx) => (
        <div
          key={idx}
          className={`relative w-80 rounded-2xl border overflow-hidden shadow-2xl backdrop-blur-xl pointer-events-auto
            ${d
              ? "bg-[#161b2e]/95 border-indigo-500/25 shadow-indigo-500/15"
              : "bg-white border-indigo-100 shadow-slate-200/80"
            }`}
          style={{ animation: "slideInRight .3s ease-out" }}
        >
          {/* Glow accent */}
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-8 left-4 w-16 h-16 bg-violet-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Progress bar */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600" />

          <div className="relative z-10 flex items-start gap-3 p-4">
            {/* Bell icon */}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
              d ? "bg-indigo-500/20" : "bg-indigo-50"
            }`}>
              <LucideBellRing className="w-5 h-5 text-indigo-400 animate-pulse" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <div className={`font-bold text-sm ${d ? "text-white" : "text-slate-800"}`}>
                  Session in {r.type}
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold border ${
                  d
                    ? "bg-amber-500/15 text-amber-400 border-amber-500/25"
                    : "bg-amber-50 text-amber-600 border-amber-100"
                }`}>
                  SOON
                </span>
              </div>

              <p className={`text-xs mb-2.5 ${d ? "text-slate-400" : "text-slate-500"}`}>
                <span className={`font-semibold ${d ? "text-indigo-300" : "text-indigo-600"}`}>
                  {r.session.skillTeach}
                </span>
                <span className={`mx-1.5 ${d ? "text-slate-500" : "text-slate-400"}`}>↔</span>
                <span className={`font-semibold ${d ? "text-violet-300" : "text-violet-600"}`}>
                  {r.session.skillLearn}
                </span>
              </p>

              {r.session.meetingLink && (
                <a
                  href={r.session.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 w-full text-xs font-bold px-3 py-2
                    bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600
                    hover:from-indigo-400 hover:via-violet-400 hover:to-purple-500
                    text-white rounded-xl justify-center
                    shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40
                    transition-all duration-200 hover:-translate-y-0.5"
                >
                  <LucideVideo className="w-3.5 h-3.5" />
                  Join Now
                </a>
              )}
            </div>

            {/* Dismiss button */}
            <button
              onClick={() => dismiss(idx)}
              className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 hover:scale-110 ${
                d
                  ? "bg-white/5 hover:bg-red-500/15 text-slate-400 hover:text-red-400 border border-white/8"
                  : "bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-500 border border-slate-200"
              }`}
            >
              <LucideX className="w-3 h-3" />
            </button>
          </div>
        </div>
      ))}

      {/* Slide-in animation */}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(110%); opacity: 0; }
          to   { transform: translateX(0);   opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default SessionReminder;

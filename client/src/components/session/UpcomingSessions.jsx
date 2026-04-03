import React from "react";
import api from "../../utils/api";
import { toast } from "react-toastify";
import { LucideVideo, LucideCheckCircle, LucideXCircle, LucideCalendarCheck, LucideClock, LucideArrowRight } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";

const AVATAR_GRADS = [
  "from-indigo-500 to-violet-600",
  "from-violet-500 to-purple-600",
  "from-blue-500 to-indigo-600",
  "from-purple-500 to-pink-600",
  "from-teal-500 to-cyan-600",
];
const getGrad = (name) => AVATAR_GRADS[(name?.charCodeAt(0) || 0) % AVATAR_GRADS.length];

const STATUS_BADGE = {
  accepted: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  pending:  "bg-amber-500/15 text-amber-400 border-amber-500/25",
  rejected: "bg-red-500/15 text-red-400 border-red-500/25",
  default:  "bg-slate-500/15 text-slate-400 border-slate-500/25",
};
const STATUS_DOT = {
  accepted: "bg-emerald-400",
  pending:  "bg-amber-400 animate-pulse",
  rejected: "bg-red-400",
  default:  "bg-slate-400",
};

const UpcomingSessions = ({ sessions, onUpdate }) => {
  const { isDarkMode: d } = useTheme();
  const currentUserId = JSON.parse(localStorage.getItem("user"))?._id;

  const handleUpdateStatus = async (sessionId, status) => {
    try {
      if (status === "deleted") {
        await api.delete(`/sessions/${sessionId}`);
      } else {
        await api.put(`/sessions/${sessionId}/${status}`);
      }
      toast.success(`Session ${status === "deleted" ? "withdrawn" : status} successfully`);
      onUpdate();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to update`);
    }
  };

  if (!sessions || sessions.length === 0) {
    return (
      <div className={`rounded-3xl border p-12 flex flex-col items-center justify-center text-center ${
        d ? "bg-[#161b2e] border-white/10" : "bg-white border-slate-200"
      }`}>
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${d ? "bg-white/5" : "bg-slate-100"}`}>
          <LucideCalendarCheck className={`w-7 h-7 ${d ? "text-slate-500" : "text-slate-400"}`} />
        </div>
        <p className={`font-bold text-sm mb-1 ${d ? "text-white" : "text-slate-800"}`}>No sessions yet</p>
        <p className={`text-xs ${d ? "text-slate-500" : "text-slate-400"}`}>Schedule your first session above</p>
      </div>
    );
  }

  const activeSessions = sessions.filter((s) => s.status !== "completed" && s.status !== "rejected");

  return (
    <div className={`rounded-3xl border overflow-hidden shadow-xl transition-all duration-300 ${
      d ? "bg-[#161b2e] border-white/10 shadow-indigo-500/5" : "bg-white border-slate-200 shadow-slate-200/80"
    }`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-6 py-5 border-b ${d ? "border-white/8 bg-white/2" : "border-slate-100 bg-slate-50/60"}`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm">
            <LucideCalendarCheck className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className={`font-bold text-base leading-tight ${d ? "text-white" : "text-slate-800"}`}>Active Requests</h3>
            <p className={`text-xs mt-0.5 ${d ? "text-slate-500" : "text-slate-400"}`}>Pending & confirmed sessions</p>
          </div>
        </div>
        <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${
          d ? "bg-indigo-500/15 border-indigo-500/25 text-indigo-300" : "bg-indigo-50 border-indigo-100 text-indigo-600"
        }`}>
          <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
          {activeSessions.length} active
        </span>
      </div>

      {/* Empty state after filtering */}
      {activeSessions.length === 0 && (
        <div className="py-10 flex flex-col items-center text-center px-6">
          <LucideCalendarCheck className={`w-8 h-8 mb-2 ${d ? "text-slate-600" : "text-slate-300"}`} />
          <p className={`text-sm ${d ? "text-slate-400" : "text-slate-500"}`}>No active sessions right now.</p>
        </div>
      )}

      {/* Session list */}
      <div
        className="divide-y overflow-y-auto"
        style={{
          maxHeight: "540px",
          scrollbarWidth: "thin",
          scrollbarColor: d ? "#312e81 transparent" : "#c7d2fe transparent",
          divideColor: d ? "rgba(255,255,255,0.05)" : "#f1f5f9",
        }}
      >
        {activeSessions.map((session) => {
          const isHost   = session.hostUser?._id === currentUserId;
          const partner  = isHost ? session.participantUser : session.hostUser;
          const isPending = session.status === "pending";
          const grad     = getGrad(partner?.name);

          const now = new Date();
          const startTimeObj = new Date(session.date);
          if (session.startTime) {
            const [h, m] = session.startTime.split(":");
            startTimeObj.setHours(+h, +m, 0, 0);
          }
          const endTimeObj = new Date(session.date);
          if (session.endTime) {
            const [h, m] = session.endTime.split(":");
            endTimeObj.setHours(+h, +m, 0, 0);
          }
          const hasStarted = now >= startTimeObj;
          const hasEnded   = now >= endTimeObj;

          const bdg = STATUS_BADGE[session.status] || STATUS_BADGE.default;
          const dot = STATUS_DOT[session.status] || STATUS_DOT.default;

          return (
            <div
              key={session._id}
              className={`p-5 transition-all duration-200 ${
                d ? "hover:bg-white/3" : "hover:bg-slate-50"
              }`}
            >
              {/* Top row */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0`}>
                    {partner?.name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className={`font-semibold text-sm ${d ? "text-white" : "text-slate-800"}`}>
                        {partner?.name || "Unknown"}
                      </h4>
                      {session.contractId && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${d ? "bg-violet-500/15 text-violet-400 border border-violet-500/20" : "bg-violet-50 text-violet-600 border border-violet-100"}`}>
                          Contract
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <LucideClock className={`w-3 h-3 ${d ? "text-slate-500" : "text-slate-400"}`} />
                      <p className={`text-xs ${d ? "text-slate-500" : "text-slate-400"}`}>
                        {new Date(session.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })} · {session.startTime}–{session.endTime}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status badge */}
                <span className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg border font-bold uppercase tracking-wide flex-shrink-0 ${bdg}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                  {session.status}
                </span>
              </div>

              {/* Skills exchange row */}
              <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl mb-3 text-xs ${d ? "bg-white/4 border border-white/8" : "bg-slate-50 border border-slate-100"}`}>
                <div className="flex-1">
                  <p className={`text-[10px] font-bold uppercase tracking-wide mb-0.5 ${d ? "text-slate-500" : "text-slate-400"}`}>You teach</p>
                  <p className={`font-semibold ${d ? "text-slate-200" : "text-slate-700"}`}>
                    {isHost ? session.skillTeach : session.skillLearn}
                  </p>
                </div>
                <LucideArrowRight className={`w-3.5 h-3.5 flex-shrink-0 ${d ? "text-indigo-400" : "text-indigo-500"}`} />
                <div className="flex-1 text-right">
                  <p className={`text-[10px] font-bold uppercase tracking-wide mb-0.5 ${d ? "text-slate-500" : "text-slate-400"}`}>They teach</p>
                  <p className={`font-semibold ${d ? "text-slate-200" : "text-slate-700"}`}>
                    {isHost ? session.skillLearn : session.skillTeach}
                  </p>
                </div>
              </div>

              {/* Meeting link state */}
              {session.meetingLink && session.status === "accepted" && (
                !hasStarted ? (
                  <div className={`flex items-center justify-center gap-2 py-2 mb-3 rounded-xl border text-xs font-semibold ${d ? "bg-white/5 border-white/8 text-slate-400" : "bg-slate-100 border-slate-200 text-slate-500"}`}>
                    <LucideClock className="w-3.5 h-3.5" />
                    Starts at {session.startTime}
                  </div>
                ) : !hasEnded ? (
                  <a
                    href={session.meetingLink}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-2 mb-3 rounded-xl border text-xs font-bold
                      bg-gradient-to-r from-indigo-500/15 to-violet-500/15
                      hover:from-indigo-500 hover:to-violet-600
                      text-indigo-400 hover:text-white
                      border-indigo-500/25 hover:border-transparent
                      transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-indigo-500/30"
                  >
                    <LucideVideo className="w-3.5 h-3.5" />
                    Join Video Call
                  </a>
                ) : (
                  <div className={`flex items-center justify-center gap-2 py-2 mb-3 rounded-xl border text-xs font-semibold ${d ? "bg-white/5 border-white/8 text-slate-500" : "bg-slate-100 border-slate-200 text-slate-400"}`}>
                    <LucideCheckCircle className="w-3.5 h-3.5" />
                    Meeting Ended
                  </div>
                )
              )}

              {/* Action buttons */}
              <div className="flex gap-2">
                {isPending && !isHost && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(session._id, "accept")}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all duration-200 hover:scale-105 border ${
                        d
                          ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/30 border-emerald-500/25"
                          : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-100"
                      }`}
                    >
                      <LucideCheckCircle className="w-3.5 h-3.5" />
                      Accept
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(session._id, "reject")}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all duration-200 hover:scale-105 border ${
                        d
                          ? "bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/20"
                          : "bg-red-50 text-red-600 hover:bg-red-100 border-red-100"
                      }`}
                    >
                      <LucideXCircle className="w-3.5 h-3.5" />
                      Reject
                    </button>
                  </>
                )}

                {session.status === "accepted" && hasEnded && (
                  <button
                    onClick={() => handleUpdateStatus(session._id, "complete")}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all duration-200 hover:scale-105 border ${
                      d
                        ? "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-blue-500/20"
                        : "bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-100"
                    }`}
                  >
                    <LucideCheckCircle className="w-3.5 h-3.5" />
                    Mark Complete
                  </button>
                )}

                {session.status === "accepted" && hasStarted && !hasEnded && (
                  <div className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 border cursor-not-allowed ${
                    d ? "bg-white/5 border-white/8 text-slate-500" : "bg-slate-50 border-slate-100 text-slate-400"
                  }`}>
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                    In Progress
                  </div>
                )}

                {isHost && isPending && (
                  <button
                    onClick={() => handleUpdateStatus(session._id, "deleted")}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition-all duration-200 hover:scale-105 border ${
                      d
                        ? "bg-white/5 text-slate-400 hover:bg-red-500/10 hover:text-red-400 border-white/8 hover:border-red-500/20"
                        : "bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600 border-slate-200"
                    }`}
                  >
                    Withdraw
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UpcomingSessions;

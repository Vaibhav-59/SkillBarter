// client/src/components/contract/ContractSessionList.jsx
import { useState, useEffect, useContext } from "react";
import api from "../../utils/api";
import { showSuccess, showError } from "../../utils/toast";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../../contexts/ThemeContext";

const SESSION_STATUS = {
  pending:   {
    dark:  "bg-slate-500/15 text-slate-400 border-slate-500/20",
    light: "bg-slate-100 text-slate-500 border-slate-200",
    dot:   { dark: "bg-slate-400", light: "bg-slate-400" },
    bubbleDark: "bg-indigo-500/10 text-slate-400 border border-indigo-500/15",
    bubbleLight: "bg-slate-100 text-slate-500 border border-slate-200",
  },
  scheduled: {
    dark:  "bg-amber-500/15 text-amber-400 border-amber-500/25",
    light: "bg-amber-50 text-amber-600 border-amber-200",
    dot:   { dark: "bg-amber-400 animate-pulse", light: "bg-amber-500 animate-pulse" },
    bubbleDark: "bg-amber-500/15 text-amber-300 border border-amber-500/25",
    bubbleLight: "bg-amber-50 text-amber-600 border border-amber-200",
  },
  completed: {
    dark:  "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
    light: "bg-emerald-50 text-emerald-600 border-emerald-200",
    dot:   { dark: "bg-emerald-400", light: "bg-emerald-500" },
    bubbleDark: "bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-transparent shadow-lg shadow-emerald-500/25",
    bubbleLight: "bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-transparent shadow-lg shadow-emerald-500/25",
  },
  cancelled: {
    dark:  "bg-red-500/15 text-red-400 border-red-500/25",
    light: "bg-red-50 text-red-600 border-red-200",
    dot:   { dark: "bg-red-400", light: "bg-red-500" },
    bubbleDark: "bg-red-500/15 text-red-400 border border-red-500/25",
    bubbleLight: "bg-red-50 text-red-600 border border-red-200",
  },
};

const genMeetingLink = () => {
  const id = Math.random().toString(36).slice(2, 7) + "-" + Math.random().toString(36).slice(2, 7);
  return `${window.location.origin}/meeting/${id}`;
};

export default function ContractSessionList({ contract, myId, onUpdate }) {
  const { theme } = useContext(ThemeContext) || { theme: "dark" };
  const d = theme === "dark";
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [formData, setFormData] = useState({ date: "", startTime: "", endTime: "", meetingLink: "", notes: "" });

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const openSchedule = (session) => {
    setSelectedSession(session);
    setFormData({
      date:        session.date ? new Date(session.date).toISOString().split("T")[0] : "",
      startTime:   session.startTime || "",
      endTime:     session.endTime || "",
      meetingLink: session.meetingLink || "",
      notes:       session.notes || "",
    });
    setShowModal(true);
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/contracts/schedule-session/${contract._id}`, {
        sessionNumber: selectedSession.sessionNumber,
        ...formData,
      });
      showSuccess(`Session #${selectedSession.sessionNumber} scheduled!`);
      setShowModal(false);
      onUpdate?.();
    } catch (err) {
      showError(err?.response?.data?.message || "Failed to schedule");
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (sessionNumber) => {
    if (!window.confirm("Mark this session as completed?")) return;
    setLoading(true);
    try {
      await api.put(`/contracts/complete-session/${contract._id}`, { sessionNumber });
      showSuccess("Session completed!");
      onUpdate?.();
    } catch (err) {
      showError(err?.response?.data?.message || "Failed to complete");
    } finally {
      setLoading(false);
    }
  };

  const canJoin = (date, startTime) => {
    if (!date || !startTime) return false;
    const s = new Date(date);
    const [h, m] = startTime.split(":");
    s.setHours(+h, +m, 0);
    return currentTime >= new Date(s.getTime() - 5 * 60 * 1000);
  };

  const handleJoin = (link) => {
    if (!link) return;
    link.startsWith("http") ? window.open(link, "_blank") : navigate(`/meeting/${link}`);
  };

  const inputCls = `w-full px-4 py-2.5 rounded-xl border outline-none transition-all duration-200 ${
    d
      ? "bg-indigo-500/8 border-indigo-500/20 text-white placeholder-slate-500 focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20"
      : "bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
  }`;
  const labelCls = `block text-xs font-bold uppercase tracking-wider mb-1.5 ${d ? "text-indigo-300" : "text-indigo-600"}`;

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className={`w-4 h-4 ${d ? "text-slate-500" : "text-slate-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className={`font-bold uppercase tracking-wider ${d ? "text-slate-400" : "text-slate-500"}`}>Sessions</h3>
        </div>
        <span className={`px-2.5 py-0.5 rounded-full font-bold border ${
          d ? "bg-indigo-500/15 text-indigo-300 border-indigo-500/20" : "bg-indigo-50 text-indigo-600 border-indigo-100"
        }`}>
          {contract.sessions?.length || 0} total
        </span>
      </div>

      {/* Session list */}
      <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1"
        style={{ scrollbarWidth: "thin", scrollbarColor: d ? "#312e81 transparent" : "#c7d2fe transparent" }}>
        {(contract.sessions || []).map((session, idx) => {
          const cfg         = SESSION_STATUS[session.status] || SESSION_STATUS.pending;
          const isScheduled = session.status === "scheduled";
          const isCompleted = session.status === "completed";
          const joinable    = canJoin(session.date, session.startTime);

          return (
            <div key={idx} className={`group flex items-center justify-between gap-3 flex-wrap p-4 rounded-2xl border transition-all duration-200 ${
              isCompleted
                ? d ? "bg-emerald-500/5 border-emerald-500/15" : "bg-emerald-50/80 border-emerald-100"
                : d ? "bg-indigo-500/5 border-indigo-500/12 hover:border-indigo-500/25 hover:bg-indigo-500/8" : "bg-white border-slate-100 hover:border-indigo-100"
            }`}>

              {/* Left: number bubble + info */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black flex-shrink-0 ${
                  isCompleted
                    ? d ? cfg.bubbleDark : cfg.bubbleLight
                    : isScheduled
                      ? d ? cfg.bubbleDark : cfg.bubbleLight
                      : d ? cfg.bubbleDark : cfg.bubbleLight
                }`}>
                  {isCompleted ? (
                    <svg className="w-4.5 h-4.5 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : session.sessionNumber}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <p className={`font-bold ${d ? "text-white" : "text-slate-800"}`}>Session {session.sessionNumber}</p>
                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full border font-bold uppercase tracking-wide ${
                      d ? cfg.dark : cfg.light
                    }`} style={{ fontSize: "9px" }}>
                      <span className={`w-1.5 h-1.5 rounded-full ${d ? cfg.dot.dark : cfg.dot.light}`} />
                      {session.status}
                    </span>
                  </div>
                  {session.date ? (
                    <p className={`flex items-center gap-1.5 ${d ? "text-slate-500" : "text-slate-400"}`} style={{ fontSize: "11px" }}>
                      <svg className="w-3 h-3 text-indigo-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(session.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      <span className={d ? "text-slate-700" : "text-slate-300"}>·</span>
                      <svg className="w-3 h-3 text-violet-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {session.startTime}–{session.endTime}
                    </p>
                  ) : (
                    <p className={`italic ${d ? "text-slate-600" : "text-slate-400"}`} style={{ fontSize: "11px" }}>Not scheduled yet</p>
                  )}
                </div>
              </div>

              {/* Right: action buttons */}
              <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                {/* Schedule / Reschedule */}
                {!isCompleted && contract.status === "active" && (
                  <button
                    onClick={() => openSchedule(session)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all duration-200 hover:scale-105 border ${
                      isScheduled
                        ? d ? "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border-amber-500/20" : "bg-amber-50 text-amber-600 hover:bg-amber-100 border-amber-200"
                        : d ? "bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border-indigo-500/20" : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-indigo-200"
                    }`} style={{ fontSize: "11px" }}
                  >
                    {isScheduled ? "Reschedule" : "Schedule"}
                  </button>
                )}

                {/* Complete */}
                {isScheduled && !isCompleted && (
                  <button
                    onClick={() => handleComplete(session.sessionNumber)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all duration-200 hover:scale-105 border ${
                      d ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border-emerald-500/20" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-200"
                    }`} style={{ fontSize: "11px" }}
                  >
                    Complete ✓
                  </button>
                )}

                {/* Join */}
                {isScheduled && !isCompleted && session.meetingLink && (
                  <button
                    onClick={() => handleJoin(session.meetingLink)}
                    disabled={!joinable}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all duration-200 border ${
                      joinable
                        ? "bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white border-transparent shadow-lg shadow-indigo-500/25 hover:scale-105"
                        : d ? "bg-indigo-500/8 text-slate-500 border-indigo-500/15 cursor-not-allowed" : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                    }`} style={{ fontSize: "11px" }}
                  >
                    {joinable ? "🚀 Join" : "⏳ Soon"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Schedule Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className={`w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border ${
            d ? "bg-[#0d1117] border-indigo-500/15 shadow-indigo-500/10" : "bg-white border-slate-200"
          }`}>
            {/* Modal header */}
            <div className={`flex items-center justify-between px-6 py-5 border-b ${
              d ? "border-indigo-500/15 bg-indigo-500/5" : "border-slate-100 bg-indigo-50/50"
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4 className={`font-bold ${d ? "text-white" : "text-slate-800"}`}>
                  Schedule Session #{selectedSession?.sessionNumber}
                </h4>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110 ${
                  d ? "bg-indigo-500/10 hover:bg-red-500/15 text-slate-400 hover:text-red-400 border border-indigo-500/15" : "bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-500"
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="p-6 space-y-4">
              <div>
                <label className={labelCls}>Date</label>
                <input type="date" required value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  style={{ colorScheme: d ? "dark" : "light" }}
                  className={inputCls} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Start Time</label>
                  <input type="time" required value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    style={{ colorScheme: d ? "dark" : "light" }}
                    className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>End Time</label>
                  <input type="time" required value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    style={{ colorScheme: d ? "dark" : "light" }}
                    className={inputCls} />
                </div>
              </div>

              <div>
                <label className={labelCls}>
                  Meeting Link <span className={`normal-case font-normal ${d ? "text-slate-500" : "text-slate-400"}`}>(optional)</span>
                </label>
                <div className="flex gap-2">
                  <input type="text" placeholder="Zoom / Meet link, or auto-generate"
                    value={formData.meetingLink}
                    onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                    className={`${inputCls} flex-1`} />
                  <button type="button"
                    onClick={() => { setFormData({ ...formData, meetingLink: genMeetingLink() }); showSuccess("Link generated!"); }}
                    className={`px-3 rounded-xl font-bold border transition-all duration-200 flex-shrink-0 hover:scale-105 ${
                      d ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/20" : "bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100"
                    }`} style={{ fontSize: "11px" }}
                  >Auto</button>
                </div>
              </div>

              <div>
                <label className={labelCls}>
                  Notes <span className={`normal-case font-normal ${d ? "text-slate-500" : "text-slate-400"}`}>(optional)</span>
                </label>
                <textarea rows={2} placeholder="Session goals, topics…"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className={`${inputCls} resize-none`} />
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600
                  hover:from-indigo-400 hover:via-violet-400 hover:to-purple-500
                  text-white font-bold rounded-xl shadow-xl shadow-indigo-500/25
                  transition-all duration-300 hover:scale-[1.02]
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100
                  flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Saving…
                  </>
                ) : "Confirm Schedule"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

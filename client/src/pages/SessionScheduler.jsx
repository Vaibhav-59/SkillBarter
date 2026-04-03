import React, { useState, useEffect } from "react";
import api from "../utils/api";
import CalendarView from "../components/session/CalendarView";
import SessionForm from "../components/session/SessionForm";
import UpcomingSessions from "../components/session/UpcomingSessions";
import { useTheme } from "../hooks/useTheme";

const STATUS_CONFIG = {
  accepted:  { dot: "bg-emerald-400",  badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",  label: "Accepted"  },
  pending:   { dot: "bg-amber-400 animate-pulse", badge: "bg-amber-500/15 text-amber-400 border-amber-500/30",     label: "Pending"   },
  rejected:  { dot: "bg-red-400",      badge: "bg-red-500/15 text-red-400 border-red-500/30",             label: "Rejected"  },
  completed: { dot: "bg-blue-400",     badge: "bg-blue-500/15 text-blue-400 border-blue-500/30",           label: "Completed" },
};

const SessionScheduler = () => {
  const { isDarkMode: d } = useTheme();
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);

  const fetchSessions = async () => {
    try {
      const res = await api.get("/sessions");
      setSessions(res.data.data);
    } catch (err) {
      console.error("Failed to load sessions", err);
    }
  };

  useEffect(() => { fetchSessions(); }, []);

  let hasStarted = false;
  let hasEnded = false;
  if (selectedSession) {
    const now = new Date();
    const startTimeObj = new Date(selectedSession.date);
    if (selectedSession.startTime) {
      const [h, m] = selectedSession.startTime.split(":");
      startTimeObj.setHours(+h, +m, 0, 0);
    }
    const endTimeObj = new Date(selectedSession.date);
    if (selectedSession.endTime) {
      const [h, m] = selectedSession.endTime.split(":");
      endTimeObj.setHours(+h, +m, 0, 0);
    }
    hasStarted = now >= startTimeObj;
    hasEnded   = now >= endTimeObj;
  }

  const cfg = selectedSession ? (STATUS_CONFIG[selectedSession.status] || STATUS_CONFIG.pending) : null;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${d ? "bg-[#0f1117]" : "bg-[#f0f4ff]"} font-sans`}>
      {/* Ambient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-60 -right-60 w-[600px] h-[600px] rounded-full blur-3xl animate-pulse ${d ? "bg-indigo-500/10" : "bg-indigo-300/20"}`} />
        <div className={`absolute -bottom-60 -left-60 w-[600px] h-[600px] rounded-full blur-3xl animate-pulse delay-1000 ${d ? "bg-violet-500/8" : "bg-violet-300/15"}`} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-20">
        {/* Page header */}
        <header className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/30">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 className={`text-3xl md:text-4xl font-extrabold tracking-tight ${
                d
                  ? "bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent"
                  : "text-slate-800"
              }`}>
                Session Calendar
              </h1>
            </div>
            <p className={`ml-[60px] text-sm ${d ? "text-slate-400" : "text-slate-500"}`}>
              Manage your skill-sharing schedule and coordinate sessions
            </p>
          </div>

          {/* Today pill */}
          <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl border shadow-sm flex-shrink-0 ${
            d ? "bg-[#161b2e] border-indigo-500/15" : "bg-white border-slate-200"
          }`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${d ? "bg-indigo-500/15" : "bg-indigo-50"}`}>
              <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className={`text-xs font-bold uppercase tracking-wider ${d ? "text-slate-500" : "text-slate-400"}`}>Today</p>
              <p className={`font-semibold text-sm ${d ? "text-slate-200" : "text-slate-800"}`}>
                {new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
              </p>
            </div>
            <div className={`ml-4 pl-4 border-l ${d ? "border-indigo-500/20" : "border-slate-100"}`}>
              <p className={`text-xs font-bold uppercase tracking-wider ${d ? "text-slate-500" : "text-slate-400"}`}>Sessions</p>
              <p className={`font-semibold text-sm ${d ? "text-indigo-300" : "text-indigo-600"}`}>
                {sessions.length} total
              </p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* ── Left: calendar + session detail ── */}
          <div className="xl:col-span-8 flex flex-col gap-8">
            <CalendarView sessions={sessions} onSelectSession={setSelectedSession} />

            {/* Session detail card */}
            {selectedSession && (
              <div className={`rounded-3xl border shadow-xl overflow-hidden transition-all duration-300 animate-in slide-in-from-bottom-4 ${
                d ? "bg-[#161b2e] border-indigo-500/25 shadow-indigo-500/10" : "bg-white border-indigo-200 shadow-indigo-100"
              }`}>
                {/* Detail header */}
                <div className={`relative flex items-center justify-between px-6 py-5 border-b ${d ? "border-indigo-500/15 bg-indigo-500/5" : "border-slate-100 bg-indigo-50/50"}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${d ? "bg-indigo-500/20" : "bg-indigo-100"}`}>
                      <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div>
                      <h3 className={`font-bold text-base leading-tight ${d ? "text-white" : "text-slate-800"}`}>Session Details</h3>
                      <div className={`flex items-center gap-1.5 mt-0.5 px-2 py-0.5 rounded-full border text-xs font-bold w-fit ${cfg.badge}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedSession(null)}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110 ${
                      d ? "bg-indigo-500/10 hover:bg-red-500/15 text-slate-400 hover:text-red-400 border border-indigo-500/15" : "bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-500"
                    }`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Detail body */}
                <div className="p-6 space-y-5">
                  {/* Info grid */}
                  <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl border ${d ? "bg-indigo-500/5 border-indigo-500/15" : "bg-slate-50 border-slate-100"}`}>
                    {/* Participants */}
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${d ? "bg-indigo-500/15" : "bg-indigo-50"}`}>
                        <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <span className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${d ? "text-indigo-400" : "text-indigo-500"}`}>Participants</span>
                        <p className={`text-sm font-semibold ${d ? "text-slate-200" : "text-slate-700"}`}>
                          Host: <span className={`font-normal ${d ? "text-slate-400" : "text-slate-500"}`}>{selectedSession.hostUser?.name}</span>
                        </p>
                        <p className={`text-sm font-semibold ${d ? "text-slate-200" : "text-slate-700"}`}>
                          Guest: <span className={`font-normal ${d ? "text-slate-400" : "text-slate-500"}`}>{selectedSession.participantUser?.name}</span>
                        </p>
                      </div>
                    </div>

                    {/* Date & Time */}
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${d ? "bg-violet-500/15" : "bg-violet-50"}`}>
                        <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <span className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${d ? "text-violet-400" : "text-violet-500"}`}>Date & Time</span>
                        <p className={`text-sm font-semibold ${d ? "text-slate-200" : "text-slate-700"}`}>
                          {new Date(selectedSession.date).toLocaleDateString(undefined, { weekday: "short", month: "long", day: "numeric", year: "numeric" })}
                        </p>
                        <p className={`text-sm ${d ? "text-slate-400" : "text-slate-500"}`}>
                          {selectedSession.startTime} → {selectedSession.endTime}
                        </p>
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${d ? "bg-purple-500/15" : "bg-purple-50"}`}>
                        <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <div>
                        <span className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${d ? "text-purple-400" : "text-purple-500"}`}>Skills Exchange</span>
                        <p className={`text-sm ${d ? "text-slate-300" : "text-slate-700"}`}>
                          <span className="font-semibold">{selectedSession.skillTeach}</span>
                          <span className={`mx-2 ${d ? "text-slate-500" : "text-slate-400"}`}>↔</span>
                          <span className="font-semibold">{selectedSession.skillLearn}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {selectedSession.notes && (
                    <div className={`p-4 rounded-2xl border ${d ? "bg-indigo-500/5 border-indigo-500/15" : "bg-slate-50 border-slate-100"}`}>
                      <span className={`block text-xs font-bold uppercase tracking-wider mb-2 ${d ? "text-indigo-400" : "text-indigo-500"}`}>Notes / Agenda</span>
                      <p className={`text-sm leading-relaxed ${d ? "text-slate-300" : "text-slate-700"}`}>{selectedSession.notes}</p>
                    </div>
                  )}

                  {/* Meeting link / CTA */}
                  {selectedSession.meetingLink ? (
                    selectedSession.status === "accepted" ? (
                      !hasStarted ? (
                        <div className={`flex items-center justify-center gap-2 py-3.5 rounded-xl border text-sm font-semibold ${d ? "bg-indigo-500/8 border-indigo-500/15 text-slate-400" : "bg-slate-100 border-slate-200 text-slate-500"}`}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Starts at {selectedSession.startTime}
                        </div>
                      ) : !hasEnded ? (
                        <a
                          href={selectedSession.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white
                            bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600
                            hover:from-indigo-400 hover:via-violet-400 hover:to-purple-500
                            shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50
                            transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.01]"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.362a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Join Video Meeting
                        </a>
                      ) : (
                        <div className={`flex items-center justify-center gap-2 py-3.5 rounded-xl border text-sm font-semibold ${d ? "bg-indigo-500/8 border-indigo-500/15 text-slate-400" : "bg-slate-100 border-slate-200 text-slate-500"}`}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Meeting Ended
                        </div>
                      )
                    ) : (
                      <div className={`flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 border-dashed text-sm font-semibold ${d ? "border-indigo-500/20 text-slate-500" : "border-slate-200 text-slate-500"}`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Link available when session is accepted
                      </div>
                    )
                  ) : (
                    <div className={`flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 border-dashed text-sm font-semibold ${d ? "border-indigo-500/20 text-slate-500" : "border-slate-200 text-slate-500"}`}>
                      No meeting link provided
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── Right sidebar ── */}
          <div className="xl:col-span-4 flex flex-col gap-8">
            <SessionForm onSessionCreated={fetchSessions} />
            <UpcomingSessions sessions={sessions} onUpdate={fetchSessions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionScheduler;

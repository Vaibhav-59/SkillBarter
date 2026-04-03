import { useState, useContext } from "react";
import { ThemeContext } from "../contexts/ThemeContext";

const generateMeetingId = () =>
  Math.random().toString(36).slice(2, 7) + "-" +
  Math.random().toString(36).slice(2, 7);

const FEATURES = [
  { icon: "M15 10l4.553-2.069A1 1 0 0121 8.82v6.362a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z", label: "HD Video" },
  { icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", label: "Screen Share" },
  { icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z", label: "Live Chat" },
  { icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z", label: "Multi-Party" },
  { icon: "M15 10l4.553-2.069A1 1 0 0121 8.82v6.362a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z", label: "Recording" },
];

const RECENT_MEETINGS = [
  { id: "abc12-xyz34", time: "Today, 2:00 PM", participants: 4 },
  { id: "def56-uvw78", time: "Yesterday, 10:30 AM", participants: 2 },
  { id: "ghi90-rst12", time: "Mar 28, 4:00 PM", participants: 6 },
];

export default function MeetingPage() {
  const [meetingIdInput, setMeetingIdInput] = useState("");
  const [nameInput, setNameInput] = useState(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user.name || "";
  });
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("create"); // "create" | "join"

  const { theme } = useContext(ThemeContext) || { theme: "dark" };
  const isDark = theme === "dark";

  const createMeeting = () => {
    if (!nameInput.trim()) { setError("Please enter your name first."); return; }
    const newId = generateMeetingId();
    window.open(`/meeting/${newId}`, "_blank");
  };

  const joinMeeting = () => {
    if (!nameInput.trim()) { setError("Please enter your name first."); return; }
    if (!meetingIdInput.trim()) { setError("Please enter a Meeting ID."); return; }
    window.open(`/meeting/${meetingIdInput.trim()}`, "_blank");
  };

  const joinRecent = (id) => {
    if (!nameInput.trim()) { setError("Please enter your name first."); return; }
    window.open(`/meeting/${id}`, "_blank");
  };

  const clearError = () => setError("");

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark
        ? "bg-[#0f1117]"
        : "bg-[#f0f4ff]"
    }`}>
      {/* Ambient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full blur-3xl animate-pulse ${
          isDark ? "bg-indigo-500/10" : "bg-indigo-300/25"
        }`} />
        <div className={`absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full blur-3xl animate-pulse delay-1000 ${
          isDark ? "bg-violet-500/8" : "bg-violet-300/20"
        }`} />
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-3xl ${
          isDark ? "bg-indigo-600/3" : "bg-blue-200/15"
        }`} />
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row min-h-screen">
        {/* ── Left panel ── */}
        <div className="flex-1 flex flex-col justify-center p-8 lg:p-16">
          {/* Logo row */}
          <div className="flex items-center gap-3 mb-12">
            <div className="relative w-12 h-12 bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-600 blur-lg opacity-50 animate-pulse" />
              <svg className="w-6 h-6 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.362a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className={`font-bold text-lg tracking-tight ${isDark ? "text-white" : "text-slate-800"}`}>
                SkillBarter Meet
              </h1>
              <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>Video Conferencing</p>
            </div>
          </div>

          {/* Hero text */}
          <div className="mb-10">
            <h2 className={`font-extrabold text-4xl lg:text-5xl leading-tight mb-4 ${isDark ? "text-white" : "text-slate-800"}`}>
              Connect. Collaborate.{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
                Skill Share.
              </span>
            </h2>
            <p className={`text-base leading-relaxed max-w-md ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Host HD video meetings for your skill exchange sessions. Invite your peers and learn together in real time.
            </p>
          </div>

          {/* Feature chips */}
          <div className="flex flex-wrap gap-3 mb-10">
            {FEATURES.map((f) => (
              <div key={f.label} className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-colors ${
                isDark
                  ? "bg-white/5 border-white/10 text-slate-300 hover:bg-indigo-500/10 hover:border-indigo-500/30 hover:text-indigo-300"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700"
              }`}>
                <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={f.icon} />
                </svg>
                {f.label}
              </div>
            ))}
          </div>

          {/* Recent meetings */}
          <div>
            <h3 className={`text-sm font-semibold mb-3 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Recent Meetings
            </h3>
            <div className="space-y-2">
              {RECENT_MEETINGS.map((m) => (
                <div key={m.id}
                  onClick={() => joinRecent(m.id)}
                  className={`group flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                    isDark
                      ? "bg-white/4 border-white/8 hover:bg-indigo-500/10 hover:border-indigo-500/30"
                      : "bg-white border-slate-200 hover:bg-indigo-50 hover:border-indigo-200"
                  }`}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.362a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className={`text-sm font-mono font-medium ${isDark ? "text-white" : "text-slate-800"}`}>{m.id}</p>
                      <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>{m.time} · {m.participants} participants</p>
                    </div>
                  </div>
                  <svg className={`w-4 h-4 transition-colors ${isDark ? "text-slate-600 group-hover:text-indigo-400" : "text-slate-300 group-hover:text-indigo-500"}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right panel (card) ── */}
        <div className="lg:w-[420px] flex items-center justify-center p-8 lg:py-16">
          <div className={`w-full rounded-3xl border shadow-2xl overflow-hidden ${
            isDark
              ? "bg-[#161b2e]/80 backdrop-blur-2xl border-white/10 shadow-indigo-500/5"
              : "bg-white border-slate-200 shadow-slate-200/80"
          }`}>
            {/* Card header */}
            <div className={`px-8 pt-8 pb-6 border-b ${isDark ? "border-white/8" : "border-slate-100"}`}>
              <h2 className={`font-bold text-xl mb-1 ${isDark ? "text-white" : "text-slate-800"}`}>
                Start a Meeting
              </h2>
              <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Enter your name and create or join a session
              </p>
            </div>

            <div className="p-8 space-y-6">
              {/* Name input */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                  Your Display Name
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <svg className={`w-4 h-4 ${isDark ? "text-slate-500" : "text-slate-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    value={nameInput}
                    onChange={(e) => { setNameInput(e.target.value); clearError(); }}
                    placeholder="Enter your name..."
                    className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm transition-all duration-200 outline-none ${
                      isDark
                        ? "bg-white/5 border-white/10 text-white placeholder-slate-500 focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20"
                        : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    }`}
                  />
                </div>
              </div>

              {/* Tabs */}
              <div className={`flex rounded-xl p-1 gap-1 ${isDark ? "bg-white/5" : "bg-slate-100"}`}>
                {["create", "join"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold capitalize transition-all duration-200 ${
                      activeTab === tab
                        ? isDark
                          ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25"
                          : "bg-white text-indigo-600 shadow-sm border border-slate-200"
                        : isDark
                          ? "text-slate-400 hover:text-slate-200"
                          : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {tab === "create" ? "🎬 New Meeting" : "🔗 Join Meeting"}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              {activeTab === "create" ? (
                <div className="space-y-4">
                  <div className={`p-4 rounded-xl border ${
                    isDark
                      ? "bg-indigo-500/8 border-indigo-500/20"
                      : "bg-indigo-50 border-indigo-100"
                  }`}>
                    <p className={`text-xs font-medium mb-1 ${isDark ? "text-indigo-300" : "text-indigo-600"}`}>
                      A new meeting room will be created instantly
                    </p>
                    <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      Share the link with participants to invite them
                    </p>
                  </div>
                  <button
                    onClick={createMeeting}
                    className="w-full py-3.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600
                      hover:from-indigo-400 hover:via-violet-400 hover:to-purple-500
                      text-white font-semibold rounded-xl transition-all duration-300
                      hover:scale-[1.02] hover:shadow-xl hover:shadow-indigo-500/30
                      flex items-center justify-center gap-2 text-sm"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create New Meeting
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                      Meeting ID
                    </label>
                    <input
                      value={meetingIdInput}
                      onChange={(e) => { setMeetingIdInput(e.target.value); clearError(); }}
                      onKeyDown={(e) => e.key === "Enter" && joinMeeting()}
                      placeholder="e.g. abc12-xyz34"
                      className={`w-full px-4 py-3 rounded-xl border text-sm font-mono transition-all duration-200 outline-none ${
                        isDark
                          ? "bg-white/5 border-white/10 text-white placeholder-slate-500 focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 tracking-widest"
                          : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 tracking-widest"
                      }`}
                    />
                  </div>
                  <button
                    onClick={joinMeeting}
                    disabled={!meetingIdInput.trim() || !nameInput.trim()}
                    className={`w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100 ${
                      isDark
                        ? "bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600 hover:from-indigo-400 hover:via-violet-400 hover:to-purple-500 text-white hover:shadow-xl hover:shadow-indigo-500/30"
                        : "bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white hover:shadow-xl hover:shadow-indigo-400/30"
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Join Meeting
                  </button>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className={`flex items-center gap-2 p-3 rounded-xl border text-sm ${
                  isDark
                    ? "bg-red-500/10 border-red-500/20 text-red-400"
                    : "bg-red-50 border-red-100 text-red-600"
                }`}>
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}
            </div>

            {/* Footer stats */}
            <div className={`px-8 py-4 border-t ${isDark ? "border-white/8 bg-white/2" : "border-slate-100 bg-slate-50"}`}>
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <p className={`font-bold text-base ${isDark ? "text-white" : "text-slate-800"}`}>4K</p>
                  <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>Max Quality</p>
                </div>
                <div className={`w-px h-8 ${isDark ? "bg-white/10" : "bg-slate-200"}`} />
                <div className="text-center">
                  <p className={`font-bold text-base ${isDark ? "text-white" : "text-slate-800"}`}>100</p>
                  <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>Participants</p>
                </div>
                <div className={`w-px h-8 ${isDark ? "bg-white/10" : "bg-slate-200"}`} />
                <div className="text-center">
                  <p className={`font-bold text-base ${isDark ? "text-white" : "text-slate-800"}`}>E2E</p>
                  <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>Encrypted</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

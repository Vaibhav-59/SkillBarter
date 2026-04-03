import { useState, useEffect } from "react";
import api from "../../utils/api";
import { showError } from "../../utils/toast";
import { useTheme } from "../../hooks/useTheme";

// ── Icons ────────────────────────────────────────────────────────
const RefreshIcon = ({ cls, spin }) => <svg className={`${cls} ${spin ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>;
const CalendarIcon = ({ cls }) => <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>;
const CheckIcon = ({ cls }) => <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
const ClockIcon = ({ cls }) => <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

// ── Shared Subcomponents ──────────────────────────────────────────
function Avatar({ src, name }) {
  const colors = ["from-emerald-500 to-teal-500","from-blue-500 to-indigo-500","from-purple-500 to-violet-500","from-amber-500 to-orange-500","from-rose-500 to-red-500"];
  const idx = name ? name.charCodeAt(0) % colors.length : 0;
  if (src && !src.includes("dicebear.com")) return <img src={src} alt={name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />;
  return <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${colors[idx]} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>{name?.slice(0, 2).toUpperCase() || "??"}</div>;
}

function Card({ children, className = "", d }) {
  return (
    <div className={`rounded-2xl border overflow-hidden shadow-lg transition-colors duration-300 ${d ? "bg-[#0d1120]/90 border-white/5 shadow-black/40" : "bg-white border-slate-200/80 shadow-slate-200/50"} ${className}`}>
      {children}
    </div>
  );
}

function CardHeader({ title, badge, d, action }) {
  return (
    <div className={`px-6 py-4 border-b flex items-center justify-between gap-3 ${d ? "border-white/5 bg-white/[0.02]" : "border-slate-100 bg-slate-50/60"}`}>
      <div className="flex items-center gap-2">
        <span className={`text-sm font-bold ${d ? "text-white" : "text-slate-800"}`}>{title}</span>
        {badge != null && <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${d ? "bg-emerald-500/15 text-emerald-400" : "bg-emerald-50 text-emerald-600"}`}>{badge}</span>}
      </div>
      {action}
    </div>
  );
}

// ── Accent lookup ────────────────────────────────────────────────
const ACC = {
  emerald: { grad: "from-emerald-500 to-teal-500", dv: "text-emerald-300", lv: "text-emerald-600", ring: "ring-emerald-500/20" },
  blue:    { grad: "from-blue-500 to-indigo-500",  dv: "text-blue-300",    lv: "text-blue-600",    ring: "ring-blue-500/20"    },
  amber:   { grad: "from-amber-500 to-orange-500", dv: "text-amber-300",   lv: "text-amber-600",   ring: "ring-amber-500/20"   },
  slate:   { grad: "from-slate-500 to-slate-400",  dv: "text-slate-300",   lv: "text-slate-600",   ring: "ring-slate-500/20"   },
};

// ── Stat Card ────────────────────────────────────────────────────
function StatCard({ label, value, accent, emoji, d }) {
  const a = ACC[accent] || ACC.emerald;
  return (
    <div className={`relative overflow-hidden rounded-2xl border p-6 ring-1 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group ${d ? `bg-[#0d1120]/80 border-white/5 ${a.ring} shadow-black/30` : `bg-white border-slate-200/70 ${a.ring} shadow-slate-200/50`}`}>
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br ${d ? "from-white/[0.02] to-transparent" : "from-emerald-50/40 to-transparent"}`} />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className={`text-xs font-semibold uppercase tracking-widest mb-3 ${d ? "text-slate-400" : "text-slate-500"}`}>{label}</p>
          <p className={`text-4xl font-black leading-none ${d ? a.dv : a.lv}`}>{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${a.grad} shadow-lg text-xl`}>
          {emoji}
        </div>
      </div>
      <div className={`absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r ${a.grad} opacity-50`} />
    </div>
  );
}

// ── Status Badge ──────────────────────────────────────────────────
const StatusBadge = ({ status, d }) => {
  const map = {
    pending:   { dark: "bg-amber-500/15 text-amber-400 border-amber-500/30",   light: "bg-amber-50 text-amber-700 border-amber-200" },
    accepted:  { dark: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", light: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    completed: { dark: "bg-blue-500/15 text-blue-400 border-blue-500/30",      light: "bg-blue-50 text-blue-700 border-blue-200" },
    rejected:  { dark: "bg-red-500/15 text-red-400 border-red-500/30",         light: "bg-red-50 text-red-700 border-red-200" },
  };
  const c = map[status] || { dark: "bg-slate-500/15 text-slate-400 border-slate-500/30", light: "bg-slate-50 text-slate-700 border-slate-200" };
  
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${d ? c.dark : c.light}`}>
      {status}
    </span>
  );
};

export default function SessionManagement() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isDarkMode: d } = useTheme();

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/sessions");
      if (response.data.success) {
        setSessions(response.data.data);
      } else {
        showError("Failed to fetch sessions");
      }
    } catch (err) {
      showError(err.response?.data?.message || "Failed to fetch sessions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const totalSessions = sessions.length;
  const pendingCount = sessions.filter(s => s.status === "pending").length;
  const acceptedCount = sessions.filter(s => s.status === "accepted").length;
  const completedCount = sessions.filter(s => s.status === "completed").length;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${d ? "bg-[#060912]" : "bg-slate-50"}`}>
      <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <CalendarIcon cls="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-2xl font-black tracking-tight ${d ? "text-white" : "text-slate-900"}`}>Session Management</h1>
              <p className={`text-sm font-medium mt-0.5 ${d ? "text-slate-400" : "text-slate-500"}`}>Monitor and manage skill exchange sessions</p>
            </div>
          </div>
          <button 
            onClick={fetchSessions} 
            disabled={loading}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-60 shadow-md ${
              d ? "bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/25" : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"}`}
          >
            <RefreshIcon cls="w-4 h-4" spin={loading} />
            {loading ? "Loading..." : "Refresh Data"}
          </button>
        </div>

        {/* Analytics Cards */}
        {loading && totalSessions === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => <div key={i} className={`h-28 rounded-2xl animate-pulse ${d ? "bg-white/5" : "bg-slate-200"}`} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <StatCard label="Total Sessions" value={totalSessions}  accent="slate"   emoji="📅" d={d} />
            <StatCard label="Pending"        value={pendingCount}   accent="amber"   emoji="⏳" d={d} />
            <StatCard label="Accepted"       value={acceptedCount}  accent="emerald" emoji="✅" d={d} />
            <StatCard label="Completed"      value={completedCount} accent="blue"    emoji="🎓" d={d} />
          </div>
        )}

        {/* Sessions List */}
        <Card d={d}>
          <CardHeader title="All Sessions" badge={totalSessions} d={d} />
          
          {loading && totalSessions === 0 ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className={`h-16 rounded-xl animate-pulse ${d ? "bg-white/5" : "bg-slate-100"}`} />)}
            </div>
          ) : totalSessions === 0 ? (
            <div className="py-24 flex flex-col items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 border-dashed ${d ? "border-slate-700 bg-white/[0.02]" : "border-slate-200 bg-slate-50"}`}>
                <CalendarIcon cls={`w-8 h-8 ${d ? "text-slate-600" : "text-slate-300"}`} />
              </div>
              <div className="text-center">
                <p className={`text-sm font-bold ${d ? "text-slate-300" : "text-slate-700"}`}>No Sessions Data</p>
                <p className={`text-xs mt-1 ${d ? "text-slate-500" : "text-slate-400"}`}>There are no individual sessions in the system.</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className={`border-b text-xs font-semibold uppercase tracking-widest whitespace-nowrap ${d ? "border-white/5 text-slate-500 bg-white/[0.01]" : "border-slate-100 text-slate-500 bg-slate-50/40"}`}>
                    <th className="px-6 py-4 text-left">Status</th>
                    <th className="px-6 py-4 text-left">Participants</th>
                    <th className="px-6 py-4 text-left">Skills Exchanged</th>
                    <th className="px-6 py-4 text-left">Schedule</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${d ? "divide-white/[0.04]" : "divide-slate-50"}`}>
                  {sessions.map((session) => (
                    <tr key={session._id} className={`transition-colors duration-150 ${d ? "hover:bg-emerald-500/[0.04]" : "hover:bg-emerald-50/50"}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={session.status} d={d} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <Avatar src={session.hostUser?.profileImage} name={session.hostUser?.name} />
                            <div>
                              <span className={`text-[10px] font-bold uppercase tracking-wider ${d ? "text-emerald-400" : "text-emerald-600"}`}>Host</span>
                              <div className={`text-xs font-semibold ${d ? "text-slate-200" : "text-slate-800"}`}>{session.hostUser?.name || 'Unknown'}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Avatar src={session.participantUser?.profileImage} name={session.participantUser?.name} />
                            <div>
                              <span className={`text-[10px] font-bold uppercase tracking-wider ${d ? "text-teal-400" : "text-teal-600"}`}>Guest</span>
                              <div className={`text-xs font-semibold ${d ? "text-slate-400" : "text-slate-600"}`}>{session.participantUser?.name || 'Unknown'}</div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1.5">
                          <div className={`text-xs ${d ? "text-slate-300" : "text-slate-700"}`}>
                            Teaching: <span className={`font-bold ${d ? "text-emerald-400" : "text-emerald-600"}`}>{session.skillTeach}</span>
                          </div>
                          <div className={`text-xs ${d ? "text-slate-400" : "text-slate-600"}`}>
                            Learning: <span className={`font-bold ${d ? "text-teal-400" : "text-teal-600"}`}>{session.skillLearn}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {session.date ? (
                          <div className="flex flex-col gap-1 text-xs">
                            <div className={`font-semibold flex items-center gap-1.5 ${d ? "text-slate-200" : "text-slate-800"}`}>
                              <CalendarIcon cls="w-3.5 h-3.5" />
                              {new Date(session.date).toLocaleDateString()}
                            </div>
                            <div className={`flex items-center gap-1.5 ${d ? "text-slate-500" : "text-slate-500"}`}>
                              <ClockIcon cls="w-3.5 h-3.5" />
                              {session.startTime} - {session.endTime}
                            </div>
                          </div>
                        ) : (
                          <span className={`text-xs italic ${d ? "text-slate-500" : "text-slate-400"}`}>Not scheduled</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";
import { ThemeContext } from "../contexts/ThemeContext";

/* ────────────────────────────────────────────────────────── helpers */
const fmt = (n) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M`
  : n >= 1_000   ? `${(n / 1_000).toFixed(1)}K`
  :                String(n ?? 0);

const secs = (s) => {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
  return `${h}h ${m}m`;
};

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

/* ────────────────────────────────────────────────────────── sub-components */

/** Circular health score ring */
function HealthRing({ score, d: dark }) {
  const r = 42, circ = 2 * Math.PI * r;
  const color = score >= 70 ? "#6366f1" : score >= 40 ? "#f59e0b" : "#ef4444";
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative">
        <svg width={100} height={100} className="-rotate-90">
          <circle cx={50} cy={50} r={r} fill="none" stroke={dark ? "rgba(99,102,241,0.1)" : "rgba(99,102,241,0.08)"} strokeWidth={8} />
          <circle cx={50} cy={50} r={r} fill="none" stroke={color} strokeWidth={8}
            strokeDasharray={`${(score / 100) * circ} ${circ}`} strokeLinecap="round"
            style={{ transition: "stroke-dasharray 1.2s ease" }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black" style={{ color }}>{score}</span>
        </div>
      </div>
      <span className={`font-bold uppercase tracking-widest ${dark ? "text-slate-500" : "text-slate-400"}`}>
        Health
      </span>
    </div>
  );
}

/** Single metric stat card */
function StatCard({ label, value, sub, icon, gradient, border, glow, onClick, dark }) {
  return (
    <div onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl p-5 border cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl ${
        dark ? `bg-[#0d1525]/80 ${border}` : `bg-white ${border} shadow-sm`
      }`}
      style={{ '--glow': glow }}>
      {/* hover shimmer */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/3 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      {/* glow pulse on hover */}
      <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
        style={{ boxShadow: `0 0 40px 0 ${glow}15` }} />

      <div className="relative flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center bg-gradient-to-br ${gradient} shadow-lg`}>
          <span className="text-lg">{icon}</span>
        </div>
        <div className={`w-2 h-2 rounded-full mt-1 ${dark ? "bg-indigo-500/40" : "bg-indigo-200"}`} />
      </div>
      <p className={`font-bold uppercase tracking-wider mb-1 ${dark ? "text-slate-500" : "text-slate-400"}`}>{label}</p>
      <p className={`text-3xl font-black mb-1 bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>{fmt(value)}</p>
      {sub && <p className={`${dark ? "text-slate-600" : "text-slate-400"}`}>{sub}</p>}
    </div>
  );
}

/** Horizontal progress bar row */
function BarRow({ label, count, max, color, dark }) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className={dark ? "text-slate-400" : "text-slate-500"}>{label}</span>
        <span className={`font-bold ${dark ? "text-white" : "text-slate-800"}`}>{fmt(count)}</span>
      </div>
      <div className={`h-1.5 rounded-full overflow-hidden ${dark ? "bg-slate-800" : "bg-slate-100"}`}>
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/** Summary table row */
function SummaryRow({ label, val, color, dark }) {
  return (
    <div className={`flex justify-between items-center py-2.5 border-b last:border-0 ${dark ? "border-indigo-500/8" : "border-indigo-50"}`}>
      <span className={dark ? "text-slate-400" : "text-slate-500"}>{label}</span>
      <span className={`font-bold ${color}`}>{val}</span>
    </div>
  );
}

/* ────────────────────────────────────────────────────────── page */
export default function AdminDashboard() {
  const { theme } = useContext(ThemeContext);
  const dark = theme === "dark";
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [now] = useState(new Date());

  useEffect(() => {
    API.get("/admin/mega-stats")
      .then((r) => setData(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  /* ── style helpers ── */
  const card = `rounded-2xl border ${dark ? "bg-[#0d1525]/80 border-indigo-500/15" : "bg-white border-indigo-100 shadow-sm"}`;

  if (loading) return (
    <div className={`min-h-screen flex items-center justify-center ${dark ? "bg-[#080c17]" : "bg-gradient-to-br from-slate-50 to-indigo-50/30"}`}>
      <div className="flex flex-col items-center gap-5">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <div className="absolute inset-0 w-16 h-16 border-4 border-violet-500/20 border-b-violet-500 rounded-full animate-spin"
            style={{ animationDuration: "1.5s", animationDirection: "reverse" }} />
        </div>
        <div className="text-center">
          <p className={`font-bold mb-1 ${dark ? "text-indigo-400" : "text-indigo-600"}`}>Loading Dashboard</p>
          <p className={dark ? "text-slate-500" : "text-slate-400"}>Fetching platform analytics…</p>
        </div>
      </div>
    </div>
  );

  const dt = data || {};
  const growth = dt.userGrowth || [];
  const maxGrowth = Math.max(...growth.map((g) => g.count), 1);

  /* stat cards config */
  const stats = [
    { label: "Total Users",     value: dt.totalUsers,          icon: "👥", gradient: "from-indigo-500 to-violet-600",   border: "border-indigo-500/20", glow: "#6366f1", sub: `${dt.newUsersToday ?? 0} joined today`,            path: "/admin/users" },
    { label: "Active (30d)",    value: dt.activeUsers30d,       icon: "🟢", gradient: "from-emerald-500 to-teal-500",    border: "border-emerald-500/20",glow: "#10b981", sub: "Logged in last 30 days",                           path: "/admin/users" },
    { label: "Skill Matches",   value: dt.totalMatches,         icon: "⚡", gradient: "from-violet-500 to-purple-600",   border: "border-violet-500/20", glow: "#8b5cf6", sub: "All-time matches",                                  path: "/admin/stats" },
    { label: "Reviews",         value: dt.totalReviews,         icon: "⭐", gradient: "from-amber-500 to-orange-500",    border: "border-amber-500/20",  glow: "#f59e0b", sub: "Platform reviews",                                  path: "/admin/reviews" },
    { label: "Challenges",      value: dt.totalChallenges,      icon: "🏆", gradient: "from-pink-500 to-rose-500",       border: "border-pink-500/20",   glow: "#ec4899", sub: `${dt.totalSubmissions ?? 0} submissions`,          path: "/admin/challenges-analytics" },
    { label: "Community Posts", value: dt.totalPosts,           icon: "📝", gradient: "from-cyan-500 to-sky-500",        border: "border-cyan-500/20",   glow: "#06b6d4", sub: "All posts",                                        path: "/admin/community-analytics" },
    { label: "Resources",       value: dt.totalResources,       icon: "📚", gradient: "from-teal-500 to-emerald-500",    border: "border-teal-500/20",   glow: "#14b8a6", sub: `${dt.totalLearningPaths ?? 0} learning paths`,     path: "/admin/resources-analytics" },
    { label: "Sessions",        value: dt.totalSessions,        icon: "🎥", gradient: "from-orange-500 to-amber-500",    border: "border-orange-500/20", glow: "#f97316", sub: `${dt.totalGroupSessions ?? 0} group sessions`,     path: "/admin/sessions" },
    { label: "Messages",        value: dt.totalMessages,        icon: "💬", gradient: "from-violet-500 to-indigo-500",   border: "border-violet-500/20", glow: "#7c3aed", sub: `${dt.totalConversations ?? 0} conversations`,      path: "/admin/platform-analytics" },
    { label: "Contracts",       value: dt.totalContracts,       icon: "📄", gradient: "from-indigo-500 to-blue-600",     border: "border-indigo-500/20", glow: "#6366f1", sub: "Smart contracts",                                  path: "/admin/contracts" },
    { label: "Meetings",        value: dt.totalMeetings,        icon: "📹", gradient: "from-rose-500 to-pink-500",       border: "border-rose-500/20",   glow: "#f43f5e", sub: "Video meetings",                                   path: "/admin/meetings" },
    { label: "Pending Reports", value: dt.pendingReports,       icon: "🚨", gradient: dt.pendingReports > 0 ? "from-red-500 to-rose-600" : "from-slate-500 to-slate-600", border: dt.pendingReports > 0 ? "border-red-500/30" : "border-slate-500/20", glow: "#ef4444", sub: `${dt.totalReports ?? 0} total reports`, path: "/admin/reports" },
    { label: "Total XP",        value: dt.totalXP,              icon: "✨", gradient: "from-yellow-500 to-amber-500",    border: "border-yellow-500/20", glow: "#eab308", sub: "Earned by all users",                              path: "/admin/gamification-analytics" },
    { label: "Notifications",   value: dt.totalNotifications,   icon: "🔔", gradient: "from-sky-500 to-blue-500",        border: "border-sky-500/20",    glow: "#0ea5e9", sub: "All-time",                                         path: "/admin/platform-analytics" },
    { label: "Server Uptime",   value: secs(dt.serverUptime || 0), icon: "🖥️", gradient: "from-slate-500 to-gray-600", border: "border-slate-500/20",  glow: "#64748b", sub: "Since last restart",                               path: "/admin/data-analysis" },
  ];

  const quickLinks = [
    { label: "Users",       icon: "👥", path: "/admin/users",                  gradient: "from-indigo-500 to-violet-600" },
    { label: "Skills",      icon: "💡", path: "/admin/skills",                 gradient: "from-violet-500 to-purple-600" },
    { label: "Reviews",     icon: "⭐", path: "/admin/reviews",                gradient: "from-amber-500 to-orange-500" },
    { label: "Community",   icon: "📝", path: "/admin/community-analytics",    gradient: "from-cyan-500 to-sky-500" },
    { label: "Challenges",  icon: "🏆", path: "/admin/challenges-analytics",   gradient: "from-pink-500 to-rose-500" },
    { label: "Gamification",icon: "✨", path: "/admin/gamification-analytics", gradient: "from-yellow-500 to-amber-500" },
    { label: "Resources",   icon: "📚", path: "/admin/resources-analytics",    gradient: "from-teal-500 to-emerald-500" },
    { label: "Platform",    icon: "🌐", path: "/admin/platform-analytics",     gradient: "from-sky-500 to-blue-600" },
    { label: "Sessions",    icon: "🎥", path: "/admin/sessions",               gradient: "from-orange-500 to-amber-500" },
    { label: "Meetings",    icon: "📹", path: "/admin/meetings",               gradient: "from-rose-500 to-pink-500" },
    { label: "Contracts",   icon: "📄", path: "/admin/contracts",              gradient: "from-indigo-500 to-blue-600" },
    { label: "Reports",     icon: "🚨", path: "/admin/reports",                gradient: "from-red-500 to-rose-600" },
  ];

  const engagementItems = [
    { label: "Challenges Created", val: dt.totalChallenges,    color: dark ? "text-pink-400"   : "text-pink-600" },
    { label: "Code Submissions",   val: dt.totalSubmissions,   color: dark ? "text-pink-300"   : "text-pink-500" },
    { label: "Community Posts",    val: dt.totalPosts,         color: dark ? "text-cyan-400"   : "text-cyan-600" },
    { label: "Learning Resources", val: dt.totalResources,     color: dark ? "text-teal-400"   : "text-teal-600" },
    { label: "Learning Paths",     val: dt.totalLearningPaths, color: dark ? "text-teal-300"   : "text-teal-500" },
    { label: "Group Sessions",     val: dt.totalGroupSessions, color: dark ? "text-orange-400" : "text-orange-600" },
  ];

  const commItems = [
    { label: "Messages Sent",   val: dt.totalMessages,      color: dark ? "text-violet-400" : "text-violet-600" },
    { label: "Conversations",   val: dt.totalConversations, color: dark ? "text-violet-300" : "text-violet-500" },
    { label: "Video Meetings",  val: dt.totalMeetings,      color: dark ? "text-rose-400"   : "text-rose-600" },
    { label: "1-on-1 Sessions", val: dt.totalSessions,      color: dark ? "text-orange-400" : "text-orange-600" },
    { label: "Smart Contracts", val: dt.totalContracts,     color: dark ? "text-indigo-400" : "text-indigo-600" },
    { label: "Skill Matches",   val: dt.totalMatches,       color: dark ? "text-purple-400" : "text-purple-600" },
  ];

  const safetyItems = [
    { label: "Total XP Earned",  val: fmt(dt.totalXP),            color: dark ? "text-yellow-400" : "text-yellow-600" },
    { label: "Total Reviews",    val: dt.totalReviews,            color: dark ? "text-amber-400"  : "text-amber-600" },
    { label: "Notifications",    val: dt.totalNotifications,      color: dark ? "text-sky-400"    : "text-sky-600" },
    { label: "Total Reports",    val: dt.totalReports,            color: dark ? "text-red-400"    : "text-red-600" },
    { label: "Pending Reports",  val: dt.pendingReports,          color: dt.pendingReports > 0 ? (dark ? "text-red-500 font-black" : "text-red-600 font-black") : (dark ? "text-emerald-400" : "text-emerald-600") },
    { label: "Platform Health",  val: `${dt.healthScore ?? 85}%`, color: (dt.healthScore ?? 85) >= 70 ? (dark ? "text-emerald-400" : "text-emerald-600") : (dark ? "text-amber-400" : "text-amber-600") },
  ];

  const barData = [
    { label: "Users",    count: dt.totalUsers ?? 0,    color: "bg-gradient-to-r from-indigo-500 to-violet-500" },
    { label: "Matches",  count: dt.totalMatches ?? 0,  color: "bg-gradient-to-r from-violet-500 to-purple-500" },
    { label: "Reviews",  count: dt.totalReviews ?? 0,  color: "bg-gradient-to-r from-amber-500 to-orange-500" },
    { label: "Posts",    count: dt.totalPosts ?? 0,    color: "bg-gradient-to-r from-cyan-500 to-sky-500" },
    { label: "Sessions", count: dt.totalSessions ?? 0, color: "bg-gradient-to-r from-orange-500 to-amber-500" },
  ];
  const barMax = Math.max(...barData.map((b) => b.count), 1);

  return (
    <div className={`min-h-screen relative ${dark ? "bg-[#080c17]" : "bg-gradient-to-br from-slate-50 via-indigo-50/20 to-slate-50"}`}>
      {/* ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full blur-3xl animate-pulse ${dark ? "bg-indigo-500/6" : "bg-indigo-100/40"}`} />
        <div className={`absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full blur-3xl animate-pulse delay-1000 ${dark ? "bg-violet-500/5" : "bg-violet-100/35"}`} />
      </div>

      <div className="relative z-10 p-6 max-w-[1600px] mx-auto space-y-6">

        {/* ── Hero Header ── */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-3 ${
              dark ? "bg-indigo-500/10 border-indigo-500/25" : "bg-indigo-50 border-indigo-200"
            }`}>
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <span className={`font-bold uppercase tracking-widest ${dark ? "text-indigo-400" : "text-indigo-600"}`}>Live Dashboard</span>
            </div>
            <h1 className={`text-4xl font-black mb-1 ${dark ? "text-white" : "text-slate-900"}`}>
              <span className="bg-gradient-to-r from-indigo-500 to-violet-600 bg-clip-text text-transparent">SkillBarter</span>&nbsp;Control Centre
            </h1>
            <p className={dark ? "text-slate-400" : "text-slate-500"}>
              Full platform analytics • Real-time data • {dt.totalUsers ?? 0} total users
            </p>
          </div>

          <div className="flex items-center gap-6">
            <HealthRing score={dt.healthScore ?? 85} d={dark} />
            <div>
              <p className={`font-bold mb-0.5 ${dark ? "text-slate-300" : "text-slate-700"}`}>Last updated</p>
              <p className={`font-black text-lg bg-gradient-to-r from-indigo-500 to-violet-600 bg-clip-text text-transparent`}>
                {now.toLocaleTimeString()}
              </p>
              <p className={dark ? "text-slate-500" : "text-slate-400"}>Uptime: {secs(dt.serverUptime || 0)}</p>
            </div>
          </div>
        </div>

        {/* ── Quick Links ── */}
        <div className={`${card} p-5 relative overflow-hidden`}>
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent pointer-events-none" />
          <h3 className={`font-bold mb-4 flex items-center gap-2 ${dark ? "text-white" : "text-slate-800"}`}>
            <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            Quick Navigation
          </h3>
          <div className="flex flex-wrap gap-2">
            {quickLinks.map(({ label, icon, path, gradient }) => (
              <button key={path} onClick={() => navigate(path)}
                className={`group relative flex items-center gap-2 px-4 py-2.5 rounded-2xl font-semibold text-white bg-gradient-to-r ${gradient} shadow-md hover:scale-105 hover:shadow-lg active:scale-95 transition-all duration-200 overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span className="relative text-base">{icon}</span>
                <span className="relative">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── 15-card Metric Grid ── */}
        <div>
          <h2 className={`font-bold mb-4 flex items-center gap-2 ${dark ? "text-white" : "text-slate-800"}`}>
            <span className="w-1 h-5 rounded-full bg-gradient-to-b from-indigo-500 to-violet-600" />
            Platform Metrics
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {stats.map(({ label, value, icon, sub, gradient, border, glow, path }) => (
              <StatCard key={label} label={label} value={value} icon={icon} sub={sub}
                gradient={gradient} border={border} glow={glow} dark={dark}
                onClick={() => navigate(path)} />
            ))}
          </div>
        </div>

        {/* ── Platform Overview bar chart + user growth ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Platform bar chart */}
          <div className={`${card} p-6 relative overflow-hidden`}>
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent pointer-events-none" />
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/25">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
              </div>
              <div>
                <h3 className={`font-bold ${dark ? "text-white" : "text-slate-800"}`}>Platform Overview</h3>
                <p className={dark ? "text-slate-500" : "text-slate-400"}>Key metrics at a glance</p>
              </div>
            </div>
            <div className="space-y-3">
              {barData.map(({ label, count, color }) => (
                <BarRow key={label} label={label} count={count} max={barMax} color={color} dark={dark} />
              ))}
            </div>
          </div>

          {/* User growth */}
          <div className={`${card} p-6 relative overflow-hidden`}>
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-violet-500/40 to-transparent pointer-events-none" />
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md shadow-violet-500/25">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                </svg>
              </div>
              <div>
                <h3 className={`font-bold ${dark ? "text-white" : "text-slate-800"}`}>User Growth — Last 6 Months</h3>
                <p className={dark ? "text-slate-500" : "text-slate-400"}>New registrations per month</p>
              </div>
            </div>
            {growth.length > 0 ? (
              <div className="space-y-3">
                {growth.map((m, i) => {
                  const pct = (m.count / maxGrowth) * 100;
                  const label = `${MONTHS[(m._id.month || 1) - 1]} ${m._id.year}`;
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span className={`w-14 text-right flex-shrink-0 ${dark ? "text-slate-400" : "text-slate-500"}`}>{label}</span>
                      <div className={`flex-1 h-6 rounded-xl overflow-hidden ${dark ? "bg-slate-800/60" : "bg-indigo-50"}`}>
                        <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-xl transition-all duration-700 flex items-center justify-end pr-2"
                          style={{ width: `${pct}%` }}>
                          {pct > 20 && <span className="text-white font-bold">{m.count}</span>}
                        </div>
                      </div>
                      {pct <= 20 && <span className={`w-6 text-right flex-shrink-0 font-bold ${dark ? "text-white" : "text-slate-700"}`}>{m.count}</span>}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={`text-center py-8 ${dark ? "text-slate-600" : "text-slate-400"}`}>
                No growth data available yet
              </div>
            )}
          </div>
        </div>

        {/* ── 3-col Summary Cards ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {[
            { title: "Engagement Summary",    icon: "🎯", items: engagementItems, accentFrom: "from-indigo-500", accentTo: "to-violet-500" },
            { title: "Communication Summary", icon: "💬", items: commItems,       accentFrom: "from-violet-500", accentTo: "to-purple-500" },
            { title: "Safety & Moderation",   icon: "🛡️", items: safetyItems,    accentFrom: "from-rose-500",   accentTo: "to-pink-500" },
          ].map(({ title, icon, items, accentFrom, accentTo }) => (
            <div key={title} className={`${card} p-5 relative overflow-hidden`}>
              <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent pointer-events-none`} />
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${accentFrom} ${accentTo} flex items-center justify-center shadow-md`}>
                  <span className="text-sm">{icon}</span>
                </div>
                <h4 className={`font-bold ${dark ? "text-white" : "text-slate-800"}`}>{title}</h4>
              </div>
              <div className="space-y-0">
                {items.map(({ label, val, color }) => (
                  <SummaryRow key={label} label={label} val={fmt(val)} color={color} dark={dark} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ── Footer bar ── */}
        <div className={`rounded-2xl border px-5 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 ${
          dark ? "bg-[#0d1525]/60 border-indigo-500/10" : "bg-white border-indigo-100 shadow-sm"
        }`}>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className={`font-semibold ${dark ? "text-slate-300" : "text-slate-700"}`}>
              SkillBarter Admin Panel
            </span>
          </div>
          <span className={dark ? "text-slate-500" : "text-slate-400"}>
            Auto-refreshed at {now.toLocaleTimeString()} • Uptime: {secs(dt.serverUptime || 0)}
          </span>
          <button onClick={() => window.location.reload()}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl border font-semibold transition-all hover:scale-105 ${
              dark ? "border-indigo-500/25 text-indigo-400 hover:bg-indigo-500/10" : "border-indigo-200 text-indigo-600 hover:bg-indigo-50"
            }`}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            Refresh
          </button>
        </div>

      </div>
    </div>
  );
}
// components/admin/ChallengesAnalytics.jsx
import { useState, useEffect } from "react";
import API from "../../utils/api";
import { useTheme } from "../../hooks/useTheme";

// ── Helpers ─────────────────────────────────────────────────────
const fmt = (n) =>
  typeof n === "number" ? (n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n)) : String(n ?? 0);

// ── Icons ────────────────────────────────────────────────────────
const TrophyIcon = ({ cls }) => (
  <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
  </svg>
);
const ZapIcon = ({ cls }) => (
  <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);
const UsersIcon = ({ cls }) => (
  <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const StarIcon = ({ cls }) => (
  <svg className={cls} fill="currentColor" viewBox="0 0 24 24">
    <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);
const ChartIcon = ({ cls }) => (
  <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);
const RefreshIcon = ({ cls, spin }) => (
  <svg className={`${cls} ${spin ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);
const BotIcon = ({ cls }) => (
  <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

// ── Stat Card ────────────────────────────────────────────────────
const ACCENTS = {
  violet:  { icon: "from-violet-500 to-purple-600",  val: ["text-violet-300",  "text-violet-600"],  ring: "ring-violet-500/20"  },
  emerald: { icon: "from-emerald-500 to-teal-500",   val: ["text-emerald-300", "text-emerald-600"], ring: "ring-emerald-500/20" },
  indigo:  { icon: "from-indigo-500 to-blue-600",    val: ["text-indigo-300",  "text-indigo-600"],  ring: "ring-indigo-500/20"  },
  amber:   { icon: "from-amber-500 to-orange-500",   val: ["text-amber-300",   "text-amber-600"],   ring: "ring-amber-500/20"   },
};

function StatCard({ icon: Icon, label, value, accent, d }) {
  const a = ACCENTS[accent] || ACCENTS.indigo;
  return (
    <div className={`relative overflow-hidden rounded-2xl border p-5 ring-1 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group ${
      d
        ? `bg-[#0d1120]/80 border-white/5 ${a.ring} shadow-black/30`
        : `bg-white border-slate-200/70 ${a.ring} shadow-slate-200/50`
    }`}>
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br ${
        d ? "from-white/[0.02] to-transparent" : "from-indigo-50/60 to-transparent"
      }`} />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className={`text-xs font-semibold uppercase tracking-widest mb-2 ${d ? "text-slate-400" : "text-slate-500"}`}>{label}</p>
          <p className={`text-4xl font-black leading-none ${d ? a.val[0] : a.val[1]}`}>{fmt(value)}</p>
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${a.icon} shadow-lg`}>
          <Icon cls="w-5 h-5 text-white" />
        </div>
      </div>
      <div className={`absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r ${a.icon} opacity-50`} />
    </div>
  );
}

// ── Horizontal Bar ───────────────────────────────────────────────
function HBar({ data, valueKey = "count", labelKey = "_id", gradient, d }) {
  if (!data?.length)
    return <p className={`text-sm text-center py-6 ${d ? "text-slate-600" : "text-slate-400"}`}>No data available</p>;
  const max = Math.max(...data.map((x) => x[valueKey] || 0), 1);
  return (
    <div className="space-y-3">
      {data.map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className={`w-24 text-xs font-medium text-right shrink-0 truncate capitalize ${d ? "text-slate-400" : "text-slate-500"}`}>
            {item[labelKey] || "—"}
          </div>
          <div className={`flex-1 h-3 rounded-full overflow-hidden ${d ? "bg-slate-800" : "bg-slate-100"}`}>
            <div
              className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all duration-700`}
              style={{ width: `${((item[valueKey] || 0) / max) * 100}%` }}
            />
          </div>
          <div className={`w-7 text-xs font-bold text-right ${d ? "text-slate-200" : "text-slate-700"}`}>
            {item[valueKey]}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Difficulty Badge ─────────────────────────────────────────────
function DiffBadge({ diff, d }) {
  const map = {
    Easy:   { dark: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", light: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    Medium: { dark: "bg-amber-500/15 text-amber-400 border-amber-500/30",       light: "bg-amber-50 text-amber-700 border-amber-200" },
    Hard:   { dark: "bg-red-500/15 text-red-400 border-red-500/30",             light: "bg-red-50 text-red-700 border-red-200" },
  };
  const c = map[diff] || { dark: "bg-slate-700 text-slate-300 border-slate-600", light: "bg-slate-100 text-slate-600 border-slate-200" };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${d ? c.dark : c.light}`}>
      {diff || "—"}
    </span>
  );
}

// ── Status Badge ─────────────────────────────────────────────────
function StatusBadge({ status, d }) {
  const map = {
    pending:      { dark: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30", light: "bg-yellow-50 text-yellow-700 border-yellow-200" },
    accepted:     { dark: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", light: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    rejected:     { dark: "bg-red-500/15 text-red-400 border-red-500/30", light: "bg-red-50 text-red-700 border-red-200" },
    ai_evaluated: { dark: "bg-blue-500/15 text-blue-400 border-blue-500/30", light: "bg-blue-50 text-blue-700 border-blue-200" },
  };
  const c = map[status] || { dark: "bg-slate-700 text-slate-300 border-slate-600", light: "bg-slate-100 text-slate-500 border-slate-200" };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border capitalize ${d ? c.dark : c.light}`}>
      {status?.replace("_", " ") || "—"}
    </span>
  );
}

// ── Score Ring ───────────────────────────────────────────────────
function ScoreRing({ score, label, color, d }) {
  const pct = Math.min(Math.max(score || 0, 0), 100);
  const r = 28, circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative w-20 h-20">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r={r} fill="none" stroke={d ? "#1e2a3a" : "#e2e8f0"} strokeWidth="6" />
          <circle
            cx="36" cy="36" r={r} fill="none"
            stroke={color} strokeWidth="6"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <span className={`absolute inset-0 flex items-center justify-center text-sm font-black ${d ? "text-white" : "text-slate-800"}`}>
          {pct.toFixed(0)}%
        </span>
      </div>
      <p className={`text-xs font-semibold text-center ${d ? "text-slate-400" : "text-slate-500"}`}>{label}</p>
    </div>
  );
}

// ── Avatar ───────────────────────────────────────────────────────
function Avatar({ src, name }) {
  const colors = ["from-indigo-500 to-violet-600", "from-emerald-500 to-teal-500", "from-violet-500 to-purple-600", "from-pink-500 to-rose-500", "from-amber-500 to-orange-500"];
  const idx = name ? name.charCodeAt(0) % colors.length : 0;
  if (src) return <img src={src} alt={name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />;
  return (
    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${colors[idx]} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
      {name?.slice(0, 2).toUpperCase() || "??"}
    </div>
  );
}

// ── Card wrapper ─────────────────────────────────────────────────
function Card({ children, className = "", d }) {
  return (
    <div className={`rounded-2xl border overflow-hidden shadow-lg transition-colors duration-300 ${
      d ? "bg-[#0d1120]/90 border-white/5 shadow-black/40" : "bg-white border-slate-200/80 shadow-slate-200/50"
    } ${className}`}>
      {children}
    </div>
  );
}
function CardHeader({ title, badge, d }) {
  return (
    <div className={`px-5 py-4 border-b flex items-center justify-between ${
      d ? "border-white/5 bg-white/[0.02]" : "border-slate-100 bg-slate-50/60"
    }`}>
      <span className={`text-sm font-bold ${d ? "text-white" : "text-slate-800"}`}>{title}</span>
      {badge != null && (
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
          d ? "bg-violet-500/15 text-violet-400" : "bg-violet-50 text-violet-600"
        }`}>{badge}</span>
      )}
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────
export default function ChallengesAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("overview");
  const { isDarkMode: d } = useTheme();

  const load = () => {
    setLoading(true);
    API.get("/admin/challenges-stats")
      .then((r) => setData(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const dt = data || {};

  // ── Skeleton ──
  if (loading && !data)
    return (
      <div className={`min-h-screen flex flex-col gap-6 p-6 ${d ? "bg-[#060912]" : "bg-slate-50"}`}>
        <div className={`h-10 w-64 rounded-xl animate-pulse ${d ? "bg-white/5" : "bg-slate-200"}`} />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`h-28 rounded-2xl animate-pulse ${d ? "bg-white/5" : "bg-slate-200"}`} />
          ))}
        </div>
        <div className={`h-48 rounded-2xl animate-pulse ${d ? "bg-white/5" : "bg-slate-200"}`} />
      </div>
    );

  return (
    <div className={`min-h-screen transition-colors duration-300 ${d ? "bg-[#060912]" : "bg-slate-50"}`}>
      {/* top accent line */}
      <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-violet-500/60 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <TrophyIcon cls="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-2xl font-black tracking-tight ${d ? "text-white" : "text-slate-900"}`}>
                Challenges Analytics
              </h1>
              <p className={`text-sm font-medium mt-0.5 ${d ? "text-slate-400" : "text-slate-500"}`}>
                Platform challenges, AI evaluations &amp; participation metrics
              </p>
            </div>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-60 shadow-md ${
              d
                ? "bg-violet-500/15 hover:bg-violet-500/25 text-violet-300 border border-violet-500/25 hover:border-violet-400/40"
                : "bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 hover:border-violet-300"
            }`}
          >
            <RefreshIcon cls="w-4 h-4" spin={loading} />
            {loading ? "Loading…" : "Refresh"}
          </button>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={TrophyIcon} label="Total Challenges"  value={dt.totalChallenges}  accent="violet"  d={d} />
          <StatCard icon={ZapIcon}    label="Active"            value={dt.activeChallenges} accent="emerald" d={d} />
          <StatCard icon={UsersIcon}  label="Total Submissions" value={dt.totalSubmissions} accent="indigo"  d={d} />
          <StatCard icon={StarIcon}   label="XP Awarded"        value={dt.totalXPAwarded}   accent="amber"   d={d} />
        </div>

        {/* ── AI Score Highlight ── */}
        {dt.scoreStats?.avgScore > 0 && (
          <Card d={d}>
            <div className={`px-5 py-4 border-b flex items-center gap-2 ${d ? "border-white/5 bg-white/[0.02]" : "border-slate-100 bg-slate-50/60"}`}>
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <BotIcon cls="w-4 h-4 text-white" />
              </div>
              <span className={`text-sm font-bold ${d ? "text-white" : "text-slate-800"}`}>AI Evaluation Scores</span>
              <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-bold ${d ? "bg-blue-500/15 text-blue-400" : "bg-blue-50 text-blue-600"}`}>
                Auto-Scored
              </span>
            </div>
            <div className="px-5 py-6 flex flex-wrap items-center gap-8 sm:gap-16">
              <ScoreRing score={dt.scoreStats.avgScore}  label="Avg Score"     color="#818cf8" d={d} />
              <ScoreRing score={dt.scoreStats.maxScore}  label="Highest Score" color="#34d399" d={d} />
              <ScoreRing score={dt.scoreStats.minScore}  label="Lowest Score"  color="#f87171" d={d} />
              <div className="flex-1 min-w-[180px]">
                <p className={`text-sm font-semibold mb-1 ${d ? "text-blue-300" : "text-blue-600"}`}>🤖 AI Evaluation Active</p>
                <p className={`text-xs leading-relaxed ${d ? "text-slate-400" : "text-slate-500"}`}>
                  All submissions are automatically scored by AI with detailed feedback and XP rewards.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* ── Tab Bar ── */}
        <div className={`flex items-center gap-1 p-1 rounded-2xl border ${
          d ? "bg-[#0d1120]/80 border-white/5" : "bg-white border-slate-200/80"
        } shadow-sm`}>
          {[
            { id: "overview",    icon: "📊", label: "Overview" },
            { id: "challenges",  icon: "🏆", label: "Challenges" },
            { id: "submissions", icon: "📬", label: "Submissions" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setView(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                view === t.id
                  ? d
                    ? "bg-violet-500 text-white shadow-sm shadow-violet-500/30"
                    : "bg-violet-600 text-white shadow-sm shadow-violet-200"
                  : d
                    ? "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* ── Overview Tab ── */}
        {view === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* By Difficulty */}
            <Card d={d}>
              <CardHeader title="By Difficulty" badge={dt.byDifficulty?.length} d={d} />
              <div className="p-5 space-y-3">
                {(dt.byDifficulty || []).map((item) => {
                  const totalC = (dt.byDifficulty || []).reduce((s, x) => s + (x.count || 0), 0) || 1;
                  const pct = Math.round(((item.count || 0) / totalC) * 100);
                  const gradMap = { Easy: "from-emerald-500 to-teal-400", Medium: "from-amber-500 to-orange-400", Hard: "from-red-500 to-rose-400" };
                  const grad = gradMap[item._id] || "from-slate-500 to-slate-400";
                  return (
                    <div key={item._id} className={`p-3 rounded-xl border ${d ? "border-white/5 bg-white/[0.02]" : "border-slate-100 bg-slate-50"}`}>
                      <div className="flex items-center justify-between mb-2">
                        <DiffBadge diff={item._id} d={d} />
                        <span className={`text-base font-black ${d ? "text-white" : "text-slate-800"}`}>{item.count}</span>
                      </div>
                      <div className={`h-2 rounded-full overflow-hidden ${d ? "bg-slate-800" : "bg-slate-200"}`}>
                        <div className={`h-full rounded-full bg-gradient-to-r ${grad} transition-all duration-700`} style={{ width: `${pct}%` }} />
                      </div>
                      <p className={`text-xs mt-1 text-right ${d ? "text-slate-500" : "text-slate-400"}`}>{pct}%</p>
                    </div>
                  );
                })}
                {!dt.byDifficulty?.length && (
                  <p className={`text-sm text-center py-6 ${d ? "text-slate-600" : "text-slate-400"}`}>No data yet</p>
                )}
              </div>
            </Card>

            {/* By Category */}
            <Card d={d}>
              <CardHeader title="By Category" badge={dt.byCategory?.length} d={d} />
              <div className="p-5">
                <HBar
                  data={(dt.byCategory || []).slice(0, 7)}
                  gradient={d ? "from-violet-500 to-indigo-500" : "from-violet-400 to-indigo-500"}
                  d={d}
                />
              </div>
            </Card>

            {/* Submissions by Status */}
            <Card d={d}>
              <CardHeader title="Submission Status" badge={dt.submissionsByStatus?.length} d={d} />
              <div className="p-5 space-y-3">
                {(dt.submissionsByStatus || []).map((s) => {
                  const totalS = (dt.submissionsByStatus || []).reduce((acc, x) => acc + (x.count || 0), 0) || 1;
                  const pct = Math.round(((s.count || 0) / totalS) * 100);
                  const gradMap = { pending: "from-yellow-500 to-amber-400", accepted: "from-emerald-500 to-teal-400", rejected: "from-red-500 to-rose-400", ai_evaluated: "from-blue-500 to-indigo-400" };
                  const grad = gradMap[s._id] || "from-slate-500 to-slate-400";
                  return (
                    <div key={s._id} className={`p-3 rounded-xl border ${d ? "border-white/5 bg-white/[0.02]" : "border-slate-100 bg-slate-50"}`}>
                      <div className="flex items-center justify-between mb-2">
                        <StatusBadge status={s._id} d={d} />
                        <span className={`text-base font-black ${d ? "text-white" : "text-slate-800"}`}>{s.count}</span>
                      </div>
                      <div className={`h-2 rounded-full overflow-hidden ${d ? "bg-slate-800" : "bg-slate-200"}`}>
                        <div className={`h-full rounded-full bg-gradient-to-r ${grad} transition-all duration-700`} style={{ width: `${pct}%` }} />
                      </div>
                      <p className={`text-xs mt-1 text-right ${d ? "text-slate-500" : "text-slate-400"}`}>{pct}%</p>
                    </div>
                  );
                })}
                {!dt.submissionsByStatus?.length && (
                  <p className={`text-sm text-center py-6 ${d ? "text-slate-600" : "text-slate-400"}`}>No data yet</p>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* ── Challenges Tab ── */}
        {view === "challenges" && (
          <Card d={d}>
            <CardHeader title="Top Challenges by Participation" badge={`${dt.topChallenges?.length || 0} records`} d={d} />
            {!dt.topChallenges?.length ? (
              <div className="py-20 flex flex-col items-center gap-3">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 border-dashed ${d ? "border-slate-700 bg-white/[0.02]" : "border-slate-200 bg-slate-50"}`}>
                  <TrophyIcon cls={`w-8 h-8 ${d ? "text-slate-600" : "text-slate-300"}`} />
                </div>
                <p className={`text-sm font-semibold ${d ? "text-slate-400" : "text-slate-500"}`}>No challenges yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className={`border-b ${d ? "border-white/5" : "border-slate-100"}`}>
                      {["Title", "Difficulty", "Category", "Participants", "XP Reward", "Status", "Date"].map((col) => (
                        <th key={col} className={`px-5 py-3 text-left text-xs font-semibold uppercase tracking-widest whitespace-nowrap ${d ? "text-slate-500" : "text-slate-400"}`}>
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${d ? "divide-white/[0.04]" : "divide-slate-50"}`}>
                    {(dt.topChallenges || []).map((c) => (
                      <tr key={c._id} className={`transition-colors duration-150 ${d ? "hover:bg-violet-500/[0.04]" : "hover:bg-violet-50/50"}`}>
                        <td className="px-5 py-4">
                          <p className={`text-sm font-semibold line-clamp-1 ${d ? "text-slate-100" : "text-slate-800"}`}>{c.title}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            {c.isDaily && (
                              <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${d ? "bg-orange-500/15 text-orange-400 border border-orange-500/30" : "bg-orange-50 text-orange-600 border border-orange-200"}`}>
                                Daily
                              </span>
                            )}
                            {c.isAIGenerated && (
                              <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${d ? "bg-blue-500/15 text-blue-400 border border-blue-500/30" : "bg-blue-50 text-blue-600 border border-blue-200"}`}>
                                AI
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <DiffBadge diff={c.difficulty} d={d} />
                        </td>
                        <td className={`px-5 py-4 whitespace-nowrap text-xs ${d ? "text-slate-400" : "text-slate-500"}`}>
                          {c.skillCategory || "—"}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${
                            d ? "bg-indigo-500/15 text-indigo-300" : "bg-indigo-50 text-indigo-600"
                          }`}>
                            <UsersIcon cls="w-3 h-3" />
                            {c.participantsCount}
                          </span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-center">
                          <span className={`text-xs font-black ${d ? "text-amber-400" : "text-amber-600"}`}>+{c.rewardXP} XP</span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                            c.isActive
                              ? d ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : d ? "bg-slate-700/50 text-slate-400 border-slate-600/40" : "bg-slate-100 text-slate-500 border-slate-200"
                          }`}>
                            {c.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className={`px-5 py-4 whitespace-nowrap text-xs ${d ? "text-slate-500" : "text-slate-400"}`}>
                          {new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {dt.topChallenges?.length > 0 && (
              <div className={`px-5 py-3 border-t flex items-center justify-between ${d ? "border-white/5 bg-white/[0.015]" : "border-slate-100 bg-slate-50/40"}`}>
                <p className={`text-xs ${d ? "text-slate-500" : "text-slate-400"}`}>
                  Showing <span className={`font-semibold ${d ? "text-slate-300" : "text-slate-600"}`}>{dt.topChallenges.length}</span> challenges
                </p>
              </div>
            )}
          </Card>
        )}

        {/* ── Submissions Tab ── */}
        {view === "submissions" && (
          <Card d={d}>
            <CardHeader title="Recent Submissions" badge={`${dt.recentSubmissions?.length || 0} records`} d={d} />
            {!dt.recentSubmissions?.length ? (
              <div className="py-20 flex flex-col items-center gap-3">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 border-dashed ${d ? "border-slate-700 bg-white/[0.02]" : "border-slate-200 bg-slate-50"}`}>
                  <ChartIcon cls={`w-8 h-8 ${d ? "text-slate-600" : "text-slate-300"}`} />
                </div>
                <p className={`text-sm font-semibold ${d ? "text-slate-400" : "text-slate-500"}`}>No submissions yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className={`border-b ${d ? "border-white/5" : "border-slate-100"}`}>
                      {["User", "Challenge", "Status", "AI Score", "Submitted"].map((col) => (
                        <th key={col} className={`px-5 py-3 text-left text-xs font-semibold uppercase tracking-widest whitespace-nowrap ${d ? "text-slate-500" : "text-slate-400"}`}>
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${d ? "divide-white/[0.04]" : "divide-slate-50"}`}>
                    {(dt.recentSubmissions || []).map((s) => (
                      <tr key={s._id} className={`transition-colors duration-150 ${d ? "hover:bg-violet-500/[0.04]" : "hover:bg-violet-50/50"}`}>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <Avatar src={s.userId?.profileImage} name={s.userId?.name} />
                            <span className={`text-sm font-semibold ${d ? "text-slate-100" : "text-slate-800"}`}>
                              {s.userId?.name || "—"}
                            </span>
                          </div>
                        </td>
                        <td className={`px-5 py-4 text-xs font-medium max-w-[200px] ${d ? "text-slate-300" : "text-slate-600"}`}>
                          <span className="line-clamp-1">{s.challengeId?.title || "Unknown"}</span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <StatusBadge status={s.status} d={d} />
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-center">
                          {s.score > 0 ? (
                            <span className={`text-sm font-black ${
                              s.score >= 70
                                ? d ? "text-emerald-400" : "text-emerald-600"
                                : s.score >= 40
                                ? d ? "text-amber-400" : "text-amber-600"
                                : d ? "text-red-400" : "text-red-600"
                            }`}>
                              {s.score}%
                            </span>
                          ) : (
                            <span className={`text-xs ${d ? "text-slate-600" : "text-slate-400"}`}>—</span>
                          )}
                        </td>
                        <td className={`px-5 py-4 whitespace-nowrap text-xs ${d ? "text-slate-500" : "text-slate-400"}`}>
                          {new Date(s.submittedAt || s.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {dt.recentSubmissions?.length > 0 && (
              <div className={`px-5 py-3 border-t flex items-center justify-between ${d ? "border-white/5 bg-white/[0.015]" : "border-slate-100 bg-slate-50/40"}`}>
                <p className={`text-xs ${d ? "text-slate-500" : "text-slate-400"}`}>
                  Showing <span className={`font-semibold ${d ? "text-slate-300" : "text-slate-600"}`}>{dt.recentSubmissions.length}</span> submissions
                </p>
              </div>
            )}
          </Card>
        )}

      </div>
    </div>
  );
}

// components/admin/CommunityAnalytics.jsx
import { useState, useEffect } from "react";
import API from "../../utils/api";
import { useTheme } from "../../hooks/useTheme";

// ── Format helper ────────────────────────────────────────────────
const fmt = (n) =>
  typeof n === "number" ? (n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n)) : String(n ?? 0);

// ── Icons ────────────────────────────────────────────────────────
const PostsIcon = ({ cls }) => (
  <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);
const HeartIcon = ({ cls }) => (
  <svg className={cls} fill="currentColor" viewBox="0 0 24 24">
    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);
const ChatIcon = ({ cls }) => (
  <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);
const CheckIcon = ({ cls }) => (
  <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const TrendIcon = ({ cls }) => (
  <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);
const RefreshIcon = ({ cls, spin }) => (
  <svg className={`${cls} ${spin ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);
const UsersIcon = ({ cls }) => (
  <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const TagIcon = ({ cls }) => (
  <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
  </svg>
);

// ── Accent config ────────────────────────────────────────────────
const ACCENTS = {
  cyan:    { icon: "from-cyan-500 to-teal-500",    val: ["text-cyan-300",    "text-cyan-600"],    ring: "ring-cyan-500/20"    },
  emerald: { icon: "from-emerald-500 to-teal-500", val: ["text-emerald-300", "text-emerald-600"], ring: "ring-emerald-500/20" },
  pink:    { icon: "from-pink-500 to-rose-500",    val: ["text-pink-300",    "text-pink-600"],    ring: "ring-pink-500/20"    },
  violet:  { icon: "from-violet-500 to-purple-600",val: ["text-violet-300",  "text-violet-600"],  ring: "ring-violet-500/20"  },
};

// ── Post type config ──────────────────────────────────────────────
const TYPE_CFG = {
  question:     { dark: "bg-blue-500/15 text-blue-400 border-blue-500/30",     light: "bg-blue-50 text-blue-700 border-blue-200"     },
  skill_share:  { dark: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", light: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  discussion:   { dark: "bg-purple-500/15 text-purple-400 border-purple-500/30",    light: "bg-purple-50 text-purple-700 border-purple-200"    },
  announcement: { dark: "bg-amber-500/15 text-amber-400 border-amber-500/30",   light: "bg-amber-50 text-amber-700 border-amber-200"   },
};
const TYPE_GRAD = {
  question:     "from-blue-500 to-indigo-500",
  skill_share:  "from-emerald-500 to-teal-400",
  discussion:   "from-purple-500 to-violet-500",
  announcement: "from-amber-500 to-orange-400",
};

// ── Stat Card ────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, accent, d }) {
  const a = ACCENTS[accent] || ACCENTS.cyan;
  return (
    <div className={`relative overflow-hidden rounded-2xl border p-5 ring-1 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group ${
      d
        ? `bg-[#0d1120]/80 border-white/5 ${a.ring} shadow-black/30`
        : `bg-white border-slate-200/70 ${a.ring} shadow-slate-200/50`
    }`}>
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br ${
        d ? "from-white/[0.02] to-transparent" : "from-cyan-50/50 to-transparent"
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

// ── Card Wrapper ─────────────────────────────────────────────────
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
          d ? "bg-cyan-500/15 text-cyan-400" : "bg-cyan-50 text-cyan-600"
        }`}>{badge}</span>
      )}
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
            {(item[labelKey] || "—").replace(/_/g, " ")}
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

// ── Post Type Badge ───────────────────────────────────────────────
function TypeBadge({ type, d }) {
  const c = TYPE_CFG[type] || { dark: "bg-slate-700/50 text-slate-300 border-slate-600/40", light: "bg-slate-100 text-slate-500 border-slate-200" };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border capitalize ${d ? c.dark : c.light}`}>
      {(type || "post").replace(/_/g, " ")}
    </span>
  );
}

// ── Avatar ───────────────────────────────────────────────────────
function Avatar({ src, name }) {
  const colors = ["from-cyan-500 to-teal-500", "from-indigo-500 to-violet-600", "from-emerald-500 to-teal-500", "from-pink-500 to-rose-500", "from-amber-500 to-orange-500"];
  const idx = name ? name.charCodeAt(0) % colors.length : 0;
  if (src) return <img src={src} alt={name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />;
  return (
    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${colors[idx]} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
      {name?.slice(0, 2).toUpperCase() || "??"}
    </div>
  );
}

// ── Activity Chart (vertical bar sparkline) ───────────────────────
function ActivityChart({ data, d }) {
  if (!data?.length)
    return <p className={`text-sm text-center py-10 ${d ? "text-slate-600" : "text-slate-400"}`}>No recent activity</p>;
  const last14 = data.slice(-14);
  const max = Math.max(...last14.map((x) => x.count || 0), 1);
  return (
    <div className="flex items-end gap-1 h-32 pt-2">
      {last14.map((day, i) => {
        const pct = ((day.count || 0) / max) * 100;
        const label = day._id?.split("-").slice(1).join("/") || "—";
        return (
          <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1 group/bar">
            <div
              className={`w-full rounded-t-md bg-gradient-to-t from-cyan-500 to-teal-400 transition-all duration-700 cursor-pointer relative group-hover/bar:from-cyan-400 group-hover/bar:to-teal-300`}
              style={{ height: `${Math.max(pct, 4)}%` }}
            >
              {/* tooltip */}
              <div className={`absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-bold px-1.5 py-0.5 rounded-md opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap ${
                d ? "bg-slate-700 text-white" : "bg-slate-800 text-white"
              }`}>
                {day.count}
              </div>
            </div>
            <span className={`text-[9px] rotate-45 origin-left mt-1 ${d ? "text-slate-600" : "text-slate-400"}`}>{label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────
export default function CommunityAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("overview");
  const { isDarkMode: d } = useTheme();

  const load = () => {
    setLoading(true);
    API.get("/admin/community-stats")
      .then((r) => setData(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const dt = data || {};
  const totalPosts = dt.totalPosts ?? 0;
  const publishedPosts = dt.publishedPosts ?? 0;
  const engagementRate = totalPosts > 0
    ? (((dt.totalLikes ?? 0) + (dt.totalComments ?? 0)) / totalPosts).toFixed(1)
    : "0.0";

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
        <div className={`h-56 rounded-2xl animate-pulse ${d ? "bg-white/5" : "bg-slate-200"}`} />
      </div>
    );

  return (
    <div className={`min-h-screen transition-colors duration-300 ${d ? "bg-[#060912]" : "bg-slate-50"}`}>
      {/* top accent line */}
      <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-cyan-500/60 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <UsersIcon cls="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-2xl font-black tracking-tight ${d ? "text-white" : "text-slate-900"}`}>
                Community Analytics
              </h1>
              <p className={`text-sm font-medium mt-0.5 ${d ? "text-slate-400" : "text-slate-500"}`}>
                Posts, interactions &amp; community health metrics
              </p>
            </div>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-60 shadow-md ${
              d
                ? "bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/25 hover:border-cyan-400/40"
                : "bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-200 hover:border-cyan-300"
            }`}
          >
            <RefreshIcon cls="w-4 h-4" spin={loading} />
            {loading ? "Loading…" : "Refresh"}
          </button>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={PostsIcon} label="Total Posts"       value={dt.totalPosts}     accent="cyan"    d={d} />
          <StatCard icon={CheckIcon} label="Published"         value={dt.publishedPosts} accent="emerald" d={d} />
          <StatCard icon={HeartIcon} label="Total Likes"       value={dt.totalLikes}     accent="pink"    d={d} />
          <StatCard icon={ChatIcon}  label="Total Comments"    value={dt.totalComments}  accent="violet"  d={d} />
        </div>

        {/* ── Engagement Banner ── */}
        <Card d={d}>
          <div className="px-5 py-5 flex flex-wrap gap-6 items-center">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-cyan-500 to-teal-500 shadow-lg shadow-cyan-500/20`}>
                <TrendIcon cls="w-7 h-7 text-white" />
              </div>
              <div>
                <p className={`text-xs font-semibold uppercase tracking-widest ${d ? "text-slate-400" : "text-slate-500"}`}>Avg Engagement</p>
                <p className={`text-3xl font-black leading-tight ${d ? "text-cyan-300" : "text-cyan-600"}`}>{engagementRate}</p>
                <p className={`text-xs mt-0.5 ${d ? "text-slate-500" : "text-slate-400"}`}>interactions per post</p>
              </div>
            </div>
            <div className={`h-10 w-px ${d ? "bg-white/5" : "bg-slate-200"} hidden sm:block`} />
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-pink-500 to-rose-500 shadow-lg shadow-pink-500/20`}>
                <HeartIcon cls="w-7 h-7 text-white" />
              </div>
              <div>
                <p className={`text-xs font-semibold uppercase tracking-widest ${d ? "text-slate-400" : "text-slate-500"}`}>Publish Rate</p>
                <p className={`text-3xl font-black leading-tight ${d ? "text-pink-300" : "text-pink-600"}`}>
                  {totalPosts > 0 ? Math.round((publishedPosts / totalPosts) * 100) : 0}%
                </p>
                <p className={`text-xs mt-0.5 ${d ? "text-slate-500" : "text-slate-400"}`}>posts published</p>
              </div>
            </div>
            <div className={`h-10 w-px ${d ? "bg-white/5" : "bg-slate-200"} hidden sm:block`} />
            <div className="flex-1 min-w-[180px]">
              <p className={`text-sm font-semibold mb-1 ${d ? "text-cyan-300" : "text-cyan-600"}`}>📝 Community Health</p>
              <p className={`text-xs leading-relaxed ${d ? "text-slate-400" : "text-slate-500"}`}>
                Track post types, engagement trends, and growth activity across the community.
              </p>
            </div>
          </div>
        </Card>

        {/* ── Tab Bar ── */}
        <div className={`flex items-center gap-1 p-1 rounded-2xl border ${
          d ? "bg-[#0d1120]/80 border-white/5" : "bg-white border-slate-200/80"
        } shadow-sm`}>
          {[
            { id: "overview", icon: "📊", label: "Analytics" },
            { id: "posts",    icon: "📋", label: "All Posts" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setView(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                view === t.id
                  ? d
                    ? "bg-cyan-500 text-white shadow-sm shadow-cyan-500/30"
                    : "bg-cyan-600 text-white shadow-sm shadow-cyan-200"
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

        {/* ── OVERVIEW TAB ── */}
        {view === "overview" && (
          <div className="space-y-5">
            {/* Row 1: By Type + Activity Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

              {/* Posts by Type */}
              <Card d={d}>
                <CardHeader title="Posts by Type" badge={dt.postsByType?.length} d={d} />
                <div className="p-5 space-y-4">
                  <HBar
                    data={dt.postsByType}
                    gradient={d ? "from-cyan-500 to-teal-400" : "from-cyan-400 to-teal-500"}
                    d={d}
                  />
                  {/* type chip grid */}
                  {(dt.postsByType || []).length > 0 && (
                    <div className={`grid grid-cols-2 gap-2 pt-2 border-t ${d ? "border-white/5" : "border-slate-100"}`}>
                      {(dt.postsByType || []).map((p) => {
                        const grad = TYPE_GRAD[p._id] || "from-slate-500 to-slate-400";
                        const total = (dt.postsByType || []).reduce((s, x) => s + (x.count || 0), 0) || 1;
                        const pct = Math.round(((p.count || 0) / total) * 100);
                        return (
                          <div key={p._id} className={`p-2.5 rounded-xl border ${d ? "border-white/5 bg-white/[0.02]" : "border-slate-100 bg-slate-50"}`}>
                            <div className="flex items-center justify-between mb-1.5">
                              <TypeBadge type={p._id} d={d} />
                              <span className={`text-sm font-black ${d ? "text-white" : "text-slate-800"}`}>{p.count}</span>
                            </div>
                            <div className={`h-1.5 rounded-full overflow-hidden ${d ? "bg-slate-800" : "bg-slate-200"}`}>
                              <div className={`h-full bg-gradient-to-r ${grad} rounded-full`} style={{ width: `${pct}%` }} />
                            </div>
                            <p className={`text-xs text-right mt-0.5 ${d ? "text-slate-600" : "text-slate-400"}`}>{pct}%</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </Card>

              {/* Activity Chart */}
              <Card d={d}>
                <CardHeader title="Post Activity — Last 14 Days" d={d} />
                <div className="px-5 pb-5 pt-3">
                  <ActivityChart data={dt.postGrowth} d={d} />
                  <div className={`flex items-center justify-between mt-3 pt-3 border-t text-xs ${
                    d ? "border-white/5 text-slate-500" : "border-slate-100 text-slate-400"
                  }`}>
                    <span>Oldest</span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-sm bg-gradient-to-r from-cyan-500 to-teal-400 inline-block" />
                      Posts per day
                    </span>
                    <span>Latest</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Row 2: Top Posts table */}
            <Card d={d}>
              <CardHeader title="🔥 Top Posts by Engagement" badge={`${dt.recentPosts?.length || 0} posts`} d={d} />
              {!dt.recentPosts?.length ? (
                <div className="py-16 flex flex-col items-center gap-3">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 border-dashed ${d ? "border-slate-700 bg-white/[0.02]" : "border-slate-200 bg-slate-50"}`}>
                    <PostsIcon cls={`w-7 h-7 ${d ? "text-slate-600" : "text-slate-300"}`} />
                  </div>
                  <p className={`text-sm font-semibold ${d ? "text-slate-400" : "text-slate-500"}`}>No posts yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className={`border-b ${d ? "border-white/5" : "border-slate-100"}`}>
                        {["Post", "Author", "Type", "❤️ Likes", "💬 Comments", "Date"].map((col) => (
                          <th key={col} className={`px-5 py-3 text-left text-xs font-semibold uppercase tracking-widest whitespace-nowrap ${d ? "text-slate-500" : "text-slate-400"}`}>{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${d ? "divide-white/[0.04]" : "divide-slate-50"}`}>
                      {(dt.recentPosts || []).map((p) => (
                        <tr key={p._id} className={`transition-colors duration-150 ${d ? "hover:bg-cyan-500/[0.04]" : "hover:bg-cyan-50/40"}`}>
                          <td className="px-5 py-4 max-w-[220px]">
                            <p className={`text-sm font-semibold line-clamp-1 ${d ? "text-slate-100" : "text-slate-800"}`}>
                              {p.title || p.content?.substring(0, 80) || "Post"}
                            </p>
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2.5">
                              <Avatar src={p.user?.profileImage || p.user?.avatar} name={p.user?.name} />
                              <span className={`text-xs font-semibold ${d ? "text-slate-300" : "text-slate-600"}`}>{p.user?.name || "—"}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <TypeBadge type={p.postType} d={d} />
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap text-center">
                            <span className={`inline-flex items-center gap-1 text-xs font-bold ${d ? "text-pink-400" : "text-pink-600"}`}>
                              <HeartIcon cls="w-3 h-3" />
                              {p.likes?.length || 0}
                            </span>
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap text-center">
                            <span className={`inline-flex items-center gap-1 text-xs font-bold ${d ? "text-violet-400" : "text-violet-600"}`}>
                              <ChatIcon cls="w-3 h-3" />
                              {p.comments?.length || 0}
                            </span>
                          </td>
                          <td className={`px-5 py-4 whitespace-nowrap text-xs ${d ? "text-slate-500" : "text-slate-400"}`}>
                            {new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* ── POSTS TAB ── */}
        {view === "posts" && (
          <Card d={d}>
            <CardHeader title="All Recent Posts" badge={`${(dt.recentPosts || []).length} records`} d={d} />
            {!(dt.recentPosts || []).length ? (
              <div className="py-20 flex flex-col items-center gap-3">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 border-dashed ${d ? "border-slate-700 bg-white/[0.02]" : "border-slate-200 bg-slate-50"}`}>
                  <PostsIcon cls={`w-7 h-7 ${d ? "text-slate-600" : "text-slate-300"}`} />
                </div>
                <p className={`text-sm font-semibold ${d ? "text-slate-400" : "text-slate-500"}`}>No posts found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className={`border-b ${d ? "border-white/5" : "border-slate-100"}`}>
                      {["Title & Tags", "Author", "Type", "Status", "❤️ / 💬", "Date"].map((col) => (
                        <th key={col} className={`px-5 py-3 text-left text-xs font-semibold uppercase tracking-widest whitespace-nowrap ${d ? "text-slate-500" : "text-slate-400"}`}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${d ? "divide-white/[0.04]" : "divide-slate-50"}`}>
                    {(dt.recentPosts || []).map((p) => (
                      <tr key={p._id} className={`transition-colors duration-150 ${d ? "hover:bg-cyan-500/[0.04]" : "hover:bg-cyan-50/40"}`}>
                        {/* Title + tags */}
                        <td className="px-5 py-4 max-w-[220px]">
                          <p className={`text-sm font-semibold line-clamp-1 ${d ? "text-slate-100" : "text-slate-800"}`}>
                            {p.title || p.content?.substring(0, 80) || "Post"}
                          </p>
                          {p.tags?.length > 0 && (
                            <div className="flex gap-1 mt-1.5 flex-wrap">
                              {p.tags.slice(0, 3).map((t) => (
                                <span key={t} className={`inline-flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded-md font-medium ${
                                  d ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-500"
                                }`}>
                                  <TagIcon cls="w-2.5 h-2.5" />
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        {/* Author */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <Avatar src={p.user?.profileImage || p.user?.avatar} name={p.user?.name} />
                            <span className={`text-xs font-semibold ${d ? "text-slate-300" : "text-slate-600"}`}>{p.user?.name || "—"}</span>
                          </div>
                        </td>
                        {/* Type */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <TypeBadge type={p.postType} d={d} />
                        </td>
                        {/* Status */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                            d ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}>
                            Published
                          </span>
                        </td>
                        {/* Likes / Comments */}
                        <td className="px-5 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-2">
                            <span className={`flex items-center gap-1 text-xs font-bold ${d ? "text-pink-400" : "text-pink-600"}`}>
                              <HeartIcon cls="w-3 h-3" />{p.likes?.length || 0}
                            </span>
                            <span className={d ? "text-slate-700" : "text-slate-300"}>/</span>
                            <span className={`flex items-center gap-1 text-xs font-bold ${d ? "text-violet-400" : "text-violet-600"}`}>
                              <ChatIcon cls="w-3 h-3" />{p.comments?.length || 0}
                            </span>
                          </div>
                        </td>
                        {/* Date */}
                        <td className={`px-5 py-4 whitespace-nowrap text-xs ${d ? "text-slate-500" : "text-slate-400"}`}>
                          {new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {/* footer */}
            {(dt.recentPosts || []).length > 0 && (
              <div className={`px-5 py-3 border-t flex items-center justify-between ${d ? "border-white/5 bg-white/[0.015]" : "border-slate-100 bg-slate-50/40"}`}>
                <p className={`text-xs ${d ? "text-slate-500" : "text-slate-400"}`}>
                  Showing <span className={`font-semibold ${d ? "text-slate-300" : "text-slate-600"}`}>{dt.recentPosts.length}</span> posts
                </p>
              </div>
            )}
          </Card>
        )}

      </div>
    </div>
  );
}

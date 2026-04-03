// components/admin/ResourcesAnalytics.jsx
import { useState, useEffect } from "react";
import API from "../../utils/api";
import { useTheme } from "../../hooks/useTheme";

const fmt = (n) => n >= 1000 ? `${(n/1000).toFixed(1)}K` : String(n ?? 0);

// ── Icons ────────────────────────────────────────────────────────
const RefreshIcon = ({ cls, spin }) => <svg className={`${cls} ${spin ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>;
const BookIcon    = ({ cls }) => <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>;

// ── Accent lookup ────────────────────────────────────────────────
const ACC = {
  teal:    { grad: "from-teal-500 to-emerald-500", dv: "text-teal-300",    lv: "text-teal-600",    ring: "ring-teal-500/20"    },
  cyan:    { grad: "from-cyan-500 to-teal-500",    dv: "text-cyan-300",    lv: "text-cyan-600",    ring: "ring-cyan-500/20"    },
  blue:    { grad: "from-blue-500 to-indigo-500",  dv: "text-blue-300",    lv: "text-blue-600",    ring: "ring-blue-500/20"    },
  purple:  { grad: "from-purple-500 to-violet-500",dv: "text-purple-300",  lv: "text-purple-600",  ring: "ring-purple-500/20"  },
  emerald: { grad: "from-emerald-500 to-green-500",dv: "text-emerald-300", lv: "text-emerald-600", ring: "ring-emerald-500/20" },
  amber:   { grad: "from-amber-500 to-orange-500", dv: "text-amber-300",   lv: "text-amber-600",   ring: "ring-amber-500/20"   },
};

// ── Stat Card ────────────────────────────────────────────────────
function StatCard({ label, value, accent, emoji, d }) {
  const a = ACC[accent] || ACC.teal;
  return (
    <div className={`relative overflow-hidden rounded-2xl border p-5 ring-1 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group ${
      d ? `bg-[#0d1120]/80 border-white/5 ${a.ring} shadow-black/30`
        : `bg-white border-slate-200/70 ${a.ring} shadow-slate-200/50`}`}>
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br ${d ? "from-white/[0.02] to-transparent" : "from-teal-50/40 to-transparent"}`} />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className={`text-xs font-semibold uppercase tracking-widest mb-2 ${d ? "text-slate-400" : "text-slate-500"}`}>{label}</p>
          <p className={`text-3xl font-black leading-none ${d ? a.dv : a.lv}`}>{fmt(value)}</p>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${a.grad} shadow-lg text-lg`}>
          {emoji}
        </div>
      </div>
      <div className={`absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r ${a.grad} opacity-50`} />
    </div>
  );
}

// ── Card ─────────────────────────────────────────────────────────
function Card({ children, className = "", d }) {
  return (
    <div className={`rounded-2xl border overflow-hidden shadow-lg ${d ? "bg-[#0d1120]/90 border-white/5 shadow-black/40" : "bg-white border-slate-200/80 shadow-slate-200/50"} ${className}`}>
      {children}
    </div>
  );
}

function CardHeader({ title, icon, d, extra }) {
  return (
    <div className={`px-5 py-4 border-b flex items-center justify-between gap-3 ${d ? "border-white/5 bg-white/[0.02]" : "border-slate-100 bg-slate-50/60"}`}>
      <div className="flex items-center gap-2">
        {icon && <span className="text-base">{icon}</span>}
        <span className={`text-sm font-bold ${d ? "text-white" : "text-slate-800"}`}>{title}</span>
      </div>
      {extra}
    </div>
  );
}

// ── HBar ─────────────────────────────────────────────────────────
function HBar({ data, valueKey = "count", labelKey = "_id", gradient, d }) {
  if (!data?.length) return <p className={`text-sm text-center py-6 ${d ? "text-slate-600" : "text-slate-400"}`}>No data</p>;
  const max = Math.max(...data.map(x => x[valueKey] || 0), 1);
  return (
    <div className="space-y-3">
      {data.map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className={`w-28 text-xs font-medium text-right shrink-0 truncate capitalize ${d ? "text-slate-400" : "text-slate-500"}`}>
            {String(item[labelKey] || "—").replace(/_/g, " ")}
          </div>
          <div className={`flex-1 h-3 rounded-full overflow-hidden ${d ? "bg-slate-800" : "bg-slate-100"}`}>
            <div className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all duration-700`} style={{ width: `${((item[valueKey] || 0) / max) * 100}%` }} />
          </div>
          <div className={`w-8 text-xs font-bold text-right ${d ? "text-slate-200" : "text-slate-700"}`}>{item[valueKey]}</div>
        </div>
      ))}
    </div>
  );
}

// ── MetricRow ────────────────────────────────────────────────────
function MetricRow({ label, value, color, d }) {
  return (
    <div className={`flex items-center justify-between py-2.5 border-b last:border-0 ${d ? "border-white/[0.04]" : "border-slate-50"}`}>
      <span className={`text-xs font-medium ${d ? "text-slate-400" : "text-slate-500"}`}>{label}</span>
      <span className={`text-sm font-bold ${color}`}>{value ?? 0}</span>
    </div>
  );
}

// ── Avatar ───────────────────────────────────────────────────────
function Avatar({ src, name }) {
  const colors = ["from-teal-500 to-cyan-500", "from-blue-500 to-indigo-500", "from-purple-500 to-violet-500", "from-emerald-500 to-teal-500", "from-amber-500 to-orange-500"];
  const idx = name ? name.charCodeAt(0) % colors.length : 0;
  if (src && !src.includes("dicebear.com/7.x/initials")) return <img src={src} alt={name} className="w-6 h-6 rounded-full object-cover flex-shrink-0" />;
  return <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${colors[idx]} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>{name?.slice(0, 2).toUpperCase() || "??"}</div>;
}

// ── Main ─────────────────────────────────────────────────────────
export default function ResourcesAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("overview");
  const { isDarkMode: d } = useTheme();

  const load = () => { setLoading(true); API.get("/admin/resources-stats").then(r => setData(r.data.data)).catch(console.error).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);

  const dt = data || {};

  if (loading && !data) return (
    <div className={`min-h-screen flex flex-col gap-6 p-6 ${d ? "bg-[#060912]" : "bg-slate-50"}`}>
      <div className={`h-10 w-64 rounded-xl animate-pulse ${d ? "bg-white/5" : "bg-slate-200"}`} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className={`h-24 rounded-2xl animate-pulse ${d ? "bg-white/5" : "bg-slate-200"}`} />)}
      </div>
      <div className={`h-64 rounded-2xl animate-pulse ${d ? "bg-white/5" : "bg-slate-200"}`} />
    </div>
  );

  return (
    <div className={`min-h-screen transition-colors duration-300 ${d ? "bg-[#060912]" : "bg-slate-50"}`}>
      <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-teal-500/60 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/30">
              <BookIcon cls="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-2xl font-black tracking-tight ${d ? "text-white" : "text-slate-900"}`}>Resources &amp; Learning</h1>
              <p className={`text-sm font-medium mt-0.5 ${d ? "text-slate-400" : "text-slate-500"}`}>Resources, downloads, ratings, and learning paths</p>
            </div>
          </div>
          <button onClick={load} disabled={loading}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-60 shadow-md ${
              d ? "bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 border border-teal-500/25" : "bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200"}`}>
            <RefreshIcon cls="w-4 h-4" spin={loading} />{loading ? "Loading…" : "Refresh"}
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Resources" value={dt.totalResources}        accent="teal"    emoji="📚" d={d} />
          <StatCard label="Reviews"         value={dt.totalReviews}          accent="blue"    emoji="⭐" d={d} />
          <StatCard label="Learning Paths"  value={dt.totalPaths}            accent="purple"  emoji="🗺️" d={d} />
          <StatCard label="Total Views"     value={dt.dlStats?.totalDownloads} accent="emerald" emoji="👀" d={d} />
        </div>

        {/* Tabs */}
        <div className={`flex items-center gap-1 p-1 rounded-2xl border ${d ? "bg-[#0d1120]/80 border-white/5" : "bg-white border-slate-200/80"} shadow-sm`}>
          {[
            ["overview", "📊", "Overview"],
            ["resources","📚", "Resources"],
            ["paths",    "🗺️", "Learning Paths"]
          ].map(([t, ic, lb]) => (
            <button key={t} onClick={() => setView(t)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                view === t
                  ? d ? "bg-teal-500 text-white shadow-sm shadow-teal-500/30" : "bg-teal-500 text-white shadow-sm shadow-teal-200"
                  : d ? "text-slate-400 hover:text-slate-200 hover:bg-white/5" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}>
              <span>{ic}</span><span>{lb}</span>
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {view === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <Card d={d}>
              <CardHeader title="By Type" icon="📑" d={d} />
              <div className="px-5 py-4">
                <HBar data={dt.byType} gradient={d ? "from-teal-500 to-cyan-400" : "from-teal-400 to-cyan-500"} d={d} />
              </div>
            </Card>

            <Card d={d}>
              <CardHeader title="By Category" icon="🗂️" d={d} />
              <div className="px-5 py-4">
                <HBar data={(dt.byCategory || []).slice(0, 8)} gradient={d ? "from-blue-500 to-cyan-400" : "from-blue-400 to-cyan-500"} d={d} />
              </div>
            </Card>

            <Card d={d}>
              <CardHeader title="Rating Distribution" icon="⭐" d={d} />
              <div className="px-5 py-4">
                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map(star => {
                    const found = (dt.ratingDist || []).find(r => r._id === star);
                    const count = found?.count || 0;
                    const max = Math.max(...(dt.ratingDist || []).map(r => r.count), 1);
                    return (
                      <div key={star} className="flex items-center gap-3">
                        <div className={`w-8 text-xs font-bold text-right ${d ? "text-amber-400" : "text-amber-500"}`}>{star}★</div>
                        <div className={`flex-1 h-3 rounded-full overflow-hidden ${d ? "bg-slate-800" : "bg-slate-100"}`}>
                          <div className={`h-full bg-gradient-to-r ${d ? "from-amber-500 to-yellow-400" : "from-amber-400 to-yellow-500"} rounded-full transition-all duration-700`} style={{ width: `${(count / max) * 100}%` }} />
                        </div>
                        <div className={`w-8 text-xs font-bold ${d ? "text-slate-200" : "text-slate-700"}`}>{count}</div>
                      </div>
                    );
                  })}
                </div>
                {dt.dlStats?.avgRating > 0 && (
                  <div className={`mt-5 pt-4 border-t flex items-center justify-between ${d ? "border-white/5" : "border-slate-100"}`}>
                    <span className={`text-xs font-semibold ${d ? "text-slate-400" : "text-slate-500"}`}>Average Rating</span>
                    <span className={`text-2xl font-black ${d ? "text-amber-400" : "text-amber-500"}`}>{dt.dlStats.avgRating?.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* ── RESOURCES ── */}
        {view === "resources" && (
          <Card d={d}>
            <CardHeader title="Top Resources by Rating & Downloads" badge={(dt.recentResources || []).length} d={d} />
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className={`border-b text-xs font-semibold uppercase tracking-widest whitespace-nowrap ${d ? "border-white/5 text-slate-500" : "border-slate-100 text-slate-400"}`}>
                    <th className="text-left px-5 py-3">Title</th>
                    <th className="text-left px-5 py-3">Creator</th>
                    <th className="text-center px-5 py-3">Type</th>
                    <th className="text-center px-5 py-3">⭐ Rating</th>
                    <th className="text-center px-5 py-3">⬇ Downloads</th>
                    <th className="text-right px-5 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${d ? "divide-white/[0.04]" : "divide-slate-50"}`}>
                  {(dt.recentResources || []).map(r => (
                    <tr key={r._id} className={`transition-colors duration-150 ${d ? "hover:bg-teal-500/[0.04]" : "hover:bg-teal-50/50"}`}>
                      <td className="px-5 py-4">
                        <p className={`font-semibold text-xs line-clamp-1 ${d ? "text-slate-100" : "text-slate-800"}`}>{r.title || "Untitled"}</p>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Avatar src={r.author?.profileImage} name={r.author?.name} />
                          <span className={`text-xs font-semibold ${d ? "text-slate-300" : "text-slate-600"}`}>{r.author?.name || "—"}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border capitalize ${d ? "bg-teal-500/15 text-teal-400 border-teal-500/30" : "bg-teal-50 text-teal-700 border-teal-200"}`}>
                          {r.resourceType || r.type || "—"}
                        </span>
                      </td>
                      <td className={`px-5 py-4 whitespace-nowrap text-center text-xs font-bold ${d ? "text-amber-400" : "text-amber-500"}`}>
                        {r.averageRating ? `${r.averageRating.toFixed(1)}★` : "—"}
                      </td>
                      <td className={`px-5 py-4 whitespace-nowrap text-center text-xs font-bold ${d ? "text-blue-400" : "text-blue-600"}`}>
                        {r.views || 0}
                      </td>
                      <td className={`px-5 py-4 whitespace-nowrap text-right text-xs ${d ? "text-slate-400" : "text-slate-500"}`}>
                        {new Date(r.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!(dt.recentResources || []).length && <p className={`text-center py-10 text-sm ${d ? "text-slate-600" : "text-slate-400"}`}>No resources yet</p>}
            </div>
          </Card>
        )}

        {/* ── PATHS ── */}
        {view === "paths" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card d={d}>
              <CardHeader title="Learning Paths by Goal" icon="🎯" d={d} />
              <div className="px-5 py-4">
                <HBar data={(dt.pathGoals || []).slice(0, 10)} labelKey="_id" gradient={d ? "from-purple-500 to-violet-400" : "from-purple-400 to-violet-500"} d={d} />
              </div>
            </Card>
            
            <Card d={d}>
              <CardHeader title="Learning Path Summary" icon="ℹ️" d={d} />
              <div className="px-5 py-4 space-y-2">
                <MetricRow label="Total Learning Paths" value={dt.totalPaths} color={d ? "text-purple-400" : "text-purple-600"} d={d} />
                <MetricRow label="Active Paths" value={dt.activePaths} color={d ? "text-emerald-400" : "text-emerald-600"} d={d} />
                <MetricRow label="Avg Resource Rating" value={dt.dlStats?.avgRating ? `${dt.dlStats.avgRating.toFixed(1)}★` : "—"} color={d ? "text-amber-400" : "text-amber-600"} d={d} />
                <MetricRow label="Total Views" value={fmt(dt.dlStats?.totalDownloads)} color={d ? "text-blue-400" : "text-blue-600"} d={d} />
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

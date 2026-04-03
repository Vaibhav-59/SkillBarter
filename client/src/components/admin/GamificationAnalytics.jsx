// components/admin/GamificationAnalytics.jsx
import { useState, useEffect } from "react";
import API from "../../utils/api";
import { useTheme } from "../../hooks/useTheme";

const fmt = (n) => n >= 1_000_000 ? `${(n/1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n/1_000).toFixed(1)}K` : String(n ?? 0);

const RefreshIcon = ({ cls, spin }) => (
  <svg className={`${cls} ${spin?"animate-spin":""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
  </svg>
);

const BADGE_COLORS = {
  session:   { dark:"bg-blue-500/15 text-blue-400 border-blue-500/30",     light:"bg-blue-50 text-blue-700 border-blue-200" },
  teaching:  { dark:"bg-emerald-500/15 text-emerald-400 border-emerald-500/30", light:"bg-emerald-50 text-emerald-700 border-emerald-200" },
  learning:  { dark:"bg-teal-500/15 text-teal-400 border-teal-500/30",     light:"bg-teal-50 text-teal-700 border-teal-200" },
  streak:    { dark:"bg-orange-500/15 text-orange-400 border-orange-500/30",light:"bg-orange-50 text-orange-700 border-orange-200" },
  challenge: { dark:"bg-red-500/15 text-red-400 border-red-500/30",        light:"bg-red-50 text-red-700 border-red-200" },
  reward:    { dark:"bg-yellow-500/15 text-yellow-400 border-yellow-500/30",light:"bg-yellow-50 text-yellow-700 border-yellow-200" },
};

function Card({ children, d }) {
  return (
    <div className={`rounded-2xl border overflow-hidden shadow-lg ${d?"bg-[#0d1120]/90 border-white/5":"bg-white border-slate-200/80 shadow-slate-200/50"}`}>
      {children}
    </div>
  );
}
function CardHeader({ title, badge, d }) {
  return (
    <div className={`px-5 py-4 border-b flex items-center justify-between ${d?"border-white/5 bg-white/[0.02]":"border-slate-100 bg-slate-50/60"}`}>
      <span className={`text-sm font-bold ${d?"text-white":"text-slate-800"}`}>{title}</span>
      {badge!=null && <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${d?"bg-amber-500/15 text-amber-400":"bg-amber-50 text-amber-600"}`}>{badge}</span>}
    </div>
  );
}

function StatCard({ label, value, accent, d }) {
  const styles = {
    amber:  { grad:"from-amber-500 to-orange-500",  val:d?"text-amber-300":"text-amber-600",  ring:"ring-amber-500/20"  },
    yellow: { grad:"from-yellow-400 to-amber-500",  val:d?"text-yellow-300":"text-yellow-600",ring:"ring-yellow-500/20" },
    violet: { grad:"from-violet-500 to-purple-600", val:d?"text-violet-300":"text-violet-600",ring:"ring-violet-500/20" },
    cyan:   { grad:"from-cyan-500 to-teal-500",     val:d?"text-cyan-300":"text-cyan-600",   ring:"ring-cyan-500/20"   },
  };
  const s = styles[accent]||styles.amber;
  return (
    <div className={`relative overflow-hidden rounded-2xl border p-5 ring-1 shadow-lg transition-all duration-300 hover:scale-[1.02] group ${d?`bg-[#0d1120]/80 border-white/5 ${s.ring}`:`bg-white border-slate-200/70 ${s.ring} shadow-slate-200/50`}`}>
      <p className={`text-xs font-semibold uppercase tracking-widest mb-2 ${d?"text-slate-400":"text-slate-500"}`}>{label}</p>
      <p className={`text-4xl font-black leading-none ${s.val}`}>{fmt(value)}</p>
      <div className={`absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r ${s.grad} opacity-50`}/>
    </div>
  );
}

function HBar({ data, valueKey="count", labelKey="_id", gradient, d }) {
  if (!data?.length) return <p className={`text-sm text-center py-6 ${d?"text-slate-600":"text-slate-400"}`}>No data</p>;
  const max = Math.max(...data.map(x=>x[valueKey]||0), 1);
  return (
    <div className="space-y-3">
      {data.map((item,i) => (
        <div key={i} className="flex items-center gap-3">
          <div className={`w-24 text-xs font-medium text-right shrink-0 truncate capitalize ${d?"text-slate-400":"text-slate-500"}`}>{String(item[labelKey]||"—")}</div>
          <div className={`flex-1 h-3 rounded-full overflow-hidden ${d?"bg-slate-800":"bg-slate-100"}`}>
            <div className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all duration-700`} style={{width:`${((item[valueKey]||0)/max)*100}%`}}/>
          </div>
          <div className={`w-7 text-xs font-bold text-right ${d?"text-slate-200":"text-slate-700"}`}>{item[valueKey]}</div>
        </div>
      ))}
    </div>
  );
}

function Avatar({ src, name }) {
  const colors = ["from-amber-500 to-orange-500","from-violet-500 to-purple-600","from-pink-500 to-rose-500","from-indigo-500 to-blue-500","from-emerald-500 to-teal-500"];
  const idx = name ? name.charCodeAt(0) % colors.length : 0;
  if (src) return <img src={src} alt={name} className="w-8 h-8 rounded-full object-cover flex-shrink-0"/>;
  return <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${colors[idx]} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>{name?.slice(0,2).toUpperCase()||"??"}</div>;
}

export default function GamificationAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("leaderboard");
  const { isDarkMode: d } = useTheme();

  const load = () => { setLoading(true); API.get("/admin/gamification-stats").then(r=>setData(r.data.data)).catch(console.error).finally(()=>setLoading(false)); };
  useEffect(()=>{load();},[]);

  const dt = data||{}; const xs = dt.xpStats||{};

  if (loading && !data) return (
    <div className={`min-h-screen flex flex-col gap-6 p-6 ${d?"bg-[#060912]":"bg-slate-50"}`}>
      <div className={`h-10 w-64 rounded-xl animate-pulse ${d?"bg-white/5":"bg-slate-200"}`}/>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_,i)=><div key={i} className={`h-28 rounded-2xl animate-pulse ${d?"bg-white/5":"bg-slate-200"}`}/>)}
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen transition-colors duration-300 ${d?"bg-[#060912]":"bg-slate-50"}`}>
      <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-amber-500/60 to-transparent"/>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30 text-2xl">✨</div>
            <div>
              <h1 className={`text-2xl font-black tracking-tight ${d?"text-white":"text-slate-900"}`}>Gamification &amp; Rewards</h1>
              <p className={`text-sm font-medium mt-0.5 ${d?"text-slate-400":"text-slate-500"}`}>XP, badges, levels, leaderboard &amp; reward analytics</p>
            </div>
          </div>
          <button onClick={load} disabled={loading}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-60 ${d?"bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/25":"bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200"}`}>
            <RefreshIcon cls="w-4 h-4" spin={loading}/>{loading?"Loading…":"Refresh"}
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total XP"     value={xs.totalXP}              accent="amber"  d={d}/>
          <StatCard label="Avg XP/User"  value={Math.round(xs.avgXP||0)} accent="yellow" d={d}/>
          <StatCard label="Badges Given" value={dt.totalBadges}           accent="violet" d={d}/>
          <StatCard label="Rewards Used" value={dt.totalRewards}          accent="cyan"   d={d}/>
        </div>

        {/* XP Banner */}
        <Card d={d}>
          <CardHeader title="XP Summary Statistics" d={d}/>
          <div className="px-5 py-5 flex flex-wrap gap-8 sm:gap-16">
            {[["Total XP",fmt(xs.totalXP),d?"text-amber-300":"text-amber-600"],["Max XP",xs.maxXP||0,d?"text-orange-300":"text-orange-600"],
              ["Avg XP",Math.round(xs.avgXP||0),d?"text-yellow-300":"text-yellow-600"],["Avg Level",Math.round(xs.avgLevel||0),d?"text-violet-300":"text-violet-600"],
              ["Max Level",xs.maxLevel||0,d?"text-white":"text-slate-800"]].map(([l,v,c])=>(
              <div key={l} className="text-center">
                <p className={`text-3xl font-black ${c}`}>{v}</p>
                <p className={`text-xs font-semibold mt-1 ${d?"text-slate-500":"text-slate-400"}`}>{l}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Tabs */}
        <div className={`flex items-center gap-1 p-1 rounded-2xl border ${d?"bg-[#0d1120]/80 border-white/5":"bg-white border-slate-200/80"}`}>
          {[["leaderboard","🥇","Leaderboard"],["badges","🎖️","Badges"],["levels","📊","Levels"]].map(([t,ic,lb])=>(
            <button key={t} onClick={()=>setView(t)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                view===t ? "bg-amber-500 text-white shadow-sm" : d?"text-slate-400 hover:text-slate-200 hover:bg-white/5":"text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}>
              <span>{ic}</span><span>{lb}</span>
            </button>
          ))}
        </div>

        {/* Leaderboard */}
        {view==="leaderboard" && (
          <Card d={d}>
            <CardHeader title="🏆 Top 20 Users by XP" badge={dt.leaderboard?.length} d={d}/>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className={`border-b ${d?"border-white/5":"border-slate-100"}`}>
                    {["#","User","Level","XP","Badges","Sessions","Challenges"].map(col=>(
                      <th key={col} className={`px-5 py-3 text-left text-xs font-semibold uppercase tracking-widest ${d?"text-slate-500":"text-slate-400"}`}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className={`divide-y ${d?"divide-white/[0.04]":"divide-slate-50"}`}>
                  {(dt.leaderboard||[]).map((player,i)=>(
                    <tr key={player._id} className={`transition-colors ${d?"hover:bg-amber-500/[0.04]":"hover:bg-amber-50/50"}`}>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`text-sm font-black ${i===0?"text-yellow-400":i===1?"text-slate-300":i===2?"text-amber-600":d?"text-slate-600":"text-slate-400"}`}>
                          {i===0?"🥇":i===1?"🥈":i===2?"🥉":i+1}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <Avatar src={player.userId?.profileImage} name={player.userId?.name}/>
                          <div>
                            <p className={`text-xs font-semibold ${d?"text-slate-100":"text-slate-800"}`}>{player.userId?.name||"Unknown"}</p>
                            <p className={`text-xs ${d?"text-slate-500":"text-slate-400"}`}>{player.userId?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${d?"bg-amber-500/15 text-amber-400 border-amber-500/30":"bg-amber-50 text-amber-700 border-amber-200"}`}>Lv {player.level}</span>
                      </td>
                      <td className={`px-5 py-4 whitespace-nowrap text-sm font-black ${d?"text-amber-400":"text-amber-600"}`}>{fmt(player.xp)}</td>
                      <td className={`px-5 py-4 whitespace-nowrap text-xs font-bold text-center ${d?"text-violet-400":"text-violet-600"}`}>{player.badges?.length||0}</td>
                      <td className={`px-5 py-4 whitespace-nowrap text-xs font-bold text-center ${d?"text-blue-400":"text-blue-600"}`}>{player.sessionsCompleted||0}</td>
                      <td className={`px-5 py-4 whitespace-nowrap text-xs font-bold text-center ${d?"text-pink-400":"text-pink-600"}`}>{player.challengesCompleted||0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!dt.leaderboard?.length && <p className={`text-center py-10 text-sm ${d?"text-slate-600":"text-slate-400"}`}>No leaderboard data yet</p>}
            </div>
          </Card>
        )}

        {/* Badges */}
        {view==="badges" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card d={d}>
              <CardHeader title="Badges by Category" d={d}/>
              <div className="p-5">
                <HBar data={dt.badgeDist} gradient="from-violet-500 to-purple-500" d={d}/>
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/5">
                  {(dt.badgeDist||[]).map(b=>{
                    const c=BADGE_COLORS[b._id]||{dark:"bg-slate-700 text-slate-300 border-slate-600",light:"bg-slate-100 text-slate-500 border-slate-200"};
                    return <span key={b._id} className={`px-2.5 py-1 rounded-full text-xs font-bold border capitalize ${d?c.dark:c.light}`}>{b._id} ({b.count})</span>;
                  })}
                </div>
              </div>
            </Card>
            <Card d={d}>
              <CardHeader title="XP Gain — Last 30 Days" d={d}/>
              <div className="p-5">
                {(dt.xpOverTime||[]).length>0 ? (
                  <div className="space-y-3">
                    {dt.xpOverTime.map((day,i)=>{
                      const max=Math.max(...dt.xpOverTime.map(x=>x.totalXP||0),1);
                      return (
                        <div key={i} className="flex items-center gap-3">
                          <div className={`w-16 text-xs text-right shrink-0 ${d?"text-slate-500":"text-slate-400"}`}>{day._id?.split("-").slice(1).join("/")||"—"}</div>
                          <div className={`flex-1 h-3 rounded-full overflow-hidden ${d?"bg-slate-800":"bg-slate-100"}`}>
                            <div className="h-full bg-gradient-to-r from-yellow-500 to-amber-400 rounded-full" style={{width:`${(day.totalXP/max)*100}%`}}/>
                          </div>
                          <div className={`w-14 text-xs font-bold text-right ${d?"text-amber-400":"text-amber-600"}`}>+{fmt(day.totalXP)}</div>
                        </div>
                      );
                    })}
                  </div>
                ) : <p className={`text-center py-8 text-sm ${d?"text-slate-600":"text-slate-400"}`}>No XP history</p>}
              </div>
            </Card>
          </div>
        )}

        {/* Levels */}
        {view==="levels" && (
          <Card d={d}>
            <CardHeader title="Level Distribution" badge={dt.levelDist?.length} d={d}/>
            <div className="p-5">
              {(dt.levelDist||[]).length>0 ? (
                <div className="space-y-3">
                  {dt.levelDist.slice(0,25).map(lv=>{
                    const max=Math.max(...dt.levelDist.map(x=>x.count),1);
                    return (
                      <div key={lv._id} className="flex items-center gap-3">
                        <div className={`w-20 text-xs font-medium text-right shrink-0 ${d?"text-slate-400":"text-slate-500"}`}>Level {lv._id}</div>
                        <div className={`flex-1 h-4 rounded-full overflow-hidden ${d?"bg-slate-800":"bg-slate-100"}`}>
                          <div className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full transition-all duration-700" style={{width:`${(lv.count/max)*100}%`}}/>
                        </div>
                        <div className={`w-20 text-xs font-bold text-right ${d?"text-slate-200":"text-slate-700"}`}>{lv.count} users</div>
                      </div>
                    );
                  })}
                </div>
              ) : <p className={`text-center py-8 text-sm ${d?"text-slate-600":"text-slate-400"}`}>No level data</p>}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

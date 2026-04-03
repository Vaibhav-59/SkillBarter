// components/admin/PlatformAnalytics.jsx
import { useState, useEffect } from "react";
import API from "../../utils/api";
import { useTheme } from "../../hooks/useTheme";

const fmt = (n) => n >= 1_000_000 ? `${(n/1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n/1_000).toFixed(1)}K` : String(n ?? 0);

// ── Icons ────────────────────────────────────────────────────────
const RefreshIcon = ({ cls, spin }) => <svg className={`${cls} ${spin?"animate-spin":""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>;
const GlobeIcon   = ({ cls }) => <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>;

// ── Accent lookup ────────────────────────────────────────────────
const ACC = {
  violet:  { grad:"from-violet-500 to-purple-600",  dv:"text-violet-300",  lv:"text-violet-600",  ring:"ring-violet-500/20"  },
  purple:  { grad:"from-purple-500 to-fuchsia-600", dv:"text-purple-300",  lv:"text-purple-600",  ring:"ring-purple-500/20"  },
  blue:    { grad:"from-blue-500 to-indigo-500",    dv:"text-blue-300",    lv:"text-blue-600",    ring:"ring-blue-500/20"    },
  orange:  { grad:"from-orange-500 to-amber-500",   dv:"text-orange-300",  lv:"text-orange-600",  ring:"ring-orange-500/20"  },
  teal:    { grad:"from-teal-500 to-emerald-500",   dv:"text-teal-300",    lv:"text-teal-600",    ring:"ring-teal-500/20"    },
  emerald: { grad:"from-emerald-500 to-green-500",  dv:"text-emerald-300", lv:"text-emerald-600", ring:"ring-emerald-500/20" },
  red:     { grad:"from-red-500 to-rose-500",       dv:"text-red-300",     lv:"text-red-600",     ring:"ring-red-500/20"     },
  cyan:    { grad:"from-cyan-500 to-teal-500",      dv:"text-cyan-300",    lv:"text-cyan-600",    ring:"ring-cyan-500/20"    },
  indigo:  { grad:"from-indigo-500 to-violet-600",  dv:"text-indigo-300",  lv:"text-indigo-600",  ring:"ring-indigo-500/20"  },
};

// ── Stat Card ────────────────────────────────────────────────────
function StatCard({ label, value, accent, emoji, d }) {
  const a = ACC[accent]||ACC.indigo;
  return (
    <div className={`relative overflow-hidden rounded-2xl border p-5 ring-1 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group ${
      d ? `bg-[#0d1120]/80 border-white/5 ${a.ring} shadow-black/30`
        : `bg-white border-slate-200/70 ${a.ring} shadow-slate-200/50`}`}>
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br ${d?"from-white/[0.02] to-transparent":"from-indigo-50/40 to-transparent"}`}/>
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className={`text-xs font-semibold uppercase tracking-widest mb-2 ${d?"text-slate-400":"text-slate-500"}`}>{label}</p>
          <p className={`text-3xl font-black leading-none ${d?a.dv:a.lv}`}>{fmt(value)}</p>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${a.grad} shadow-lg text-lg`}>
          {emoji}
        </div>
      </div>
      <div className={`absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r ${a.grad} opacity-50`}/>
    </div>
  );
}

// ── Card ─────────────────────────────────────────────────────────
function Card({ children, className="", d }) {
  return (
    <div className={`rounded-2xl border overflow-hidden shadow-lg ${d?"bg-[#0d1120]/90 border-white/5 shadow-black/40":"bg-white border-slate-200/80 shadow-slate-200/50"} ${className}`}>
      {children}
    </div>
  );
}
function CardHeader({ title, icon, d, extra }) {
  return (
    <div className={`px-5 py-4 border-b flex items-center justify-between gap-3 ${d?"border-white/5 bg-white/[0.02]":"border-slate-100 bg-slate-50/60"}`}>
      <div className="flex items-center gap-2">
        {icon && <span className="text-base">{icon}</span>}
        <span className={`text-sm font-bold ${d?"text-white":"text-slate-800"}`}>{title}</span>
      </div>
      {extra}
    </div>
  );
}

// ── HBar ─────────────────────────────────────────────────────────
function HBar({ data, valueKey="count", labelKey="_id", gradient, d }) {
  if (!data?.length) return <p className={`text-sm text-center py-6 ${d?"text-slate-600":"text-slate-400"}`}>No data</p>;
  const max = Math.max(...data.map(x=>x[valueKey]||0), 1);
  return (
    <div className="space-y-3">
      {data.map((item,i)=>(
        <div key={i} className="flex items-center gap-3">
          <div className={`w-28 text-xs font-medium text-right shrink-0 truncate capitalize ${d?"text-slate-400":"text-slate-500"}`}>
            {String(item[labelKey]||"—").replace(/_/g," ")}
          </div>
          <div className={`flex-1 h-3 rounded-full overflow-hidden ${d?"bg-slate-800":"bg-slate-100"}`}>
            <div className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all duration-700`} style={{width:`${((item[valueKey]||0)/max)*100}%`}}/>
          </div>
          <div className={`w-8 text-xs font-bold text-right ${d?"text-slate-200":"text-slate-700"}`}>{item[valueKey]}</div>
        </div>
      ))}
    </div>
  );
}

// ── MetricRow ────────────────────────────────────────────────────
function MetricRow({ label, value, color, d }) {
  return (
    <div className={`flex items-center justify-between py-2.5 border-b last:border-0 ${d?"border-white/[0.04]":"border-slate-50"}`}>
      <span className={`text-xs font-medium ${d?"text-slate-400":"text-slate-500"}`}>{label}</span>
      <span className={`text-sm font-bold ${color}`}>{value ?? 0}</span>
    </div>
  );
}

// ── Report Status Badge ──────────────────────────────────────────
function ReportCard({ id, count, d }) {
  const map = {
    pending:      { dark:"bg-yellow-500/15 text-yellow-400 border-yellow-500/30", light:"bg-yellow-50 text-yellow-700 border-yellow-200", grad:"from-yellow-500 to-amber-400" },
    action_taken: { dark:"bg-emerald-500/15 text-emerald-400 border-emerald-500/30", light:"bg-emerald-50 text-emerald-700 border-emerald-200", grad:"from-emerald-500 to-teal-400" },
    rejected:     { dark:"bg-red-500/15 text-red-400 border-red-500/30", light:"bg-red-50 text-red-700 border-red-200", grad:"from-red-500 to-rose-400" },
    under_review: { dark:"bg-blue-500/15 text-blue-400 border-blue-500/30", light:"bg-blue-50 text-blue-700 border-blue-200", grad:"from-blue-500 to-indigo-400" },
  };
  const c = map[id] || map.under_review;
  return (
    <div className={`p-4 rounded-xl border text-center ${d?c.dark:c.light}`}>
      <p className={`text-2xl font-black ${d?c.dark.split(" ")[1]:c.light.split(" ")[1]}`}>{count}</p>
      <p className={`text-xs capitalize mt-1 font-semibold ${d?"text-slate-400":"text-slate-500"}`}>{(id||"—").replace(/_/g," ")}</p>
      <div className={`mt-2 h-1 rounded-full bg-gradient-to-r ${c.grad} opacity-60`}/>
    </div>
  );
}

// ── Messages Sparkline (vertical bar chart) ──────────────────────
function MsgChart({ data, d }) {
  if (!data?.length) return <p className={`text-sm text-center py-10 ${d?"text-slate-600":"text-slate-400"}`}>No message data</p>;
  const max = Math.max(...data.map(x=>x.count||0), 1);
  return (
    <div className="flex items-end gap-2 h-36 pt-4">
      {data.map((day,i)=>{
        const pct = ((day.count||0)/max)*100;
        const label = day._id?.split("-").slice(1).join("/")||"—";
        return (
          <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1 group/b">
            <div className={`absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-bold px-1.5 py-0.5 rounded-md opacity-0 group-hover/b:opacity-100 transition-opacity whitespace-nowrap z-10 ${d?"bg-slate-700 text-white":"bg-slate-800 text-white"}`}>
              {day.count}
            </div>
            <div
              className="w-full rounded-t-md bg-gradient-to-t from-violet-500 to-indigo-400 transition-all duration-700 cursor-pointer relative group-hover/b:from-violet-400 group-hover/b:to-indigo-300"
              style={{height:`${Math.max(pct,6)}%`}}
            />
            <span className={`text-[9px] ${d?"text-slate-600":"text-slate-400"}`}>{label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── GroupSession Status Row ──────────────────────────────────────
function GroupStatusRow({ id, count, total, d }) {
  const pct = total>0 ? Math.round((count/total)*100) : 0;
  const gradMap = { active:"from-emerald-500 to-teal-400", completed:"from-blue-500 to-indigo-400", pending:"from-amber-500 to-yellow-400", cancelled:"from-red-500 to-rose-400" };
  const grad = gradMap[id]||"from-slate-500 to-slate-400";
  return (
    <div className={`p-3 rounded-xl border ${d?"border-white/5 bg-white/[0.02]":"border-slate-100 bg-slate-50"}`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs font-semibold capitalize ${d?"text-slate-300":"text-slate-600"}`}>{id||"unknown"}</span>
        <span className={`text-sm font-black ${d?"text-white":"text-slate-800"}`}>{count}</span>
      </div>
      <div className={`h-1.5 rounded-full overflow-hidden ${d?"bg-slate-800":"bg-slate-200"}`}>
        <div className={`h-full bg-gradient-to-r ${grad} rounded-full transition-all duration-700`} style={{width:`${pct}%`}}/>
      </div>
      <p className={`text-xs text-right mt-0.5 ${d?"text-slate-600":"text-slate-400"}`}>{pct}%</p>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────
export default function PlatformAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isDarkMode: d } = useTheme();

  const load = () => { setLoading(true); API.get("/admin/platform-stats").then(r=>setData(r.data.data)).catch(console.error).finally(()=>setLoading(false)); };
  useEffect(()=>{load();},[]);

  const dt = data||{};
  const ws = dt.walletStats||{};
  const groupTotal = (dt.groupSessionsByStatus||[]).reduce((s,x)=>s+(x.count||0),0)||1;

  if (loading && !data) return (
    <div className={`min-h-screen flex flex-col gap-6 p-6 ${d?"bg-[#060912]":"bg-slate-50"}`}>
      <div className={`h-10 w-64 rounded-xl animate-pulse ${d?"bg-white/5":"bg-slate-200"}`}/>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_,i)=><div key={i} className={`h-24 rounded-2xl animate-pulse ${d?"bg-white/5":"bg-slate-200"}`}/>)}
      </div>
      <div className={`h-48 rounded-2xl animate-pulse ${d?"bg-white/5":"bg-slate-200"}`}/>
    </div>
  );

  return (
    <div className={`min-h-screen transition-colors duration-300 ${d?"bg-[#060912]":"bg-slate-50"}`}>
      <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent"/>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <GlobeIcon cls="w-6 h-6 text-white"/>
            </div>
            <div>
              <h1 className={`text-2xl font-black tracking-tight ${d?"text-white":"text-slate-900"}`}>Platform Analytics</h1>
              <p className={`text-sm font-medium mt-0.5 ${d?"text-slate-400":"text-slate-500"}`}>Chat, wallets, notifications, group sessions &amp; safety reports</p>
            </div>
          </div>
          <button onClick={load} disabled={loading}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-60 shadow-md ${
              d?"bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/25":"bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200"}`}>
            <RefreshIcon cls="w-4 h-4" spin={loading}/>{loading?"Loading…":"Refresh"}
          </button>
        </div>

        {/* ── 8 Stat Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Messages Sent"  value={dt.totalMessages}       accent="violet"  emoji="💬" d={d}/>
          <StatCard label="Conversations"  value={dt.totalConversations}  accent="purple"  emoji="🗨️" d={d}/>
          <StatCard label="Notifications"  value={dt.totalNotifications}  accent="blue"    emoji="🔔" d={d}/>
          <StatCard label="Unread Notifs"  value={dt.unreadNotifications} accent="orange"  emoji="📩" d={d}/>
          <StatCard label="Group Sessions" value={dt.totalGroupSessions}  accent="teal"    emoji="👥" d={d}/>
          <StatCard label="Active Groups"  value={dt.activeGroupSessions} accent="emerald" emoji="✅" d={d}/>
          <StatCard label="Total Reports"  value={dt.totalReports}        accent="red"     emoji="🚨" d={d}/>
          <StatCard label="Transactions"   value={dt.totalTransactions}   accent="cyan"    emoji="💸" d={d}/>
        </div>

        {/* ── 3 Detail Cards Row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Wallet Summary */}
          <Card d={d}>
            <CardHeader title="Wallet Summary" icon="💰" d={d}/>
            <div className="px-5 py-4">
              <MetricRow label="Total Wallets"   value={ws.totalWallets} color={d?"text-cyan-400":"text-cyan-600"} d={d}/>
              <MetricRow label="Platform Balance" value={`${(ws.totalBalance||0).toFixed(2)} TC`} color={d?"text-emerald-400":"text-emerald-600"} d={d}/>
              <MetricRow label="Avg Balance"     value={`${(ws.avgBalance||0).toFixed(2)} TC`} color={d?"text-blue-400":"text-blue-600"} d={d}/>
              <MetricRow label="Transactions"    value={dt.totalTransactions} color={d?"text-violet-400":"text-violet-600"} d={d}/>

              {(dt.txStats||[]).length > 0 && (
                <div className={`mt-4 pt-3 border-t ${d?"border-white/5":"border-slate-100"}`}>
                  <p className={`text-xs font-semibold mb-3 ${d?"text-slate-500":"text-slate-400"}`}>By Transaction Type</p>
                  <HBar data={(dt.txStats||[]).slice(0,5)} gradient={d?"from-cyan-500 to-teal-400":"from-cyan-400 to-teal-500"} d={d}/>
                </div>
              )}
            </div>
          </Card>

          {/* Notifications */}
          <Card d={d}>
            <CardHeader title="Notification Types" icon="🔔" d={d}
              extra={
                <div className="flex items-center gap-3">
                  <span className={`text-xs ${d?"text-slate-500":"text-slate-400"}`}>Unread: <span className={`font-bold ${d?"text-orange-400":"text-orange-600"}`}>{fmt(dt.unreadNotifications)}</span></span>
                </div>
              }
            />
            <div className="px-5 py-4">
              <HBar data={(dt.notifByType||[]).slice(0,8)} gradient={d?"from-blue-500 to-indigo-400":"from-blue-400 to-indigo-500"} d={d}/>
              <div className={`mt-4 pt-3 border-t flex justify-between text-xs ${d?"border-white/5 text-slate-500":"border-slate-100 text-slate-400"}`}>
                <span>Total: <span className={`font-bold ${d?"text-blue-400":"text-blue-600"}`}>{fmt(dt.totalNotifications)}</span></span>
              </div>
            </div>
          </Card>

          {/* Group Sessions */}
          <Card d={d}>
            <CardHeader title="Group Sessions" icon="👥" d={d}
              extra={
                <div className="flex items-center gap-3">
                  <span className={`text-xs ${d?"text-slate-500":"text-slate-400"}`}>Active: <span className={`font-bold ${d?"text-emerald-400":"text-emerald-600"}`}>{fmt(dt.activeGroupSessions)}</span></span>
                </div>
              }
            />
            <div className="px-5 py-4 space-y-2">
              {(dt.groupSessionsByStatus||[]).length > 0 ? (
                (dt.groupSessionsByStatus||[]).map(s => (
                  <GroupStatusRow key={s._id} id={s._id} count={s.count} total={groupTotal} d={d}/>
                ))
              ) : <p className={`text-sm text-center py-6 ${d?"text-slate-600":"text-slate-400"}`}>No group session data</p>}
            </div>
          </Card>
        </div>

        {/* ── Messages Chart ── */}
        <Card d={d}>
          <CardHeader title="Messages per Day — Last 7 Days" icon="💬" d={d}/>
          <div className="px-5 pb-5 pt-3">
            <MsgChart data={dt.msgPerDay} d={d}/>
            {(dt.msgPerDay||[]).length > 0 && (
              <div className={`flex items-center justify-between mt-3 pt-3 border-t text-xs ${d?"border-white/5 text-slate-500":"border-slate-100 text-slate-400"}`}>
                <span>Oldest</span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-sm bg-gradient-to-r from-violet-500 to-indigo-400 inline-block"/> Messages
                </span>
                <span>Latest</span>
              </div>
            )}
          </div>
        </Card>

        {/* ── Reports Breakdown ── */}
        <Card d={d}>
          <CardHeader title="Safety Reports Breakdown" icon="🚨" d={d}
            extra={<span className={`px-2 py-0.5 rounded-full text-xs font-bold ${d?"bg-red-500/15 text-red-400":"bg-red-50 text-red-600"}`}>{dt.totalReports||0} total</span>}
          />
          <div className="p-5">
            {(dt.reportsByStatus||[]).length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {(dt.reportsByStatus||[]).map(r => (
                  <ReportCard key={r._id} id={r._id} count={r.count} d={d}/>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 flex flex-col items-center gap-2">
                <span className="text-3xl">🛡️</span>
                <p className={`text-sm font-semibold ${d?"text-slate-300":"text-slate-700"}`}>No reports yet</p>
                <p className={`text-xs ${d?"text-slate-500":"text-slate-400"}`}>Platform is looking safe!</p>
              </div>
            )}
          </div>
        </Card>

      </div>
    </div>
  );
}

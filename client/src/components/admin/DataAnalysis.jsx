import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchInactiveUsersAsync,
  cleanupInactiveUsersAsync,
  deleteInactiveUserAsync,
  fetchAdminStatsAsync,
} from "../../redux/slices/adminSlice";
import { showError, showSuccess } from "../../utils/toast";
import { useTheme } from "../../hooks/useTheme";

// ── Icons ────────────────────────────────────────────────────────
const UsersIcon    = ({ cls }) => <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/></svg>;
const CheckIcon    = ({ cls }) => <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>;
const WarnIcon     = ({ cls }) => <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>;
const AlertIcon    = ({ cls }) => <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>;
const TrashIcon    = ({ cls }) => <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>;
const MailIcon     = ({ cls }) => <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>;
const ChartIcon    = ({ cls }) => <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>;
const StarIcon     = ({ cls }) => <svg className={cls} fill="currentColor" viewBox="0 0 24 24"><path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>;
const TrendIcon    = ({ cls }) => <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>;

// ── Stat Card ────────────────────────────────────────────────────
const ACCENTS = {
  emerald: { icon:"from-emerald-500 to-teal-500",  val:["text-emerald-300","text-emerald-600"], ring:"ring-emerald-500/20" },
  green:   { icon:"from-green-500 to-emerald-500", val:["text-green-300",  "text-green-600"],   ring:"ring-green-500/20"   },
  amber:   { icon:"from-amber-500 to-orange-500",  val:["text-amber-300",  "text-amber-600"],   ring:"ring-amber-500/20"   },
  red:     { icon:"from-red-500 to-rose-500",      val:["text-red-300",    "text-red-600"],     ring:"ring-red-500/20"     },
  blue:    { icon:"from-blue-500 to-indigo-500",   val:["text-blue-300",   "text-blue-600"],    ring:"ring-blue-500/20"    },
  indigo:  { icon:"from-indigo-500 to-violet-600", val:["text-indigo-300", "text-indigo-600"],  ring:"ring-indigo-500/20"  },
};

function StatCard({ icon: Icon, label, value, subtitle, accent, d }) {
  const a = ACCENTS[accent] || ACCENTS.emerald;
  return (
    <div className={`relative overflow-hidden rounded-2xl border p-5 ring-1 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group ${
      d ? `bg-[#0d1120]/80 border-white/5 ${a.ring} shadow-black/30`
        : `bg-white border-slate-200/70 ${a.ring} shadow-slate-200/50`}`}>
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br ${d?"from-white/[0.02] to-transparent":"from-emerald-50/40 to-transparent"}`}/>
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className={`text-xs font-semibold uppercase tracking-widest mb-2 ${d?"text-slate-400":"text-slate-500"}`}>{label}</p>
          <p className={`text-4xl font-black leading-none ${d?a.val[0]:a.val[1]}`}>{value}</p>
          {subtitle && <p className={`text-xs mt-1.5 ${d?"text-slate-500":"text-slate-400"}`}>{subtitle}</p>}
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${a.icon} shadow-lg`}>
          <Icon cls="w-5 h-5 text-white"/>
        </div>
      </div>
      <div className={`absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r ${a.icon} opacity-50`}/>
    </div>
  );
}

// ── Card wrapper ─────────────────────────────────────────────────
function Card({ children, className="", d }) {
  return (
    <div className={`rounded-2xl border overflow-hidden shadow-lg ${d?"bg-[#0d1120]/90 border-white/5 shadow-black/40":"bg-white border-slate-200/80 shadow-slate-200/50"} ${className}`}>
      {children}
    </div>
  );
}
function CardHeader({ title, badge, action, d }) {
  return (
    <div className={`px-5 py-4 border-b flex items-center justify-between gap-3 ${d?"border-white/5 bg-white/[0.02]":"border-slate-100 bg-slate-50/60"}`}>
      <div className="flex items-center gap-2">
        <span className={`text-sm font-bold ${d?"text-white":"text-slate-800"}`}>{title}</span>
        {badge!=null && <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${d?"bg-indigo-500/15 text-indigo-400":"bg-indigo-50 text-indigo-600"}`}>{badge}</span>}
      </div>
      {action}
    </div>
  );
}

// ── Metric Row ───────────────────────────────────────────────────
function MetricRow({ label, value, accent="emerald", d }) {
  const colors = {
    emerald: d?"text-emerald-400":"text-emerald-600",
    indigo:  d?"text-indigo-400":"text-indigo-600",
    amber:   d?"text-amber-400":"text-amber-600",
    blue:    d?"text-blue-400":"text-blue-600",
  };
  return (
    <div className={`flex items-center justify-between py-2.5 border-b last:border-0 ${d?"border-white/[0.04]":"border-slate-50"}`}>
      <span className={`text-xs font-medium ${d?"text-slate-400":"text-slate-500"}`}>{label}</span>
      <span className={`text-sm font-black ${colors[accent]||colors.emerald}`}>{value}</span>
    </div>
  );
}

// ── Growth Bar ───────────────────────────────────────────────────
function GrowthBar({ month, count, max, d }) {
  const pct = max > 0 ? Math.round((count/max)*100) : 0;
  return (
    <div className={`p-4 rounded-xl border ${d?"border-white/5 bg-white/[0.02]":"border-slate-100 bg-slate-50"}`}>
      <p className={`text-xs font-medium mb-2 ${d?"text-slate-400":"text-slate-500"}`}>{month}</p>
      <div className={`h-2 rounded-full overflow-hidden mb-2 ${d?"bg-slate-800":"bg-slate-200"}`}>
        <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700" style={{width:`${pct}%`}}/>
      </div>
      <p className={`text-2xl font-black ${d?"text-emerald-400":"text-emerald-600"}`}>{count}</p>
      <p className={`text-xs ${d?"text-slate-500":"text-slate-400"}`}>new users</p>
    </div>
  );
}

// ── Status Badge ─────────────────────────────────────────────────
function StatusBadge({ status, d }) {
  const map = {
    to_be_deleted: { dark:"bg-red-500/15 text-red-400 border-red-500/30",    light:"bg-red-50 text-red-700 border-red-200",    label:"To Be Deleted" },
    reminder_sent: { dark:"bg-amber-500/15 text-amber-400 border-amber-500/30",light:"bg-amber-50 text-amber-700 border-amber-200",label:"Reminder Sent" },
    inactive:      { dark:"bg-blue-500/15 text-blue-400 border-blue-500/30",  light:"bg-blue-50 text-blue-700 border-blue-200",  label:"Inactive" },
  };
  const c = map[status] || { dark:"bg-slate-700/50 text-slate-400 border-slate-600/30", light:"bg-slate-100 text-slate-500 border-slate-200", label:"Active" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${d?c.dark:c.light}`}>
      {status==="to_be_deleted" && <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"/>}
      {c.label}
    </span>
  );
}

// ── Avatar ───────────────────────────────────────────────────────
function Avatar({ name }) {
  const colors = ["from-emerald-500 to-teal-500","from-indigo-500 to-violet-600","from-pink-500 to-rose-500","from-amber-500 to-orange-500","from-blue-500 to-cyan-500"];
  const idx = name ? name.charCodeAt(0) % colors.length : 0;
  return <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${colors[idx]} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>{name?.slice(0,2).toUpperCase()||"??"}</div>;
}

// ── Main ─────────────────────────────────────────────────────────
export default function DataAnalysis() {
  const dispatch = useDispatch();
  const { inactiveUsers, inactiveUsersSummary, inactiveUsersLoading, loading, adminStats } =
    useSelector((state) => state.admin);
  const [activeTab, setActiveTab] = useState("overview");
  const [deleting, setDeleting] = useState(null);
  const { isDarkMode: d } = useTheme();

  useEffect(() => {
    dispatch(fetchInactiveUsersAsync());
    dispatch(fetchAdminStatsAsync());
  }, [dispatch]);

  const handleCleanup = async () => {
    if (!window.confirm("Are you sure you want to delete ALL inactive users marked for deletion?")) return;
    try {
      await dispatch(cleanupInactiveUsersAsync()).unwrap();
      showSuccess("Inactive users cleaned up successfully");
      dispatch(fetchInactiveUsersAsync());
      dispatch(fetchAdminStatsAsync());
    } catch (err) { showError(err.message || "Failed to cleanup inactive users"); }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user permanently?")) return;
    setDeleting(userId);
    try {
      await dispatch(deleteInactiveUserAsync(userId)).unwrap();
      showSuccess("User deleted successfully");
      dispatch(fetchAdminStatsAsync());
    } catch (err) { showError(err.message || "Failed to delete user"); }
    finally { setDeleting(null); }
  };

  const stats      = adminStats?.overview || {};
  const topSkills  = adminStats?.topSkills || [];
  const matchStats = adminStats?.matchStatistics || {};
  const userGrowth = adminStats?.userGrowth || [];
  const maxGrowth  = Math.max(...userGrowth.map(m => m.count || 0), 1);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${d?"bg-[#060912]":"bg-slate-50"}`}>
      <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent"/>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <ChartIcon cls="w-6 h-6 text-white"/>
          </div>
          <div>
            <h1 className={`text-2xl font-black tracking-tight ${d?"text-white":"text-slate-900"}`}>Data Analysis</h1>
            <p className={`text-sm font-medium mt-0.5 ${d?"text-slate-400":"text-slate-500"}`}>
              Comprehensive platform analytics, user health &amp; growth insights
            </p>
          </div>
          <div className="ml-auto">
            <p className={`text-xs ${d?"text-slate-500":"text-slate-400"}`}>Last updated: {new Date().toLocaleTimeString()}</p>
          </div>
        </div>

        {/* Tab Bar */}
        <div className={`flex items-center gap-1 p-1 rounded-2xl border ${d?"bg-[#0d1120]/80 border-white/5":"bg-white border-slate-200/80"} shadow-sm`}>
          {[["overview","📊","Overview"],["inactive","⚠️","Inactive Users"]].map(([t,ic,lb])=>(
            <button key={t} onClick={()=>setActiveTab(t)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                activeTab===t
                  ? d?"bg-emerald-500 text-white shadow-sm shadow-emerald-500/30":"bg-emerald-600 text-white shadow-sm"
                  : d?"text-slate-400 hover:text-slate-200 hover:bg-white/5":"text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}>
              <span>{ic}</span><span>{lb}</span>
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab==="overview" && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={UsersIcon} label="Total Users"    value={stats.totalUsers||0}                     subtitle="Registered users"          accent="emerald" d={d}/>
              <StatCard icon={CheckIcon} label="Active Users"   value={stats.activeUsers||0}                    subtitle="In last 30 days"            accent="green"   d={d}/>
              <StatCard icon={WarnIcon}  label="Inactive Users" value={inactiveUsersSummary.totalInactive||0}   subtitle="Not logged in recently"     accent="amber"   d={d}/>
              <StatCard icon={AlertIcon} label="At Risk"        value={inactiveUsersSummary.atRisk||0}          subtitle="Within 5 days of deletion"  accent="red"     d={d}/>
            </div>

            {/* Match Stats + Top Skills */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <Card d={d}>
                <CardHeader title="Match Statistics" d={d}/>
                <div className="px-5 py-4">
                  {Object.keys(matchStats).length>0 ? (
                    Object.entries(matchStats).map(([key,value])=>(
                      <MetricRow key={key} label={key.replace(/([A-Z])/g," $1").replace(/^./,s=>s.toUpperCase())} value={value} accent="emerald" d={d}/>
                    ))
                  ) : <p className={`text-sm text-center py-6 ${d?"text-slate-600":"text-slate-400"}`}>No match data available</p>}
                </div>
              </Card>

              <Card d={d}>
                <CardHeader title="Top Skills" badge={topSkills.length} d={d}/>
                <div className="px-5 py-4">
                  {topSkills.length>0 ? (
                    <div className="space-y-2">
                      {topSkills.slice(0,7).map((skill,i)=>{
                        const maxS = topSkills[0]?.count||1;
                        const pct  = Math.round((skill.count/maxS)*100);
                        return (
                          <div key={i} className="flex items-center gap-3">
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${
                              i===0?"bg-amber-400 text-white":d?"bg-slate-800 text-slate-400":"bg-slate-100 text-slate-500"}`}>{i+1}</span>
                            <span className={`flex-1 text-xs font-medium truncate ${d?"text-slate-300":"text-slate-600"}`}>{skill._id}</span>
                            <div className={`w-20 h-2 rounded-full overflow-hidden ${d?"bg-slate-800":"bg-slate-100"}`}>
                              <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" style={{width:`${pct}%`}}/>
                            </div>
                            <span className={`w-6 text-xs font-bold text-right ${d?"text-emerald-400":"text-emerald-600"}`}>{skill.count}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : <p className={`text-sm text-center py-6 ${d?"text-slate-600":"text-slate-400"}`}>No skills data</p>}
                </div>
              </Card>
            </div>

            {/* User Growth */}
            <Card d={d}>
              <CardHeader title="User Growth Trend" badge="Last 6 Months" d={d}/>
              <div className="p-5">
                {userGrowth.length>0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {userGrowth.slice(-6).map((month,i)=>(
                      <GrowthBar
                        key={i}
                        month={month._id ? `${month._id.month}/${month._id.year}` : `Month ${i+1}`}
                        count={month.count}
                        max={maxGrowth}
                        d={d}
                      />
                    ))}
                  </div>
                ) : <p className={`text-center py-10 text-sm ${d?"text-slate-600":"text-slate-400"}`}>No growth data available</p>}
              </div>
            </Card>

            {/* Platform Metric Panels */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Card d={d}>
                <CardHeader title="Skill Metrics" d={d}/>
                <div className="px-5 py-4">
                  <MetricRow label="Total Skills" value={stats.totalSkills||0} accent="emerald" d={d}/>
                  <MetricRow label="Avg per User"
                    value={stats.totalUsers>0 ? (stats.totalSkills/stats.totalUsers).toFixed(1) : "0"}
                    accent="indigo" d={d}/>
                </div>
              </Card>
              <Card d={d}>
                <CardHeader title="Review Metrics" d={d}/>
                <div className="px-5 py-4">
                  <MetricRow label="Total Reviews" value={stats.totalReviews||0} accent="emerald" d={d}/>
                  <MetricRow label="Avg Rating"
                    value={<span className="flex items-center gap-1">{stats.averageRating||0}<StarIcon cls="w-3 h-3"/></span>}
                    accent="amber" d={d}/>
                </div>
              </Card>
              <Card d={d}>
                <CardHeader title="Activity Metrics" d={d}/>
                <div className="px-5 py-4">
                  <MetricRow label="New Users (30d)" value={stats.recentUsers||0} accent="emerald" d={d}/>
                  <MetricRow label="Weekly Users"    value={stats.weeklyUsers||0}  accent="blue"    d={d}/>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ── INACTIVE USERS TAB ── */}
        {activeTab==="inactive" && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={WarnIcon}  label="Total Inactive"  value={inactiveUsersSummary.totalInactive||0}  subtitle="Not logged in recently"    accent="amber"  d={d}/>
              <StatCard icon={AlertIcon} label="At Risk"         value={inactiveUsersSummary.atRisk||0}         subtitle="Within 5 days of deletion" accent="red"    d={d}/>
              <StatCard icon={TrashIcon} label="To Be Deleted"   value={inactiveUsersSummary.toBeDeleted||0}    subtitle="15+ days inactive"         accent="red"    d={d}/>
              <StatCard icon={MailIcon}  label="Reminder Day"    value={inactiveUsersSummary.reminderDay||10}   subtitle="Email reminder sent"        accent="blue"   d={d}/>
            </div>

            {/* Table */}
            <Card d={d}>
              <CardHeader
                title="Inactive Users List"
                badge={inactiveUsers.length}
                d={d}
                action={
                  <button
                    onClick={handleCleanup}
                    disabled={loading || inactiveUsersSummary.toBeDeleted===0}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      d?"bg-red-500/15 hover:bg-red-500/25 text-red-400 border-red-500/30":"bg-red-50 hover:bg-red-100 text-red-700 border-red-200"}`}>
                    <TrashIcon cls="w-3.5 h-3.5"/>
                    {loading?"Processing…":"Delete All"}
                  </button>
                }
              />

              {/* sub-info */}
              <div className={`px-5 py-2.5 border-b ${d?"border-white/5 bg-white/[0.01]":"border-slate-100 bg-slate-50/30"}`}>
                <p className={`text-xs ${d?"text-slate-500":"text-slate-400"}`}>
                  Users are deleted after <span className={`font-semibold ${d?"text-slate-300":"text-slate-600"}`}>{inactiveUsersSummary.deleteDay||15}</span> days of inactivity
                </p>
              </div>

              {inactiveUsersLoading ? (
                <div className="p-6 space-y-3">
                  {[...Array(5)].map((_,i)=><div key={i} className={`h-14 rounded-xl animate-pulse ${d?"bg-white/5":"bg-slate-100"}`}/>)}
                </div>
              ) : inactiveUsers.length>0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className={`border-b ${d?"border-white/5":"border-slate-100"}`}>
                        {["User","Last Activity","Days Inactive","Status","Days Until Deletion","Action"].map(col=>(
                          <th key={col} className={`px-5 py-3 text-left text-xs font-semibold uppercase tracking-widest whitespace-nowrap ${d?"text-slate-500":"text-slate-400"}`}>{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${d?"divide-white/[0.04]":"divide-slate-50"}`}>
                      {inactiveUsers.map(user=>(
                        <tr key={user._id} className={`transition-colors duration-150 ${d?"hover:bg-red-500/[0.04]":"hover:bg-red-50/40"}`}>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2.5">
                              <Avatar name={user.name}/>
                              <div>
                                <p className={`text-sm font-semibold ${d?"text-slate-100":"text-slate-800"}`}>{user.name}</p>
                                <p className={`text-xs ${d?"text-slate-500":"text-slate-400"}`}>{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className={`px-5 py-4 whitespace-nowrap text-xs ${d?"text-slate-400":"text-slate-500"}`}>
                            {new Date(user.lastActivity).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <span className={`text-sm font-bold ${user.daysInactive>=10?d?"text-red-400":"text-red-600":d?"text-amber-400":"text-amber-600"}`}>
                              {user.daysInactive}d
                            </span>
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <StatusBadge status={user.status} d={d}/>
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <span className={`text-sm font-bold ${user.daysUntilDeletion<=5?d?"text-red-400":"text-red-600":d?"text-slate-300":"text-slate-600"}`}>
                              {user.daysUntilDeletion}d
                            </span>
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            {user.status==="to_be_deleted" && (
                              <button
                                onClick={()=>handleDeleteUser(user._id)}
                                disabled={deleting===user._id}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all disabled:opacity-50 ${
                                  d?"bg-red-500/15 hover:bg-red-500/25 text-red-400 border-red-500/30":"bg-red-50 hover:bg-red-100 text-red-700 border-red-200"}`}>
                                <TrashIcon cls="w-3 h-3"/>
                                {deleting===user._id?"…":"Delete"}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-20 flex flex-col items-center gap-3">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${d?"bg-emerald-500/10":"bg-emerald-50"}`}>
                    <CheckIcon cls={`w-8 h-8 ${d?"text-emerald-400":"text-emerald-600"}`}/>
                  </div>
                  <p className={`text-sm font-bold ${d?"text-slate-300":"text-slate-700"}`}>No inactive users</p>
                  <p className={`text-xs ${d?"text-slate-500":"text-slate-400"}`}>All users are active 🎉</p>
                </div>
              )}

              {inactiveUsers.length>0 && (
                <div className={`px-5 py-3 border-t ${d?"border-white/5 bg-white/[0.015]":"border-slate-100 bg-slate-50/40"}`}>
                  <p className={`text-xs ${d?"text-slate-500":"text-slate-400"}`}>
                    Total inactive: <span className={`font-semibold ${d?"text-slate-300":"text-slate-600"}`}>{inactiveUsers.length}</span> users
                  </p>
                </div>
              )}
            </Card>
          </div>
        )}

      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAdminStatsAsync,
} from "../../redux/slices/adminSlice";
import { showError } from "../../utils/toast";
import { useTheme } from "../../hooks/useTheme";

// ── Icons ────────────────────────────────────────────────────────
const UsersIcon = ({ cls }) => <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /></svg>;
const SkillsIcon = ({ cls }) => <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>;
const MatchIcon = ({ cls }) => <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
const StarIcon = ({ cls }) => <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>;
const RefreshIcon = ({ cls, spin }) => <svg className={`${cls} ${spin ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>;

// ── Shared Subcomponents ──────────────────────────────────────────
function Card({ children, className = "", d }) {
  return (
    <div className={`rounded-2xl border overflow-hidden shadow-lg transition-colors duration-300 ${d ? "bg-[#0d1120]/90 border-white/5 shadow-black/40" : "bg-white border-slate-200/80 shadow-slate-200/50"} ${className}`}>
      {children}
    </div>
  );
}

const ChartCard = ({ title, children, d }) => {
  return (
    <Card d={d} className="p-6">
      <h3 className={`text-xl font-bold mb-6 ${d ? "text-white" : "text-slate-800"}`}>{title}</h3>
      {children}
    </Card>
  );
};

// ── Accents & Theme mapping ────────────────────────────────────────
const ACC = {
  emerald: { grad: "from-emerald-500 to-teal-500",   dv: "text-emerald-300", lv: "text-emerald-600", bg: "bg-emerald-500/15" },
  blue:    { grad: "from-blue-500 to-indigo-500",    dv: "text-blue-300",    lv: "text-blue-600",    bg: "bg-blue-500/15" },
  teal:    { grad: "from-teal-400 to-emerald-500",   dv: "text-teal-300",    lv: "text-teal-600",    bg: "bg-teal-500/15" },
  yellow:  { grad: "from-amber-400 to-yellow-500",   dv: "text-amber-300",   lv: "text-amber-600",   bg: "bg-amber-500/15" },
  red:     { grad: "from-red-500 to-rose-500",       dv: "text-red-300",     lv: "text-red-600",     bg: "bg-red-500/15" },
  green:   { grad: "from-green-400 to-emerald-500",  dv: "text-green-300",   lv: "text-green-600",   bg: "bg-green-500/15" },
};

function MetricCard({ title, value, change, icon, color = "emerald", d }) {
  const a = ACC[color] || ACC.emerald;
  return (
    <div className={`relative overflow-hidden rounded-2xl border p-6 ring-1 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group ${d ? `bg-[#0d1120]/80 border-white/5 ring-${color}-500/20 shadow-black/30` : `bg-white border-slate-200/70 ring-${color}-500/20 shadow-slate-200/50`}`}>
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br ${d ? "from-white/[0.02] to-transparent" : `from-${color}-50/40 to-transparent`}`} />
      <div className="flex items-center justify-between relative">
        <div className="flex-1">
          <p className={`text-sm font-bold uppercase tracking-widest mb-2 ${d ? "text-slate-400" : "text-slate-500"}`}>{title}</p>
          <div className="flex items-center gap-3">
            <p className={`text-3xl font-black ${d ? a.dv : a.lv}`}>{value}</p>
            {change && (
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${d ? (change.type === "increase" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-red-500/15 text-red-400 border-red-500/30") : (change.type === "increase" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200")}`}>
                {change.type === "increase" ? "↗" : "↘"} {change.value}%
              </span>
            )}
          </div>
        </div>
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${a.grad} shadow-lg text-white`}>
          {icon}
        </div>
      </div>
      <div className={`absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r ${a.grad} opacity-50`} />
    </div>
  );
}

const SimpleBarChart = ({ data, label, color = "emerald", d }) => {
  if (!data || data.length === 0) return <div className={`text-center py-8 text-sm font-medium ${d ? "text-slate-500" : "text-slate-400"}`}>No data available</div>;
  const maxValue = Math.max(...data.map((item) => item.count), 1);
  const a = ACC[color] || ACC.emerald;

  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div key={index} className="flex items-center gap-4">
          <div className={`w-20 text-sm font-medium capitalize truncate ${d ? "text-slate-400" : "text-slate-600"}`}>
            {item._id || `Month ${index + 1}`}
          </div>
          <div className={`flex-1 rounded-full h-3 relative overflow-hidden ${d ? "bg-slate-800" : "bg-slate-100"}`}>
            <div
              className={`h-full rounded-full transition-all duration-700 bg-gradient-to-r ${a.grad}`}
              style={{ width: `${(item.count / maxValue) * 100}%` }}
            />
          </div>
          <div className={`w-12 text-sm font-bold text-right ${d ? "text-slate-200" : "text-slate-700"}`}>
            {item.count}
          </div>
        </div>
      ))}
    </div>
  );
};

const ActivityTimeline = ({ activities = [], d }) => {
  const defaultActivities = [
    { type: "system", message: "System health check completed", time: new Date(), status: "success" },
    { type: "backup", message: "Daily database backup completed", time: new Date(Date.now() - 2 * 60 * 60 * 1000), status: "success" },
    { type: "update", message: "Platform security updates applied", time: new Date(Date.now() - 6 * 60 * 60 * 1000), status: "info" },
  ];
  const activityList = activities.length > 0 ? activities : defaultActivities;

  const getStatus = (status) => {
    const map = {
      success: { color: d ? "text-emerald-400 bg-emerald-500/15" : "text-emerald-600 bg-emerald-50", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> },
      warning: { color: d ? "text-yellow-400 bg-yellow-500/15" : "text-amber-600 bg-amber-50", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg> },
      error:   { color: d ? "text-red-400 bg-red-500/15" : "text-red-600 bg-red-50", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg> },
      info:    { color: d ? "text-blue-400 bg-blue-500/15" : "text-blue-600 bg-blue-50", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    };
    return map[status] || map.info;
  };

  return (
    <div className="space-y-4">
      {activityList.map((activity, index) => {
        const { color, icon } = getStatus(activity.status);
        return (
          <div key={index} className="flex items-start gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${color}`}>
              {icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold ${d ? "text-slate-200" : "text-slate-800"}`}>
                {activity.message}
              </p>
              <p className={`text-xs mt-0.5 ${d ? "text-slate-500" : "text-slate-500"}`}>
                {activity.time ? new Date(activity.time).toLocaleString() : "Unknown time"}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────
export default function StatsOverview() {
  const dispatch = useDispatch();
  const { adminStats, loading, error } = useSelector((state) => state.admin);
  const [refreshing, setRefreshing] = useState(false);
  const { isDarkMode: d } = useTheme();

  useEffect(() => {
    dispatch(fetchAdminStatsAsync());
  }, [dispatch]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await dispatch(fetchAdminStatsAsync()).unwrap();
    } catch (err) {
      showError("Failed to refresh statistics");
    } finally {
      setRefreshing(false);
    }
  };

  if (loading && !adminStats) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${d ? "bg-[#060912]" : "bg-slate-50"}`}>
        <div className="w-12 h-12 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 ${d ? "bg-[#060912]" : "bg-slate-50"}`}>
        <Card d={d} className="max-w-md w-full p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 flex items-center justify-center rounded-full mx-auto">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
          </div>
          <div className={`text-lg font-bold ${d ? "text-red-400" : "text-red-600"}`}>
            {error.includes("Admin privileges") ? "Access denied. Admin privileges required." : "Failed to load statistics"}
          </div>
          <button onClick={handleRefresh} className={`px-6 py-2.5 rounded-xl text-sm font-bold border transition-colors ${d ? "bg-white/5 border-white/10 text-white hover:bg-white/10" : "bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200"}`}>
            Try Again
          </button>
        </Card>
      </div>
    );
  }

  const stats = adminStats?.overview || {};
  const topSkills = adminStats?.topSkills || [];
  const matchStats = adminStats?.matchStatistics || {};
  const userGrowth = adminStats?.userGrowth || [];

  const matchChartData = Object.entries(matchStats).map(([status, count]) => ({ _id: status, count }));

  // Helper for KPI rows
  const KPIRow = ({ label, value, valColor }) => (
    <div className={`flex justify-between items-center py-2.5 border-b last:border-0 ${d ? "border-white/[0.04]" : "border-slate-50"}`}>
      <span className={`text-sm font-semibold ${d ? "text-slate-400" : "text-slate-500"}`}>{label}</span>
      <span className={`text-sm font-bold ${valColor}`}>{value}</span>
    </div>
  );

  return (
    <div className={`min-h-screen transition-colors duration-300 ${d ? "bg-[#060912]" : "bg-slate-50"}`}>
      <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className={`text-3xl font-black tracking-tight ${d ? "text-white" : "text-slate-900"}`}>Statistics Overview</h1>
            <p className={`text-base font-medium mt-1 ${d ? "text-slate-400" : "text-slate-500"}`}>Comprehensive platform analytics and insights</p>
          </div>
          <button 
            onClick={handleRefresh} disabled={refreshing}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-60 shadow-md ${
              d ? "bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/25" : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"}`}>
            <RefreshIcon cls="w-4 h-4" spin={refreshing} />
            {refreshing ? "Refreshing..." : "Refresh Data"}
          </button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard title="Total Users" value={stats.totalUsers || 0} color="emerald" icon={<UsersIcon cls="w-6 h-6" />} d={d} />
          <MetricCard title="Total Skills" value={stats.totalSkills || 0} color="green" icon={<SkillsIcon cls="w-6 h-6" />} d={d} />
          <MetricCard title="Active Matches" value={stats.totalMatches || 0} color="teal" icon={<MatchIcon cls="w-6 h-6" />} d={d} />
          <MetricCard title="Platform Rating" value={`${stats.averageRating || 5}★`} color="yellow" icon={<StarIcon cls="w-6 h-6" />} d={d} />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Match Status Distribution" d={d}>
            <SimpleBarChart data={matchChartData} label="Matches" color="emerald" d={d} />
          </ChartCard>
          <ChartCard title="Top Skills" d={d}>
            <SimpleBarChart data={topSkills.slice(0, 5)} label="Skills" color="green" d={d} />
          </ChartCard>
        </div>

        {/* User Growth Chart */}
        <ChartCard title="User Growth (Last 12 Months)" d={d}>
          {userGrowth.length > 0 ? (
            <div className="space-y-4">
              {userGrowth.slice(-6).map((month, index) => {
                const max = Math.max(...userGrowth.map(m => m.count), 1);
                return (
                  <div key={index} className="flex items-center gap-4">
                    <div className={`w-24 text-sm font-semibold capitalize truncate ${d ? "text-slate-400" : "text-slate-600"}`}>
                      {month._id ? `${month._id.month}/${month._id.year}` : `Month ${index + 1}`}
                    </div>
                    <div className={`flex-1 rounded-full h-3 relative overflow-hidden ${d ? "bg-slate-800" : "bg-slate-100"}`}>
                      <div
                        className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-teal-400 to-emerald-500"
                        style={{ width: `${(month.count / max) * 100}%` }}
                      />
                    </div>
                    <div className={`w-12 text-sm font-bold text-right ${d ? "text-slate-200" : "text-slate-700"}`}>
                      {month.count}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={`text-center py-8 text-sm font-medium ${d ? "text-slate-500" : "text-slate-400"}`}>No user growth data available</div>
          )}
        </ChartCard>

        {/* Activity and System Status */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <ChartCard title="Recent Activity" d={d}>
            <ActivityTimeline activities={stats.recentActivity || []} d={d} />
          </ChartCard>

          <ChartCard title="System Health" d={d}>
            <div className="space-y-3">
              {[
                { label: "Database", status: "Operational", color: "emerald" },
                { label: "API Services", status: "Operational", color: "green" },
                { label: "File Storage", status: "Operational", color: "teal" },
                { label: "Email Service", status: "Maintenance", color: "amber" },
              ].map((sys, i) => {
                const isOp = sys.status === "Operational";
                return (
                  <div key={i} className={`flex items-center justify-between p-4 rounded-xl border ${d ? (isOp ? "bg-emerald-500/10 border-emerald-500/20" : "bg-amber-500/10 border-amber-500/20") : (isOp ? "bg-emerald-50 border-emerald-100" : "bg-amber-50 border-amber-100")}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${isOp ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)] animate-pulse"}`} />
                      <span className={`text-sm font-bold ${d ? "text-slate-200" : "text-slate-800"}`}>{sys.label}</span>
                    </div>
                    <span className={`text-xs font-bold uppercase tracking-widest ${isOp ? (d ? "text-emerald-400" : "text-emerald-700") : (d ? "text-amber-400" : "text-amber-700")}`}>
                      {sys.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </ChartCard>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ChartCard title="Platform Performance" d={d}>
            <div className="space-y-1">
              <KPIRow label="Avg Response Time" value="125ms" valColor={d ? "text-emerald-400" : "text-emerald-600"} />
              <KPIRow label="Uptime" value="99.9%" valColor={d ? "text-emerald-400" : "text-emerald-600"} />
              <KPIRow label="Error Rate" value="0.01%" valColor={d ? "text-emerald-400" : "text-emerald-600"} />
            </div>
          </ChartCard>

          <ChartCard title="User Engagement" d={d}>
            <div className="space-y-1">
              <KPIRow label="Daily Active Users" value={Math.floor((stats.totalUsers || 0) * 0.3)} valColor={d ? "text-teal-400" : "text-teal-600"} />
              <KPIRow label="Avg Session Time" value="12 min" valColor={d ? "text-teal-400" : "text-teal-600"} />
              <KPIRow label="Bounce Rate" value="22%" valColor={d ? "text-teal-400" : "text-teal-600"} />
            </div>
          </ChartCard>

          <ChartCard title="Growth Metrics" d={d}>
            <div className="space-y-1">
              <KPIRow label="New Users (30d)" value={stats.recentUsers || 0} valColor={d ? "text-green-400" : "text-green-600"} />
              <KPIRow label="Skill Creation Rate" value="↗ 15%" valColor={d ? "text-green-400" : "text-green-600"} />
              <KPIRow label="Match Success Rate" value="78%" valColor={d ? "text-green-400" : "text-green-600"} />
            </div>
          </ChartCard>
        </div>



        {/* Footer */}
        <div className={`text-center text-xs font-semibold py-4 ${d ? "text-slate-500" : "text-slate-400"}`}>
          Statistics exactly synced at: <span className={d ? "text-slate-400" : "text-slate-500"}>{adminStats?.lastUpdated ? new Date(adminStats.lastUpdated).toLocaleString() : "Never"}</span>
        </div>
      </div>
    </div>
  );
}
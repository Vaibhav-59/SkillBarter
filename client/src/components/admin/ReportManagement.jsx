// components/admin/ReportManagement.jsx
import { useState, useEffect } from "react";
import { Loader2, Shield, Flag, CheckCircle, XCircle, Clock, Eye, RefreshCw, BarChart3, AlertTriangle } from "lucide-react";
import { getAllReports, takeReportAction, getUsersAnalysis } from "../../services/reportApi";
import { toast } from "react-toastify";
import { useTheme } from "../../hooks/useTheme";

const STATUS_OPTIONS = ["pending", "under_review", "action_taken", "rejected"];
const TYPE_OPTIONS = ["user", "post", "message", "session", "resource"];

const REASON_LABEL = {
  spam: "Spam", fraud: "Fraud", fake_profile: "Fake Profile",
  harassment: "Harassment", inappropriate_content: "Inappropriate",
  misleading_information: "Misleading", other: "Other",
};

// ── Shared Subcomponents ──────────────────────────────────────────
function Avatar({ src, name }) {
  const colors = ["from-red-500 to-rose-600", "from-orange-500 to-amber-500", "from-violet-500 to-purple-600", "from-blue-500 to-indigo-500", "from-emerald-500 to-teal-500"];
  const idx = name ? name.charCodeAt(0) % colors.length : 0;
  if (src && !src.includes("dicebear.com/7.x/initials")) return <img src={src} alt={name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />;
  return <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${colors[idx]} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>{name?.slice(0, 2).toUpperCase() || "??"}</div>;
}

function Card({ children, className = "", d }) {
  return (
    <div className={`rounded-2xl border overflow-hidden shadow-lg transition-colors duration-300 ${
      d ? "bg-[#0d1120]/90 border-white/5 shadow-black/40" : "bg-white border-slate-200/80 shadow-slate-200/50"
    } ${className}`}>
      {children}
    </div>
  );
}

function CardHeader({ title, badge, d, action }) {
  return (
    <div className={`px-5 py-4 border-b flex items-center justify-between gap-3 ${d ? "border-white/5 bg-white/[0.02]" : "border-slate-100 bg-slate-50/60"}`}>
      <div className="flex items-center gap-2">
        <span className={`text-sm font-bold ${d ? "text-white" : "text-slate-800"}`}>{title}</span>
        {badge != null && <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${d ? "bg-red-500/15 text-red-400" : "bg-red-50 text-red-600"}`}>{badge}</span>}
      </div>
      {action}
    </div>
  );
}

// ── Status Config ─────────────────────────────────────────────────
const getStatusConfig = (status, d) => {
  const config = {
    pending:      { label: "Pending",      icon: Clock,       dark: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30", light: "bg-yellow-50 text-yellow-700 border-yellow-200" },
    under_review: { label: "Under Review", icon: Eye,         dark: "bg-blue-500/15 text-blue-400 border-blue-500/30",       light: "bg-blue-50 text-blue-700 border-blue-200" },
    action_taken: { label: "Action Taken", icon: CheckCircle, dark: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", light: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    rejected:     { label: "Rejected",     icon: XCircle,     dark: "bg-red-500/15 text-red-400 border-red-500/30",          light: "bg-red-50 text-red-700 border-red-200" },
  };
  return config[status] || config.pending;
};

// ── Action Modal ──────────────────────────────────────────────────
function ActionModal({ report, onClose, onDone, d }) {
  const [status, setStatus] = useState(report.status);
  const [adminNote, setAdminNote] = useState(report.adminNote || "");
  const [userAction, setUserAction] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await takeReportAction(report._id, { status, adminNote, userAction });
      toast.success("Action taken successfully!");
      onDone();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to take action");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div className={`absolute inset-0 backdrop-blur-sm ${d ? "bg-black/60" : "bg-slate-900/40"}`} />
      <div
        className={`relative z-10 w-full max-w-lg border rounded-2xl shadow-2xl p-6 transition-colors duration-300 ${
          d ? "bg-[#0f1423] border-white/10" : "bg-white border-slate-200"
        }`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-red-500 to-rose-600 shadow-lg`}>
            <Shield className="w-5 h-5 text-white" />
          </div>
          <h3 className={`font-bold text-lg ${d ? "text-white" : "text-slate-900"}`}>Take Action on Report</h3>
        </div>

        {/* Reporter & Target summary */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className={`rounded-xl p-4 border ${d ? "bg-white/[0.02] border-white/5" : "bg-slate-50 border-slate-100"}`}>
            <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${d ? "text-slate-500" : "text-slate-400"}`}>Reporter</p>
            <div className="flex items-center gap-2">
              <Avatar src={report.reporterId?.profileImage} name={report.reporterId?.name} />
              <p className={`text-sm font-semibold truncate ${d ? "text-white" : "text-slate-800"}`}>{report.reporterId?.name || "Unknown"}</p>
            </div>
          </div>
          <div className={`rounded-xl p-4 border ${d ? "bg-white/[0.02] border-white/5" : "bg-slate-50 border-slate-100"}`}>
            <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${d ? "text-slate-500" : "text-slate-400"}`}>Reason</p>
            <p className={`text-sm font-semibold ${d ? "text-amber-400" : "text-amber-600"}`}>{REASON_LABEL[report.reason] || report.reason}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Status */}
          <div>
            <label className={`block text-xs font-semibold mb-2 uppercase tracking-wider ${d ? "text-slate-400" : "text-slate-500"}`}>Update Status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-red-500 transition-colors ${
                d ? "bg-[#151b2b] border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"
              }`}
            >
              {STATUS_OPTIONS.map(s => (
                <option key={s} value={s}>{getStatusConfig(s, d).label}</option>
              ))}
            </select>
          </div>

          {/* User Action (only for user reports) */}
          {report.targetType === "user" && (
            <div>
              <label className={`block text-xs font-semibold mb-2 uppercase tracking-wider ${d ? "text-slate-400" : "text-slate-500"}`}>Action on Reported User</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "",        label: "No Action",   cls: d ? "border-slate-700 text-slate-400" : "border-slate-200 text-slate-500" },
                  { id: "warn",    label: "⚠ Warn User", cls: d ? "border-amber-500/50 text-amber-400" : "border-amber-300 text-amber-600" },
                  { id: "suspend", label: "🚫 Suspend",  cls: d ? "border-orange-500/50 text-orange-400" : "border-orange-300 text-orange-600" },
                  { id: "ban",     label: "⛔ Ban User", cls: d ? "border-red-500/50 text-red-400" : "border-red-300 text-red-600" },
                  { id: "clear",   label: "✅ Clear",    cls: d ? "border-emerald-500/50 text-emerald-400" : "border-emerald-300 text-emerald-600" },
                ].map(({ id, label, cls }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setUserAction(id)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border-2 transition-all ${
                      userAction === id ? `${cls} ${d ? "bg-white/5" : "bg-slate-50"}` : (d ? "border-slate-800 text-slate-500" : "border-slate-200 text-slate-400")
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Admin Note */}
          <div>
            <label className={`block text-xs font-semibold mb-2 uppercase tracking-wider ${d ? "text-slate-400" : "text-slate-500"}`}>Admin Note</label>
            <textarea
              rows={3}
              value={adminNote}
              onChange={e => setAdminNote(e.target.value)}
              placeholder="Optional note visible to the reporter…"
              className={`w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-500 resize-none transition-colors ${
                d ? "bg-[#151b2b] border-white/10 text-white placeholder-slate-600" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
              }`}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-2.5 rounded-xl border text-sm font-bold transition-colors ${
                d ? "border-white/10 text-slate-300 hover:bg-white/5" : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white text-sm font-bold transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Action
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── User Analysis Component ───────────────────────────────────────
function UsersAnalysis({ d }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUsersAnalysis()
      .then(res => setData(res))
      .catch(() => toast.error("Failed to load user analysis"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className={`h-24 rounded-2xl animate-pulse ${d ? "bg-white/5" : "bg-slate-200"}`} />)}
      </div>
      <div className={`h-64 rounded-2xl animate-pulse ${d ? "bg-white/5" : "bg-slate-200"}`} />
    </div>
  );
  if (!data) return null;

  const { stats, data: users } = data;

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Reports",   value: stats.totalReports,   color: d ? "text-amber-400" : "text-amber-600", bg: d ? "bg-amber-500/10 border-amber-500/20" : "bg-amber-50 border-amber-200" },
          { label: "Pending Review",  value: stats.pendingReports, color: d ? "text-yellow-400" : "text-yellow-600", bg: d ? "bg-yellow-500/10 border-yellow-500/20" : "bg-yellow-50 border-yellow-200" },
          { label: "Flagged Users",   value: stats.flaggedUsers,   color: d ? "text-orange-400" : "text-orange-600", bg: d ? "bg-orange-500/10 border-orange-500/20" : "bg-orange-50 border-orange-200" },
          { label: "Suspended",       value: stats.suspendedUsers, color: d ? "text-red-400" : "text-red-600", bg: d ? "bg-red-500/10 border-red-500/20" : "bg-red-50 border-red-200" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`rounded-2xl border p-5 transition-all hover:scale-[1.02] ${bg}`}>
            <div className={`text-4xl font-black mb-1 ${color}`}>{value}</div>
            <div className={`text-xs font-bold uppercase tracking-wider ${d ? "text-slate-400" : "text-slate-500"}`}>{label}</div>
          </div>
        ))}
      </div>

      {/* Users table */}
      <Card d={d}>
        <CardHeader title="All Users — Safety Analysis" badge={users.length} d={d} />
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className={`border-b text-xs font-semibold uppercase tracking-widest ${d ? "border-white/5 text-slate-500" : "border-slate-100 text-slate-400"}`}>
                <th className="text-left px-5 py-3">User</th>
                <th className="text-center px-5 py-3">Trust</th>
                <th className="text-center px-5 py-3">Reports</th>
                <th className="text-center px-5 py-3">Warnings</th>
                <th className="text-center px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${d ? "divide-white/[0.04]" : "divide-slate-50"}`}>
              {users.map(u => {
                const tc = u.trustScore >= 75 ? (d ? "text-emerald-400" : "text-emerald-600") : u.trustScore >= 50 ? (d ? "text-amber-400" : "text-amber-600") : (d ? "text-red-400" : "text-red-600");
                return (
                  <tr key={u._id} className={`transition-colors duration-150 ${d ? "hover:bg-red-500/[0.04]" : "hover:bg-red-50/50"}`}>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <Avatar src={u.profileImage} name={u.name} />
                        <div>
                          <p className={`font-semibold text-xs ${d ? "text-white" : "text-slate-800"}`}>{u.name}</p>
                          <p className={`text-[10px] ${d ? "text-slate-500" : "text-slate-400"}`}>{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className={`px-5 py-4 text-center font-bold ${tc}`}>{u.trustScore ?? 100}</td>
                    <td className={`px-5 py-4 text-center ${u.reportsReceivedActual > 0 ? (d ? "text-red-400 font-black" : "text-red-600 font-black") : (d ? "text-slate-500" : "text-slate-400")}`}>
                      {u.reportsReceivedActual}
                    </td>
                    <td className={`px-5 py-4 text-center ${u.warningCount > 0 ? (d ? "text-amber-400 font-black" : "text-amber-600 font-black") : (d ? "text-slate-500" : "text-slate-400")}`}>
                      {u.warningCount}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-center">
                      {u.isSuspended ? (
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${d ? "bg-red-500/10 text-red-400 border-red-500/30" : "bg-red-50 text-red-700 border-red-200"}`}>Suspended</span>
                      ) : u.isFlagged ? (
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${d ? "bg-orange-500/10 text-orange-400 border-orange-500/30" : "bg-orange-50 text-orange-700 border-orange-200"}`}>Flagged</span>
                      ) : (
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${d ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}>Active</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────
export default function ReportManagement() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("reports"); // "reports" | "analysis"
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const [actionReport, setActionReport] = useState(null);
  const { isDarkMode: d } = useTheme();

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (filterType) params.targetType = filterType;
      const res = await getAllReports(params);
      setReports(res.data || []);
    } catch {
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, [filterStatus, filterType]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${d ? "bg-[#060912]" : "bg-slate-50"}`}>
      <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-red-500/60 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/30">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-2xl font-black tracking-tight ${d ? "text-white" : "text-slate-900"}`}>
                Reports &amp; Safety
              </h1>
              <p className={`text-sm font-medium mt-0.5 ${d ? "text-slate-400" : "text-slate-500"}`}>
                Review reports, take moderation action, and analyze user safety
              </p>
            </div>
          </div>
          <div className={`flex gap-1 p-1 rounded-2xl border ${d ? "bg-[#0d1120]/80 border-white/5" : "bg-white border-slate-200/80"} shadow-sm`}>
            {[
              { id: "reports", icon: Flag, label: "Reports" },
              { id: "analysis", icon: BarChart3, label: "Analysis" },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setView(tab.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                    view === tab.id
                      ? "bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-md shadow-red-500/20"
                      : d ? "text-slate-400 hover:text-slate-200 hover:bg-white/5" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="w-4 h-4" /> {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {view === "analysis" ? (
          <UsersAnalysis d={d} />
        ) : (
          <div className="space-y-5">
            {/* Filters Row */}
            <div className={`p-4 rounded-2xl border flex flex-wrap gap-4 items-center justify-between shadow-sm ${d ? "bg-[#0d1120]/80 border-white/5" : "bg-white border-slate-200/80"}`}>
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  className={`rounded-xl border px-4 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-red-500 transition-colors cursor-pointer ${
                    d ? "bg-[#151b2b] border-white/10 text-white" : "bg-slate-50 border-slate-200 text-slate-800"
                  }`}
                >
                  <option value="">All Statuses</option>
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{getStatusConfig(s, d).label}</option>)}
                </select>
                <select
                  value={filterType}
                  onChange={e => setFilterType(e.target.value)}
                  className={`rounded-xl border px-4 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-red-500 transition-colors cursor-pointer ${
                    d ? "bg-[#151b2b] border-white/10 text-white" : "bg-slate-50 border-slate-200 text-slate-800"
                  }`}
                >
                  <option value="">All Types</option>
                  {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
                <button
                  onClick={fetchReports}
                  className={`p-2.5 rounded-xl border transition-colors ${
                    d ? "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10" : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
              <div className="w-full sm:w-auto hidden sm:block">
                <span className={`px-3 py-1.5 rounded-xl text-xs font-bold ${d ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-600"}`}>
                  {reports.length} Reports
                </span>
              </div>
            </div>

            {/* Reports Table */}
            <Card d={d}>
              <CardHeader title="Report Log" badge={reports.length} d={d} />
              
              {loading ? (
                <div className="p-6 space-y-3">
                  {[...Array(5)].map((_, i) => <div key={i} className={`h-16 rounded-xl animate-pulse ${d ? "bg-white/5" : "bg-slate-100"}`} />)}
                </div>
              ) : reports.length === 0 ? (
                <div className="py-24 flex flex-col items-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 border-dashed ${d ? "border-slate-700 bg-white/[0.02]" : "border-slate-200 bg-slate-50"}`}>
                    <Flag className={`w-8 h-8 ${d ? "text-slate-600" : "text-slate-300"}`} />
                  </div>
                  <p className={`text-sm font-semibold ${d ? "text-slate-400" : "text-slate-500"}`}>No reports found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className={`border-b text-xs font-semibold uppercase tracking-widest whitespace-nowrap ${d ? "border-white/5 text-slate-500" : "border-slate-100 text-slate-400"}`}>
                        <th className="text-left px-5 py-3">Reporter</th>
                        <th className="text-left px-5 py-3">Target</th>
                        <th className="text-left px-5 py-3">Reason</th>
                        <th className="text-center px-5 py-3">Status</th>
                        <th className="text-center px-5 py-3">Date</th>
                        <th className="text-right px-5 py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${d ? "divide-white/[0.04]" : "divide-slate-50"}`}>
                      {reports.map((r) => {
                        const sc = getStatusConfig(r.status, d);
                        const StatusIcon = sc.icon;
                        return (
                          <tr key={r._id} className={`transition-colors duration-150 ${d ? "hover:bg-red-500/[0.04]" : "hover:bg-red-50/50"}`}>
                            <td className="px-5 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <Avatar src={r.reporterId?.profileImage} name={r.reporterId?.name} />
                                <p className={`text-xs font-semibold ${d ? "text-white" : "text-slate-800"}`}>{r.reporterId?.name || "Unknown"}</p>
                              </div>
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap">
                              {r.targetUser ? (
                                <div className="flex items-center gap-3">
                                  <Avatar src={r.targetUser.profileImage} name={r.targetUser.name} />
                                  <div>
                                    <p className={`font-semibold text-xs ${d ? "text-white" : "text-slate-800"}`}>{r.targetUser.name || "Unknown"}</p>
                                    <p className={`text-[10px] ${d ? "text-slate-500" : "text-slate-500"}`}>Trust: <span className="font-bold">{r.targetUser.trustScore ?? 100}</span></p>
                                  </div>
                                </div>
                              ) : (
                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${d ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-500"}`}>
                                  {r.targetType}
                                </span>
                              )}
                            </td>
                            <td className="px-5 py-4 max-w-[200px]">
                              <p className={`text-xs font-bold mb-0.5 ${d ? "text-amber-400" : "text-amber-600"}`}>{REASON_LABEL[r.reason] || r.reason}</p>
                              {r.description && <p className={`text-[10px] line-clamp-1 italic ${d ? "text-slate-500" : "text-slate-500"}`}>"{r.description}"</p>}
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap text-center">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${d ? sc.dark : sc.light}`}>
                                <StatusIcon className="w-3 h-3" />
                                {sc.label}
                              </span>
                            </td>
                            <td className={`px-5 py-4 whitespace-nowrap text-center text-xs ${d ? "text-slate-400" : "text-slate-500"}`}>
                              {new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap text-right">
                              <button
                                onClick={() => setActionReport(r)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                                  d ? "bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/30" : "bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
                                }`}
                              >
                                Review
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>

      {/* Action Modal */}
      {actionReport && (
        <ActionModal
          report={actionReport}
          onClose={() => setActionReport(null)}
          onDone={fetchReports}
          d={d}
        />
      )}
    </div>
  );
}

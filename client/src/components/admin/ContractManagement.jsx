import { useState, useEffect } from "react";
import api from "../../utils/api";
import { showError } from "../../utils/toast";
import { useTheme } from "../../hooks/useTheme";

// ── Icons ────────────────────────────────────────────────────────
const ContractIcon = ({ cls }) => (
  <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);
const CheckCircleIcon = ({ cls }) => (
  <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const ClockIcon = ({ cls }) => (
  <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const ActiveIcon = ({ cls }) => (
  <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);
const RefreshIcon = ({ cls, spin }) => (
  <svg className={`${cls} ${spin ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

// ── Accent config ────────────────────────────────────────────────
const ACCENTS = {
  indigo:  { icon: "from-indigo-500 to-violet-600",  val: ["text-indigo-300",  "text-indigo-600"],  ring: "ring-indigo-500/20"  },
  emerald: { icon: "from-emerald-500 to-teal-500",   val: ["text-emerald-300", "text-emerald-600"], ring: "ring-emerald-500/20" },
  amber:   { icon: "from-amber-500 to-orange-500",   val: ["text-amber-300",   "text-amber-600"],   ring: "ring-amber-500/20"   },
  blue:    { icon: "from-blue-500 to-indigo-500",    val: ["text-blue-300",    "text-blue-600"],    ring: "ring-blue-500/20"    },
};

// ── Stat Card ────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, accent, d }) {
  const a = ACCENTS[accent] || ACCENTS.indigo;
  return (
    <div className={`relative overflow-hidden rounded-2xl border p-5 ring-1 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group ${
      d ? `bg-[#0d1120]/80 border-white/5 ${a.ring} shadow-black/30`
        : `bg-white border-slate-200/70 ${a.ring} shadow-slate-200/50`
    }`}>
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br ${
        d ? "from-white/[0.02] to-transparent" : "from-indigo-50/60 to-transparent"}`} />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className={`text-xs font-semibold uppercase tracking-widest mb-2 ${d ? "text-slate-400" : "text-slate-500"}`}>{label}</p>
          <p className={`text-4xl font-black leading-none ${d ? a.val[0] : a.val[1]}`}>{value}</p>
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${a.icon} shadow-lg`}>
          <Icon cls="w-5 h-5 text-white" />
        </div>
      </div>
      <div className={`absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r ${a.icon} opacity-50`} />
    </div>
  );
}

// ── Status Badge ─────────────────────────────────────────────────
function StatusBadge({ status, d }) {
  const map = {
    active:    { dark: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", light: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    completed: { dark: "bg-blue-500/15 text-blue-400 border-blue-500/30",          light: "bg-blue-50 text-blue-700 border-blue-200" },
    pending:   { dark: "bg-amber-500/15 text-amber-400 border-amber-500/30",       light: "bg-amber-50 text-amber-700 border-amber-200" },
    cancelled: { dark: "bg-red-500/15 text-red-400 border-red-500/30",             light: "bg-red-50 text-red-700 border-red-200" },
  };
  const c = map[status] || map.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border uppercase ${d ? c.dark : c.light}`}>
      {status === "active" && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
      {status}
    </span>
  );
}

// ── Avatar ───────────────────────────────────────────────────────
function Avatar({ name }) {
  const colors = ["from-indigo-500 to-violet-600","from-emerald-500 to-teal-500","from-pink-500 to-rose-500","from-amber-500 to-orange-500","from-blue-500 to-cyan-500"];
  const idx = name ? name.charCodeAt(0) % colors.length : 0;
  return (
    <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${colors[idx]} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
      {name?.slice(0, 2).toUpperCase() || "??"}
    </div>
  );
}

// ── Progress Bar ─────────────────────────────────────────────────
function ProgressBar({ completed, total, d }) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <div className="min-w-[120px]">
      <div className={`h-2 rounded-full overflow-hidden ${d ? "bg-slate-800" : "bg-slate-100"}`}>
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className={`text-xs mt-1 ${d ? "text-slate-400" : "text-slate-500"}`}>
        <span className={`font-semibold ${d ? "text-slate-200" : "text-slate-700"}`}>{completed}</span>
        <span className="mx-0.5">/</span>{total} sessions · <span className={`font-semibold ${d ? "text-emerald-400" : "text-emerald-600"}`}>{pct}%</span>
      </p>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────
export default function ContractManagement() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const { isDarkMode: d } = useTheme();

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/contracts");
      if (res.data.success) setContracts(res.data.data);
      else showError("Failed to fetch contracts");
    } catch (err) {
      showError(err.response?.data?.message || "Failed to fetch contracts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchContracts(); }, []);

  const totalContracts  = contracts.length;
  const activeCount     = contracts.filter(c => c.status === "active").length;
  const completedCount  = contracts.filter(c => c.status === "completed").length;
  const pendingCount    = contracts.filter(c => c.status === "pending").length;

  const filtered = filter === "all" ? contracts : contracts.filter(c => c.status === filter);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${d ? "bg-[#060912]" : "bg-slate-50"}`}>
      <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <ContractIcon cls="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-2xl font-black tracking-tight ${d ? "text-white" : "text-slate-900"}`}>Contract Management</h1>
              <p className={`text-sm font-medium mt-0.5 ${d ? "text-slate-400" : "text-slate-500"}`}>Smart skill-barter agreements &amp; session progress</p>
            </div>
          </div>
          <button onClick={fetchContracts} disabled={loading}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-60 shadow-md ${
              d ? "bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/25"
                : "bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200"}`}>
            <RefreshIcon cls="w-4 h-4" spin={loading} />
            {loading ? "Loading…" : "Refresh"}
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={ContractIcon}  label="Total Contracts" value={totalContracts} accent="indigo"  d={d} />
          <StatCard icon={ActiveIcon}    label="Active"          value={activeCount}    accent="emerald" d={d} />
          <StatCard icon={ClockIcon}     label="Pending"         value={pendingCount}   accent="amber"   d={d} />
          <StatCard icon={CheckCircleIcon} label="Completed"     value={completedCount} accent="blue"    d={d} />
        </div>

        {/* Table Card */}
        <div className={`rounded-2xl border overflow-hidden shadow-xl transition-colors duration-300 ${
          d ? "bg-[#0d1120]/90 border-white/5 shadow-black/40" : "bg-white border-slate-200/80 shadow-slate-200/50"}`}>

          {/* table header */}
          <div className={`px-5 py-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            d ? "border-white/5 bg-white/[0.02]" : "border-slate-100 bg-slate-50/60"}`}>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold ${d ? "text-white" : "text-slate-800"}`}>Contract Log</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${d ? "bg-indigo-500/15 text-indigo-400" : "bg-indigo-50 text-indigo-600"}`}>
                {filtered.length} records
              </span>
            </div>
            {/* filter pills */}
            <div className={`flex items-center gap-1 p-1 rounded-xl ${d ? "bg-white/5" : "bg-slate-100"}`}>
              {[
                { id: "all",       label: "All" },
                { id: "active",    label: "Active" },
                { id: "pending",   label: "Pending" },
                { id: "completed", label: "Completed" },
              ].map(f => (
                <button key={f.id} onClick={() => setFilter(f.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all duration-200 ${
                    filter === f.id
                      ? d ? "bg-indigo-500 text-white shadow-sm" : "bg-white text-indigo-600 shadow-sm"
                      : d ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-700"}`}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* body */}
          {loading && contracts.length === 0 ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className={`h-16 rounded-xl animate-pulse ${d ? "bg-white/5" : "bg-slate-100"}`} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-24 flex flex-col items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 border-dashed ${d ? "border-slate-700" : "border-slate-200"}`}>
                <ContractIcon cls={`w-8 h-8 ${d ? "text-slate-600" : "text-slate-300"}`} />
              </div>
              <p className={`text-sm font-semibold ${d ? "text-slate-400" : "text-slate-500"}`}>No contracts found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className={`border-b ${d ? "border-white/5" : "border-slate-100"}`}>
                    {["Status", "Users", "Skills Exchange", "Progress", "Start Date"].map(col => (
                      <th key={col} className={`px-5 py-3 text-left text-xs font-semibold uppercase tracking-widest whitespace-nowrap ${d ? "text-slate-500" : "text-slate-400"}`}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className={`divide-y ${d ? "divide-white/[0.04]" : "divide-slate-50"}`}>
                  {filtered.map(contract => (
                    <tr key={contract._id} className={`transition-colors duration-150 ${d ? "hover:bg-indigo-500/[0.04]" : "hover:bg-indigo-50/50"}`}>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <StatusBadge status={contract.status} d={d} />
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Avatar name={contract.userA?.name} />
                          <span className={`text-xs font-semibold ${d ? "text-slate-200" : "text-slate-700"}`}>{contract.userA?.name || "Unknown"}</span>
                          <span className={`text-xs font-bold mx-1 ${d ? "text-indigo-400" : "text-indigo-400"}`}>↔</span>
                          <Avatar name={contract.userB?.name} />
                          <span className={`text-xs font-semibold ${d ? "text-slate-200" : "text-slate-700"}`}>{contract.userB?.name || "Unknown"}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className={`flex items-center gap-2 text-xs font-medium ${d ? "text-slate-300" : "text-slate-600"}`}>
                          <span className={`px-2 py-0.5 rounded-lg ${d ? "bg-indigo-500/15 text-indigo-300" : "bg-indigo-50 text-indigo-600"}`}>{contract.skillTeach}</span>
                          <span className={d ? "text-emerald-400" : "text-emerald-500"}>↔</span>
                          <span className={`px-2 py-0.5 rounded-lg ${d ? "bg-emerald-500/15 text-emerald-300" : "bg-emerald-50 text-emerald-700"}`}>{contract.skillLearn}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <ProgressBar completed={contract.completedSessions} total={contract.totalSessions} d={d} />
                      </td>
                      <td className={`px-5 py-4 whitespace-nowrap text-xs ${d ? "text-slate-400" : "text-slate-500"}`}>
                        {new Date(contract.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {filtered.length > 0 && (
            <div className={`px-5 py-3 border-t flex items-center justify-between ${d ? "border-white/5 bg-white/[0.015]" : "border-slate-100 bg-slate-50/40"}`}>
              <p className={`text-xs ${d ? "text-slate-500" : "text-slate-400"}`}>
                Showing <span className={`font-semibold ${d ? "text-slate-300" : "text-slate-600"}`}>{filtered.length}</span> of{" "}
                <span className={`font-semibold ${d ? "text-slate-300" : "text-slate-600"}`}>{totalContracts}</span> contracts
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

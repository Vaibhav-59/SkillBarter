// client/src/pages/SmartContractPage.jsx
import { useState, useEffect, useCallback, useContext } from "react";
import api from "../utils/api";
import { showError } from "../utils/toast";
import ContractForm from "../components/contract/ContractForm";
import ContractList from "../components/contract/ContractList";
import ContractDetails from "../components/contract/ContractDetails";
import { ThemeContext } from "../contexts/ThemeContext";

const TABS = [
  { key: "all",       label: "All",       icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
  { key: "pending",   label: "Pending",   icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
  { key: "active",    label: "Active",    icon: "M13 10V3L4 14h7v7l9-11h-7z" },
  { key: "completed", label: "Done",      icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
  { key: "cancelled", label: "Cancelled", icon: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" },
];

const STAT_CFG = [
  { key: "total",     label: "Total",     iconPath: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2", gradFrom: "from-slate-500",   gradTo: "to-slate-600",   glowColor: "indigo" },
  { key: "active",    label: "Active",    iconPath: "M13 10V3L4 14h7v7l9-11h-7z",                                                                                                          gradFrom: "from-indigo-500",  gradTo: "to-violet-600",  glowColor: "indigo" },
  { key: "pending",   label: "Pending",   iconPath: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",                                                                                        gradFrom: "from-amber-500",   gradTo: "to-orange-500",  glowColor: "amber" },
  { key: "completed", label: "Completed", iconPath: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",                                                                                      gradFrom: "from-emerald-500", gradTo: "to-teal-600",    glowColor: "emerald" },
];

export default function SmartContractPage() {
  const { theme } = useContext(ThemeContext) || { theme: "dark" };
  const d = theme === "dark";

  const [contracts, setContracts] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [showForm, setShowForm]   = useState(false);
  const [selected, setSelected]   = useState(null);

  const myId = (() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}")._id || ""; }
    catch { return ""; }
  })();

  const fetchContracts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/contracts/user");
      setContracts(res.data.data || []);
    } catch {
      showError("Failed to load contracts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchContracts(); }, [fetchContracts]);

  const handleUpdate = () => {
    fetchContracts();
    if (selected) {
      api.get(`/contracts/${selected._id}`).then((r) => setSelected(r.data.data)).catch(() => {});
    }
  };

  const stats = {
    total:     contracts.length,
    active:    contracts.filter((c) => c.status === "active").length,
    pending:   contracts.filter((c) => c.status === "pending").length,
    completed: contracts.filter((c) => c.status === "completed").length,
  };

  const needsApproval = contracts.filter((c) => {
    const myApproved = c.userA._id === myId ? c.approvedByA : c.approvedByB;
    return !myApproved && c.status === "pending";
  }).length;

  const tabCount = (key) => key === "all" ? contracts.length : contracts.filter((c) => c.status === key).length;

  return (
    <div className={`min-h-screen relative overflow-hidden ${
      d
        ? "bg-[#080c18]"
        : "bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/20"
    }`}>

      {/* Background ambient orbs */}
      <div className={`absolute top-[-120px] left-[-80px] w-[480px] h-[480px] rounded-full blur-[120px] pointer-events-none ${d ? "bg-indigo-600/8" : "bg-indigo-300/20"}`} />
      <div className={`absolute bottom-[-80px] right-[-100px] w-[400px] h-[400px] rounded-full blur-[100px] pointer-events-none ${d ? "bg-violet-600/6" : "bg-violet-300/15"}`} />
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none ${d ? "bg-indigo-500/3" : "bg-indigo-200/10"}`} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-24">

        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-xl shadow-indigo-500/30 flex-shrink-0">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className={`text-3xl font-black leading-tight tracking-tight ${d ? "text-white" : "text-slate-900"}`}>
                Skill Contracts
              </h1>
              <p className={`mt-0.5 font-medium ${d ? "text-slate-400" : "text-slate-500"}`}>
                Manage your skill exchange agreements
              </p>
            </div>
          </div>

          <button
            id="create-contract-btn"
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2.5 px-6 py-3 bg-gradient-to-r from-indigo-500 via-violet-600 to-purple-600
              hover:from-indigo-400 hover:via-violet-500 hover:to-purple-500
              text-white font-bold rounded-2xl
              shadow-xl shadow-indigo-500/30
              transition-all duration-300 hover:scale-[1.03] hover:shadow-indigo-500/40
              border border-indigo-500/20 text-sm whitespace-nowrap"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            New Contract
          </button>
        </div>

        {/* ── Stats Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
          {STAT_CFG.map((s) => (
            <div
              key={s.key}
              className={`relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 ${
                d
                  ? "bg-[#111827]/80 border-indigo-500/15 hover:border-indigo-500/30"
                  : "bg-white border-slate-200/80 hover:border-indigo-200 shadow-sm hover:shadow-indigo-100"
              }`}
            >
              {/* top accent gradient bar */}
              <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${s.gradFrom} ${s.gradTo}`} />
              {/* background icon watermark */}
              <div className={`absolute bottom-2 right-3 opacity-5`}>
                <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={s.iconPath} />
                </svg>
              </div>
              <div className="relative z-10">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.gradFrom} ${s.gradTo} flex items-center justify-center mb-3 shadow-lg`}>
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={s.iconPath} />
                  </svg>
                </div>
                <p className={`text-3xl font-black tabular-nums ${d ? "text-white" : "text-slate-900"}`}>{stats[s.key]}</p>
                <p className={`text-xs font-bold uppercase tracking-widest mt-1 ${d ? "text-slate-500" : "text-slate-400"}`}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Approval Alert Banner ── */}
        {needsApproval > 0 && (
          <div className={`mb-6 flex items-center gap-3 px-5 py-4 rounded-2xl border transition-all ${
            d
              ? "bg-amber-500/8 border-amber-500/25"
              : "bg-amber-50 border-amber-200"
          }`}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/25">
              <svg className="w-4.5 h-4.5 text-white w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className={`font-semibold ${d ? "text-amber-200" : "text-amber-800"}`}>
                <span className={`font-black ${d ? "text-white" : "text-amber-900"}`}>{needsApproval}</span> contract{needsApproval > 1 ? "s" : ""} awaiting your approval
              </p>
            </div>
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all hover:scale-105 ${
                d
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/30"
                  : "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200"
              }`}
            >
              Review →
            </button>
          </div>
        )}

        {/* ── Tab Bar ── */}
        <div className={`flex gap-1.5 flex-wrap mb-7 p-1.5 rounded-2xl border ${
          d
            ? "bg-[#111827]/60 border-indigo-500/15"
            : "bg-white border-slate-200 shadow-sm"
        }`}>
          {TABS.map((t) => {
            const isActive = activeTab === t.key;
            const count = tabCount(t.key);
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all duration-200 text-sm ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25"
                    : d
                      ? "text-slate-500 hover:text-slate-200 hover:bg-indigo-500/10"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={t.icon} />
                </svg>
                {t.label}
                <span className={`text-xs font-black px-1.5 py-0.5 rounded-lg min-w-[20px] text-center ${
                  isActive
                    ? "bg-white/20 text-white"
                    : d ? "bg-indigo-500/15 text-indigo-400" : "bg-slate-100 text-slate-400"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Contract List ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className={`w-12 h-12 rounded-full border-4 border-t-transparent animate-spin ${
              d ? "border-indigo-500/40 border-t-indigo-400" : "border-indigo-200 border-t-indigo-500"
            }`} />
            <p className={`font-medium ${d ? "text-slate-500" : "text-slate-400"}`}>Loading contracts…</p>
          </div>
        ) : (
          <ContractList
            contracts={contracts}
            myId={myId}
            onSelect={setSelected}
            filterStatus={activeTab}
          />
        )}
      </div>

      {/* ── Modals ── */}
      {showForm && (
        <ContractForm
          onCreated={fetchContracts}
          onClose={() => setShowForm(false)}
        />
      )}
      {selected && (
        <ContractDetails
          contract={selected}
          myId={myId}
          onClose={() => setSelected(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}

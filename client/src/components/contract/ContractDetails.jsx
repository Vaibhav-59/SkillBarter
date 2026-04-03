// client/src/components/contract/ContractDetails.jsx
import { useState, useContext } from "react";
import api from "../../utils/api";
import { showSuccess, showError } from "../../utils/toast";
import ContractProgress from "./ContractProgress";
import ContractSessionList from "./ContractSessionList";
import { ThemeContext } from "../../contexts/ThemeContext";
import { useNavigate } from "react-router-dom";

const STATUS_CFG = {
  pending:   { dark: "bg-amber-500/15 text-amber-400 border-amber-500/30",   light: "bg-amber-50 text-amber-600 border-amber-200"   },
  active:    { dark: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30", light: "bg-indigo-50 text-indigo-600 border-indigo-200" },
  completed: { dark: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", light: "bg-emerald-50 text-emerald-600 border-emerald-200" },
  cancelled: { dark: "bg-red-500/15 text-red-400 border-red-500/30",         light: "bg-red-50 text-red-600 border-red-200"         },
};

const AVATAR_GRADS = [
  "from-indigo-500 to-violet-600",
  "from-violet-500 to-purple-600",
  "from-blue-500 to-indigo-600",
  "from-purple-500 to-pink-600",
  "from-teal-500 to-cyan-600",
];
const getGrad = (name) => AVATAR_GRADS[(name?.charCodeAt(0) || 0) % AVATAR_GRADS.length];

export default function ContractDetails({ contract, myId, onClose, onUpdate }) {
  const { theme }  = useContext(ThemeContext) || { theme: "dark" };
  const d          = theme === "dark";
  const navigate   = useNavigate();
  const [loading, setLoading] = useState(false);

  const isA               = contract.userA._id === myId;
  const partner           = isA ? contract.userB : contract.userA;
  const myApproved        = isA ? contract.approvedByA : contract.approvedByB;
  const needsMyApproval   = !myApproved && contract.status === "pending";
  const displaySkillTeach = isA ? contract.skillTeach : contract.skillLearn;
  const displaySkillLearn = isA ? contract.skillLearn : contract.skillTeach;
  const statusCfg         = STATUS_CFG[contract.status] || STATUS_CFG.pending;
  const grad              = getGrad(partner?.name);

  const handleApprove = async () => {
    setLoading(true);
    try {
      await api.put(`/contracts/accept/${contract._id}`);
      showSuccess("Contract approved!");
      onUpdate?.();
    } catch (err) {
      showError(err?.response?.data?.message || "Failed to approve");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this contract?")) return;
    setLoading(true);
    try {
      await api.put(`/contracts/cancel/${contract._id}`);
      showSuccess("Contract cancelled.");
      onUpdate?.();
      onClose?.();
    } catch (err) {
      showError(err?.response?.data?.message || "Failed to cancel");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <div className={`w-full max-w-3xl rounded-3xl overflow-hidden flex flex-col max-h-[90vh] border shadow-2xl ${
        d
          ? "bg-[#0d1117] border-indigo-500/15 shadow-indigo-500/10"
          : "bg-white border-slate-200 shadow-slate-300/50"
      }`}>

        {/* ── Header ── */}
        <div className={`relative px-8 py-6 flex items-start justify-between flex-shrink-0 border-b overflow-hidden ${
          d ? "bg-gradient-to-r from-indigo-500/8 to-violet-500/5 border-indigo-500/15" : "bg-gradient-to-r from-indigo-50 to-violet-50/50 border-slate-100"
        }`}>
          {/* decorative glow */}
          <div className={`absolute -top-12 -left-12 w-40 h-40 rounded-full blur-3xl pointer-events-none ${d ? "bg-indigo-500/15" : "bg-indigo-200/30"}`} />

          <div className="relative z-10 flex items-center gap-4">
            {/* Partner avatar */}
            <div className={`w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center font-bold text-white shadow-xl ring-2 overflow-hidden bg-gradient-to-br ${grad} ${d ? "ring-indigo-500/25" : "ring-slate-200"}`}>
              {partner?.profileImage
                ? <img src={partner.profileImage} alt={partner.name} className="w-full h-full object-cover" />
                : <span className="text-xl">{partner?.name?.[0]?.toUpperCase() || "?"}</span>
              }
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap mb-1">
                <h2 className={`font-black text-xl leading-tight ${d ? "text-white" : "text-slate-900"}`}>
                  <span className={d ? "text-indigo-300" : "text-indigo-600"}>{displaySkillTeach}</span>
                  <span className={`mx-2 ${d ? "text-slate-600" : "text-slate-300"}`}>↔</span>
                  <span className={d ? "text-violet-300" : "text-violet-600"}>{displaySkillLearn}</span>
                </h2>
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-wider ${d ? statusCfg.dark : statusCfg.light}`}>
                  {contract.status}
                </span>
              </div>
              <p className={`${d ? "text-slate-400" : "text-slate-500"}`}>
                with <span className={`font-semibold ${d ? "text-slate-200" : "text-slate-700"}`}>{partner.name}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`relative z-10 flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110 ml-4 ${
              d ? "bg-indigo-500/10 hover:bg-red-500/15 text-slate-400 hover:text-red-400 border border-indigo-500/15" : "bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-500"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Body (scrollable) ── */}
        <div className="overflow-y-auto flex-1 px-8 py-6 space-y-5"
          style={{ scrollbarWidth: "thin", scrollbarColor: d ? "#312e81 transparent" : "#c7d2fe transparent" }}>

          {/* Info grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "You Teach",  value: displaySkillTeach, strong: true, color: d ? "text-indigo-400" : "text-indigo-600" },
              { label: "You Learn",  value: displaySkillLearn, strong: true, color: d ? "text-violet-400" : "text-violet-600" },
              { label: "Sessions",   value: `${contract.totalSessions}` },
              { label: "Duration",   value: `${contract.sessionDuration} min` },
            ].map((item) => (
              <div key={item.label} className={`rounded-2xl p-4 border ${
                d ? "bg-indigo-500/8 border-indigo-500/15" : "bg-slate-50 border-slate-100"
              }`}>
                <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${d ? "text-slate-500" : "text-slate-400"}`}>{item.label}</p>
                <p className={`font-bold truncate ${item.color || (d ? "text-white" : "text-slate-800")}`}>{item.value}</p>
              </div>
            ))}
          </div>

          {/* Start date + Approval */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className={`rounded-2xl p-4 border ${d ? "bg-indigo-500/8 border-indigo-500/15" : "bg-slate-50 border-slate-100"}`}>
              <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${d ? "text-slate-500" : "text-slate-400"}`}>Start Date</p>
              <p className={`font-bold ${d ? "text-white" : "text-slate-800"}`}>
                {new Date(contract.startDate).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
              </p>
            </div>
            <div className={`rounded-2xl p-4 border ${d ? "bg-indigo-500/8 border-indigo-500/15" : "bg-slate-50 border-slate-100"}`}>
              <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${d ? "text-slate-500" : "text-slate-400"}`}>Approval Status</p>
              <div className="space-y-1">
                {[
                  { user: contract.userA, approved: contract.approvedByA },
                  { user: contract.userB, approved: contract.approvedByB },
                ].map(({ user, approved }) => (
                  <div key={user._id} className="flex items-center justify-between">
                    <span className={`font-medium truncate ${d ? "text-slate-300" : "text-slate-600"}`}>{user.name}</span>
                    <span className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-lg border ${
                      approved
                        ? d ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" : "bg-emerald-50 text-emerald-600 border-emerald-200"
                        : d ? "bg-slate-700/40 text-slate-500 border-slate-600/30"       : "bg-slate-100 text-slate-400 border-slate-200"
                    }`}>
                      {approved ? "✓ Approved" : "⏳ Pending"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className={`rounded-2xl p-5 border relative overflow-hidden group transition-all ${
            d ? "bg-indigo-500/8 border-indigo-500/15 hover:border-indigo-500/30" : "bg-slate-50 border-slate-100 hover:border-indigo-100"
          }`}>
            <div className="absolute inset-0 bg-indigo-500/3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <ContractProgress completed={contract.completedSessions} total={contract.totalSessions} />
          </div>

          {/* Notes */}
          {contract.notes && (
            <div className={`rounded-2xl p-5 border ${d ? "bg-indigo-500/8 border-indigo-500/15" : "bg-slate-50 border-slate-100"}`}>
              <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${d ? "text-slate-500" : "text-slate-400"}`}>Contract Notes</p>
              <p className={`leading-relaxed ${d ? "text-slate-300" : "text-slate-600"}`}>{contract.notes}</p>
            </div>
          )}

          {/* Sessions */}
          <div className={`rounded-2xl p-5 border ${d ? "bg-indigo-500/8 border-indigo-500/15" : "bg-slate-50 border-slate-100"}`}>
            <ContractSessionList contract={contract} myId={myId} onUpdate={onUpdate} />
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 flex-wrap pt-1">
            {needsMyApproval && (
              <button
                onClick={handleApprove}
                disabled={loading}
                className="flex-1 min-w-[160px] py-3 bg-gradient-to-r from-indigo-500 via-violet-600 to-purple-600
                  hover:from-indigo-400 hover:via-violet-500 hover:to-purple-500
                  text-white font-bold rounded-2xl shadow-xl shadow-indigo-500/25
                  transition-all duration-300 hover:scale-[1.02]
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 text-sm"
              >
                ✓ Approve Contract
              </button>
            )}
            {contract.status === "completed" && !contract.reviewLeft && (
              <button
                onClick={() => navigate(`/review/${contract._id}?type=contract`)}
                className="flex-1 min-w-[160px] py-3 bg-gradient-to-r from-amber-500 to-orange-500
                  hover:from-amber-400 hover:to-orange-400
                  text-white font-bold rounded-2xl shadow-xl shadow-amber-500/20
                  transition-all duration-300 hover:scale-[1.02] text-sm"
              >
                ⭐ Leave a Review
              </button>
            )}
            {(contract.status === "pending" || contract.status === "active") && (
              <button
                onClick={handleCancel}
                disabled={loading}
                className={`flex-1 min-w-[140px] py-3 font-bold rounded-2xl border transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed text-sm ${
                  d
                    ? "bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/25"
                    : "bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
                }`}
              >
                Cancel Contract
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

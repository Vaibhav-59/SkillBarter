// client/src/components/contract/ContractList.jsx
import { useContext } from "react";
import { ThemeContext } from "../../contexts/ThemeContext";
import ContractProgress from "./ContractProgress";

const AVATAR_GRADS = [
  "from-indigo-500 to-violet-600",
  "from-violet-500 to-purple-600",
  "from-blue-500 to-indigo-600",
  "from-purple-500 to-pink-600",
  "from-teal-500 to-cyan-600",
];
const getGrad = (name) => AVATAR_GRADS[(name?.charCodeAt(0) || 0) % AVATAR_GRADS.length];

const STATUS = {
  pending:   {
    badge: { dark: "bg-amber-500/15 text-amber-400 border-amber-500/25",     light: "bg-amber-50 text-amber-600 border-amber-200"     },
    dot:   { dark: "bg-amber-400 animate-pulse",                              light: "bg-amber-500 animate-pulse"                      },
    label: "Pending",
    accent: { dark: "border-amber-500/15",  light: "border-amber-100"   },
  },
  active: {
    badge: { dark: "bg-indigo-500/15 text-indigo-400 border-indigo-500/25",  light: "bg-indigo-50 text-indigo-600 border-indigo-200"  },
    dot:   { dark: "bg-indigo-400",                                           light: "bg-indigo-500"                                   },
    label: "Active",
    accent: { dark: "border-indigo-500/15", light: "border-indigo-100"  },
  },
  completed: {
    badge: { dark: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25", light: "bg-emerald-50 text-emerald-600 border-emerald-200" },
    dot:   { dark: "bg-emerald-400",                                             light: "bg-emerald-500"                                    },
    label: "Completed",
    accent: { dark: "border-emerald-500/15", light: "border-emerald-100" },
  },
  cancelled: {
    badge: { dark: "bg-red-500/15 text-red-400 border-red-500/25",          light: "bg-red-50 text-red-600 border-red-200"          },
    dot:   { dark: "bg-red-400",                                              light: "bg-red-500"                                     },
    label: "Cancelled",
    accent: { dark: "border-red-500/15",     light: "border-red-100"    },
  },
};

export default function ContractList({ contracts, myId, onSelect, filterStatus }) {
  const { theme } = useContext(ThemeContext) || { theme: "dark" };
  const d = theme === "dark";

  let filtered = contracts;
  if (filterStatus && filterStatus !== "all") {
    filtered = contracts.filter((c) => c.status === filterStatus);
  }

  if (filtered.length === 0) {
    return (
      <div className={`rounded-3xl border p-16 flex flex-col items-center justify-center text-center relative overflow-hidden ${
        d ? "bg-[#111827]/80 border-white/6" : "bg-white border-slate-200 shadow-sm"
      }`}>
        <div className={`absolute inset-0 opacity-30 pointer-events-none ${
          d ? "bg-gradient-to-br from-indigo-900/20 to-violet-900/10" : "bg-gradient-to-br from-indigo-50 to-violet-50"
        }`} />
        <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center mb-4 text-3xl shadow-lg ${
          d ? "bg-white/5 border border-white/8" : "bg-slate-100 border border-slate-200"
        }`}>
          🤝
        </div>
        <p className={`font-bold mb-1 ${d ? "text-white" : "text-slate-800"}`}>No contracts found</p>
        <p className={`text-sm ${d ? "text-slate-500" : "text-slate-400"}`}>
          Create a new skill exchange contract to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {filtered.map((c) => {
        const partner      = c.userA._id === myId ? c.userB : c.userA;
        const st           = STATUS[c.status] || STATUS.pending;
        const myApproved   = c.userA._id === myId ? c.approvedByA : c.approvedByB;
        const needsApproval = !myApproved && c.status === "pending";
        const isA          = c.userA._id === myId;
        const displayTeach = isA ? c.skillTeach : c.skillLearn;
        const displayLearn = isA ? c.skillLearn : c.skillTeach;
        const grad         = getGrad(partner?.name);

        return (
          <div
            key={c._id}
            onClick={() => onSelect(c)}
            className={`group relative rounded-3xl border cursor-pointer overflow-hidden transition-all duration-300
              hover:-translate-y-1.5 hover:shadow-2xl ${
              d
                ? "bg-[#111827]/90 border-indigo-500/15 hover:border-indigo-500/35 hover:shadow-indigo-500/10"
                : "bg-white border-slate-200 hover:border-indigo-200 hover:shadow-indigo-100"
            }`}
          >
            {/* Top accent bar */}
            <div className={`absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

            {/* Hover glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/3 to-violet-500/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            <div className="relative z-10 p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0 pr-3">
                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                    <span className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-lg border uppercase tracking-wide ${d ? st.badge.dark : st.badge.light}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${d ? st.dot.dark : st.dot.light}`} />
                      {st.label}
                    </span>
                    {needsApproval && (
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border uppercase tracking-wide ${
                        d ? "bg-amber-500/15 text-amber-300 border-amber-500/25" : "bg-amber-50 text-amber-600 border-amber-200"
                      }`}>
                        ⚡ Action Required
                      </span>
                    )}
                  </div>

                  {/* Skill exchange title */}
                  <h3 className={`font-black leading-tight ${d ? "text-white" : "text-slate-900"}`}>
                    <span className={d ? "text-indigo-300" : "text-indigo-600"}>{displayTeach}</span>
                    <span className={`mx-2 font-black ${d ? "text-slate-600" : "text-slate-300"}`}>↔</span>
                    <span className={d ? "text-violet-300" : "text-violet-600"}>{displayLearn}</span>
                  </h3>
                </div>

                {/* Partner avatar */}
                <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center font-bold text-white shadow-lg ring-2 overflow-hidden ${
                  partner?.profileImage ? "" : `bg-gradient-to-br ${grad}`
                } ${d ? "ring-indigo-500/20" : "ring-slate-200"}`}>
                  {partner?.profileImage
                    ? <img src={partner.profileImage} alt={partner.name} className="w-full h-full object-cover" />
                    : partner?.name?.[0]?.toUpperCase() || "?"
                  }
                </div>
              </div>

              {/* Partner name */}
              <p className={`mb-4 ${d ? "text-slate-400" : "text-slate-500"}`}>
                with <span className={`font-semibold ${d ? "text-slate-200" : "text-slate-700"}`}>{partner?.name}</span>
              </p>

              {/* Stats chips */}
              <div className="flex flex-wrap gap-2 mb-5">
                {[
                  { emoji: "📋", val: `${c.totalSessions} sessions` },
                  { emoji: "⏱",  val: `${c.sessionDuration} min`   },
                  { emoji: "📆", val: new Date(c.startDate).toLocaleDateString(undefined, { month: "short", day: "numeric" }) },
                ].map((chip) => (
                  <span key={chip.val} className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border font-medium ${
                    d ? "bg-indigo-500/8 border-indigo-500/15 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-500"
                  }`}>
                    <span className="text-xs">{chip.emoji}</span>
                    <span className="text-xs">{chip.val}</span>
                  </span>
                ))}
              </div>

              {/* Divider */}
              <div className={`border-t mb-4 ${d ? "border-indigo-500/15" : "border-slate-100"}`} />

              {/* Progress */}
              <ContractProgress completed={c.completedSessions} total={c.totalSessions} />
            </div>

            {/* Right edge indicator */}
            <div className={`absolute right-0 top-6 bottom-6 w-[3px] rounded-l-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-b from-indigo-500 to-violet-600`} />
          </div>
        );
      })}
    </div>
  );
}

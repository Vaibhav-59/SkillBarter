// client/src/components/contract/ContractProgress.jsx
import { useContext } from "react";
import { ThemeContext } from "../../contexts/ThemeContext";

export default function ContractProgress({ completed, total }) {
  const { theme } = useContext(ThemeContext) || { theme: "dark" };
  const d = theme === "dark";
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div>
      <div className="flex justify-between items-center mb-2.5">
        <div className="flex items-center gap-2">
          <svg className={`w-3.5 h-3.5 ${d ? "text-slate-500" : "text-slate-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span className={`text-xs font-bold uppercase tracking-wider ${d ? "text-slate-500" : "text-slate-400"}`}>Progress</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`text-sm font-bold tabular-nums ${d ? "text-indigo-300" : "text-indigo-600"}`}>
            {completed}<span className={`text-xs ${d ? "text-slate-500" : "text-slate-400"}`}>/{total}</span>
          </span>
          <span className={`text-xs font-semibold ${d ? "text-slate-500" : "text-slate-400"}`}>sessions</span>
        </div>
      </div>

      {/* Track */}
      <div className={`w-full h-2.5 rounded-full overflow-hidden ${d ? "bg-indigo-950/70" : "bg-slate-100"}`}>
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600 transition-all duration-700 ease-out relative overflow-hidden"
          style={{ width: `${Math.max(pct, 2)}%` }}
        >
          {/* shimmer */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12 animate-pulse" />
        </div>
      </div>

      <div className="flex items-center justify-between mt-1.5">
        <span className={`text-xs ${d ? "text-slate-600" : "text-slate-400"}`}>
          {completed === 0 ? "Not started" : completed === total ? "All done 🎉" : "In progress"}
        </span>
        <span className={`text-xs font-bold tabular-nums ${
          pct === 100
            ? "text-emerald-400"
            : d ? "text-indigo-400" : "text-indigo-600"
        }`}>{pct}%</span>
      </div>
    </div>
  );
}

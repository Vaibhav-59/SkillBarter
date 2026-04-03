// /client/src/components/matching/MatchFilters.jsx
import { useTheme } from "../../hooks/useTheme";

const FILTERS = [
  { key: "all",              label: "All Matches",        icon: "🤝" },
  { key: "current",          label: "Active",             icon: "⚡" },
  { key: "pending-sent",     label: "Sent",               icon: "📤" },
  { key: "pending-received", label: "Received",           icon: "📥" },
  { key: "rejected",         label: "Declined",           icon: "✕"  },
];

export default function MatchFilters({ activeFilter, setActiveFilter, counts = {} }) {
  const { isDarkMode } = useTheme();

  return (
    <div className={`rounded-2xl border p-1.5 mb-5 ${
      isDarkMode
        ? "bg-slate-800/60 border-slate-700/50"
        : "bg-white border-indigo-100 shadow-sm"
    }`}>
      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((f) => {
          const isActive = activeFilter === f.key;
          const count    = counts[f.key] ?? 0;
          return (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold border transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600 text-white border-transparent shadow-md shadow-indigo-500/25 scale-[1.02]"
                  : isDarkMode
                    ? "bg-transparent border-slate-700/50 text-slate-400 hover:border-indigo-500/40 hover:text-indigo-300"
                    : "bg-transparent border-gray-200 text-gray-500 hover:border-indigo-300 hover:text-indigo-600"
              }`}
            >
              <span>{f.icon}</span>
              <span>{f.label}</span>
              {count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-black ${
                  isActive
                    ? "bg-white/20 text-white"
                    : isDarkMode ? "bg-indigo-500/20 text-indigo-300" : "bg-indigo-100 text-indigo-600"
                }`}>{count}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

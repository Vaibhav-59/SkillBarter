import VerificationBadge from "../verification/VerificationBadge";
import { useTheme } from "../../hooks/useTheme";

const levelConfig = {
  beginner: {
    icon: "🌱",
    darkBg: "bg-sky-900/20 border-sky-700/30",
    lightBg: "bg-sky-50 border-sky-200",
    darkBadge: "bg-sky-500/20 text-sky-300",
    lightBadge: "bg-sky-100 text-sky-700",
    dots: 1,
  },
  intermediate: {
    icon: "⚡",
    darkBg: "bg-emerald-900/20 border-emerald-700/30",
    lightBg: "bg-emerald-50 border-emerald-200",
    darkBadge: "bg-emerald-500/20 text-emerald-300",
    lightBadge: "bg-emerald-100 text-emerald-700",
    dots: 2,
  },
  advanced: {
    icon: "🔥",
    darkBg: "bg-orange-900/20 border-orange-700/30",
    lightBg: "bg-orange-50 border-orange-200",
    darkBadge: "bg-orange-500/20 text-orange-300",
    lightBadge: "bg-orange-100 text-orange-700",
    dots: 3,
  },
};

export default function SkillList({ skills = [], verifiedSkills = [], editable = false, onRemove }) {
  const { isDarkMode } = useTheme();

  if (!skills.length) {
    return (
      <div className={`text-center py-10 rounded-xl border-2 border-dashed ${
        isDarkMode ? "border-slate-700 text-slate-500" : "border-indigo-100 text-gray-400"
      }`}>
        <svg className="w-8 h-8 mx-auto mb-2 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        <p className="text-sm font-medium">No skills added yet</p>
        <p className="text-xs mt-0.5 opacity-70">Start building your skill profile</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {skills.map((skill, index) => {
        const key = skill.level?.toLowerCase() || "";
        const cfg = levelConfig[key] || {
          icon: "💼",
          darkBg: "bg-slate-800/40 border-slate-700/30",
          lightBg: "bg-slate-50 border-slate-200",
          darkBadge: "bg-slate-500/20 text-slate-300",
          lightBadge: "bg-slate-100 text-slate-700",
          dots: 1,
        };

        return (
          <div
            key={index}
            className={`group relative rounded-xl border p-4 transition-all duration-200 hover:scale-[1.02] overflow-hidden ${
              isDarkMode ? cfg.darkBg : cfg.lightBg
            }`}
          >
            {/* Shimmer */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

            <div className="relative z-10">
              {/* Header row */}
              <div className="flex items-start justify-between mb-2">
                <span className="text-lg">{cfg.icon}</span>
                {editable && (
                  <button
                    type="button"
                    onClick={() => onRemove?.(skill.name)}
                    className="w-6 h-6 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 bg-red-500/15 text-red-400 hover:bg-red-500/30 border border-red-500/20"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Name + badge */}
              <div className="flex items-center gap-1.5 mb-2">
                <span className={`font-bold text-sm ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  {skill.name}
                </span>
                {verifiedSkills?.some((v) => v.toLowerCase() === skill.name.toLowerCase()) && (
                  <VerificationBadge size="sm" showLabel={false} />
                )}
              </div>

              {/* Level row */}
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                  isDarkMode ? cfg.darkBadge : cfg.lightBadge
                }`}>
                  {skill.level || "—"}
                </span>
                <div className="flex gap-1">
                  {[1, 2, 3].map((d) => (
                    <div key={d} className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      d <= cfg.dots
                        ? isDarkMode ? "bg-indigo-400" : "bg-indigo-500"
                        : isDarkMode ? "bg-slate-700" : "bg-gray-200"
                    }`} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
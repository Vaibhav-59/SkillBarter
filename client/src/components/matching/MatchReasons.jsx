// /client/src/components/matching/MatchReasons.jsx
import React, { useState } from "react";
import {
  BookOpen, Users, MapPin, Clock, Star, Zap, Target,
  Heart, Award, TrendingUp, CheckCircle, Info, Eye,
} from "lucide-react";
import { useTheme } from "../../hooks/useTheme";

/* ── icon lookup ─────────────────────────────────────────── */
const getIcon = (reason) => {
  const r = reason.toLowerCase();
  if (r.includes("skill") || r.includes("teach") || r.includes("learn")) return BookOpen;
  if (r.includes("experience") || r.includes("level")) return TrendingUp;
  if (r.includes("location") || r.includes("city") || r.includes("meet"))  return MapPin;
  if (r.includes("time") || r.includes("schedule") || r.includes("avail")) return Clock;
  if (r.includes("rating") || r.includes("review") || r.includes("rep"))   return Star;
  if (r.includes("mutual") || r.includes("exchange") || r.includes("both")) return Users;
  if (r.includes("active") || r.includes("online")) return Zap;
  if (r.includes("success") || r.includes("similar")) return Award;
  if (r.includes("communication") || r.includes("personality")) return Heart;
  return Target;
};

/* ── color palette (indigo/violet theme) ─────────────────── */
const PALETTE = [
  { dk: "bg-indigo-500/12 border-indigo-500/25 text-indigo-300",  lt: "bg-indigo-50 border-indigo-200 text-indigo-700",  icon: "text-indigo-400" },
  { dk: "bg-violet-500/12 border-violet-500/25 text-violet-300",  lt: "bg-violet-50 border-violet-200 text-violet-700",  icon: "text-violet-400" },
  { dk: "bg-emerald-500/12 border-emerald-500/25 text-emerald-300", lt: "bg-emerald-50 border-emerald-200 text-emerald-700", icon: "text-emerald-400" },
  { dk: "bg-blue-500/12 border-blue-500/25 text-blue-300",        lt: "bg-blue-50 border-blue-200 text-blue-700",        icon: "text-blue-400"   },
  { dk: "bg-amber-500/12 border-amber-500/25 text-amber-300",     lt: "bg-amber-50 border-amber-200 text-amber-700",     icon: "text-amber-400"  },
  { dk: "bg-rose-500/12 border-rose-500/25 text-rose-300",        lt: "bg-rose-50 border-rose-200 text-rose-700",        icon: "text-rose-400"   },
];

const getStyle = (isDarkMode, index) => {
  const p = PALETTE[index % PALETTE.length];
  return isDarkMode ? { chip: p.dk, icon: p.icon } : { chip: p.lt, icon: p.icon };
};

/* ─────────────────────────────────────────────────────────────
   MAIN: MatchReasons
──────────────────────────────────────────────────────────── */
const MatchReasons = ({
  reasons = [],
  showAll = false,
  maxVisible = 2,
  className = "",
  variant = "default",
}) => {
  const { isDarkMode } = useTheme();
  const [expanded, setExpanded] = useState(showAll);
  const visible = expanded ? reasons : reasons.slice(0, maxVisible);
  const hasMore = reasons.length > maxVisible;

  if (!reasons.length) return null;

  /* ── compact: icon row with tooltips ─────────────────── */
  if (variant === "compact") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex items-center gap-1">
          {visible.map((reason, i) => {
            const Icon  = getIcon(reason);
            const style = getStyle(isDarkMode, i);
            return (
              <div key={i} title={reason}
                className={`group relative p-1.5 rounded-lg border transition-all duration-200 hover:scale-105 ${style.chip}`}>
                <Icon className={`w-4 h-4 ${style.icon}`} />
                <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded-lg text-xs font-medium whitespace-nowrap z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-xl ${
                  isDarkMode ? "bg-slate-900 text-slate-100 border border-slate-700" : "bg-gray-900 text-white"
                }`}>
                  {reason}
                  <div className={`absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent ${isDarkMode ? "border-t-slate-900" : "border-t-gray-900"}`} />
                </div>
              </div>
            );
          })}
        </div>
        {hasMore && !expanded && (
          <button onClick={() => setExpanded(true)}
            className={`text-xs font-semibold transition-colors ${isDarkMode ? "text-indigo-400 hover:text-indigo-300" : "text-indigo-600 hover:text-indigo-500"}`}>
            +{reasons.length - maxVisible} more
          </button>
        )}
      </div>
    );
  }

  /* ── detailed: full cards ────────────────────────────── */
  if (variant === "detailed") {
    return (
      <div className={`space-y-2.5 ${className}`}>
        <div className={`flex items-center gap-2 mb-3 text-sm font-bold ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>
          <Info className="w-4 h-4 text-indigo-400" />
          Why this is a great match:
        </div>
        <div className="space-y-2">
          {visible.map((reason, i) => {
            const Icon  = getIcon(reason);
            const style = getStyle(isDarkMode, i);
            return (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border transition-all duration-200 hover:scale-[1.01] ${style.chip}`}>
                <div className={`p-1.5 rounded-lg border ${style.chip} flex-shrink-0`}>
                  <Icon className={`w-4 h-4 ${style.icon}`} />
                </div>
                <p className={`text-sm font-medium flex-1 leading-relaxed ${isDarkMode ? "text-slate-200" : "text-gray-800"}`}>{reason}</p>
                <CheckCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${style.icon}`} />
              </div>
            );
          })}
        </div>
        {hasMore && (
          <button onClick={() => setExpanded(p => !p)}
            className={`flex items-center gap-1.5 text-sm font-bold transition-colors mt-1 ${isDarkMode ? "text-indigo-400 hover:text-indigo-300" : "text-indigo-600 hover:text-indigo-500"}`}>
            <Eye className="w-4 h-4" />
            {expanded ? "Show less" : `Show ${reasons.length - maxVisible} more reasons`}
            <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>
    );
  }

  /* ── default: inline pill rows ───────────────────────── */
  return (
    <div className={className}>
      <div className="space-y-1.5">
        {visible.map((reason, i) => {
          const Icon  = getIcon(reason);
          const style = getStyle(isDarkMode, i);
          return (
            <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-200 hover:scale-[1.01] ${style.chip}`}>
              <Icon className={`w-4 h-4 flex-shrink-0 ${style.icon}`} />
              <span className={`text-sm font-medium ${isDarkMode ? "text-slate-200" : "text-gray-700"}`}>{reason}</span>
            </div>
          );
        })}
      </div>
      {hasMore && (
        <button onClick={() => setExpanded(p => !p)}
          className={`flex items-center gap-1.5 mt-2 text-xs font-semibold transition-colors ${isDarkMode ? "text-indigo-400 hover:text-indigo-300" : "text-indigo-600 hover:text-indigo-500"}`}>
          <Eye className="w-3 h-3" />
          {expanded ? "Show less" : `Show ${reasons.length - maxVisible} more`}
          <svg className={`w-3 h-3 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}
    </div>
  );
};

/* ── MatchReasonsSummary ─────────────────────────────────── */
export const MatchReasonsSummary = ({ reasons = [], className = "" }) => {
  const { isDarkMode } = useTheme();
  const top = reasons.slice(0, 3);
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <span className={`text-xs font-medium ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}>Great for:</span>
      {top.map((reason, i) => {
        const Icon = getIcon(reason);
        return <Icon key={i} className={`w-3 h-3 ${isDarkMode ? "text-indigo-400" : "text-indigo-500"}`} title={reason} />;
      })}
      {reasons.length > 3 && (
        <span className={`text-xs font-medium ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}>+{reasons.length - 3}</span>
      )}
    </div>
  );
};

/* ── ReasonsFilter ───────────────────────────────────────── */
export const ReasonsFilter = ({ reasons = [], selectedCategories = [], onCategoryChange, className = "" }) => {
  const { isDarkMode } = useTheme();
  const CATS = [
    { key: "skill",      label: "Skills",         icon: BookOpen  },
    { key: "experience", label: "Experience",     icon: TrendingUp },
    { key: "location",   label: "Location",       icon: MapPin    },
    { key: "time",       label: "Availability",   icon: Clock     },
    { key: "rating",     label: "Reputation",     icon: Star      },
    { key: "mutual",     label: "Mutual Interest",icon: Users     },
  ];

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {CATS.map(cat => {
        const count      = reasons.filter(r => r.toLowerCase().includes(cat.key)).length;
        const isSelected = selectedCategories.includes(cat.key);
        const Icon       = cat.icon;
        if (!count) return null;
        return (
          <button key={cat.key} onClick={() => onCategoryChange?.(cat.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all duration-200 ${
              isSelected
                ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white border-transparent shadow-md shadow-indigo-500/20"
                : isDarkMode
                  ? "bg-slate-800/60 border-slate-700/50 text-slate-400 hover:border-indigo-500/40 hover:text-indigo-300"
                  : "bg-white border-indigo-100 text-gray-500 hover:border-indigo-300 hover:text-indigo-600"
            }`}>
            <Icon className="w-3 h-3" />
            <span>{cat.label}</span>
            <span className={`px-1.5 py-0.5 rounded-full text-xs font-black ${
              isSelected ? "bg-white/20 text-white" : isDarkMode ? "bg-indigo-500/20 text-indigo-300" : "bg-indigo-100 text-indigo-600"
            }`}>{count}</span>
          </button>
        );
      })}
    </div>
  );
};

/* ── ReasonsStats ────────────────────────────────────────── */
export const ReasonsStats = ({ matches = [], className = "" }) => {
  const { isDarkMode } = useTheme();
  const allReasons = matches.flatMap(m => m.reasons || []);
  const counts = {};
  allReasons.forEach(r => { counts[r] = (counts[r] || 0) + 1; });
  const top = Object.entries(counts).sort(([,a],[,b]) => b - a).slice(0, 5);

  const DOT_COLORS = ["#6366f1","#8b5cf6","#10b981","#3b82f6","#f59e0b"];

  return (
    <div className={`rounded-2xl border p-4 ${isDarkMode ? "bg-slate-800/60 border-slate-700/50" : "bg-white border-indigo-100 shadow-sm"} ${className}`}>
      <h4 className={`text-sm font-bold mb-3 ${isDarkMode ? "text-slate-200" : "text-gray-800"}`}>
        Top Match Reasons
      </h4>
      <div className="space-y-2.5">
        {top.map(([reason, count], i) => (
          <div key={reason} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: DOT_COLORS[i] }} />
              <span className={`text-xs truncate ${isDarkMode ? "text-slate-400" : "text-gray-600"}`}>{reason}</span>
            </div>
            <span className={`text-xs font-black flex-shrink-0 ${isDarkMode ? "text-indigo-300" : "text-indigo-600"}`}>{count}</span>
          </div>
        ))}
        {top.length === 0 && (
          <p className={`text-xs ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}>No reason data available</p>
        )}
      </div>
    </div>
  );
};

/* ── ReasonsCarousel ─────────────────────────────────────── */
export const ReasonsCarousel = ({ reasons = [], autoPlay = true, className = "" }) => {
  const { isDarkMode } = useTheme();
  const [idx, setIdx] = useState(0);

  React.useEffect(() => {
    if (!autoPlay || reasons.length <= 1) return;
    const t = setInterval(() => setIdx(p => (p + 1) % reasons.length), 3000);
    return () => clearInterval(t);
  }, [autoPlay, reasons.length]);

  if (!reasons.length) return null;
  const Icon  = getIcon(reasons[idx]);
  const style = getStyle(isDarkMode, idx);

  return (
    <div className={`relative overflow-hidden rounded-2xl border p-4 ${isDarkMode ? "bg-slate-800/50 border-slate-700/40" : "bg-indigo-50/60 border-indigo-100"} ${className}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-xl border ${style.chip}`}>
          <Icon className={`w-5 h-5 ${style.icon}`} />
        </div>
        <p className={`text-sm font-semibold flex-1 leading-snug ${isDarkMode ? "text-slate-200" : "text-gray-800"}`}>
          {reasons[idx]}
        </p>
      </div>
      {reasons.length > 1 && (
        <div className="flex justify-center gap-1.5">
          {reasons.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)}
              className={`rounded-full transition-all duration-300 ${i === idx ? "w-5 h-1.5 bg-indigo-500" : "w-1.5 h-1.5 bg-indigo-300/40 hover:bg-indigo-400/60"}`} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MatchReasons;

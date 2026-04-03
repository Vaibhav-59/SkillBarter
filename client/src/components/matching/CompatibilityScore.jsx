// /client/src/components/matching/CompatibilityScore.jsx
import React, { useState, useEffect, useRef } from "react";
import { Zap, Star, Award, Target } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";

/* ── score tier config ─────────────────────────────────── */
const getTier = (score) => {
  if (score >= 85) return { from: "#6366f1", to: "#8b5cf6", label: "Perfect Match", icon: Award,  glowColor: "rgba(99,102,241,0.4)" };
  if (score >= 70) return { from: "#3b82f6", to: "#06b6d4", label: "Great Match",   icon: Star,   glowColor: "rgba(59,130,246,0.35)" };
  if (score >= 50) return { from: "#f59e0b", to: "#f97316", label: "Good Match",    icon: Target, glowColor: "rgba(245,158,11,0.35)" };
  return               { from: "#64748b", to: "#475569", label: "Potential",       icon: Zap,    glowColor: "rgba(100,116,139,0.2)"  };
};

/* ── animated ring (same as SmartMatchCard) ─────────────── */
const ScoreRing = ({ score, size = "md" }) => {
  const [animated, setAnimated] = useState(0);
  const { from, to, glowColor } = getTier(score);
  const id = `compat-ring-${score}-${size}`;

  const dim  = { sm: 56,  md: 72,  lg: 96,  xl: 112 }[size] || 72;
  const R    = { sm: 22,  md: 28,  lg: 38,  xl: 46  }[size] || 28;
  const sw   = { sm: 4,   md: 5,   lg: 6,   xl: 7   }[size] || 5;
  const norm = 2 * Math.PI * R;

  useEffect(() => {
    const t = setTimeout(() => setAnimated(score), 150);
    return () => clearTimeout(t);
  }, [score]);

  return (
    <div className="relative flex-shrink-0" style={{ width: dim, height: dim }}>
      {/* outer glow */}
      <div className="absolute inset-0 rounded-full opacity-25 blur-md"
        style={{ background: `conic-gradient(${from}, ${to}, transparent)` }} />
      <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`} className="absolute inset-0 -rotate-90">
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
        </defs>
        <circle cx={dim/2} cy={dim/2} r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={sw} />
        <circle cx={dim/2} cy={dim/2} r={R} fill="none"
          stroke={`url(#${id})`} strokeWidth={sw} strokeLinecap="round"
          strokeDasharray={norm}
          strokeDashoffset={norm - (animated / 100) * norm}
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)", filter: `drop-shadow(0 0 6px ${glowColor})` }}
        />
      </svg>
      {/* inner */}
      <div className="absolute inset-[6px] rounded-full flex flex-col items-center justify-center"
        style={{ background: `radial-gradient(circle, ${glowColor} 0%, rgba(10,15,26,0.92) 100%)` }}>
        <span className="font-black text-white leading-none" style={{ fontSize: dim < 70 ? 12 : dim < 90 ? 16 : 22 }}>{score}</span>
        <span className="font-bold uppercase tracking-widest mt-0.5" style={{ fontSize: 8, color: from }}>match</span>
      </div>
    </div>
  );
};

/* ── Main: CompatibilityScore ────────────────────────────── */
const CompatibilityScore = ({
  score,
  confidence = null,
  size = "md",
  showLabel = true,
  showConfidence = false,
  animated = true,
  className = "",
}) => {
  const { isDarkMode } = useTheme();
  const tier = getTier(score);
  const Icon = tier.icon;

  const labelColor = {
    85: isDarkMode ? "text-indigo-300" : "text-indigo-700",
    70: isDarkMode ? "text-blue-300"   : "text-blue-700",
    50: isDarkMode ? "text-amber-300"  : "text-amber-700",
  };
  const lc = score >= 85 ? labelColor[85] : score >= 70 ? labelColor[70] : score >= 50 ? labelColor[50]
    : isDarkMode ? "text-slate-400" : "text-gray-500";

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <ScoreRing score={score} size={size} />
      {showLabel && (
        <div className="text-center space-y-0.5">
          <div className={`text-xs font-bold ${lc}`}>{tier.label}</div>
          {showConfidence && confidence && (
            <div className={`text-xs ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}>{confidence}% confidence</div>
          )}
        </div>
      )}
    </div>
  );
};

/* ── CompatibilityBadge ──────────────────────────────────── */
export const CompatibilityBadge = ({ score, className = "" }) => {
  const { isDarkMode } = useTheme();
  const tier = getTier(score);
  const badge = score >= 85
    ? isDarkMode ? "bg-indigo-500/15 border-indigo-500/30 text-indigo-300" : "bg-indigo-50 border-indigo-200 text-indigo-700"
    : score >= 70
    ? isDarkMode ? "bg-blue-500/15 border-blue-500/30 text-blue-300"       : "bg-blue-50 border-blue-200 text-blue-700"
    : score >= 50
    ? isDarkMode ? "bg-amber-500/15 border-amber-500/30 text-amber-300"    : "bg-amber-50 border-amber-200 text-amber-700"
    : isDarkMode ? "bg-slate-700/40 border-slate-600/30 text-slate-400"    : "bg-gray-50 border-gray-200 text-gray-600";

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${badge} ${className}`}>
      <Zap className="w-3 h-3" />
      {score}% match
    </span>
  );
};

/* ── CompatibilityBar ────────────────────────────────────── */
export const CompatibilityBar = ({ score, label = true, height = "h-2", className = "" }) => {
  const { isDarkMode } = useTheme();
  const [w, setW] = useState(0);
  const ref = useRef();
  const tier = getTier(score);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setW(score); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [score]);

  return (
    <div ref={ref} className={`w-full ${className}`}>
      {label && (
        <div className={`flex justify-between text-xs mb-1 ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
          <span>Compatibility</span>
          <span className="font-bold" style={{ color: tier.from }}>{score}%</span>
        </div>
      )}
      <div className={`w-full ${height} rounded-full overflow-hidden ${isDarkMode ? "bg-slate-700/50" : "bg-gray-100"}`}>
        <div className={`${height} rounded-full transition-all duration-1000 ease-out`}
          style={{
            width: `${w}%`,
            background: `linear-gradient(90deg, ${tier.from}, ${tier.to})`,
            boxShadow: `0 0 8px ${tier.glowColor}`,
          }} />
      </div>
    </div>
  );
};

/* ── CompatibilityComparison ─────────────────────────────── */
export const CompatibilityComparison = ({ scores, labels }) => {
  const { isDarkMode } = useTheme();
  return (
    <div className="space-y-4">
      {scores.map((score, i) => (
        <div key={i} className="flex items-center gap-3">
          <CompatibilityScore score={score} size="sm" showLabel={false} animated={false} />
          <div className="flex-1">
            <div className={`text-sm font-semibold mb-1 ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>
              {labels?.[i] || `Match ${i + 1}`}
            </div>
            <CompatibilityBar score={score} label={false} height="h-1.5" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default CompatibilityScore;

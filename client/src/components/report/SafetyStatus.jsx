// components/report/SafetyStatus.jsx
import { Loader2, Shield, AlertTriangle, CheckCircle, XCircle, RefreshCw, TrendingUp } from "lucide-react";

export default function SafetyStatus({ isDarkMode, safetyData, onRefresh }) {
  const cardBase = isDarkMode ? "bg-gray-900/60 border-gray-800" : "bg-white border-gray-200 shadow-sm";

  if (!safetyData) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
      </div>
    );
  }

  const { trustScore, reportsCount, warningCount, isSuspended, isFlagged, isVerified } = safetyData;

  // Trust score visual
  const scoreColor = trustScore >= 75 ? "#22c55e" : trustScore >= 50 ? "#f59e0b" : "#ef4444";
  const scoreLabel = trustScore >= 75 ? "Excellent" : trustScore >= 50 ? "Fair" : "At Risk";
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const filled = (trustScore / 100) * circumference;

  const metrics = [
    {
      label: "Trust Score",
      value: `${trustScore}/100`,
      sub: scoreLabel,
      Icon: Shield,
      color: trustScore >= 75 ? "text-emerald-500" : trustScore >= 50 ? "text-amber-500" : "text-red-500",
      bg: trustScore >= 75
        ? (isDarkMode ? "bg-emerald-500/10 border-emerald-500/20" : "bg-emerald-50 border-emerald-200")
        : trustScore >= 50
        ? (isDarkMode ? "bg-amber-500/10 border-amber-500/20" : "bg-amber-50 border-amber-200")
        : (isDarkMode ? "bg-red-500/10 border-red-500/20" : "bg-red-50 border-red-200"),
    },
    {
      label: "Verification",
      value: isVerified ? "Verified ✓" : "Unverified",
      sub: isVerified ? "Identity confirmed" : "Complete profile",
      Icon: CheckCircle,
      color: isVerified ? "text-blue-500" : (isDarkMode ? "text-slate-400" : "text-gray-500"),
      bg: isVerified
        ? (isDarkMode ? "bg-blue-500/10 border-blue-500/20" : "bg-blue-50 border-blue-200")
        : (isDarkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"),
    },
    {
      label: "Reports Received",
      value: reportsCount,
      sub: "By other users",
      Icon: AlertTriangle,
      color: reportsCount > 5 ? "text-red-500" : reportsCount > 0 ? "text-amber-500" : "text-emerald-500",
      bg: reportsCount > 5
        ? (isDarkMode ? "bg-red-500/10 border-red-500/20" : "bg-red-50 border-red-200")
        : (isDarkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"),
    },
    {
      label: "Warnings",
      value: warningCount,
      sub: warningCount === 0 ? "Clean record" : "From admin",
      Icon: XCircle,
      color: warningCount > 2 ? "text-red-500" : warningCount > 0 ? "text-amber-500" : "text-emerald-500",
      bg: warningCount > 2
        ? (isDarkMode ? "bg-red-500/10 border-red-500/20" : "bg-red-50 border-red-200")
        : (isDarkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`rounded-2xl border p-5 ${cardBase} flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h2 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              Safety Status & Trust Score
            </h2>
            <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
              Your account's safety metrics and reputation score
            </p>
          </div>
        </div>
        <button
          onClick={onRefresh}
          className={`p-2 rounded-xl transition-colors ${isDarkMode ? "hover:bg-gray-800 text-slate-400" : "hover:bg-gray-100 text-gray-500"}`}
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Suspension alert */}
      {isSuspended && (
        <div className={`flex items-start gap-3 p-4 rounded-2xl border ${
          isDarkMode ? "bg-red-900/20 border-red-500/30" : "bg-red-50 border-red-200"
        }`}>
          <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-red-500 text-sm">Account Suspended</p>
            <p className={`text-xs mt-0.5 ${isDarkMode ? "text-red-300" : "text-red-600"}`}>
              Your account has been suspended due to repeated violations. Contact support to appeal.
            </p>
          </div>
        </div>
      )}

      {/* Trust Score Ring + Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Trust Score Ring Card */}
        <div className={`rounded-2xl border p-6 flex flex-col items-center justify-center gap-3 ${cardBase}`}>
          <svg width={120} height={120} className="-rotate-90">
            <circle cx={60} cy={60} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={10} />
            <circle
              cx={60} cy={60} r={radius} fill="none"
              stroke={scoreColor} strokeWidth={10}
              strokeDasharray={`${filled} ${circumference}`}
              strokeLinecap="round"
              style={{ transition: "stroke-dasharray 1s cubic-bezier(0.4,0,0.2,1)" }}
            />
          </svg>
          {/* Score overlay */}
          <div className="text-center -mt-2">
            <div className="text-4xl font-black" style={{ color: scoreColor }}>{trustScore}</div>
            <div className={`text-xs uppercase font-bold tracking-wider ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>Trust Score</div>
          </div>
          <div className={`px-4 py-1 rounded-full text-xs font-bold border`} style={{
            color: scoreColor,
            borderColor: scoreColor + "40",
            background: scoreColor + "15",
          }}>
            {scoreLabel}
          </div>
          {/* Progress bar */}
          <div className={`w-full h-2 rounded-full overflow-hidden ${isDarkMode ? "bg-gray-700" : "bg-gray-200"}`}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${trustScore}%`, background: scoreColor }}
            />
          </div>
          <div className={`flex justify-between w-full text-[10px] ${isDarkMode ? "text-slate-600" : "text-gray-400"}`}>
            <span>At Risk (0)</span>
            <span>Trusted (100)</span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          {metrics.map(({ label, value, sub, Icon, color, bg }) => (
            <div key={label} className={`rounded-2xl border p-5 flex flex-col gap-3 ${bg}`}>
              <div className="flex items-center gap-2">
                <Icon className={`w-5 h-5 ${color}`} />
                <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
                  {label}
                </span>
              </div>
              <div>
                <div className={`text-2xl font-black ${color}`}>{value}</div>
                <div className={`text-xs mt-0.5 ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}>{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Safety Alerts */}
      {isFlagged && (
        <div className={`rounded-2xl border p-5 ${isDarkMode ? "bg-orange-900/10 border-orange-500/25" : "bg-orange-50 border-orange-200"}`}>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            <h3 className={`font-bold text-sm ${isDarkMode ? "text-orange-300" : "text-orange-700"}`}>
              🤖 AI Safety Alerts
            </h3>
          </div>
          <div className="space-y-2">
            {[
              "This account has been flagged for suspicious activity patterns",
              "Multiple reports have been received from different users",
              "Reduced trust score due to community feedback",
            ].map((alert, i) => (
              <div key={i} className={`flex items-start gap-2 text-sm ${isDarkMode ? "text-orange-200" : "text-orange-700"}`}>
                <span className="text-orange-500 flex-shrink-0">⚠</span>
                <span>{alert}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* How is trust score calculated */}
      <div className={`rounded-2xl border p-5 ${cardBase}`}>
        <h3 className={`font-bold text-sm mb-3 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
          📊 How is Trust Score calculated?
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {[
            { effect: "+",  text: "Verified profile",             points: "+20" },
            { effect: "+",  text: "Positive reviews received",    points: "+2 each" },
            { effect: "-",  text: "Reports received from others", points: "-5 each" },
            { effect: "-",  text: "Admin warning issued",         points: "-10 each" },
            { effect: "-",  text: "Account suspended",            points: "-20" },
            { effect: "+",  text: "Active and trusted member",    points: "baseline 100" },
          ].map(({ effect, text, points }) => (
            <div key={text} className={`flex items-center justify-between p-2 rounded-xl ${
              isDarkMode ? "bg-gray-800/60" : "bg-gray-50"
            }`}>
              <span className={`text-xs ${isDarkMode ? "text-slate-300" : "text-gray-600"}`}>{text}</span>
              <span className={`text-xs font-bold ${effect === "+" ? "text-emerald-500" : "text-red-500"}`}>{points}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

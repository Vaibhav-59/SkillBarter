// pages/ReportSafety.jsx
import { useState, useEffect, useCallback } from "react";
import { useTheme } from "../hooks/useTheme";
import { toast } from "react-toastify";
import {
  Shield, Flag, AlertTriangle, Users, BookOpen,
  ChevronRight, BarChart3, Lock, ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getSafetyStatus } from "../services/reportApi";
import ReportForm from "../components/report/ReportForm";
import MyReports from "../components/report/MyReports";
import SafetyStatus from "../components/report/SafetyStatus";
import BlockedUsers from "../components/report/BlockedUsers";
import SafetyGuidelines from "../components/report/SafetyGuidelines";

const TABS = [
  { id: "report",    label: "Report Issue",    icon: Flag },
  { id: "myreports", label: "My Reports",      icon: BarChart3 },
  { id: "safety",    label: "Safety Status",   icon: Shield },
  { id: "blocked",   label: "Blocked Users",   icon: Lock },
  { id: "guidelines",label: "Safety Guide",    icon: BookOpen },
];

export default function ReportSafety() {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("report");
  const [safetyData, setSafetyData] = useState(null);

  const fetchSafety = useCallback(async () => {
    try {
      const res = await getSafetyStatus();
      setSafetyData(res.data);
    } catch {/* silent */}
  }, []);

  useEffect(() => { fetchSafety(); }, [fetchSafety]);

  const bg = isDarkMode
    ? "bg-gradient-to-br from-gray-950 via-slate-950 to-gray-900"
    : "bg-gradient-to-br from-slate-50 via-red-50/30 to-rose-50/20";

  const trustScore = safetyData?.trustScore ?? 100;
  const trustColor = trustScore >= 75 ? "text-emerald-500" : trustScore >= 50 ? "text-amber-500" : "text-red-500";
  const trustBg    = trustScore >= 75
    ? (isDarkMode ? "bg-emerald-500/10 border-emerald-500/20" : "bg-emerald-50 border-emerald-200")
    : trustScore >= 50
    ? (isDarkMode ? "bg-amber-500/10 border-amber-500/20"    : "bg-amber-50 border-amber-200")
    : (isDarkMode ? "bg-red-500/10 border-red-500/20"        : "bg-red-50 border-red-200");

  return (
    <div className={`min-h-screen transition-colors duration-300 ${bg}`}>
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-red-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-24 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-rose-500/4 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Back button */}
        <button
          onClick={() => navigate("/dashboard")}
          className={`flex items-center gap-2 text-sm font-medium mb-6 group transition-colors ${
            isDarkMode ? "text-slate-400 hover:text-white" : "text-gray-500 hover:text-gray-900"
          }`}
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>

        {/* ── Page Header ───────────────────────────── */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 mb-4">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-semibold text-red-500 uppercase tracking-widest">Report & Safety</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <h1 className={`text-4xl sm:text-5xl font-extrabold tracking-tight mb-3 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}>
                <Shield className="inline w-10 h-10 mr-3 text-red-500 -mt-1" />
                Report & Safety
              </h1>
              <p className={`text-lg ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
                Help keep the community safe by reporting suspicious or harmful activity
              </p>
            </div>

            {/* Trust Score Quick View */}
            {safetyData && (
              <div className={`flex items-center gap-4 px-5 py-3 rounded-2xl border ${trustBg}`}>
                <div className="text-center">
                  <div className={`text-3xl font-black ${trustColor}`}>{trustScore}</div>
                  <div className={`text-[10px] uppercase font-bold tracking-wider ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}>
                    Trust Score
                  </div>
                </div>
                <div className={`text-left text-sm ${isDarkMode ? "text-slate-300" : "text-gray-600"}`}>
                  <div className="font-semibold">
                    {trustScore >= 75 ? "✅ Trusted Member" : trustScore >= 50 ? "⚠️ Caution" : "🔴 At Risk"}
                  </div>
                  <div className={`text-xs ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}>
                    {safetyData.warningCount} warning{safetyData.warningCount !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AI Safety Alert */}
        {safetyData?.isFlagged && (
          <div className={`mb-6 flex items-start gap-3 p-4 rounded-2xl border ${
            isDarkMode ? "bg-red-900/20 border-red-500/30" : "bg-red-50 border-red-200"
          }`}>
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-500">⚠️ Safety Alert</p>
              <p className={`text-xs mt-0.5 ${isDarkMode ? "text-red-300" : "text-red-600"}`}>
                Your account has been flagged for suspicious activity. Please review the safety guidelines and contact support if you believe this is a mistake.
              </p>
            </div>
          </div>
        )}

        {/* ── Tabs ─────────────────────────────────── */}
        <div className={`flex flex-wrap gap-1 p-1 rounded-2xl mb-8 ${
          isDarkMode ? "bg-gray-900/60 border border-gray-800" : "bg-white border border-gray-200 shadow-sm"
        }`}>
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === id
                  ? "bg-red-500 text-white shadow-md shadow-red-500/20"
                  : isDarkMode
                  ? "text-slate-400 hover:text-white hover:bg-gray-800"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* ── Tab Content ───────────────────────────── */}
        {activeTab === "report"     && <ReportForm     isDarkMode={isDarkMode} />}
        {activeTab === "myreports"  && <MyReports      isDarkMode={isDarkMode} />}
        {activeTab === "safety"     && <SafetyStatus   isDarkMode={isDarkMode} safetyData={safetyData} onRefresh={fetchSafety} />}
        {activeTab === "blocked"    && <BlockedUsers   isDarkMode={isDarkMode} />}
        {activeTab === "guidelines" && <SafetyGuidelines isDarkMode={isDarkMode} />}

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className={`text-sm ${isDarkMode ? "text-slate-700" : "text-gray-300"}`}>
            All reports are confidential and reviewed by our moderation team. 🛡️
          </p>
        </div>
      </div>
    </div>
  );
}

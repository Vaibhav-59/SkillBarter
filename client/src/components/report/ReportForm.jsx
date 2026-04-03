// components/report/ReportForm.jsx
import { useState } from "react";
import { Flag, User, FileText, MessageSquare, Video, BookOpen, AlertCircle, CheckCircle2, Upload, Loader2 } from "lucide-react";
import { submitReport } from "../../services/reportApi";
import { toast } from "react-toastify";

const REPORT_TYPES = [
  { id: "user",     label: "User Profile",     icon: User,          color: "text-blue-500",   bg: "bg-blue-500/10 border-blue-500/30" },
  { id: "post",     label: "Community Post",   icon: FileText,      color: "text-purple-500", bg: "bg-purple-500/10 border-purple-500/30" },
  { id: "message",  label: "Chat Message",     icon: MessageSquare, color: "text-green-500",  bg: "bg-green-500/10 border-green-500/30" },
  { id: "session",  label: "Session",          icon: Video,         color: "text-orange-500", bg: "bg-orange-500/10 border-orange-500/30" },
  { id: "resource", label: "Learning Resource",icon: BookOpen,      color: "text-cyan-500",   bg: "bg-cyan-500/10 border-cyan-500/30" },
];

const REASONS = [
  { id: "spam",                   label: "Spam",                    emoji: "📧" },
  { id: "fraud",                  label: "Fraud / Scam",            emoji: "💰" },
  { id: "fake_profile",           label: "Fake Profile",            emoji: "🎭" },
  { id: "harassment",             label: "Harassment / Bullying",   emoji: "🚫" },
  { id: "inappropriate_content",  label: "Inappropriate Content",   emoji: "⚠️" },
  { id: "misleading_information", label: "Misleading Information",  emoji: "❌" },
  { id: "other",                  label: "Other",                   emoji: "📋" },
];

export default function ReportForm({ isDarkMode }) {
  const [step, setStep] = useState(1);
  const [reportType, setReportType]   = useState("");
  const [targetId, setTargetId]       = useState("");
  const [reason, setReason]           = useState("");
  const [description, setDescription] = useState("");
  const [proofUrl, setProofUrl]       = useState("");
  const [loading, setLoading]         = useState(false);
  const [submitted, setSubmitted]     = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reportType || !targetId || !reason) {
      toast.error("Please fill all required fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await submitReport({ targetId, targetType: reportType, reason, description, proofUrl });
      setSubmitted(res);
      toast.success(res.message || "Report submitted successfully!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to submit report");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(1); setReportType(""); setTargetId("");
    setReason(""); setDescription(""); setProofUrl("");
    setSubmitted(null);
  };

  const cardBase = isDarkMode
    ? "bg-gray-900/60 border-gray-800 backdrop-blur-sm"
    : "bg-white border-gray-200 shadow-sm";

  const inputCls = `w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-red-500 ${
    isDarkMode
      ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500"
      : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white"
  }`;

  // ── Success State ────────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className={`rounded-2xl border p-10 text-center ${isDarkMode ? "bg-emerald-900/10 border-emerald-500/25" : "bg-emerald-50 border-emerald-200"}`}>
        <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-5" />
        <h3 className={`text-2xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
          Report Submitted Successfully!
        </h3>
        <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full font-mono text-sm font-bold mb-4 ${
          isDarkMode ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "bg-emerald-100 text-emerald-700 border border-emerald-200"
        }`}>
          🆔 {submitted.message?.match(/RPT[A-Z0-9]{6}/)?.[0] || "RPT-" + submitted.reportId?.toString().slice(-6).toUpperCase()}
        </div>
        <p className={`text-sm mb-6 ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
          Our moderation team will review your report and take appropriate action within 24–48 hours.
        </p>
        <button
          onClick={reset}
          className="px-8 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition-colors"
        >
          Submit Another Report
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`rounded-2xl border p-6 ${cardBase}`}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
            <Flag className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h2 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              Submit a Report
            </h2>
            <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
              All reports are confidential and reviewed by our team
            </p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mt-5">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                s <= step
                  ? "bg-red-500 text-white"
                  : isDarkMode ? "bg-gray-700 text-gray-400" : "bg-gray-200 text-gray-400"
              }`}>{s}</div>
              {s < 3 && <div className={`w-12 h-0.5 transition-all ${s < step ? "bg-red-500" : isDarkMode ? "bg-gray-700" : "bg-gray-200"}`} />}
            </div>
          ))}
          <span className={`ml-3 text-xs ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}>
            {step === 1 ? "Select Type" : step === 2 ? "Choose Reason" : "Add Details"}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Step 1 — Report Type */}
        <div className={`rounded-2xl border p-6 ${cardBase}`}>
          <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
            Step 1 — What are you reporting? *
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {REPORT_TYPES.map(({ id, label, icon: Icon, color, bg }) => (
              <button
                key={id}
                type="button"
                onClick={() => { setReportType(id); if (step < 2) setStep(2); }}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 text-center hover:scale-105 ${
                  reportType === id
                    ? bg + " " + color + " border-current shadow-md"
                    : isDarkMode
                    ? "border-gray-700 text-slate-400 hover:border-gray-600"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs font-semibold leading-tight">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2 — Reason */}
        {reportType && (
          <div className={`rounded-2xl border p-6 ${cardBase}`}>
            <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
              Step 2 — Select Reason *
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {REASONS.map(({ id, label, emoji }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => { setReason(id); if (step < 3) setStep(3); }}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all hover:scale-[1.01] ${
                    reason === id
                      ? isDarkMode
                        ? "border-red-500/50 bg-red-500/10 text-red-400"
                        : "border-red-400 bg-red-50 text-red-700"
                      : isDarkMode
                      ? "border-gray-700 text-slate-300 hover:border-gray-600"
                      : "border-gray-200 text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <span className="text-xl">{emoji}</span>
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3 — Details */}
        {reportType && reason && (
          <div className={`rounded-2xl border p-6 ${cardBase}`}>
            <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
              Step 3 — Details *
            </h3>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-semibold mb-1.5 ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>
                  Target ID / URL *
                </label>
                <input
                  required
                  type="text"
                  value={targetId}
                  onChange={e => setTargetId(e.target.value)}
                  placeholder="Paste the user ID, post ID or content URL…"
                  className={inputCls}
                />
                <p className={`text-xs mt-1 ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}>
                  You can find user IDs in their profile URL or by clicking "Copy ID" in their profile options.
                </p>
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-1.5 ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>
                  Additional Description <span className={isDarkMode ? "text-slate-500" : "text-gray-400"}>(optional)</span>
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Provide more context about the incident…"
                  className={`${inputCls} resize-none`}
                  maxLength={1000}
                />
                <p className={`text-xs mt-1 text-right ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}>
                  {description.length}/1000
                </p>
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-1.5 ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>
                  Proof URL <span className={isDarkMode ? "text-slate-500" : "text-gray-400"}>(screenshot / drive link, optional)</span>
                </label>
                <div className="relative">
                  <Upload className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDarkMode ? "text-slate-500" : "text-gray-400"}`} />
                  <input
                    type="url"
                    value={proofUrl}
                    onChange={e => setProofUrl(e.target.value)}
                    placeholder="https://drive.google.com/..."
                    className={`${inputCls} pl-10`}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submit */}
        {reportType && reason && (
          <button
            type="submit"
            disabled={loading || !targetId}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm shadow-lg hover:shadow-red-500/30 active:scale-[.98] transition-all disabled:opacity-60"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Submitting Report…</>
            ) : (
              <><Flag className="w-4 h-4" /> Submit Report</>
            )}
          </button>
        )}
      </form>

      {/* Info note */}
      <div className={`flex items-start gap-3 p-4 rounded-xl border ${
        isDarkMode ? "bg-blue-900/10 border-blue-500/20" : "bg-blue-50 border-blue-200"
      }`}>
        <AlertCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
        <p className={`text-xs ${isDarkMode ? "text-blue-300" : "text-blue-700"}`}>
          False reports may result in action against your account. Please only report genuine violations.
          Submitting a report does not guarantee immediate action — all reports are reviewed manually.
        </p>
      </div>
    </div>
  );
}

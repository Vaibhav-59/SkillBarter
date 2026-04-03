// components/report/MyReports.jsx
import { useState, useEffect } from "react";
import { Loader2, BarChart3, RefreshCw, ExternalLink, Clock, CheckCircle, XCircle, Shield } from "lucide-react";
import { getMyReports } from "../../services/reportApi";
import { toast } from "react-toastify";

const STATUS_CONFIG = {
  pending:       { label: "Pending",       color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/30",  icon: Clock },
  under_review:  { label: "Under Review",  color: "text-blue-500 bg-blue-500/10 border-blue-500/30",        icon: Shield },
  action_taken:  { label: "Action Taken",  color: "text-green-500 bg-green-500/10 border-green-500/30",     icon: CheckCircle },
  rejected:      { label: "Rejected",      color: "text-red-500 bg-red-500/10 border-red-500/30",           icon: XCircle },
};

const TYPE_EMOJI = {
  user: "👤", post: "📝", message: "💬", session: "🎥", resource: "📚",
};

const REASON_LABEL = {
  spam:                   "Spam",
  fraud:                  "Fraud / Scam",
  fake_profile:           "Fake Profile",
  harassment:             "Harassment",
  inappropriate_content:  "Inappropriate Content",
  misleading_information: "Misleading Info",
  other:                  "Other",
};

export default function MyReports({ isDarkMode }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await getMyReports();
      setReports(res.data || []);
    } catch {
      toast.error("Failed to load your reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, []);

  const cardBase = isDarkMode ? "bg-gray-900/60 border-gray-800" : "bg-white border-gray-200 shadow-sm";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className={`rounded-2xl border p-5 ${cardBase} flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h2 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>My Reports</h2>
            <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
              {reports.length} report{reports.length !== 1 ? "s" : ""} submitted
            </p>
          </div>
        </div>
        <button
          onClick={fetchReports}
          className={`p-2 rounded-xl transition-colors ${isDarkMode ? "hover:bg-gray-800 text-slate-400" : "hover:bg-gray-100 text-gray-500"}`}
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
        </div>
      ) : reports.length === 0 ? (
        <div className={`text-center py-16 rounded-2xl border ${cardBase}`}>
          <BarChart3 className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? "text-slate-600" : "text-gray-300"}`} />
          <p className={`font-semibold mb-1 ${isDarkMode ? "text-slate-400" : "text-gray-600"}`}>No reports submitted</p>
          <p className={`text-sm ${isDarkMode ? "text-slate-600" : "text-gray-400"}`}>
            Reports you submit will appear here.
          </p>
        </div>
      ) : (
        <div className={`rounded-2xl border overflow-hidden ${cardBase}`}>
          {/* Table header */}
          <div className={`grid grid-cols-12 gap-2 px-5 py-3 text-xs font-semibold uppercase tracking-widest border-b ${
            isDarkMode ? "border-gray-800 text-slate-500 bg-gray-950/40" : "border-gray-100 text-gray-400 bg-gray-50"
          }`}>
            <span className="col-span-1">Type</span>
            <span className="col-span-3">Target</span>
            <span className="col-span-3">Reason</span>
            <span className="col-span-2">Status</span>
            <span className="col-span-2">Report ID</span>
            <span className="col-span-1 text-right">Date</span>
          </div>

          <div className="divide-y divide-gray-800/20">
            {reports.map((r) => {
              const sc = STATUS_CONFIG[r.status] || STATUS_CONFIG.pending;
              const StatusIcon = sc.icon;
              
              return (
                <div
                  key={r._id}
                  className={`grid grid-cols-12 gap-2 px-5 py-4 items-center text-sm transition-colors ${
                    isDarkMode ? "hover:bg-gray-800/30" : "hover:bg-gray-50"
                  }`}
                >
                  {/* Type emoji */}
                  <div className="col-span-1 text-xl text-center">
                    {TYPE_EMOJI[r.targetType] || "📋"}
                  </div>

                  {/* Target */}
                  <div className="col-span-3">
                    {r.targetUser ? (
                      <div className="flex items-center gap-2">
                        <img
                          src={r.targetUser.profileImage || "https://api.dicebear.com/7.x/avataaars/svg"}
                          alt=""
                          className="w-7 h-7 rounded-full"
                        />
                        <div>
                          <p className={`font-semibold text-xs truncate ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                            {r.targetUser.name}
                          </p>
                          <p className={`text-[10px] truncate ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}>
                            {r.targetType}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className={`font-medium text-xs ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>
                          {r.targetType}
                        </p>
                        <p className={`text-[10px] font-mono truncate ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}>
                          {r.targetId?.toString().slice(-8)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Reason */}
                  <div className="col-span-3">
                    <span className={`text-xs ${isDarkMode ? "text-slate-300" : "text-gray-600"}`}>
                      {REASON_LABEL[r.reason] || r.reason}
                    </span>
                    {r.description && (
                      <p className={`text-[10px] line-clamp-1 mt-0.5 italic ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}>
                        {r.description}
                      </p>
                    )}
                  </div>

                  {/* Status */}
                  <div className="col-span-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${sc.color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {sc.label}
                    </span>
                    {r.adminNote && (
                      <p className={`text-[10px] mt-1 italic ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}>
                        "{r.adminNote.slice(0, 30)}{r.adminNote.length > 30 ? '…' : ''}"
                      </p>
                    )}
                  </div>

                  {/* Report ID */}
                  <div className="col-span-2">
                    <code className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                      isDarkMode ? "bg-gray-800 text-slate-400" : "bg-gray-100 text-gray-500"
                    }`}>
                      {r._id?.toString().slice(-8).toUpperCase()}
                    </code>
                  </div>

                  {/* Date */}
                  <div className={`col-span-1 text-right text-[10px] ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}>
                    {new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

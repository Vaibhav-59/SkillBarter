import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import { showError, showSuccess } from "../../utils/toast";
import { useTheme } from "../../hooks/useTheme";

export default function MatchCard({ match, currentUserId, onRespond }) {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  if (!match || !match.requester || !match.receiver) return null;

  const otherUser = match.requester?._id === currentUserId ? match.receiver : match.requester;
  const isReceiver  = match.receiver?._id  === currentUserId;
  const isRequester = match.requester?._id === currentUserId;
  const isPending   = match.status === "pending";

  const [responding, setResponding] = useState(false);

  const userRequestedCompletion  = match.completionRequests?.some(r => r.user.toString() === currentUserId.toString());
  const otherUserRequestedCompletion = match.completionRequests?.some(r => r.user.toString() === otherUser?._id?.toString());

  const handleResponse = async (status) => {
    setResponding(true);
    try {
      await api.put(`/matches/${match._id}`, { status });
      showSuccess(`Match ${status}`);
      onRespond();
    } catch { showError("Failed to update match"); }
    finally { setResponding(false); }
  };

  const handleRequestCompletion = async () => {
    setResponding(true);
    try {
      const res = await api.post(`/matches/${match._id}/complete`);
      showSuccess(res.data.message);
      onRespond();
    } catch (err) { showError(err.response?.data?.message || "Failed to request completion"); }
    finally { setResponding(false); }
  };

  const handleStartChat = () => navigate(`/chat/match/${match._id}`);

  /* ── status chip ──────────────────────────────────── */
  const statusChip = {
    accepted: isDarkMode
      ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
      : "bg-emerald-50 border-emerald-200 text-emerald-700",
    rejected: isDarkMode
      ? "bg-red-500/15 border-red-500/30 text-red-300"
      : "bg-red-50 border-red-200 text-red-700",
    pending: isDarkMode
      ? "bg-amber-500/15 border-amber-500/30 text-amber-300"
      : "bg-amber-50 border-amber-200 text-amber-700",
    completed: isDarkMode
      ? "bg-indigo-500/15 border-indigo-500/30 text-indigo-300"
      : "bg-indigo-50 border-indigo-200 text-indigo-700",
  }[match.status] || (isDarkMode ? "bg-slate-700/40 border-slate-600/30 text-slate-400" : "bg-gray-50 border-gray-200 text-gray-600");

  /* ── completion button ────────────────────────────── */
  const completionBtn = (() => {
    if (userRequestedCompletion && otherUserRequestedCompletion) {
      return { text: "✅ Completed", disabled: true, cls: "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20" };
    } else if (userRequestedCompletion) {
      return { text: "⏳ Awaiting Confirmation", disabled: true, cls: isDarkMode ? "bg-slate-700/60 text-slate-400 border border-slate-600/40" : "bg-gray-100 text-gray-500 border border-gray-200" };
    } else if (otherUserRequestedCompletion) {
      return { text: "✅ Confirm Completion", disabled: false, cls: "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/20" };
    }
    return { text: "✅ Mark Complete", disabled: false, cls: "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/20" };
  })();

  const initials = otherUser.name?.charAt(0)?.toUpperCase() || "U";

  const card = isDarkMode
    ? "bg-slate-800/60 border-slate-700/50 hover:border-indigo-500/30"
    : "bg-white border-indigo-100 shadow-lg shadow-indigo-100/30 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-100/40";

  const infoRow = isDarkMode
    ? "bg-slate-700/40 border-slate-600/30"
    : "bg-indigo-50/60 border-indigo-100";

  const textMain = isDarkMode ? "text-white" : "text-gray-900";
  const textSub  = isDarkMode ? "text-slate-400" : "text-gray-500";

  const Spinner = () => (
    <div className="flex items-center justify-center gap-2">
      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      <span>Processing...</span>
    </div>
  );

  return (
    <div className={`group relative rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 flex flex-col ${card}`}>
      {/* Shimmer overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/3 to-violet-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex items-center gap-4 mb-5">
        <div className="relative flex-shrink-0">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl overflow-hidden shadow-lg group-hover:scale-105 transition-transform duration-300"
            style={{ boxShadow: "0 4px 16px rgba(99,102,241,0.3)" }}>
            {otherUser.profileImage
              ? <img src={otherUser.profileImage} alt={otherUser.name} className="w-full h-full object-cover" />
              : <span>{initials}</span>}
          </div>
          <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-400 rounded-full border-2 ${isDarkMode ? "border-slate-800" : "border-white"} shadow-sm`} />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className={`text-lg font-bold mb-0.5 truncate group-hover:text-indigo-400 transition-colors duration-200 ${textMain}`}>
            {otherUser.name || "Unknown User"}
          </h3>
          <p className={`text-sm truncate ${textSub}`}>{otherUser.email || ""}</p>
        </div>
      </div>

      {/* Bio */}
      {otherUser.bio && (
        <div className={`relative z-10 mb-4 px-3 py-2.5 rounded-xl border text-sm leading-relaxed line-clamp-2 ${infoRow} ${isDarkMode ? "text-slate-300" : "text-gray-600"}`}>
          {otherUser.bio}
        </div>
      )}

      {/* Status + type row */}
      <div className="relative z-10 flex items-center justify-between mb-4">
        <span className={`text-xs font-bold px-3 py-1.5 rounded-full border capitalize ${statusChip}`}>
          {match.status}
        </span>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${
          isDarkMode ? "bg-slate-700/40 border-slate-600/30 text-slate-400" : "bg-gray-50 border-gray-200 text-gray-500"
        }`}>
          {isRequester ? "Sent" : isReceiver ? "Received" : ""}
        </span>
      </div>

      {/* Skills exchange */}
      <div className="relative z-10 space-y-2 mb-5">
        {match.skillOffered && (
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm ${isDarkMode ? "bg-emerald-900/15 border-emerald-700/25 text-emerald-300" : "bg-emerald-50 border-emerald-200 text-emerald-700"}`}>
            <span className="font-medium opacity-70">Offering:</span>
            <span className="font-bold">{match.skillOffered}</span>
          </div>
        )}
        {match.skillRequested && (
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm ${isDarkMode ? "bg-indigo-900/15 border-indigo-700/25 text-indigo-300" : "bg-indigo-50 border-indigo-200 text-indigo-700"}`}>
            <span className="font-medium opacity-70">Requesting:</span>
            <span className="font-bold">{match.skillRequested}</span>
          </div>
        )}
        {match.skillsInvolved?.length > 0 && (
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm ${isDarkMode ? "bg-violet-900/15 border-violet-700/25 text-violet-300" : "bg-violet-50 border-violet-200 text-violet-700"}`}>
            <span className="font-medium opacity-70">Skills:</span>
            <span className="font-bold">{match.skillsInvolved.join(", ")}</span>
          </div>
        )}
        {match.message && (
          <div className={`px-3 py-2.5 rounded-xl border text-sm ${infoRow} ${isDarkMode ? "text-slate-300" : "text-gray-600"}`}>
            <span className={`font-medium ${textSub} text-xs`}>Message: </span>
            <span className="italic">{match.message}</span>
          </div>
        )}
      </div>

      {/* Completion request alert */}
      {match.status === "accepted" && otherUserRequestedCompletion && !userRequestedCompletion && (
        <div className={`relative z-10 mb-4 flex items-start gap-3 p-3 rounded-xl border ${
          isDarkMode ? "bg-amber-900/15 border-amber-700/30" : "bg-amber-50 border-amber-200"
        }`}>
          <span className="text-lg flex-shrink-0">🔔</span>
          <div>
            <p className={`text-sm font-bold ${isDarkMode ? "text-amber-300" : "text-amber-800"}`}>
              {otherUser.name} requested to mark this exchange as complete.
            </p>
            <p className={`text-xs mt-0.5 ${isDarkMode ? "text-amber-400/70" : "text-amber-600"}`}>
              Click "Confirm Completion" if you agree.
            </p>
          </div>
        </div>
      )}

      {/* Action buttons — pushed to bottom */}
      <div className="relative z-10 mt-auto space-y-2">
        {isReceiver && isPending && (
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => handleResponse("accepted")} disabled={responding}
              className="py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 disabled:opacity-50 transition-all duration-200 hover:scale-[1.02] shadow-md shadow-indigo-500/20">
              {responding ? <Spinner /> : "✓ Accept"}
            </button>
            <button onClick={() => handleResponse("rejected")} disabled={responding}
              className="py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 disabled:opacity-50 transition-all duration-200 hover:scale-[1.02] shadow-md shadow-red-500/20">
              {responding ? <Spinner /> : "✕ Reject"}
            </button>
          </div>
        )}

        {match.status === "accepted" && (
          <div className="grid grid-cols-2 gap-2">
            <button onClick={handleStartChat}
              className="py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 transition-all duration-200 hover:scale-[1.02] shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5">
              💬 Chat
            </button>
            <button onClick={handleRequestCompletion} disabled={responding || completionBtn.disabled}
              className={`py-3 rounded-xl font-bold text-sm transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-default ${completionBtn.cls}`}>
              {responding ? <Spinner /> : completionBtn.text}
            </button>
          </div>
        )}

        {match.status === "completed" && (
          <div className="space-y-2">
            <div className={`text-center py-3 rounded-xl border font-bold text-sm ${isDarkMode ? "bg-emerald-900/15 border-emerald-700/30 text-emerald-300" : "bg-emerald-50 border-emerald-200 text-emerald-700"}`}>
              🎉 Exchange Completed!
            </div>
            <button onClick={() => navigate(`/review/${match._id}`)}
              className="w-full py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 transition-all duration-200 hover:scale-[1.02] shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5">
              ⭐ Write Review
            </button>
          </div>
        )}

        {match.status === "rejected" && (
          <div className={`text-center py-3 rounded-xl border text-sm font-semibold ${isDarkMode ? "bg-slate-700/40 border-slate-600/30 text-slate-400" : "bg-gray-50 border-gray-200 text-gray-400"}`}>
            This request was declined
          </div>
        )}
      </div>
    </div>
  );
}

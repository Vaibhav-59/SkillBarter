// components/report/BlockedUsers.jsx
import { useState, useEffect } from "react";
import { Loader2, Lock, UserX, RefreshCw, Shield, AlertCircle } from "lucide-react";
import { getBlockedUsers, blockUser, unblockUser } from "../../services/reportApi";
import { toast } from "react-toastify";

export default function BlockedUsers({ isDarkMode }) {
  const [blocked, setBlocked]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [blockTarget, setBlockTarget] = useState("");
  const [blocking, setBlocking]   = useState(false);
  const [unblocking, setUnblocking] = useState(null);

  const fetchBlocked = async () => {
    setLoading(true);
    try {
      const res = await getBlockedUsers();
      setBlocked(res.data || []);
    } catch {
      toast.error("Failed to load blocked users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBlocked(); }, []);

  const handleBlock = async (e) => {
    e.preventDefault();
    if (!blockTarget.trim()) return;
    setBlocking(true);
    try {
      await blockUser(blockTarget.trim());
      toast.success("User blocked successfully");
      setBlockTarget("");
      fetchBlocked();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to block user");
    } finally {
      setBlocking(false);
    }
  };

  const handleUnblock = async (userId, name) => {
    setUnblocking(userId);
    try {
      await unblockUser(userId);
      toast.success(`${name} has been unblocked`);
      setBlocked(prev => prev.filter(b => b.blockedUserId?._id !== userId));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to unblock user");
    } finally {
      setUnblocking(null);
    }
  };

  const cardBase = isDarkMode ? "bg-gray-900/60 border-gray-800" : "bg-white border-gray-200 shadow-sm";
  const inputCls = `w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-red-500 ${
    isDarkMode
      ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500"
      : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"
  }`;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className={`rounded-2xl border p-5 ${cardBase}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <Lock className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>Block & Mute Users</h2>
              <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
                Blocked users cannot message you or see your content
              </p>
            </div>
          </div>
          <button
            onClick={fetchBlocked}
            className={`p-2 rounded-xl transition-colors ${isDarkMode ? "hover:bg-gray-800 text-slate-400" : "hover:bg-gray-100 text-gray-500"}`}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Block user form */}
        <form onSubmit={handleBlock} className="flex gap-3">
          <input
            type="text"
            value={blockTarget}
            onChange={e => setBlockTarget(e.target.value)}
            placeholder="Enter User ID to block…"
            className={inputCls}
          />
          <button
            type="submit"
            disabled={blocking || !blockTarget.trim()}
            className="px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition-colors flex items-center gap-2 whitespace-nowrap disabled:opacity-60"
          >
            {blocking ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserX className="w-4 h-4" />}
            Block User
          </button>
        </form>

        <div className={`mt-3 flex items-start gap-2 text-xs ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}>
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          <span>Enter the exact User ID (found in the user's profile URL: /user/[ID])</span>
        </div>
      </div>

      {/* Effects of blocking */}
      <div className={`rounded-2xl border p-5 ${cardBase}`}>
        <h3 className={`text-sm font-bold mb-3 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
          🔒 When you block someone:
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            "They cannot send you messages",
            "Their content is hidden from your feed",
            "They cannot view your profile",
            "Existing matches may be affected",
            "You will not see their posts or comments",
            "You can unblock them at any time",
          ].map((item, i) => (
            <div key={i} className={`flex items-center gap-2 text-sm ${isDarkMode ? "text-slate-300" : "text-gray-600"}`}>
              <Shield className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Blocked list */}
      <div className={`rounded-2xl border overflow-hidden ${cardBase}`}>
        <div className={`px-5 py-3 border-b flex items-center justify-between ${
          isDarkMode ? "border-gray-800 bg-gray-950/40" : "border-gray-100 bg-gray-50"
        }`}>
          <h3 className={`text-sm font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            Blocked Users ({blocked.length})
          </h3>
        </div>

        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-6 h-6 text-red-500 animate-spin" />
          </div>
        ) : blocked.length === 0 ? (
          <div className="text-center py-12">
            <Lock className={`w-10 h-10 mx-auto mb-2 ${isDarkMode ? "text-slate-600" : "text-gray-300"}`} />
            <p className={`font-semibold ${isDarkMode ? "text-slate-400" : "text-gray-600"}`}>No blocked users</p>
            <p className={`text-sm ${isDarkMode ? "text-slate-600" : "text-gray-400"}`}>Your blocked list is empty</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800/20">
            {blocked.map((b) => {
              const u = b.blockedUserId;
              return (
                <div
                  key={b._id}
                  className={`flex items-center justify-between px-5 py-4 transition-colors ${
                    isDarkMode ? "hover:bg-gray-800/30" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={u?.profileImage || "https://api.dicebear.com/7.x/avataaars/svg"}
                        alt={u?.name}
                        className="w-10 h-10 rounded-full grayscale opacity-60"
                      />
                      <div className="absolute inset-0 rounded-full border-2 border-red-500/50" />
                    </div>
                    <div>
                      <p className={`font-semibold text-sm ${isDarkMode ? "text-slate-400" : "text-gray-600"}`}>
                        {u?.name || "Unknown User"}
                      </p>
                      <p className={`text-xs ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}>
                        {u?.email ? u.email.split("@")[0] + "@…" : "—"} · Blocked {new Date(b.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleUnblock(u?._id, u?.name)}
                    disabled={unblocking === u?._id}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isDarkMode
                        ? "bg-gray-700 hover:bg-gray-600 text-slate-200 border border-gray-600"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200"
                    } disabled:opacity-50`}
                  >
                    {unblocking === u?._id
                      ? <Loader2 className="w-3 h-3 animate-spin" />
                      : "Unblock"
                    }
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

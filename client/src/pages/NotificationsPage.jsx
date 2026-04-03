import { useEffect, useState } from "react";
import api from "../utils/api";
import { showError, showSuccess } from "../utils/toast";
import { useTheme } from "../hooks/useTheme";

export default function NotificationsPage() {
  const { isDarkMode } = useTheme();
  const d = isDarkMode;

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState("all");

  // ── theme tokens ────────────────────────────────────────────────────────────
  const t = {
    pageBg: d ? "bg-[#0a0f1e]" : "bg-gradient-to-br from-slate-50 via-indigo-50/40 to-violet-50/30",
    card: d
      ? "bg-slate-900/80 border border-slate-700/60 backdrop-blur-xl"
      : "bg-white border border-indigo-100 shadow-xl shadow-indigo-100/40",
    divider: d ? "divide-slate-800" : "divide-indigo-50",
    unreadRow: d
      ? "bg-indigo-500/8 border-l-4 border-l-indigo-500"
      : "bg-indigo-50/70 border-l-4 border-l-indigo-500",
    readRow: d
      ? "border-l-4 border-l-transparent hover:bg-slate-800/40"
      : "border-l-4 border-l-transparent hover:bg-indigo-50/40",
    iconBox: d
      ? "bg-slate-800 border border-slate-700/60"
      : "bg-indigo-50 border border-indigo-100",
    contentText: d ? "text-slate-200" : "text-gray-800",
    contentMuted: d ? "text-slate-400" : "text-gray-500",
    timeTag: d
      ? "bg-slate-800 text-slate-400 border border-slate-700/50"
      : "bg-indigo-50 text-indigo-400 border border-indigo-100",
    emptyBox: d ? "bg-slate-800/60" : "bg-indigo-50",
    emptyIcon: d ? "text-slate-600" : "text-indigo-200",
    emptyTitle: d ? "text-slate-400" : "text-gray-500",
    tabActive: "bg-indigo-600 text-white shadow-md shadow-indigo-500/30",
    tabInactive: d
      ? "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
      : "bg-white text-gray-500 border border-indigo-100 hover:bg-indigo-50 hover:text-indigo-700",
    markReadBtn: d
      ? "text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10"
      : "text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50",
    deleteBtn: d
      ? "text-slate-600 hover:text-red-400 hover:bg-red-500/10"
      : "text-gray-300 hover:text-red-500 hover:bg-red-50",
    markAllBtn: d
      ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300"
      : "bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700",
    subText: d ? "text-slate-400" : "text-gray-500",
  };

  const tabs = [
    { id: "all", label: "All" },
    { id: "match_request", label: "Matches" },
    { id: "session", label: "Sessions" },
    { id: "message", label: "Chats" },
    { id: "review", label: "Reviews" },
    { id: "gamification", label: "XP / Badges" },
    { id: "resource", label: "Resources" },
  ];

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "all") return true;
    if (activeTab === "session") return n.type === "session" || n.type === "session_accepted";
    if (activeTab === "message") return n.type === "message" || n.type === "chat";
    return n.type === activeTab;
  });

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      const data = res.data || [];
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.isRead).length);
    } catch {
      showError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
      showSuccess("Marked as read");
    } catch {
      showError("Failed to mark as read");
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      showSuccess("All notifications marked as read");
    } catch {
      showError("Failed to mark all as read");
    }
  };

  const deleteNotification = async (id) => {
    try {
      const notif = notifications.find((n) => n._id === id);
      await api.delete(`/notifications/${id}`);
      if (notif && !notif.isRead) setUnreadCount((prev) => Math.max(0, prev - 1));
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      showSuccess("Notification deleted");
    } catch {
      showError("Failed to delete notification");
    }
  };

  const getIcon = (type) => {
    const icons = {
      match_request: "🤝",
      message: "💬",
      chat: "💬",
      reminder: "⏰",
      system: "⚙️",
      gamification: "🎮",
      session: "📅",
      session_accepted: "✅",
      resource: "📚",
      review: "⭐",
    };
    return icons[type] || "🔔";
  };

  const getTypeLabel = (type) => {
    const labels = {
      match_request: { text: "Match", color: d ? "bg-violet-500/20 text-violet-400 border-violet-500/30" : "bg-violet-100 text-violet-600 border-violet-200" },
      session: { text: "Session Invite", color: d ? "bg-amber-500/20 text-amber-400 border-amber-500/30" : "bg-amber-100 text-amber-600 border-amber-200" },
      session_accepted: { text: "Accepted", color: d ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-emerald-100 text-emerald-600 border-emerald-200" },
      message: { text: "Chat", color: d ? "bg-blue-500/20 text-blue-400 border-blue-500/30" : "bg-blue-100 text-blue-600 border-blue-200" },
      gamification: { text: "XP / Badge", color: d ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/30" : "bg-indigo-100 text-indigo-600 border-indigo-200" },
      review: { text: "Review", color: d ? "bg-pink-500/20 text-pink-400 border-pink-500/30" : "bg-pink-100 text-pink-600 border-pink-200" },
      resource: { text: "Resource", color: d ? "bg-teal-500/20 text-teal-400 border-teal-500/30" : "bg-teal-100 text-teal-600 border-teal-200" },
    };
    return labels[type] || null;
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${t.pageBg}`}>
        <div className="text-center space-y-4">
          <div className="relative inline-flex">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-2xl shadow-indigo-500/40">
              <div className="w-8 h-8 border-[3px] border-white border-t-transparent rounded-full animate-spin" />
            </div>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 blur-xl opacity-40 animate-pulse" />
          </div>
          <p className="text-sm font-medium bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            Loading notifications…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${t.pageBg} transition-colors duration-500`}>
      {/* ── Background decorations ── */}
      {!d && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[350px] bg-gradient-to-bl from-violet-100/60 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[300px] bg-gradient-to-tr from-indigo-100/60 to-transparent rounded-full blur-3xl" />
        </div>
      )}
      {d && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-indigo-600/8 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-violet-600/6 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        </div>
      )}

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 pb-28 md:pb-10">

        {/* ── Page Header ── */}
        <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600 bg-clip-text text-transparent leading-tight">
                Notifications
              </h1>
              <p className={`text-sm font-medium mt-0.5 ${t.subText}`}>
                {unreadCount > 0 ? (
                  <><span className="text-indigo-500 font-bold">{unreadCount} unread</span> · {notifications.length} total</>
                ) : (
                  <>All caught up! · {notifications.length} total</>
                )}
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-all duration-200 ${t.markAllBtn}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Mark all read
            </button>
          )}
        </div>

        {/* ── Filter Tabs ── */}
        <div className={`flex gap-1.5 overflow-x-auto pb-2 mb-4`} style={{ scrollbarWidth: "none" }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${activeTab === tab.id ? t.tabActive : t.tabInactive}`}
            >
              {tab.label}
              {tab.id === "all" && notifications.length > 0 && (
                <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${activeTab === "all" ? "bg-white/20" : d ? "bg-slate-700 text-slate-300" : "bg-indigo-100 text-indigo-600"}`}>
                  {notifications.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Notifications Card ── */}
        <div className={`rounded-2xl overflow-hidden ${t.card}`}>

          {filteredNotifications.length === 0 ? (
            <div className="py-20 flex flex-col items-center gap-4 text-center px-6">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${t.emptyBox}`}>
                <svg className={`w-10 h-10 ${t.emptyIcon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div>
                <p className={`text-base font-bold ${d ? "text-slate-300" : "text-gray-600"}`}>No notifications here</p>
                <p className={`text-sm mt-1 ${t.emptyTitle}`}>
                  {activeTab === "all" ? "You're all caught up!" : `No ${activeTab} notifications yet`}
                </p>
              </div>
            </div>
          ) : (
            <div className={`divide-y ${t.divider}`}>
              {filteredNotifications.map((note) => {
                const typeLabel = getTypeLabel(note.type);
                return (
                  <div
                    key={note._id}
                    className={`px-4 sm:px-5 py-4 transition-all duration-200 flex gap-3 sm:gap-4 ${note.isRead ? t.readRow : t.unreadRow}`}
                  >
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-xl ${t.iconBox}`}>
                      {getIcon(note.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        {typeLabel && (
                          <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border ${typeLabel.color}`}>
                            {typeLabel.text}
                          </span>
                        )}
                        {!note.isRead && (
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block" />
                        )}
                      </div>

                      <p className={`text-sm leading-relaxed font-medium ${note.isRead ? t.contentMuted : t.contentText}`}>
                        {note.content || note.message || note.title || "Notification"}
                      </p>

                      <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
                        <div className="flex items-center gap-3">
                          {!note.isRead && (
                            <button
                              onClick={() => markAsRead(note._id)}
                              className={`text-xs font-semibold flex items-center gap-1 px-2 py-1 rounded-lg transition-all duration-200 ${t.markReadBtn}`}
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Mark read
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(note._id)}
                            className={`text-xs font-semibold flex items-center gap-1 px-2 py-1 rounded-lg transition-all duration-200 ${t.deleteBtn}`}
                            title="Remove"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Remove
                          </button>
                        </div>

                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg border ${t.timeTag}`}>
                          {formatTime(note.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

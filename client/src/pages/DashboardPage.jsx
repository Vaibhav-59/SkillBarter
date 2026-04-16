import { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";
import api, { BASE_URL } from "../utils/api";
import { useSocket } from "../contexts/SocketContext";

export default function DashboardPage() {
  const { isDarkMode, textClass, borderClass } = useTheme();
  const { socket, isUserOnline } = useSocket();
  const [allUsers, setAllUsers] = useState([]);
  const [displayedUsers, setDisplayedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [filterBy, setFilterBy] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [searchFocused, setSearchFocused] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeNotifTab, setActiveNotifTab] = useState("all");
  const [sessionActionLoading, setSessionActionLoading] = useState({});
  const notifRef = useRef(null);

  const navigate = useNavigate();

  // ─── theme tokens ─────────────────────────────────────────────────────────
  const t = {
    pageBg: isDarkMode
      ? "bg-[#0a0f1e]"
      : "bg-gradient-to-br from-slate-50 via-indigo-50/40 to-violet-50/30",
    card: isDarkMode
      ? "bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50"
      : "bg-white border border-indigo-100/80 shadow-xl shadow-indigo-100/40",
    cardHover: isDarkMode
      ? "hover:border-indigo-500/50 hover:shadow-indigo-500/10"
      : "hover:border-indigo-300 hover:shadow-indigo-200/60",
    searchBg: isDarkMode
      ? "bg-slate-800/70 border-slate-700/60 text-white placeholder-slate-400 focus:border-indigo-500/70 focus:ring-indigo-500/20"
      : "bg-white border-indigo-200 text-gray-800 placeholder-indigo-300 focus:border-indigo-400 focus:ring-indigo-200/50 shadow-sm",
    selectBg: isDarkMode
      ? "bg-slate-800/70 border-slate-700/60 text-slate-200 focus:border-indigo-500/70"
      : "bg-white border-indigo-200 text-gray-700 focus:border-indigo-400 shadow-sm",
    skillPill: isDarkMode
      ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 hover:bg-indigo-500/25"
      : "bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100",
    skillPillTeach: isDarkMode
      ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 hover:bg-emerald-500/25"
      : "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100",
    emptyText: isDarkMode ? "text-slate-400" : "text-indigo-400",
    bioBox: isDarkMode
      ? "bg-slate-700/30 text-slate-300 border border-slate-600/30"
      : "bg-indigo-50/60 text-gray-600 border border-indigo-100",
    badgePill: isDarkMode
      ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
      : "bg-violet-100 text-violet-700 border border-violet-200",
    btnPrimary: isDarkMode
      ? "bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600 hover:from-indigo-400 hover:via-violet-400 hover:to-purple-500 text-white"
      : "bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600 hover:from-indigo-600 hover:via-violet-600 hover:to-purple-700 text-white",
    iconBtn: isDarkMode
      ? "bg-slate-800/70 border-slate-700/60 text-indigo-400 hover:border-indigo-500/60 hover:bg-slate-700/70"
      : "bg-white border-indigo-200 text-indigo-500 hover:border-indigo-400 hover:bg-indigo-50 shadow-sm",
    sectionTitle: isDarkMode ? "text-white" : "text-gray-900",
    accentText: isDarkMode ? "text-indigo-400" : "text-indigo-600",
    notifPanel: isDarkMode
      ? "bg-slate-900/95 border-slate-700"
      : "bg-white/98 border-indigo-100",
    notifItem: isDarkMode
      ? "border-slate-800 hover:bg-slate-800/50"
      : "border-indigo-50 hover:bg-indigo-50/60",
    notifUnread: isDarkMode
      ? "bg-indigo-900/40 border-slate-800"
      : "bg-indigo-50 border-indigo-100",
    filterActive: isDarkMode
      ? "bg-indigo-600 text-white"
      : "bg-indigo-600 text-white shadow-sm",
    filterInactive: isDarkMode
      ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
      : "bg-white text-gray-600 hover:bg-indigo-50 border border-indigo-100",
    statCard: isDarkMode
      ? "bg-slate-800/60 border border-slate-700/50"
      : "bg-white border border-indigo-100 shadow-sm",
    onlineIndicator: isDarkMode ? "border-slate-900" : "border-white",
    locationText: isDarkMode ? "text-slate-400" : "text-gray-500",
    statsNum: isDarkMode ? "text-white" : "text-gray-900",
    statsLabel: isDarkMode ? "text-slate-500" : "text-gray-500",
    certLink: isDarkMode
      ? "bg-blue-900/20 border-blue-700/30 text-blue-400 hover:border-blue-500/50"
      : "bg-blue-50 border-blue-200 text-blue-600 hover:border-blue-300 hover:bg-blue-100",
    noResults: isDarkMode ? "text-slate-300" : "text-gray-700",
    noResultsSub: isDarkMode ? "text-slate-500" : "text-gray-500",
    searchHighlight: isDarkMode
      ? "bg-indigo-500/10 border-indigo-500/40 shadow-indigo-500/10"
      : "bg-indigo-50/80 border-indigo-300 shadow-indigo-200/30",
  };

  // ─── click outside notifications ─────────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target))
        setShowNotifications(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ─── fetch notifications ──────────────────────────────────────────────────
  useEffect(() => {
    api.get("/notifications").then((res) => {
      setNotifications(res.data);
      setUnreadCount(res.data.filter((n) => !n.isRead).length);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (!socket) return;
    const h = (notif) => {
      setNotifications((p) => [notif, ...p]);
      setUnreadCount((p) => p + 1);
    };
    socket.on("notificationReceived", h);
    return () => socket.off("notificationReceived", h);
  }, [socket]);

  const notifTabs = [
    { id: "all", label: "All" },
    { id: "match_request", label: "Matches" },
    { id: "session", label: "Sessions" },
    { id: "time_banking", label: "Time Bank" },
    { id: "contract", label: "Contracts" },
    { id: "chat", label: "Chats" },
    { id: "review", label: "Reviews" },
    { id: "resource", label: "Resources" },
    { id: "group_session", label: "Groups" },
    { id: "gamification", label: "XP / Badges" },
  ];

  const filteredNotifications = notifications.filter((n) => {
    if (activeNotifTab === "all") return true;
    if (activeNotifTab === "match_request" && n.type === "match_request") return true;
    if (activeNotifTab === "chat" && (n.type === "message" || n.type === "chat")) return true;
    if (activeNotifTab === "gamification" && n.type === "gamification") return true;
    if (activeNotifTab === "session" && (n.type === "session" || n.type === "session_accepted")) return true;
    if (activeNotifTab === "review" && n.type === "review") return true;
    if (activeNotifTab === "resource" && n.type === "resource") return true;
    const content = ((n.title || "") + " " + (n.message || "") + " " + (n.content || "")).toLowerCase();
    if (activeNotifTab === "match_request" && content.includes("match") && !content.includes("group")) return true;
    if (activeNotifTab === "session" && content.includes("session") && !content.includes("group")) return true;
    if (activeNotifTab === "time_banking" && (content.includes("time bank") || content.includes("wallet") || content.includes("credit"))) return true;
    if (activeNotifTab === "contract" && content.includes("contract")) return true;
    if (activeNotifTab === "review" && (content.includes("review") || content.includes("rating"))) return true;
    if (activeNotifTab === "resource" && (content.includes("resource") || content.includes("published"))) return true;
    if (activeNotifTab === "group_session" && content.includes("group")) return true;
    return false;
  });

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((p) => p.map((n) => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount((p) => Math.max(0, p - 1));
    } catch (e) { console.error(e); }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put("/notifications/read-all");
      setNotifications((p) => p.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) { console.error(e); }
  };

  const handleDeleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      const d = notifications.find((n) => n._id === id);
      if (d && !d.isRead) setUnreadCount((p) => Math.max(0, p - 1));
      setNotifications((p) => p.filter((n) => n._id !== id));
    } catch (e) { console.error(e); }
  };

  const handleSessionAction = async (notif, action) => {
    if (!notif.relatedId) return;
    setSessionActionLoading((p) => ({ ...p, [notif._id]: action }));
    try {
      await api.put(`/sessions/${notif.relatedId}/${action}`);
      await api.put(`/notifications/${notif._id}/read`);
      setNotifications((p) =>
        p.map((n) => n._id === notif._id ? { ...n, isRead: true, _sessionActioned: action } : n)
      );
      setUnreadCount((p) => Math.max(0, p - 1));
    } catch (e) { console.error(e); }
    finally {
      setSessionActionLoading((p) => { const s = { ...p }; delete s[notif._id]; return s; });
    }
  };

  // ─── fetch users ──────────────────────────────────────────────────────────
  useEffect(() => {
    api.get(`/users/discover?t=${Date.now()}`).then((res) => {
      setAllUsers(res.data);
      setDisplayedUsers(res.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const refresh = () => {
      api.get(`/users/discover?t=${Date.now()}`).then((res) => {
        setAllUsers(res.data);
        setDisplayedUsers(res.data);
      }).catch(console.error);
    };
    window.addEventListener("profileUpdated", refresh);
    const onStorage = (e) => { if (e.key === "profileUpdated") refresh(); };
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("profileUpdated", refresh);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  useEffect(() => {
    let result = [...allUsers];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((u) => {
        if (u.name?.toLowerCase().includes(q)) return true;
        const loc = typeof u.location === "object" && u.location !== null
          ? `${u.location.city || ""} ${u.location.country || ""}` : (u.location || "");
        if (loc.toLowerCase().includes(q)) return true;
        if (u.bio?.toLowerCase().includes(q)) return true;
        if (u.teachSkills?.some((s) => s.name?.toLowerCase().includes(q))) return true;
        if (u.learnSkills?.some((s) => s.name?.toLowerCase().includes(q))) return true;
        return false;
      });
    }
    if (filterBy === "teaching") result = result.filter((u) => u.teachSkills?.length > 0);
    else if (filterBy === "learning") result = result.filter((u) => u.learnSkills?.length > 0);
    if (sortBy === "nameAsc") result.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    else if (sortBy === "nameDesc") result.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
    setDisplayedUsers(result);
  }, [allUsers, searchQuery, sortBy, filterBy]);

  const getLocationStr = (loc) => {
    if (!loc) return null;
    if (typeof loc === "object") return [loc.city, loc.country].filter(Boolean).join(", ");
    return loc;
  };

  const getCerts = (user) => {
    const newCerts = user?.certificates || [];
    const oldCerts = (user?.skillCertificates || []).filter((c) => c && typeof c === "string" && c.trim());
    const normalizedOld = oldCerts.map((url) => ({
      fileUrl: url,
      fileType: /\.(jpg|jpeg|png|gif|webp)$/i.test(url) ? "image" : "pdf",
      fileName: url.split("/").pop() || "Certificate",
    }));
    const seen = new Set();
    return [...newCerts, ...normalizedOld].filter((c) => {
      if (!c?.fileUrl || seen.has(c.fileUrl)) return false;
      seen.add(c.fileUrl);
      return true;
    });
  };

  // ─── Loading screen ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${t.pageBg}`}>
        <div className="text-center space-y-6">
          <div className="relative inline-flex">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/40">
              <div className="w-10 h-10 border-3 border-white border-t-transparent rounded-full animate-spin" style={{ borderWidth: "3px" }} />
            </div>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 blur-xl opacity-40 animate-pulse" />
          </div>
          <div>
            <p className={`text-2xl font-bold bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent`}>
              Discovering Talent...
            </p>
            <p className={`mt-1 text-sm ${isDarkMode ? "text-slate-500" : "text-gray-500"}`}>
              Finding skilled professionals just for you
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${t.pageBg} transition-colors duration-500`}>
      {/* ── Decorative blobs (dark mode only) ─────────────────────────────── */}
      {isDarkMode && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-indigo-600/8 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-violet-600/6 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 left-1/3 w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: "2s" }} />
          {/* grid dots */}
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(139,92,246,1) 1px, transparent 0)", backgroundSize: "40px 40px" }} />
        </div>
      )}

      {/* ── Light mode subtle pattern ─────────────────────────────────────── */}
      {!isDarkMode && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-gradient-to-bl from-violet-100/60 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[400px] bg-gradient-to-tr from-indigo-100/60 to-transparent rounded-full blur-3xl" />
        </div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-8 pb-24 md:pb-8 space-y-5 sm:space-y-8">

        {/* ════════════════════════════════════════════════
            SEARCH & CONTROLS BAR
        ════════════════════════════════════════════════ */}
        <div className="flex flex-col gap-4">

          {/* Top row — search */}
          <div className={`relative group transition-all duration-300 ${searchFocused ? "scale-[1.01]" : ""}`}>
            {/* glow ring */}
            <div className={`absolute inset-0 rounded-2xl transition-opacity duration-300 pointer-events-none ${searchFocused ? "opacity-100" : "opacity-0"}`}
              style={{ boxShadow: isDarkMode ? "0 0 0 1px rgba(99,102,241,.5), 0 4px 40px rgba(99,102,241,.12)" : "0 0 0 1px rgba(99,102,241,.3), 0 4px 24px rgba(99,102,241,.08)" }} />

            {/* Search icon */}
            <div className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${searchFocused ? "text-indigo-500" : isDarkMode ? "text-slate-500" : "text-indigo-300"}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <input
              type="text"
              placeholder="Search by name, skill, location, or bio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className={`w-full pl-14 pr-14 py-4 rounded-2xl border backdrop-blur-sm text-sm font-medium transition-all duration-300 focus:outline-none focus:ring-2 ${t.searchBg}`}
            />

            {/* Clear btn or search count */}
            <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {searchQuery && (
                <>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isDarkMode ? "bg-indigo-500/20 text-indigo-300" : "bg-indigo-100 text-indigo-600"}`}>
                    {displayedUsers.length} found
                  </span>
                  <button onClick={() => setSearchQuery("")}
                    className={`w-7 h-7 flex items-center justify-center rounded-full transition-all duration-200 ${isDarkMode ? "text-slate-400 hover:text-white hover:bg-slate-700" : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Controls row */}
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
            {/* Filter pills — full width on mobile, scroll horizontally */}
            <div className={`flex items-center gap-1 p-1 rounded-xl overflow-x-auto sm:overflow-visible ${isDarkMode ? "bg-slate-800/60 border border-slate-700/50" : "bg-white border border-indigo-100 shadow-sm"}`}
              style={{ scrollbarWidth: "none" }}>
              {[
                { id: "all", label: "All Members", short: "All" },
                { id: "teaching", label: "🧑‍🏫 Mentors", short: "🧑‍🏫 Mentors" },
                { id: "learning", label: "📚 Learners", short: "📚 Learners" },
              ].map((f) => (
                <button key={f.id} onClick={() => setFilterBy(f.id)}
                  className={`flex-shrink-0 px-3 sm:px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 whitespace-nowrap ${filterBy === f.id ? t.filterActive : t.filterInactive}`}>
                  <span className="hidden sm:inline">{f.label}</span>
                  <span className="sm:hidden">{f.short}</span>
                </button>
              ))}
            </div>

            {/* Second row on mobile: sort + spacer + stats chip + icons */}
            <div className="flex items-center gap-2 sm:contents">
              {/* Sort select */}
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                className={`py-2 px-3 sm:px-4 rounded-xl border text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer ${t.selectBg}`}>
                <option value="default">Sort: Default</option>
                <option value="nameAsc">Name A → Z</option>
                <option value="nameDesc">Name Z → A</option>
              </select>

              {/* Spacer */}
              <div className="flex-1 sm:flex-1" />

              {/* Stats chip */}
              <div className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl border text-xs font-semibold ${isDarkMode ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-300" : "bg-indigo-50 border-indigo-200 text-indigo-600"}`}>
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span>{displayedUsers.length} {displayedUsers.length === allUsers.length ? "members" : "results"}</span>
              </div>

              {/* Time Banking icon — hidden on mobile (use MobileNav More menu) */}
              <Link to="/skill-hub/time-banking"
                className={`hidden sm:flex items-center justify-center w-10 h-10 rounded-xl border transition-all duration-200 ${t.iconBtn}`}
                title="Time Banking">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </Link>

              {/* Notification bell — hidden on mobile (shown in MobileNav header) */}
              <div className="relative hidden sm:block" ref={notifRef}>
              <button
                onClick={() => {
                  const opening = !showNotifications;
                  setShowNotifications(opening);
                  if (opening && unreadCount > 0) handleMarkAllAsRead();
                }}
                className={`relative flex items-center justify-center w-10 h-10 rounded-xl border transition-all duration-200 ${t.iconBtn}`}
                title="Notifications">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full px-1 shadow-md animate-pulse z-10">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {/* ── Notifications panel ──────────────────────────────── */}
              {showNotifications && (
                <div className={`absolute right-0 mt-3 w-[22rem] rounded-2xl shadow-2xl border backdrop-blur-xl z-50 overflow-hidden ${t.notifPanel} transition-all duration-300`}
                  style={{ boxShadow: isDarkMode ? "0 24px 60px rgba(0,0,0,0.6)" : "0 24px 60px rgba(99,102,241,0.15)" }}>

                  {/* Header */}
                  <div className={`flex items-center justify-between px-5 py-4 border-b ${isDarkMode ? "border-slate-800" : "border-indigo-50"}`}>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                      </div>
                      <span className={`font-semibold text-sm ${isDarkMode ? "text-white" : "text-gray-800"}`}>Notifications</span>
                      {notifications.length > 0 && (
                        <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${isDarkMode ? "bg-slate-700 text-slate-400" : "bg-indigo-100 text-indigo-500"}`}>
                          {notifications.length}
                        </span>
                      )}
                    </div>
                    {notifications.some((n) => !n.isRead) && (
                      <button onClick={(e) => { e.stopPropagation(); handleMarkAllAsRead(); }}
                        className={`text-xs font-semibold transition-colors px-2 py-1 rounded-lg ${isDarkMode ? "text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10" : "text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"}`}>
                        Mark all read
                      </button>
                    )}
                  </div>

                  {/* Tabs */}
                  <div className={`flex overflow-x-auto gap-1 p-2 border-b ${isDarkMode ? "border-slate-800" : "border-indigo-50"}`}
                    style={{ scrollbarWidth: "none" }}>
                    {notifTabs.map((tab) => (
                      <button key={tab.id} onClick={(e) => { e.stopPropagation(); setActiveNotifTab(tab.id); }}
                        className={`flex-shrink-0 px-3 py-1 rounded-full text-[11px] font-semibold transition-all duration-200 ${activeNotifTab === tab.id ? "bg-indigo-600 text-white" : isDarkMode ? "text-slate-400 hover:text-slate-200 hover:bg-slate-800" : "text-gray-500 hover:text-gray-700 hover:bg-indigo-50"}`}>
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Items */}
                  <div className="max-h-80 overflow-y-auto">
                    {filteredNotifications.length === 0 ? (
                      <div className={`py-12 flex flex-col items-center gap-3 ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}>
                        <svg className="w-10 h-10 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <p className="text-xs font-medium">No notifications here</p>
                      </div>
                    ) : filteredNotifications.map((notif) => (
                      <div key={notif._id}
                        className={`px-4 py-3.5 border-b last:border-0 transition-colors duration-200 ${notif.isRead ? t.notifItem : t.notifUnread}`}>
                        <div className="flex items-start gap-3">
                          <div className={`flex-1 min-w-0`}>
                            {(notif.type === "session" || notif.type === "session_accepted") && (
                              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full mb-1.5 ${notif.type === "session_accepted"
                                ? "bg-green-500/20 text-green-500 border border-green-500/30"
                                : "bg-amber-500/20 text-amber-500 border border-amber-500/30"}`}>
                                {notif.type === "session_accepted" ? "✅ Accepted" : "📅 Session Invite"}
                              </span>
                            )}
                            <p className={`text-xs font-semibold mb-0.5 cursor-pointer hover:text-indigo-500 transition-colors truncate ${isDarkMode ? "text-slate-200" : "text-gray-800"}`}
                              onClick={(e) => { e.stopPropagation(); if (!notif.isRead) handleMarkAsRead(notif._id); }}>
                              {notif?.title || notif?.type || "Notification"}
                              {!notif.isRead && <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 ml-1.5 mb-0.5 align-middle" />}
                            </p>
                            <p className={`text-[11px] leading-relaxed line-clamp-2 ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
                              {notif?.message || notif?.content}
                            </p>
                            <p className={`text-[10px] mt-1 ${isDarkMode ? "text-slate-600" : "text-gray-400"}`}>
                              {new Date(notif?.createdAt).toLocaleString()}
                            </p>
                            {notif.type === "session" && notif.relatedId && !notif._sessionActioned && !notif.isRead && (
                              <div className="flex gap-2 mt-2.5">
                                <button onClick={(e) => { e.stopPropagation(); handleSessionAction(notif, "accept"); }}
                                  disabled={!!sessionActionLoading[notif._id]}
                                  className="flex-1 py-1.5 text-[11px] font-bold rounded-lg bg-green-500/20 text-green-600 hover:bg-green-500/30 border border-green-500/30 transition-all disabled:opacity-50">
                                  {sessionActionLoading[notif._id] === "accept" ? "..." : "✓ Accept"}
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); handleSessionAction(notif, "reject"); }}
                                  disabled={!!sessionActionLoading[notif._id]}
                                  className="flex-1 py-1.5 text-[11px] font-bold rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 transition-all disabled:opacity-50">
                                  {sessionActionLoading[notif._id] === "reject" ? "..." : "✗ Reject"}
                                </button>
                              </div>
                            )}
                            {notif.type === "session" && notif._sessionActioned && (
                              <p className={`mt-1.5 text-[11px] font-semibold ${notif._sessionActioned === "accept" ? "text-green-500" : "text-red-500"}`}>
                                {notif._sessionActioned === "accept" ? "✅ Accepted" : "❌ Rejected"}
                              </p>
                            )}
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteNotification(notif._id); }}
                            className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 ${isDarkMode ? "text-slate-600 hover:text-red-400 hover:bg-red-500/10" : "text-gray-300 hover:text-red-500 hover:bg-red-50"}`}>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>   {/* ← closes notifRef div */}
            </div>   {/* ← closes sm:contents wrapper */}
          </div>     {/* ← closes controls row flex-col */}
        </div>       {/* ← closes search flex-col */}

        {/* ════════════════════════════════════════════════
            USER CARDS GRID
        ════════════════════════════════════════════════ */}
        {displayedUsers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {displayedUsers.map((user, index) => {
              const loc = getLocationStr(user.location);
              const certs = getCerts(user);
              const teachSkills = user.teachSkills || [];
              const learnSkills = user.learnSkills || [];
              const initials = (user.name || "U").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

              // Gradient based on index for variety
              const avatarGradients = [
                "from-indigo-500 via-violet-500 to-purple-600",
                "from-rose-500 via-pink-500 to-fuchsia-600",
                "from-amber-500 via-orange-500 to-red-500",
                "from-emerald-500 via-teal-500 to-cyan-600",
                "from-sky-500 via-blue-500 to-indigo-600",
                "from-violet-500 via-purple-500 to-pink-600",
              ];
              const avatarGrad = avatarGradients[index % avatarGradients.length];

              return (
                <div
                  key={user._id}
                  className={`group relative rounded-2xl ${t.card} ${t.cardHover} transition-all duration-400 hover:-translate-y-2 overflow-hidden`}
                  style={{ animationDelay: `${index * 60}ms`, animation: "fadeUp 0.5s ease both" }}
                >
                  {/* ── Top gradient accent bar ──────────────────────── */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${avatarGrad} opacity-70 group-hover:opacity-100 transition-opacity duration-300`} />

                  {/* ── Hover shimmer ────────────────────────────────── */}
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-violet-500/0 to-purple-500/0 group-hover:from-indigo-500/3 group-hover:via-violet-500/2 group-hover:to-purple-500/3 transition-all duration-500 pointer-events-none rounded-2xl" />

                  <div className="p-6 flex flex-col h-full">

                    {/* ── Avatar + Name + Location ─────────────────── */}
                    <div className="flex items-start gap-4 mb-5">
                      <div className="relative flex-shrink-0">
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${avatarGrad} flex items-center justify-center text-white text-xl font-bold overflow-hidden shadow-lg group-hover:scale-105 transition-transform duration-300`}
                          style={{ boxShadow: isDarkMode ? `0 8px 24px rgba(99,102,241,0.25)` : `0 8px 24px rgba(99,102,241,0.20)` }}>
                          {user.profileImage ? (
                            <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="tracking-wide">{initials}</span>
                          )}
                        </div>
                        {/* Online dot — only visible when user is connected */}
                        {isUserOnline(user._id) && (
                          <span
                            className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-400 rounded-full border-2 ${t.onlineIndicator} shadow-sm`}
                            title="Online"
                          />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className={`text-base font-bold truncate group-hover:text-indigo-500 transition-colors duration-200 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                          {user.name || "Anonymous User"}
                        </h3>

                        {user.role && (
                          <span className={`inline-flex items-center mt-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${t.badgePill}`}>
                            {user.role}
                          </span>
                        )}

                        {loc && (
                          <div className={`flex items-center gap-1 mt-1.5 ${t.locationText}`}>
                            <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="text-[11px] truncate">{loc}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ── Bio ────────────────────────────────────────── */}
                    {user.bio && (
                      <p className={`text-[12px] leading-relaxed rounded-xl px-3 py-2.5 mb-4 line-clamp-2 ${t.bioBox}`}>
                        {user.bio}
                      </p>
                    )}

                    {/* ── Skills ─────────────────────────────────────── */}
                    <div className="space-y-3 flex-1">
                      {teachSkills.length > 0 && (
                        <div>
                          <p className={`text-[10px] font-bold uppercase tracking-widest mb-1.5 ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}>
                            🧑‍🏫 Teaching
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {teachSkills.slice(0, 3).map((skill, i) => (
                              <span key={i} className={`text-[11px] font-semibold px-2.5 py-1 rounded-full transition-all duration-200 cursor-default ${t.skillPillTeach}`}>
                                {skill.name}
                              </span>
                            ))}
                            {teachSkills.length > 3 && (
                              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${isDarkMode ? "bg-slate-700 text-slate-400" : "bg-gray-100 text-gray-500"}`}>
                                +{teachSkills.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {learnSkills.length > 0 && (
                        <div>
                          <p className={`text-[10px] font-bold uppercase tracking-widest mb-1.5 ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}>
                            📚 Learning
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {learnSkills.slice(0, 3).map((skill, i) => (
                              <span key={i} className={`text-[11px] font-semibold px-2.5 py-1 rounded-full transition-all duration-200 cursor-default ${t.skillPill}`}>
                                {skill.name}
                              </span>
                            ))}
                            {learnSkills.length > 3 && (
                              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${isDarkMode ? "bg-slate-700 text-slate-400" : "bg-gray-100 text-gray-500"}`}>
                                +{learnSkills.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {teachSkills.length === 0 && learnSkills.length === 0 && (
                        <div className={`text-center py-4 rounded-xl border border-dashed text-[12px] ${isDarkMode ? "border-slate-700 text-slate-500" : "border-indigo-100 text-gray-400"}`}>
                          No skills listed yet
                        </div>
                      )}
                    </div>

                    {/* ── Certificates ───────────────────────────────── */}
                    {certs.length > 0 && (
                      <div className="mt-4">
                        <p className={`text-[10px] font-bold uppercase tracking-widest mb-1.5 ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}>
                          🏅 Certificates ({certs.length})
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {certs.slice(0, 2).map((cert, i) => (
                            <a key={i} href={cert.fileUrl} target="_blank" rel="noopener noreferrer"
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all duration-200 ${t.certLink}`}>
                              {cert.fileType === "pdf" ? (
                                <svg className="w-3 h-3 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              )}
                              <span className="truncate max-w-[80px]">{cert.fileName || `Cert ${i + 1}`}</span>
                            </a>
                          ))}
                          {certs.length > 2 && (
                            <span className={`text-[11px] px-2.5 py-1 rounded-lg font-medium ${isDarkMode ? "bg-slate-700 text-slate-400" : "bg-gray-100 text-gray-500"}`}>
                              +{certs.length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* ── Stats row ──────────────────────────────────── */}
                    <div className={`flex items-center divide-x mt-4 py-3 rounded-xl ${isDarkMode ? "bg-slate-800/50 divide-slate-700" : "bg-indigo-50/50 divide-indigo-100"}`}>
                      {[
                        { val: teachSkills.length, label: "Teaching" },
                        { val: learnSkills.length, label: "Learning" },
                        { val: certs.length, label: "Certs" },
                      ].map(({ val, label }) => (
                        <div key={label} className="flex-1 text-center">
                          <p className={`text-base font-bold leading-none ${t.statsNum}`}>{val}</p>
                          <p className={`text-[10px] mt-0.5 ${t.statsLabel}`}>{label}</p>
                        </div>
                      ))}
                    </div>

                    {/* ── CTA Button ─────────────────────────────────── */}
                    <button
                      onClick={() => navigate(`/user/${user._id}`)}
                      className={`relative mt-4 w-full py-3 px-6 rounded-xl font-bold text-sm overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg ${t.btnPrimary}`}
                      style={{ boxShadow: isDarkMode ? "0 4px 20px rgba(99,102,241,0.3)" : "0 4px 16px rgba(99,102,241,0.25)" }}>
                      {/* Shimmer */}
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                      <span className="relative flex items-center justify-center gap-2">
                        View Profile
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ── Empty state ─────────────────────────────────────────── */
          <div className="flex flex-col items-center justify-center py-24 gap-6">
            <div className={`w-24 h-24 rounded-3xl flex items-center justify-center ${isDarkMode ? "bg-slate-800" : "bg-indigo-50"}`}>
              <svg className={`w-12 h-12 ${isDarkMode ? "text-slate-600" : "text-indigo-200"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="text-center">
              <h3 className={`text-2xl font-bold mb-2 ${t.noResults}`}>
                {searchQuery ? "No Results Found" : "No Members Yet"}
              </h3>
              <p className={`text-sm max-w-sm ${t.noResultsSub}`}>
                {searchQuery
                  ? `Try a different search term — we couldn't find anyone matching "${searchQuery}".`
                  : "Be the first! Add your skills and start building the community."}
              </p>
              {searchQuery && (
                <button onClick={() => setSearchQuery("")}
                  className={`mt-4 px-6 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${t.btnPrimary}`}>
                  Clear Search
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Keyframe styles ───────────────────────────────────────────────── */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

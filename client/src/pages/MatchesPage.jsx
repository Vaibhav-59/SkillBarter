// /client/src/pages/MatchesPage.jsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import api from "../utils/api";
import MatchCard from "../components/matching/MatchCard";
import SmartMatchCard from "../components/matching/SmartMatchCard";
import { showError, showSuccess } from "../utils/toast";
import {
  fetchSmartMatches, clearSmartMatches,
  selectSmartMatches, selectSmartMatchesLoading, selectSmartMatchesError,
} from "../redux/slices/smartMatchSlice";
import { useTheme } from "../hooks/useTheme";

/* ── tiny reusable card ─────────────────────────────── */
function Card({ children, className = "", isDarkMode }) {
  return (
    <div className={`rounded-2xl border transition-all duration-300 ${
      isDarkMode
        ? "bg-slate-800/60 border-slate-700/50"
        : "bg-white border-indigo-100 shadow-lg shadow-indigo-100/30"
    } ${className}`}>{children}</div>
  );
}

export default function MatchesPage() {
  const { isDarkMode } = useTheme();
  const dispatch = useDispatch();

  const [matches,         setMatches]         = useState([]);
  const [filteredMatches, setFilteredMatches] = useState([]);
  const [userId,          setUserId]          = useState(null);
  const [loading,         setLoading]         = useState(true);
  const [activeFilter,    setActiveFilter]    = useState("all");
  const [activeTab,       setActiveTab]       = useState("requests");
  const [searchQuery,     setSearchQuery]     = useState("");

  const smartMatches        = useSelector(selectSmartMatches);
  const smartMatchesLoading = useSelector(selectSmartMatchesLoading);
  const smartMatchesError   = useSelector(selectSmartMatchesError);

  /* ── fetch ────────────────────────────────────────── */
  const fetchMatches = async () => {
    try {
      setLoading(true);
      const userRes  = await api.get("/users/me");
      const matchRes = await api.get("/matches");
      const uid = userRes.data._id;
      setUserId(uid);
      const all = Array.isArray(matchRes.data.data) ? matchRes.data.data : matchRes.data?.data?.matches || [];
      setMatches(all);
      applyFilter(all, activeFilter, uid, searchQuery);
    } catch (err) {
      showError("Failed to load matches");
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = (list, filter, uid, query) => {
    let out = list;
    if (filter === "current")              out = list.filter(m => m.status === "accepted");
    else if (filter === "pending-sent")    out = list.filter(m => m.status === "pending" && m.requester?._id === uid);
    else if (filter === "pending-received") out = list.filter(m => m.status === "pending" && m.receiver?._id === uid);
    else if (filter === "rejected")        out = list.filter(m => m.status === "rejected");
    if (query.trim()) {
      const q = query.toLowerCase();
      out = out.filter(m => {
        if (!m.requester || !m.receiver) return false;
        const other = m.requester._id === uid ? m.receiver : m.requester;
        return other.name?.toLowerCase().includes(q) ||
          other.skillsToTeach?.some(s => s.toLowerCase().includes(q)) ||
          other.skillsToLearn?.some(s => s.toLowerCase().includes(q));
      });
    }
    setFilteredMatches(out);
  };

  const handleSmartRefresh = async () => {
    if (!userId) return;
    await dispatch(fetchSmartMatches({ page: 1, limit: 10, minCompatibility: 30, includeInsights: false, refresh: true }));
    showSuccess("Smart matches refreshed!");
  };

  const handleSmartRequest = async (targetId) => {
    try {
      await api.post("/matches/request", { receiverId: targetId });
      showSuccess("Match request sent!");
      fetchMatches();
      handleSmartRefresh();
    } catch (err) { showError(err.response?.data?.message || "Failed to send match request"); }
  };

  useEffect(() => { fetchMatches(); }, []);

  useEffect(() => {
    if (matches.length > 0 && userId) applyFilter(matches, activeFilter, userId, searchQuery);
  }, [activeFilter, matches, userId, searchQuery]);

  useEffect(() => {
    if (activeTab === "smart" && userId && smartMatches.length === 0)
      dispatch(fetchSmartMatches({ page: 1, limit: 10, minCompatibility: 30, includeInsights: false }));
  }, [activeTab, userId, dispatch, smartMatches.length]);

  /* ── derived stats ────────────────────────────────── */
  const stats = {
    requests: matches.length,
    smart:    smartMatches.length,
    current:  matches.filter(m => m.status === "accepted").length,
    pending:  matches.filter(m => m.status === "pending").length,
  };

  const filterOptions = [
    { key: "all",              label: "All",      count: matches.length },
    { key: "current",          label: "Active",   count: matches.filter(m => m.status === "accepted").length },
    { key: "pending-sent",     label: "Sent",     count: matches.filter(m => m.status === "pending" && m.requester?._id === userId).length },
    { key: "pending-received", label: "Received", count: matches.filter(m => m.status === "pending" && m.receiver?._id === userId).length },
    { key: "rejected",         label: "Declined", count: matches.filter(m => m.status === "rejected").length },
  ];

  const emptyMsg = {
    current: "No active matches yet.",
    "pending-sent": "No pending requests sent.",
    "pending-received": "No pending requests received.",
    rejected: "No declined matches.",
    all: searchQuery ? "No matches found for that search." : "No match requests yet.",
  }[activeFilter] || "No matches found.";

  /* ── shared tokens ────────────────────────────────── */
  const pageBg = isDarkMode
    ? "bg-[#0a0f1e]"
    : "bg-gradient-to-br from-slate-50 via-indigo-50/40 to-violet-50/30";

  const inputCls = isDarkMode
    ? "w-full pl-12 py-3 pr-4 rounded-2xl border border-slate-600/50 bg-slate-900/60 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/60 transition-all duration-200"
    : "w-full pl-12 py-3 pr-4 rounded-2xl border border-indigo-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/40 focus:border-indigo-400 transition-all duration-200 shadow-sm";

  const textMain = isDarkMode ? "text-white" : "text-gray-900";
  const textSub  = isDarkMode ? "text-slate-400" : "text-gray-500";

  const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/30">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
      <p className={`text-lg font-bold bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-500 bg-clip-text text-transparent`}>
        Loading...
      </p>
      <p className={`text-sm ${textSub}`}>Finding your learning partners</p>
    </div>
  );

  /* ────────────────────────────────────────────────────
     RENDER
  ──────────────────────────────────────────────────── */
  return (
    <div className={`min-h-screen transition-colors duration-500 ${pageBg}`}>

      {/* Decorative background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {isDarkMode ? (
          <>
            <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-indigo-600/6 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
            <div className="absolute inset-0 opacity-[0.03]"
              style={{ backgroundImage: "radial-gradient(circle at 1px 1px,rgba(139,92,246,1) 1px,transparent 0)", backgroundSize: "40px 40px" }} />
          </>
        ) : (
          <>
            <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-gradient-to-bl from-violet-100/60 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[400px] bg-gradient-to-tr from-indigo-100/60 to-transparent rounded-full blur-3xl" />
          </>
        )}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-5 sm:space-y-6 pb-24 md:pb-8">

        {/* ══ Header + Search ══════════════════════════ */}
        <div>
          <h1 className={`text-2xl sm:text-3xl font-black mb-1 ${textMain}`}>Matches</h1>
          <p className={`text-xs sm:text-sm mb-4 sm:mb-6 ${textSub}`}>
            Discover and manage your skill exchange connections
          </p>

          {/* Search */}
          <div className="relative max-w-2xl">
            <svg className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${isDarkMode ? "text-slate-400" : "text-gray-400"}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name or skill..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className={inputCls}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")}
                className={`absolute right-4 top-1/2 -translate-y-1/2 ${isDarkMode ? "text-slate-400 hover:text-white" : "text-gray-400 hover:text-gray-700"} transition-colors`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* ══ Stat cards ═══════════════════════════════ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total",    val: stats.requests, icon: "🤝", grad: "from-indigo-500 to-violet-600" },
            { label: "Active",   val: stats.current,  icon: "⚡", grad: "from-emerald-500 to-teal-600" },
            { label: "Pending",  val: stats.pending,  icon: "⏳", grad: "from-amber-500 to-orange-600" },
            { label: "AI Picks", val: stats.smart,    icon: "✨", grad: "from-violet-500 to-purple-600" },
          ].map(s => (
            <Card key={s.label} isDarkMode={isDarkMode} className="p-3 sm:p-5 text-center group hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
              <div className="text-xl sm:text-2xl mb-1.5 sm:mb-2 group-hover:scale-110 transition-transform duration-300">{s.icon}</div>
              <div className={`text-xl sm:text-2xl font-black bg-gradient-to-r ${s.grad} bg-clip-text text-transparent mb-0.5`}>{s.val}</div>
              <div className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wide ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}>{s.label}</div>
            </Card>
          ))}
        </div>

        {/* ══ Tab bar ════════════════════════════════ */}
        <div className={`flex items-center gap-2 p-1.5 rounded-2xl ${isDarkMode ? "bg-slate-800/60 border border-slate-700/50" : "bg-white border border-indigo-100 shadow-sm"}`}>
          {[
            { id: "requests", label: "Match Requests", short: "Requests", icon: "🎯", count: stats.requests },
            { id: "smart",    label: "Smart Matches",  short: "AI Picks", icon: "✨", count: stats.smart, special: true },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 px-2 sm:px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30"
                  : isDarkMode ? "text-slate-400 hover:text-white hover:bg-slate-700/50" : "text-gray-500 hover:text-indigo-700 hover:bg-indigo-50"
              }`}>
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.short}</span>
              {tab.count > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] sm:text-xs font-black ${
                  activeTab === tab.id
                    ? "bg-white/20 text-white"
                    : isDarkMode ? "bg-indigo-500/20 text-indigo-300" : "bg-indigo-100 text-indigo-600"
                }`}>{tab.count}</span>
              )}
            </button>
          ))}

          {activeTab === "smart" && (
            <button onClick={handleSmartRefresh} disabled={smartMatchesLoading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 disabled:opacity-50 transition-all duration-200 flex-shrink-0 shadow-md shadow-indigo-500/20">
              <svg className={`w-4 h-4 ${smartMatchesLoading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          )}
        </div>

        {/* ══ Tab: Requests ════════════════════════════ */}
        {activeTab === "requests" && (
          <div>
            {/* Filter pills — horizontally scrollable on mobile */}
            <div className="flex gap-2 mb-5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
              {filterOptions.map(opt => (
                <button key={opt.key} onClick={() => setActiveFilter(opt.key)}
                  className={`flex-shrink-0 flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all duration-200 ${
                    activeFilter === opt.key
                      ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white border-transparent shadow-md shadow-indigo-500/20 scale-[1.03]"
                      : isDarkMode
                        ? "bg-slate-800/60 border-slate-700/50 text-slate-400 hover:border-indigo-500/40 hover:text-indigo-300"
                        : "bg-white border-indigo-100 text-gray-500 hover:border-indigo-300 hover:text-indigo-600 shadow-sm"
                  }`}>
                  {opt.label}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-black ${
                    activeFilter === opt.key
                      ? "bg-white/20 text-white"
                      : isDarkMode ? "bg-slate-700 text-slate-400" : "bg-indigo-50 text-indigo-500"
                  }`}>{opt.count}</span>
                </button>
              ))}
            </div>

            {/* Content */}
            {loading ? <LoadingSpinner /> : filteredMatches.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/15 via-violet-500/10 to-purple-500/15 border border-indigo-500/20 flex items-center justify-center mx-auto mb-5">
                  <span className="text-3xl">🎯</span>
                </div>
                <h3 className={`text-xl font-black mb-2 ${textMain}`}>{emptyMsg}</h3>
                <p className={`text-sm mb-6 max-w-sm mx-auto ${textSub}`}>
                  {searchQuery ? "Try different search terms." : "Start by discovering users and sending match requests!"}
                </p>
                <button onClick={() => window.location.href = "/dashboard"}
                  className="px-6 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600 hover:from-indigo-400 hover:via-violet-400 hover:to-purple-500 transition-all duration-300 hover:scale-105 shadow-lg shadow-indigo-500/25">
                  Discover Users
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredMatches.map(match => (
                  <MatchCard key={match._id} match={match} currentUserId={userId} onRespond={fetchMatches} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ Tab: Smart Matches ═══════════════════════ */}
        {activeTab === "smart" && (
          <div>
            {/* Smart header panel */}
            <Card isDarkMode={isDarkMode} className="p-5 mb-5">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <span className="text-white text-lg">✨</span>
                </div>
                <div>
                  <h3 className={`text-base font-bold flex items-center gap-2 ${textMain}`}>
                    Smart Matching
                    <span className="text-yellow-400 animate-pulse">⚡</span>
                  </h3>
                  <p className={`text-xs mt-0.5 ${textSub}`}>
                    12 factors · Profile-aware · Updated from your skills, style & location
                  </p>
                </div>
              </div>

              {/* Factor pills */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {[
                  { label: "Skill Match",     icon: "🎯", dark: "bg-indigo-500/15 border-indigo-500/25 text-indigo-300",  light: "bg-indigo-50 border-indigo-200 text-indigo-600" },
                  { label: "Mutual Exchange", icon: "🔄", dark: "bg-violet-500/15 border-violet-500/25 text-violet-300",  light: "bg-violet-50 border-violet-200 text-violet-600" },
                  { label: "Learning Style",  icon: "🎨", dark: "bg-purple-500/15 border-purple-500/25 text-purple-300",  light: "bg-purple-50 border-purple-200 text-purple-600" },
                  { label: "Experience",      icon: "📈", dark: "bg-blue-500/15 border-blue-500/25 text-blue-300",        light: "bg-blue-50 border-blue-200 text-blue-600" },
                  { label: "Languages",       icon: "🌐", dark: "bg-indigo-500/15 border-indigo-500/25 text-indigo-300",  light: "bg-indigo-50 border-indigo-200 text-indigo-600" },
                  { label: "Availability",    icon: "🗓️", dark: "bg-amber-500/15 border-amber-500/25 text-amber-300",    light: "bg-amber-50 border-amber-200 text-amber-600" },
                  { label: "Verified Skills", icon: "✅", dark: "bg-emerald-500/15 border-emerald-500/25 text-emerald-300",light:"bg-emerald-50 border-emerald-200 text-emerald-600" },
                  { label: "Reputation",      icon: "⭐", dark: "bg-yellow-500/15 border-yellow-500/25 text-yellow-300",  light: "bg-yellow-50 border-yellow-200 text-yellow-600" },
                  { label: "Location",        icon: "📍", dark: "bg-rose-500/15 border-rose-500/25 text-rose-300",        light: "bg-rose-50 border-rose-200 text-rose-600" },
                  { label: "GitHub",          icon: "💻", dark: "bg-slate-500/15 border-slate-500/30 text-slate-300",     light: "bg-gray-50 border-gray-200 text-gray-600" },
                  { label: "Activity",        icon: "🟢", dark: "bg-cyan-500/15 border-cyan-500/25 text-cyan-300",        light: "bg-cyan-50 border-cyan-200 text-cyan-600" },
                  { label: "Profile",         icon: "📋", dark: "bg-pink-500/15 border-pink-500/25 text-pink-300",        light: "bg-pink-50 border-pink-200 text-pink-600" },
                ].map(f => (
                  <span key={f.label} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-semibold ${isDarkMode ? f.dark : f.light}`}>
                    <span>{f.icon}</span>{f.label}
                  </span>
                ))}
              </div>

              {/* Match type legend */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {[
                  { icon: "✨", label: "Perfect Match",    dark: "bg-emerald-500/10 border-emerald-500/20 text-emerald-300", light: "bg-emerald-50 border-emerald-200 text-emerald-600" },
                  { icon: "🎨", label: "Style Aligned",    dark: "bg-violet-500/10 border-violet-500/20 text-violet-300",    light: "bg-violet-50 border-violet-200 text-violet-600" },
                  { icon: "✅", label: "Verified Expert",  dark: "bg-blue-500/10 border-blue-500/20 text-blue-300",          light: "bg-blue-50 border-blue-200 text-blue-600" },
                  { icon: "🤝", label: "Mutual Learning",  dark: "bg-amber-500/10 border-amber-500/20 text-amber-300",       light: "bg-amber-50 border-amber-200 text-amber-600" },
                  { icon: "⭐", label: "Trusted Mentor",   dark: "bg-yellow-500/10 border-yellow-500/20 text-yellow-300",    light: "bg-yellow-50 border-yellow-200 text-yellow-600" },
                  { icon: "🎯", label: "Skill Complement", dark: "bg-rose-500/10 border-rose-500/20 text-rose-300",          light: "bg-rose-50 border-rose-200 text-rose-600" },
                ].map(t => (
                  <div key={t.label} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[10px] font-semibold ${isDarkMode ? t.dark : t.light}`}>
                    <span>{t.icon}</span><span>{t.label}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Smart content */}
            {smartMatchesLoading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-violet-500/30">
                  <span className="text-white text-2xl animate-pulse">✨</span>
                </div>
                <p className="text-lg font-bold bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-500 bg-clip-text text-transparent">
                  AI Analyzing Matches...
                </p>
                <p className={`text-sm ${textSub}`}>Finding your most compatible learning partners</p>
                <div className="flex gap-1.5 mt-1">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                </div>
              </div>
            ) : smartMatchesError ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
                  <span className="text-3xl">⚠️</span>
                </div>
                <h3 className="text-xl font-black text-red-400 mb-2">Failed to Load Smart Matches</h3>
                <p className={`text-sm mb-6 ${textSub}`}>{smartMatchesError}</p>
                <button onClick={handleSmartRefresh}
                  className="px-6 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 transition-all duration-300 hover:scale-105">
                  Try Again
                </button>
              </div>
            ) : smartMatches.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/15 to-violet-500/15 border border-indigo-500/20 flex items-center justify-center mx-auto mb-5">
                  <span className="text-3xl">🧠</span>
                </div>
                <h3 className={`text-xl font-black mb-2 ${textMain}`}>No Smart Matches Found</h3>
                <p className={`text-sm mb-6 max-w-sm mx-auto ${textSub}`}>
                  Complete your profile and add more skills to get better AI-powered matches!
                </p>
                <div className="flex flex-col items-center gap-3">
                  <button onClick={() => window.location.href = "/profile"}
                    className="px-6 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600 hover:from-indigo-400 hover:via-violet-400 hover:to-purple-500 transition-all duration-300 hover:scale-105 shadow-lg shadow-indigo-500/25">
                    Complete Profile
                  </button>
                  <button onClick={() => window.location.href = "/skills"}
                    className={`text-sm font-semibold transition-colors ${isDarkMode ? "text-indigo-400 hover:text-indigo-300" : "text-indigo-600 hover:text-indigo-500"}`}>
                    Add Skills →
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className={`flex items-center justify-between mb-5 flex-wrap gap-2`}>
                  <h4 className={`text-base font-bold flex items-center gap-2 ${textMain}`}>
                    <span>✨</span>
                    <span>{smartMatches.length} Perfect Matches Found</span>
                  </h4>
                  <span className={`text-xs px-3 py-1.5 rounded-full border font-medium ${
                    isDarkMode ? "bg-slate-800/60 border-slate-700/50 text-slate-400" : "bg-white border-indigo-100 text-gray-500"
                  }`}>Updated just now</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {smartMatches.map(m => (
                    <SmartMatchCard key={m.user._id} match={m} onSendRequest={() => handleSmartRequest(m.user._id)} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ Footer stats ════════════════════════════ */}
        {matches.length > 0 && (
          <Card isDarkMode={isDarkMode} className="p-6">
            <h3 className={`text-lg font-black text-center mb-5 bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-500 bg-clip-text text-transparent`}>
              Your Matching Journey
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total Connections", val: stats.requests, grad: "from-indigo-500 to-violet-600", icon: "🤝" },
                { label: "Active Matches",    val: stats.current,  grad: "from-emerald-500 to-teal-600",  icon: "⚡" },
                { label: "AI Suggestions",   val: stats.smart,    grad: "from-violet-500 to-purple-600",  icon: "🧠" },
                {
                  label: "Success Rate",
                  val: stats.current > 0 ? `${Math.round((stats.current / stats.requests) * 100)}%` : "0%",
                  grad: "from-amber-500 to-orange-600",
                  icon: "📈",
                },
              ].map(s => (
                <div key={s.label} className={`group text-center p-4 rounded-xl border transition-all duration-300 hover:-translate-y-1 ${
                  isDarkMode ? "bg-slate-700/30 border-slate-600/30 hover:border-indigo-500/30" : "bg-indigo-50/60 border-indigo-100 hover:border-indigo-300 hover:shadow-md"
                }`}>
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">{s.icon}</div>
                  <div className={`text-2xl font-black bg-gradient-to-r ${s.grad} bg-clip-text text-transparent mb-0.5`}>{s.val}</div>
                  <div className={`text-xs font-semibold ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}>{s.label}</div>
                </div>
              ))}
            </div>
          </Card>
        )}

      </div>
    </div>
  );
}

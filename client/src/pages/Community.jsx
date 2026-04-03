// pages/Community.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { useTheme } from "../hooks/useTheme";
import {
  Users, Search, X, LayoutList, Star, HelpCircle,
  MessageSquare, Bookmark, Sparkles, RefreshCw,
  ChevronDown, TrendingUp, Filter, Zap, Lightbulb,
} from "lucide-react";
import { toast } from "react-toastify";
import * as communityApi from "../services/communityApi";
import CreatePost from "../components/community/CreatePost";
import PostCard from "../components/community/PostCard";
import TrendingTopics from "../components/community/TrendingTopics";

/* ── constants ─────────────────────────────────────────── */
const TABS = [
  { id: "all",         label: "All",         icon: <LayoutList className="w-4 h-4" />     },
  { id: "post",        label: "Posts",       icon: <MessageSquare className="w-4 h-4" />  },
  { id: "question",    label: "Questions",   icon: <HelpCircle className="w-4 h-4" />     },
  { id: "discussion",  label: "Discussions", icon: <Zap className="w-4 h-4" />           },
  { id: "saved",       label: "Saved",       icon: <Bookmark className="w-4 h-4" />       },
  { id: "recommended", label: "For You",     icon: <Sparkles className="w-4 h-4" />      },
];

const SORTS = [
  { value: "newest",     label: "Newest"       },
  { value: "popular",    label: "Most Popular" },
  { value: "unanswered", label: "Unanswered"   },
];

function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem("user")) || {}; }
  catch { return {}; }
}

export default function Community() {
  const { isDarkMode } = useTheme();
  const currentUser   = getCurrentUser();
  const currentUserId = currentUser?._id || currentUser?.id || "";

  const [posts,        setPosts]        = useState([]);
  const [recommended,  setRecommended]  = useState([]);
  const [trendingTags, setTrendingTags] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);
  const [activeTab,    setActiveTab]    = useState("all");
  const [sort,         setSort]         = useState("newest");
  const [activeTag,    setActiveTag]    = useState("");
  const [search,       setSearch]       = useState("");
  const [debouncedQ,   setDebouncedQ]   = useState("");
  const [showSort,     setShowSort]     = useState(false);
  const [pagination,   setPagination]   = useState({ page: 1, pages: 1, total: 0 });
  const debRef = useRef();

  useEffect(() => {
    clearTimeout(debRef.current);
    debRef.current = setTimeout(() => setDebouncedQ(search), 350);
    return () => clearTimeout(debRef.current);
  }, [search]);

  const fetchPosts = useCallback(async (page = 1, showLoader = true) => {
    if (showLoader) setLoading(true);
    else setRefreshing(true);
    try {
      const params = {
        page, limit: 12, sort,
        ...(activeTab !== "all" && activeTab !== "saved" && activeTab !== "recommended" && { postType: activeTab }),
        ...(activeTab === "saved" && { saved: "true" }),
        ...(activeTag && { tag: activeTag }),
        ...(debouncedQ && { search: debouncedQ }),
      };
      const res = await communityApi.getPosts(params);
      setPosts(res.data || []);
      setPagination(res.pagination || { page: 1, pages: 1, total: 0 });
    } catch { toast.error("Failed to load posts"); }
    finally { setLoading(false); setRefreshing(false); }
  }, [activeTab, sort, activeTag, debouncedQ]);

  const fetchRecommended  = async () => { try { const r = await communityApi.getRecommended();  setRecommended(r.data || []);  } catch {} };
  const fetchTrendingTags = async () => { try { const r = await communityApi.getTrendingTags(); setTrendingTags(r.data || []); } catch {} };

  useEffect(() => { fetchTrendingTags(); fetchRecommended(); }, []);
  useEffect(() => { if (activeTab !== "recommended") fetchPosts(1); }, [fetchPosts, activeTab]);

  const handlePosted   = (newPost) => setPosts(p => [newPost, ...p]);
  const handleDelete   = (id)      => setPosts(p => p.filter(x => x._id !== id));
  const handleTagClick = (tag)     => { setActiveTag(p => p === tag ? "" : tag); setActiveTab("all"); };

  const displayList = activeTab === "recommended" ? recommended : posts;

  /* ── theme tokens ─────────────────────────────────────── */
  const pageBg = isDarkMode
    ? "bg-[#0a0f1e]"
    : "bg-gradient-to-br from-slate-50 via-indigo-50/40 to-violet-50/30";

  const card = isDarkMode
    ? "bg-slate-800/60 border-slate-700/50"
    : "bg-white border-indigo-100 shadow-sm";

  const textMain = isDarkMode ? "text-white"      : "text-gray-900";
  const textSub  = isDarkMode ? "text-slate-400"  : "text-gray-500";
  const inputCls = isDarkMode
    ? "bg-slate-900/60 border-slate-600/50 text-white placeholder-slate-500 focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20"
    : "bg-white border-indigo-200 text-gray-900 placeholder-gray-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 shadow-sm";

  return (
    <div className={`min-h-screen transition-colors duration-500 ${pageBg}`}>

      {/* ── Decorative BG ────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {isDarkMode ? (
          <>
            <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-indigo-600/6 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-3xl" />
            <div className="absolute inset-0 opacity-[0.02]"
              style={{ backgroundImage: "radial-gradient(circle at 1px 1px,rgba(139,92,246,1) 1px,transparent 0)", backgroundSize: "40px 40px" }} />
          </>
        ) : (
          <>
            <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-gradient-to-bl from-violet-100/60 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[400px] bg-gradient-to-tr from-indigo-100/60 to-transparent rounded-full blur-3xl" />
          </>
        )}
      </div>

      {/* ── HERO HEADER ─────────────────────────────────── */}
      <div className={`relative overflow-hidden border-b z-10 ${isDarkMode ? "border-slate-700/30" : "border-indigo-100"}`}>
        <div className="relative max-w-6xl mx-auto px-3 sm:px-6 py-5 sm:py-10">
          <div className="flex items-center justify-between gap-3 mb-3 sm:mb-6">
            {/* Left: icon + title */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 4px 20px rgba(99,102,241,0.35)" }}>
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-xl sm:text-3xl font-black ${textMain}`}>Community</h1>
                <p className={`text-xs sm:text-sm ${textSub}`}>Ask · Share · Discuss · Grow</p>
              </div>
            </div>

            {/* Right: stats pills — compact on mobile */}
            <div className="flex items-center gap-2">
              {[
                { label: "Posts",  value: pagination.total  || "—", icon: "📝", color: isDarkMode ? "text-indigo-400" : "text-indigo-600", bg: isDarkMode ? "bg-indigo-500/10" : "bg-indigo-50" },
                { label: "Topics", value: trendingTags.length || "—", icon: "🔥", color: isDarkMode ? "text-violet-400" : "text-violet-600", bg: isDarkMode ? "bg-violet-500/10" : "bg-violet-50" },
              ].map(s => (
                <div key={s.label} className={`px-2.5 sm:px-4 py-1.5 sm:py-2.5 rounded-xl border text-center ${card} ${s.bg}`}>
                  <div className={`text-sm sm:text-lg font-black ${s.color}`}>{s.value}</div>
                  <div className={`text-[10px] sm:text-xs ${textSub} flex items-center gap-1 justify-center`}><span>{s.icon}</span><span className="hidden sm:inline">{s.label}</span></div>
                </div>
              ))}
            </div>
          </div>

          {/* Description — hidden on mobile */}
          <p className={`hidden sm:block text-base ${textSub} max-w-xl mb-5`}>
            Connect with learners and experts. Ask questions, start discussions, and share knowledge
            tagged with the skills that matter to you.
          </p>

          {/* Search */}
          <div className="mt-3 sm:mt-6 relative max-w-2xl">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? "text-slate-400" : "text-gray-400"}`} />
            <input
              type="text" placeholder="Search posts, questions…"
              value={search} onChange={e => setSearch(e.target.value)}
              className={`w-full pl-12 pr-12 py-3 sm:py-3.5 rounded-2xl border text-sm sm:text-base outline-none transition-all ${inputCls}`}
            />
            {search && (
              <button onClick={() => setSearch("")}
                className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${isDarkMode ? "text-slate-400 hover:text-white" : "text-gray-400 hover:text-gray-700"}`}>
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── BODY ──────────────────────────────────────────── */}
      <div className="relative z-10 max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-8 pb-24 md:pb-8">
        <div className="flex flex-col xl:flex-row gap-5 sm:gap-8">

          {/* ── MAIN FEED ────────────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-5">

            {/* Create post */}
            <CreatePost isDarkMode={isDarkMode} currentUser={currentUser} onPosted={handlePosted} />

            {/* Control bar */}
            <div className={`flex items-center gap-3 p-1.5 rounded-2xl border ${card}`}>
              <div className="flex gap-1 flex-1 overflow-x-auto [scrollbar-width:none]">
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); setActiveTag(""); }}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                      activeTab === tab.id
                        ? "text-white shadow-md"
                        : isDarkMode ? "text-slate-400 hover:text-white" : "text-gray-500 hover:text-indigo-700"
                    }`}
                    style={activeTab === tab.id ? { background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 2px 10px rgba(99,102,241,0.3)" } : {}}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="relative">
                  <button onClick={() => setShowSort(p => !p)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                      isDarkMode ? "border-slate-600/40 text-slate-400 hover:text-white hover:border-indigo-500/40" : "border-indigo-100 text-gray-500 hover:text-indigo-700 hover:border-indigo-300"
                    }`}>
                    <Filter className="w-3.5 h-3.5" />
                    {SORTS.find(s => s.value === sort)?.label}
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  {showSort && (
                    <div className={`absolute right-0 top-full mt-1 z-20 rounded-2xl border shadow-2xl overflow-hidden ${
                      isDarkMode ? "bg-slate-800 border-slate-700/50" : "bg-white border-indigo-100"
                    }`} style={{ minWidth: 160 }}>
                      {SORTS.map(s => (
                        <button key={s.value}
                          onClick={() => { setSort(s.value); setShowSort(false); }}
                          className={`w-full px-4 py-2.5 text-left text-sm font-semibold transition-colors ${
                            sort === s.value
                              ? isDarkMode ? "text-indigo-400 bg-indigo-500/10" : "text-indigo-600 bg-indigo-50"
                              : isDarkMode ? "text-slate-300 hover:bg-slate-700/60" : "text-gray-700 hover:bg-indigo-50"
                          }`}>
                          {s.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button onClick={() => fetchPosts(1, false)}
                  className={`p-2 rounded-xl border transition-all ${
                    isDarkMode ? "border-slate-600/40 text-slate-400 hover:text-white hover:border-indigo-500/40" : "border-indigo-100 text-gray-400 hover:text-indigo-600 hover:border-indigo-300"
                  } ${refreshing ? "animate-spin" : ""}`}>
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Active tag banner */}
            {activeTag && (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
                style={{ background: isDarkMode ? "rgba(99,102,241,0.1)" : "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.25)" }}>
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                <span className={`text-sm font-semibold ${isDarkMode ? "text-indigo-300" : "text-indigo-700"}`}>
                  Filtering by <strong>#{activeTag}</strong>
                </span>
                <button onClick={() => setActiveTag("")} className="ml-auto p-0.5 text-indigo-400 hover:text-indigo-200 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Results meta */}
            {activeTab !== "recommended" && !loading && (
              <div className={`text-xs ${textSub} flex items-center justify-between`}>
                <span>
                  {pagination.total} post{pagination.total !== 1 ? "s" : ""}
                  {debouncedQ && <> for "<span className="text-indigo-400 font-bold">{debouncedQ}</span>"</>}
                </span>
              </div>
            )}

            {/* Feed */}
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className={`rounded-2xl border animate-pulse ${card}`} style={{ height: 200 }} />
                ))}
              </div>
            ) : displayList.length === 0 ? (
              <div className="flex flex-col items-center py-24">
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-5 ${isDarkMode ? "bg-indigo-500/10 border border-indigo-500/20" : "bg-indigo-50 border border-indigo-100"}`}>
                  <Users className={`w-10 h-10 ${isDarkMode ? "text-indigo-400" : "text-indigo-500"}`} />
                </div>
                <p className={`text-lg font-black mb-2 ${textMain}`}>
                  {activeTab === "saved" ? "No saved posts yet"
                    : activeTab === "recommended" ? "No recommendations yet"
                    : "Nothing here yet"}
                </p>
                <p className={`text-sm ${textSub}`}>
                  {activeTab === "saved" ? "Save posts to read them later"
                    : activeTab === "recommended" ? "Complete your profile to get personalized suggestions"
                    : "Be the first to post something!"}
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-5">
                  {displayList.map(p => (
                    <PostCard
                      key={p._id} post={p}
                      isDarkMode={isDarkMode}
                      currentUserId={currentUserId}
                      onDelete={handleDelete}
                      onRefresh={() => fetchPosts(pagination.page, false)}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {activeTab !== "recommended" && pagination.pages > 1 && (
                  <div className="flex justify-center gap-2 mt-6">
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                      <button key={p} onClick={() => fetchPosts(p)}
                        className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${
                          pagination.page === p
                            ? "text-white shadow-md"
                            : isDarkMode ? "text-slate-400 border border-slate-600/40 hover:text-white" : "text-gray-500 border border-indigo-100 hover:border-indigo-300 hover:text-indigo-700"
                        }`}
                        style={pagination.page === p ? { background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 2px 10px rgba(99,102,241,0.3)" } : {}}>
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── SIDEBAR ──────────────────────────────────── */}
          <div className="w-full xl:w-72 flex-shrink-0 space-y-5">

            {/* Stats card */}
            <div className={`rounded-2xl border p-5 ${card}`}>
              <h3 className={`font-bold text-sm mb-4 flex items-center gap-2 ${textMain}`}>
                <span className="text-base">📊</span> Community Stats
              </h3>
              {[
                { label: "Total Posts",   val: pagination.total || "—", color: isDarkMode ? "text-indigo-400" : "text-indigo-600", bg: isDarkMode ? "bg-indigo-500/10" : "bg-indigo-50"  },
                { label: "Trending Tags", val: trendingTags.length || "—", color: isDarkMode ? "text-violet-400" : "text-violet-600", bg: isDarkMode ? "bg-violet-500/10" : "bg-violet-50" },
                { label: "Saved by You",  val: posts.filter(p => p.saves?.some(s => s.toString() === currentUserId)).length, color: isDarkMode ? "text-amber-400" : "text-amber-600", bg: isDarkMode ? "bg-amber-500/10" : "bg-amber-50" },
              ].map(s => (
                <div key={s.label} className={`flex justify-between items-center px-3 py-2.5 rounded-xl mb-2 last:mb-0 ${s.bg}`}>
                  <span className={`text-sm ${textSub}`}>{s.label}</span>
                  <span className={`text-sm font-black ${s.color}`}>{s.val}</span>
                </div>
              ))}
            </div>

            {/* Trending topics */}
            <TrendingTopics
              tags={trendingTags} isDarkMode={isDarkMode}
              onTagClick={handleTagClick} activeTag={activeTag}
            />

            {/* Tips card */}
            <div className={`rounded-2xl border p-5 ${card}`}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                  <Lightbulb className="w-3.5 h-3.5 text-white" />
                </div>
                <h3 className={`font-bold text-sm ${textMain}`}>Community Tips</h3>
              </div>
              {[
                "Tag your posts with relevant skills for better discovery",
                "Use Question type for technical problems",
                "Accept the best answer to help others",
                "Share learning resources in your posts",
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-2.5 mb-3 last:mb-0">
                  <span className="w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-black text-white flex-shrink-0 mt-0.5"
                    style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                    {i + 1}
                  </span>
                  <p className={`text-xs leading-relaxed ${textSub}`}>{tip}</p>
                </div>
              ))}
            </div>

            {/* Quick post types */}
            <div className={`rounded-2xl border p-5 ${card}`}>
              <h3 className={`font-bold text-sm mb-4 flex items-center gap-2 ${textMain}`}>
                <Zap className="w-4 h-4 text-indigo-400" /> Post Types
              </h3>
              {[
                { emoji: "💬", label: "Post",       desc: "Share an idea or resource",       tab: "post"       },
                { emoji: "❓", label: "Question",   desc: "Ask the community for help",      tab: "question"   },
                { emoji: "🗣️", label: "Discussion", desc: "Start a conversation",            tab: "discussion" },
              ].map(t => (
                <button key={t.tab} onClick={() => setActiveTab(t.tab)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left mb-2 last:mb-0 border ${
                    activeTab === t.tab
                      ? isDarkMode ? "border-indigo-500/40 bg-indigo-500/10" : "border-indigo-200 bg-indigo-50"
                      : isDarkMode ? "border-slate-700/40 hover:border-indigo-500/30 hover:bg-indigo-500/5" : "border-indigo-100 hover:border-indigo-200 hover:bg-indigo-50/50"
                  }`}>
                  <span className="text-base">{t.emoji}</span>
                  <div>
                    <p className={`text-xs font-bold ${activeTab === t.tab ? isDarkMode ? "text-indigo-300" : "text-indigo-700" : textMain}`}>{t.label}</p>
                    <p className={`text-[10px] ${textSub}`}>{t.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

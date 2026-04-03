// pages/LearningResources.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";
import {
  Search, Plus, Bookmark, TrendingUp, Sparkles, Filter,
  BookOpen, Video, FileText, Code, BookMarked, Globe,
  Star, Clock, Eye, Heart, X, ChevronDown, LayoutGrid,
  List, SlidersHorizontal, RefreshCw, Zap,
} from "lucide-react";
import { toast } from "react-toastify";
import * as resourceApi from "../services/resourceApi";
import ResourceCard from "../components/resources/ResourceCard";
import AddResourceForm from "../components/resources/AddResourceForm";
import TrendingResources from "../components/resources/TrendingResources";
import RecommendedResources from "../components/resources/RecommendedResources";

/* ── Constants ─────────────────────────────────────────── */
const CATEGORIES = [
  "All", "Web Development", "Data Science", "UI/UX Design",
  "Mobile Development", "AI & Machine Learning", "DevOps", "Other",
];
const TYPES  = ["All", "Video", "Article", "Course", "Documentation", "Book", "Tutorial"];
const LEVELS = ["All", "Beginner", "Intermediate", "Advanced"];
const SORTS  = [
  { value: "newest",  label: "Newest"         },
  { value: "popular", label: "Most Popular"   },
  { value: "rated",   label: "Highest Rated"  },
  { value: "liked",   label: "Most Liked"     },
];

const TYPE_ICONS = {
  Video:         <Video className="w-3.5 h-3.5" />,
  Article:       <FileText className="w-3.5 h-3.5" />,
  Course:        <BookOpen className="w-3.5 h-3.5" />,
  Documentation: <Code className="w-3.5 h-3.5" />,
  Book:          <BookMarked className="w-3.5 h-3.5" />,
  Tutorial:      <Globe className="w-3.5 h-3.5" />,
};

const CAT_EMOJI = {
  "All":                  "✨",
  "Web Development":      "🌐",
  "Data Science":         "📊",
  "UI/UX Design":         "🎨",
  "Mobile Development":   "📱",
  "AI & Machine Learning":"🤖",
  "DevOps":               "⚙️",
  "Other":                "📚",
};

/* ── TABS ──────────────────────────────────────────────── */
const TABS = [
  { id: "all",         label: "All Resources", icon: <LayoutGrid className="w-4 h-4" /> },
  { id: "recommended", label: "For You",       icon: <Sparkles className="w-4 h-4" />  },
  { id: "trending",    label: "Trending",      icon: <TrendingUp className="w-4 h-4" />},
  { id: "bookmarked",  label: "Saved",         icon: <Bookmark className="w-4 h-4" />  },
];

export default function LearningResources() {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  /* ── state ── */
  const [activeTab,   setActiveTab]   = useState("all");
  const [resources,   setResources]   = useState([]);
  const [trending,    setTrending]    = useState({ mostViewed: [], mostLiked: [], recent: [] });
  const [recommended, setRecommended] = useState([]);
  const [bookmarked,  setBookmarked]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category,    setCategory]    = useState("All");
  const [type,        setType]        = useState("All");
  const [level,       setLevel]       = useState("All");
  const [sort,        setSort]        = useState("newest");
  const [viewMode,    setViewMode]    = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [pagination,  setPagination]  = useState({ page: 1, pages: 1, total: 0 });
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [likedIds,    setLikedIds]    = useState(new Set());
  const debounceRef = useRef();

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const fetchResources = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page, limit: 12, sort,
        ...(category !== "All" && { category }),
        ...(type     !== "All" && { resourceType: type }),
        ...(level    !== "All" && { difficultyLevel: level }),
        ...(debouncedSearch    && { search: debouncedSearch }),
      };
      const res = await resourceApi.getResources(params);
      setResources(res.data || []);
      setPagination(res.pagination || { page: 1, pages: 1, total: 0 });
    } catch { toast.error("Failed to load resources"); }
    finally   { setLoading(false); }
  }, [category, type, level, sort, debouncedSearch]);

  const fetchTrending    = async () => { try { const r = await resourceApi.getTrending();   setTrending(r.data || {}); } catch {} };
  const fetchRecommended = async () => { try { const r = await resourceApi.getRecommended(); setRecommended(r.data || []); } catch {} };
  const fetchBookmarked  = async () => {
    try {
      const r = await resourceApi.getBookmarked();
      setBookmarked(r.data || []);
      setBookmarkedIds(new Set((r.data || []).map(b => b._id)));
    } catch {}
  };

  useEffect(() => { fetchTrending(); fetchRecommended(); fetchBookmarked(); }, []);
  useEffect(() => { if (activeTab === "all") fetchResources(1); }, [fetchResources, activeTab]);

  const handleLike = async (id) => {
    try {
      const r = await resourceApi.toggleLike(id);
      setLikedIds(prev => { const n = new Set(prev); r.liked ? n.add(id) : n.delete(id); return n; });
      setResources(prev => prev.map(res =>
        res._id === id ? { ...res, likes: r.liked ? [...res.likes, "me"] : res.likes.slice(0, -1) } : res
      ));
    } catch { toast.error("Failed"); }
  };

  const handleBookmark = async (id) => {
    try {
      const r = await resourceApi.toggleBookmark(id);
      setBookmarkedIds(prev => { const n = new Set(prev); r.bookmarked ? n.add(id) : n.delete(id); return n; });
      if (!r.bookmarked) setBookmarked(prev => prev.filter(b => b._id !== id));
      else fetchBookmarked();
      toast.success(r.bookmarked ? "Bookmarked!" : "Removed from saved");
    } catch { toast.error("Failed"); }
  };

  const handleResourceAdded = (res) => {
    setResources(prev => [res, ...prev]);
    setShowAddForm(false);
    toast.success("Resource added!");
  };

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

  const displayList = activeTab === "bookmarked" ? bookmarked : resources;

  return (
    <div className={`min-h-screen transition-colors duration-500 ${pageBg}`}>

      {/* ── Decorative BG ──────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {isDarkMode ? (
          <>
            <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-indigo-600/6 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1.5s" }} />
            <div className="absolute inset-0 opacity-[0.025]"
              style={{ backgroundImage: "radial-gradient(circle at 1px 1px,rgba(139,92,246,1) 1px,transparent 0)", backgroundSize: "40px 40px" }} />
          </>
        ) : (
          <>
            <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-gradient-to-bl from-violet-100/60 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[400px] bg-gradient-to-tr from-indigo-100/60 to-transparent rounded-full blur-3xl" />
          </>
        )}
      </div>

      {/* ── HERO HEADER ────────────────────────────────── */}
      <div className={`relative overflow-hidden border-b ${isDarkMode ? "border-slate-700/30" : "border-indigo-100"}`}>
        <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 py-5 sm:py-10">
          <div className="flex items-center justify-between gap-4 mb-3 sm:mb-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/25 flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-xl sm:text-3xl font-black ${textMain}`}>Learning Resources</h1>
                <p className={`text-xs sm:text-sm ${textSub}`}>Discover · Share · Grow</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-3 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-sm font-bold text-white shadow-lg hover:opacity-90 active:scale-95 transition-all flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 4px 20px rgba(99,102,241,0.35)" }}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Resource</span>
            </button>
          </div>

          <p className={`hidden sm:block text-base ${textSub} max-w-xl mb-6`}>
            Curated tutorials, videos, courses and articles matched to your skills and goals.
            Contribute resources and earn community recognition.
          </p>

          {/* Search */}
          <div className="mt-3 sm:mt-6 relative max-w-2xl">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? "text-slate-400" : "text-gray-400"}`} />
            <input
              type="text"
              placeholder="Search resources…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={`w-full pl-12 pr-12 py-3 sm:py-3.5 rounded-2xl border text-sm sm:text-base outline-none transition-all ${inputCls}`}
            />
            {search && (
              <button onClick={() => setSearch("")}
                className={`absolute right-4 top-1/2 -translate-y-1/2 ${isDarkMode ? "text-slate-400 hover:text-white" : "text-gray-400 hover:text-gray-700"} transition-colors`}>
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category pills — horizontally scrollable on mobile */}
          <div className="mt-4 sm:mt-5 flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {CATEGORIES.map(cat => {
              const isActive = category === cat && activeTab === "all";
              return (
                <button
                  key={cat}
                  onClick={() => { setCategory(cat); setActiveTab("all"); }}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold border transition-all duration-200 ${
                    isActive
                      ? "text-white border-transparent shadow-md"
                      : isDarkMode
                        ? "text-slate-400 border-slate-600/40 hover:text-white hover:border-indigo-500/40"
                        : "text-gray-600 border-indigo-100 hover:border-indigo-300 hover:text-indigo-700 bg-white shadow-sm"
                  }`}
                  style={isActive ? { background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 2px 12px rgba(99,102,241,0.3)" } : {}}
                >
                  <span>{CAT_EMOJI[cat]}</span>
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── BODY ───────────────────────────────────────── */}
      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 py-5 sm:py-8 pb-24 md:pb-8">
        <div className="flex flex-col xl:flex-row gap-6 sm:gap-8">

          {/* ── MAIN COLUMN ──────────────────────────── */}
          <div className="flex-1 min-w-0">

            {/* Tab bar — scrollable on mobile */}
            <div className={`flex items-center justify-between gap-2 mb-5 sm:mb-6 p-1.5 rounded-2xl border ${card} overflow-x-auto`}
              style={{ scrollbarWidth: "none" }}>
              <div className="flex gap-1 flex-shrink-0">
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 whitespace-nowrap ${
                      activeTab === tab.id
                        ? "text-white shadow-md"
                        : isDarkMode ? "text-slate-400 hover:text-white" : "text-gray-500 hover:text-indigo-700"
                    }`}
                    style={activeTab === tab.id ? { background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 2px 12px rgba(99,102,241,0.3)" } : {}}
                  >
                    {tab.icon}
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.id === "all" ? "All" : tab.id === "recommended" ? "For You" : tab.id === "trending" ? "Hot" : "Saved"}</span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                {/* View toggle */}
                <div className={`flex rounded-xl border overflow-hidden ${isDarkMode ? "border-slate-600/40" : "border-indigo-100"}`}>
                  {[{ id: "grid", icon: <LayoutGrid className="w-4 h-4" /> }, { id: "list", icon: <List className="w-4 h-4" /> }].map(v => (
                    <button
                      key={v.id}
                      onClick={() => setViewMode(v.id)}
                      className={`p-2 transition-colors ${viewMode === v.id
                        ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white"
                        : isDarkMode ? "text-slate-400 hover:text-white" : "text-gray-400 hover:text-indigo-600"
                      }`}
                    >{v.icon}</button>
                  ))}
                </div>

                {/* Filter toggle */}
                <button
                  onClick={() => setShowFilters(p => !p)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold border transition-all ${
                    showFilters
                      ? "text-white border-transparent shadow-md"
                      : isDarkMode
                        ? "border-slate-600/40 text-slate-400 hover:text-white hover:border-indigo-500/40"
                        : "border-indigo-100 text-gray-500 hover:text-indigo-600 hover:border-indigo-300"
                  }`}
                  style={showFilters ? { background: "linear-gradient(135deg, #6366f1, #8b5cf6)" } : {}}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                </button>
              </div>
            </div>

            {/* Filters panel */}
            {showFilters && activeTab === "all" && (
              <div className={`mb-6 p-5 rounded-2xl border ${card} grid grid-cols-2 md:grid-cols-4 gap-4`}>
                {[
                  { label: "Type",    value: type,  set: setType,  options: TYPES },
                  { label: "Level",   value: level, set: setLevel, options: LEVELS },
                  { label: "Sort By", value: sort,  set: setSort,  options: SORTS.map(s => s.value), labels: SORTS.map(s => s.label) },
                ].map(({ label, value, set, options, labels }) => (
                  <div key={label}>
                    <label className={`block text-xs font-bold uppercase tracking-widest mb-1.5 ${textSub}`}>{label}</label>
                    <div className="relative">
                      <select
                        value={value}
                        onChange={e => set(e.target.value)}
                        className={`w-full appearance-none pl-3 pr-8 py-2.5 rounded-xl border text-sm outline-none ${inputCls}`}
                      >
                        {options.map((o, i) => <option key={o} value={o}>{labels ? labels[i] : o}</option>)}
                      </select>
                      <ChevronDown className={`absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none ${isDarkMode ? "text-slate-400" : "text-gray-400"}`} />
                    </div>
                  </div>
                ))}
                <div className="flex items-end">
                  <button
                    onClick={() => { setCategory("All"); setType("All"); setLevel("All"); setSort("newest"); setSearch(""); }}
                    className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                      isDarkMode ? "border-slate-600/40 text-slate-400 hover:text-white hover:border-indigo-500/40" : "border-indigo-100 text-gray-500 hover:text-indigo-600 hover:border-indigo-300"
                    }`}
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Reset
                  </button>
                </div>
              </div>
            )}

            {/* Results bar */}
            {activeTab === "all" && (
              <div className={`flex items-center justify-between mb-5 text-sm ${textSub}`}>
                <span>{pagination.total} resource{pagination.total !== 1 ? "s" : ""} found</span>
                {debouncedSearch && (
                  <span>Results for "<span className="text-indigo-400 font-bold">{debouncedSearch}</span>"</span>
                )}
              </div>
            )}

            {/* Content */}
            {activeTab === "recommended" ? (
              <RecommendedResources
                resources={recommended} loading={false}
                onLike={handleLike} onBookmark={handleBookmark}
                likedIds={likedIds} bookmarkedIds={bookmarkedIds}
                isDarkMode={isDarkMode} onView={id => navigate(`/resources/${id}`)}
              />
            ) : activeTab === "trending" ? (
              <TrendingResources data={trending} isDarkMode={isDarkMode} onView={id => navigate(`/resources/${id}`)} />
            ) : (
              <>
                {loading ? (
                  <div className={`grid gap-5 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3" : "grid-cols-1"}`}>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className={`rounded-2xl border animate-pulse ${card}`} style={{ height: 280 }} />
                    ))}
                  </div>
                ) : displayList.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24">
                    <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-5 ${isDarkMode ? "bg-indigo-500/10 border border-indigo-500/20" : "bg-indigo-50 border border-indigo-100"}`}>
                      <BookOpen className={`w-10 h-10 ${isDarkMode ? "text-indigo-400" : "text-indigo-500"}`} />
                    </div>
                    <p className={`text-lg font-bold mb-1 ${textMain}`}>
                      {activeTab === "bookmarked" ? "No saved resources yet" : "No resources found"}
                    </p>
                    <p className={`text-sm mb-6 ${textSub}`}>
                      {activeTab === "bookmarked" ? "Bookmark resources to see them here" : "Try adjusting your filters or search"}
                    </p>
                    {activeTab === "all" && (
                      <button
                        onClick={() => setShowAddForm(true)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
                        style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 4px 16px rgba(99,102,241,0.3)" }}
                      >
                        <Plus className="w-4 h-4" /> Add the first resource
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    <div className={`grid gap-5 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3" : "grid-cols-1"}`}>
                      {displayList.map(r => (
                        <ResourceCard
                          key={r._id} resource={r}
                          isLiked={likedIds.has(r._id)}
                          isBookmarked={bookmarkedIds.has(r._id)}
                          onLike={() => handleLike(r._id)}
                          onBookmark={() => handleBookmark(r._id)}
                          onView={() => navigate(`/resources/${r._id}`)}
                          viewMode={viewMode}
                          isDarkMode={isDarkMode}
                        />
                      ))}
                    </div>

                    {/* Pagination */}
                    {activeTab === "all" && pagination.pages > 1 && (
                      <div className="flex justify-center gap-2 mt-8">
                        {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                          <button
                            key={p}
                            onClick={() => fetchResources(p)}
                            className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${
                              pagination.page === p
                                ? "text-white shadow-md"
                                : isDarkMode ? "text-slate-400 border border-slate-600/40 hover:text-white" : "text-gray-500 border border-indigo-100 hover:border-indigo-300 hover:text-indigo-700"
                            }`}
                            style={pagination.page === p ? { background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 2px 10px rgba(99,102,241,0.3)" } : {}}
                          >{p}</button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>

          {/* ── SIDEBAR ───────────────────────────────── */}
          <div className="w-full xl:w-80 flex-shrink-0 space-y-5">

            {/* Stats card */}
            <div className={`rounded-2xl border p-5 ${card}`}>
              <h3 className={`font-bold text-base mb-4 flex items-center gap-2 ${textMain}`}>
                <span className="text-lg">📊</span> Resource Stats
              </h3>
              {[
                { label: "Total Resources", value: pagination.total || "—", color: isDarkMode ? "text-indigo-400"  : "text-indigo-600", bg: isDarkMode ? "bg-indigo-500/10" : "bg-indigo-50" },
                { label: "Your Bookmarks",  value: bookmarked.length,       color: isDarkMode ? "text-violet-400"  : "text-violet-600", bg: isDarkMode ? "bg-violet-500/10" : "bg-violet-50" },
                { label: "Categories",      value: CATEGORIES.length - 1,   color: isDarkMode ? "text-purple-400"  : "text-purple-600", bg: isDarkMode ? "bg-purple-500/10" : "bg-purple-50" },
              ].map(s => (
                <div key={s.label} className={`flex justify-between items-center px-3 py-2.5 rounded-xl mb-2 last:mb-0 ${s.bg}`}>
                  <span className={`text-sm ${textSub}`}>{s.label}</span>
                  <span className={`text-sm font-black ${s.color}`}>{s.value}</span>
                </div>
              ))}
            </div>

            {/* Browse by Type */}
            <div className={`rounded-2xl border p-5 ${card}`}>
              <h3 className={`font-bold text-base mb-4 flex items-center gap-2 ${textMain}`}>
                <span className="text-lg">🗂️</span> Browse by Type
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {TYPES.slice(1).map(t => {
                  const isActive = type === t;
                  return (
                    <button
                      key={t}
                      onClick={() => { setType(t); setActiveTab("all"); setShowFilters(true); }}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                        isActive
                          ? "text-white border-transparent shadow-md"
                          : isDarkMode
                            ? "text-slate-400 border-slate-600/40 hover:text-white hover:border-indigo-500/40"
                            : "text-gray-600 border-indigo-100 hover:border-indigo-300 hover:text-indigo-700"
                      }`}
                      style={isActive ? { background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 2px 8px rgba(99,102,241,0.3)" } : {}}
                    >
                      <span className={isActive ? "text-white" : isDarkMode ? "text-slate-400" : "text-indigo-400"}>{TYPE_ICONS[t]}</span>
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Difficulty Level */}
            <div className={`rounded-2xl border p-5 ${card}`}>
              <h3 className={`font-bold text-base mb-4 flex items-center gap-2 ${textMain}`}>
                <span className="text-lg">📈</span> Difficulty Level
              </h3>
              <div className="space-y-2">
                {[
                  { l: "Beginner",     icon: "🟢", color: "#10b981", pct: "33%",  cls: isDarkMode ? "bg-emerald-500/10 border-emerald-500/25" : "bg-emerald-50 border-emerald-200" },
                  { l: "Intermediate", icon: "🟡", color: "#f59e0b", pct: "66%",  cls: isDarkMode ? "bg-amber-500/10 border-amber-500/25"   : "bg-amber-50 border-amber-200"   },
                  { l: "Advanced",     icon: "🔴", color: "#ef4444", pct: "100%", cls: isDarkMode ? "bg-rose-500/10 border-rose-500/25"     : "bg-rose-50 border-rose-200"     },
                ].map(({ l, icon, color, pct, cls }) => {
                  const isActive = level === l;
                  return (
                    <button
                      key={l}
                      onClick={() => { setLevel(l); setActiveTab("all"); }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all text-sm font-semibold ${isActive ? cls : isDarkMode ? "border-slate-600/30 hover:border-slate-500" : "border-indigo-100 hover:border-indigo-200"}`}
                    >
                      <span className="flex items-center gap-2" style={{ color: isActive ? color : undefined }}>
                        <span>{icon}</span>
                        <span className={isActive ? "" : textSub}>{l}</span>
                      </span>
                      <div className={`w-16 h-1.5 rounded-full overflow-hidden ${isDarkMode ? "bg-slate-700/50" : "bg-gray-100"}`}>
                        <div className="h-full rounded-full" style={{ width: pct, background: color }} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick links */}
            <div className={`rounded-2xl border p-5 ${card}`}>
              <h3 className={`font-bold text-base mb-4 flex items-center gap-2 ${textMain}`}>
                <Zap className="w-4 h-4 text-indigo-400" /> Quick Actions
              </h3>
              <div className="space-y-2">
                {[
                  { label: "Share a Resource", icon: "➕", action: () => setShowAddForm(true) },
                  { label: "View Trending",     icon: "🔥", action: () => setActiveTab("trending") },
                  { label: "For You",           icon: "✨", action: () => setActiveTab("recommended") },
                  { label: "My Bookmarks",      icon: "🔖", action: () => setActiveTab("bookmarked") },
                ].map(q => (
                  <button key={q.label} onClick={q.action}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold border transition-all text-left ${
                      isDarkMode ? "border-slate-700/50 text-slate-300 hover:border-indigo-500/40 hover:text-indigo-300 hover:bg-indigo-500/5" : "border-indigo-100 text-gray-600 hover:border-indigo-300 hover:text-indigo-700 hover:bg-indigo-50"
                    }`}>
                    <span>{q.icon}</span>
                    {q.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── ADD RESOURCE MODAL ────────────────────────── */}
      {showAddForm && (
        <AddResourceForm
          isDarkMode={isDarkMode}
          onClose={() => setShowAddForm(false)}
          onAdded={handleResourceAdded}
        />
      )}
    </div>
  );
}

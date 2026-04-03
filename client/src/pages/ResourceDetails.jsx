// pages/ResourceDetails.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";
import {
  ArrowLeft, Star, Eye, Heart, Bookmark, Share2, ExternalLink,
  Clock, User, Calendar, MessageSquare, Send, CheckCircle,
  Video, FileText, BookOpen, Code, BookMarked, Globe, Loader,
} from "lucide-react";
import { toast } from "react-toastify";
import * as resourceApi from "../services/resourceApi";
import ResourceCard from "../components/resources/ResourceCard";

/* ── Type / Level config ──────────────────────────────── */
const TYPE_META = {
  Video:         { icon: <Video className="w-4 h-4" />,      color: "#ef4444" },
  Article:       { icon: <FileText className="w-4 h-4" />,   color: "#6366f1" },
  Course:        { icon: <BookOpen className="w-4 h-4" />,   color: "#8b5cf6" },
  Documentation: { icon: <Code className="w-4 h-4" />,       color: "#10b981" },
  Book:          { icon: <BookMarked className="w-4 h-4" />, color: "#f59e0b" },
  Tutorial:      { icon: <Globe className="w-4 h-4" />,      color: "#ec4899" },
};

const LEVEL_COLORS = {
  Beginner:     { text: "#10b981", bg: "rgba(16,185,129,0.12)",  border: "rgba(16,185,129,0.3)"  },
  Intermediate: { text: "#f59e0b", bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.3)"  },
  Advanced:     { text: "#ef4444", bg: "rgba(239,68,68,0.12)",   border: "rgba(239,68,68,0.3)"   },
};

/* ── Stars ────────────────────────────────────────────── */
function Stars({ rating, interactive, onRate }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star
          key={i}
          className={`${interactive ? "w-6 h-6 cursor-pointer transition-transform hover:scale-125" : "w-4 h-4"}`}
          onClick={() => interactive && onRate?.(i)}
          onMouseEnter={() => interactive && setHover(i)}
          onMouseLeave={() => interactive && setHover(0)}
          style={{
            color: i <= (interactive ? (hover || rating) : rating) ? "#f59e0b" : "rgba(148,163,184,0.4)",
            fill:  i <= (interactive ? (hover || rating) : rating) ? "#f59e0b" : "transparent",
          }}
        />
      ))}
    </div>
  );
}

export default function ResourceDetails() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const { isDarkMode } = useTheme();

  const [resource,   setResource]   = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [isLiked,    setIsLiked]    = useState(false);
  const [isSaved,    setIsSaved]    = useState(false);
  const [myRating,   setMyRating]   = useState(0);
  const [comment,    setComment]    = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { load(); }, [id]);

  const load = async () => {
    setLoading(true);
    try {
      const res  = await resourceApi.getResource(id);
      setResource(res.data);
      const saved = await resourceApi.getBookmarked();
      setIsSaved(saved.data.some(r => r._id === id));
    } catch {
      toast.error("Resource not found");
      navigate("/resources");
    } finally { setLoading(false); }
  };

  const handleLike = async () => {
    try {
      const r = await resourceApi.toggleLike(id);
      setIsLiked(r.liked);
      setResource(prev => ({ ...prev, likes: r.liked ? [...prev.likes, "me"] : prev.likes.slice(0, -1) }));
    } catch {}
  };

  const handleBookmark = async () => {
    try {
      const r = await resourceApi.toggleBookmark(id);
      setIsSaved(r.bookmarked);
      toast.success(r.bookmarked ? "Saved to bookmarks!" : "Removed from bookmarks");
    } catch {}
  };

  const handleReview = async () => {
    if (!myRating) return toast.warning("Please select a star rating");
    setSubmitting(true);
    try {
      await resourceApi.addReview(id, { rating: myRating, comment });
      toast.success("Review submitted!");
      setComment("");
      load();
    } catch { toast.error("Could not submit review"); }
    finally   { setSubmitting(false); }
  };

  const handleShare = async () => {
    try { await navigator.clipboard.writeText(resource.resourceLink); toast.success("Link copied!"); }
    catch { toast.error("Could not copy"); }
  };

  /* ── theme ─────────────────────────────────────────── */
  const pageBg   = isDarkMode ? "bg-[#0a0f1e]"  : "bg-gradient-to-br from-slate-50 via-indigo-50/40 to-violet-50/30";
  const textMain = isDarkMode ? "text-white"     : "text-gray-900";
  const textSub  = isDarkMode ? "text-slate-400" : "text-gray-500";
  const card     = isDarkMode ? "bg-slate-800/60 border-slate-700/50" : "bg-white border-indigo-100 shadow-sm";
  const inputCls = isDarkMode
    ? "bg-slate-900/60 border-slate-600/50 text-white placeholder-slate-500 focus:border-indigo-500/60"
    : "bg-white border-indigo-200 text-gray-900 placeholder-gray-400 focus:border-indigo-400 shadow-sm";

  /* ── loading ── */
  if (loading) return (
    <div className={`min-h-screen flex items-center justify-center ${pageBg}`}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl"
          style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 8px 32px rgba(99,102,241,0.35)" }}>
          <Loader className="w-8 h-8 text-white animate-spin" />
        </div>
        <p className="font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent text-lg">Loading resource…</p>
        <p className={`text-sm ${textSub}`}>Please wait a moment</p>
      </div>
    </div>
  );

  if (!resource) return null;

  const typeMeta  = TYPE_META[resource.resourceType]  || TYPE_META.Article;
  const levelMeta = LEVEL_COLORS[resource.difficultyLevel] || LEVEL_COLORS.Beginner;

  const isYoutube = /youtube\.com|youtu\.be/.test(resource.resourceLink);
  let embedUrl = "";
  if (isYoutube) {
    const videoId = resource.resourceLink.match(/(?:v=|youtu\.be\/)([^&?]+)/)?.[1];
    if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`;
  }

  return (
    <div className={`min-h-screen ${pageBg} transition-colors`}>

      {/* ── Sticky back bar ────────────────────────────── */}
      <div className={`sticky top-0 z-20 backdrop-blur-xl border-b px-3 sm:px-6 py-3 flex items-center justify-between ${
        isDarkMode ? "bg-slate-900/80 border-slate-700/30" : "bg-white/90 border-indigo-100"
      }`}>
        <button onClick={() => navigate(-1)}
          className={`flex items-center gap-2 text-sm font-semibold transition-colors ${isDarkMode ? "text-slate-400 hover:text-indigo-300" : "text-gray-500 hover:text-indigo-600"}`}>
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back to Resources</span>
        </button>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button onClick={handleBookmark}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
              isSaved
                ? "text-amber-400 border-amber-400/40 bg-amber-500/10"
                : isDarkMode ? "text-slate-400 border-slate-600/40 hover:text-amber-400" : "text-gray-500 border-indigo-100 hover:text-amber-500 hover:border-amber-200"
            }`}>
            <Bookmark className="w-4 h-4" style={{ fill: isSaved ? "#f59e0b" : "transparent" }} />
            <span className="hidden sm:inline">{isSaved ? "Saved" : "Save"}</span>
          </button>
          <button onClick={handleShare}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
              isDarkMode ? "text-slate-400 border-slate-600/40 hover:text-white hover:border-indigo-500/40" : "text-gray-500 border-indigo-100 hover:text-indigo-600 hover:border-indigo-300"
            }`}>
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Share</span>
          </button>
          <a href={resource.resourceLink} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold text-white"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 2px 12px rgba(99,102,241,0.35)" }}>
            <ExternalLink className="w-4 h-4" /> Open
          </a>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-3 sm:px-6 py-5 sm:py-8 pb-24 md:pb-8">

        {/* ── Hero card ──────────────────────────────────── */}
        <div className={`rounded-3xl border overflow-hidden mb-8 ${card}`}>
          {embedUrl ? (
            <div className="relative" style={{ paddingBottom: "42.8%", height: 0 }}>
              <iframe src={embedUrl} title={resource.title} allow="autoplay; encrypted-media" allowFullScreen
                className="absolute inset-0 w-full h-full" />
            </div>
          ) : resource.thumbnail ? (
            <div className="h-72 overflow-hidden relative">
              <img src={resource.thumbnail} alt={resource.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
          ) : (
            <div className="h-40 relative"
              style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))" }}>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ background: typeMeta.color, boxShadow: `0 8px 32px ${typeMeta.color}55` }}>
                  <span className="text-white text-2xl">{typeMeta.icon}</span>
                </div>
              </div>
            </div>
          )}

          <div className="p-4 sm:p-7">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
              <span className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold text-white"
                style={{ background: typeMeta.color, boxShadow: `0 2px 8px ${typeMeta.color}55` }}>
                {typeMeta.icon} {resource.resourceType}
              </span>
              <span className="px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold"
                style={{ background: levelMeta.bg, border: `1px solid ${levelMeta.border}`, color: levelMeta.text }}>
                {resource.difficultyLevel}
              </span>
              <span className={`px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${isDarkMode ? "bg-slate-700/60 text-slate-300 border border-slate-600/40" : "bg-indigo-50 text-indigo-700 border border-indigo-100"}`}>
                {resource.category}
              </span>
            </div>

            {/* Title */}
            <h1 className={`text-2xl sm:text-3xl font-black mb-3 sm:mb-4 ${textMain}`}>{resource.title}</h1>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-5 mb-4 sm:mb-5">
              <div className="flex items-center gap-1.5">
                <Stars rating={resource.averageRating} />
                <span className="text-amber-400 font-bold">{resource.averageRating.toFixed(1)}</span>
                <span className={`text-xs sm:text-sm ${textSub}`}>({resource.totalRatings})</span>
              </div>
              <span className={`flex items-center gap-1.5 text-xs sm:text-sm ${textSub}`}><Eye className="w-4 h-4" />{resource.views}</span>
              <span className={`flex items-center gap-1.5 text-xs sm:text-sm ${textSub}`}>
                <Heart className="w-4 h-4" style={{ color: isLiked ? "#ef4444" : undefined }} />
                {resource.likes?.length || 0}
              </span>
              {resource.duration && (
                <span className={`flex items-center gap-1.5 text-xs sm:text-sm ${textSub}`}><Clock className="w-4 h-4" />{resource.duration}</span>
              )}
              <span className={`flex items-center gap-1.5 text-xs sm:text-sm ${textSub}`}>
                <Calendar className="w-4 h-4" />
                {new Date(resource.createdAt).toLocaleDateString()}
              </span>
            </div>

            {/* Description */}
            <p className={`text-base leading-relaxed mb-5 ${textSub}`}>{resource.description}</p>

            {/* Tags */}
            {resource.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {resource.tags.map(t => (
                  <span key={t} className={`px-3 py-1 rounded-lg text-sm font-medium ${
                    isDarkMode ? "bg-indigo-500/10 border border-indigo-500/20 text-indigo-300" : "bg-indigo-50 border border-indigo-100 text-indigo-600"
                  }`}>
                    #{t}
                  </span>
                ))}
              </div>
            )}

            {/* Author */}
            {resource.author && (
              <div className="flex items-center gap-3">
                <img
                  src={resource.author.profileImage || resource.author.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(resource.author.name || "U")}&background=6366f1&color=fff`}
                  alt={resource.author.name}
                  className="w-10 h-10 rounded-xl object-cover ring-2 ring-indigo-500/30"
                />
                <div>
                  <div className={`font-bold text-sm ${textMain}`}>{resource.author.name}</div>
                  <div className={`text-xs capitalize ${textSub}`}>{resource.author.experienceLevel}</div>
                </div>
              </div>
            )}

            {/* Action row */}
            <div className={`flex flex-wrap items-center gap-2 sm:gap-3 mt-5 sm:mt-6 pt-4 sm:pt-5 border-t ${isDarkMode ? "border-slate-700/40" : "border-indigo-100"}`}>
              <button onClick={handleLike}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-sm font-bold border transition-all active:scale-95 ${
                  isLiked ? "text-red-400 border-red-400/40 bg-red-500/10" : isDarkMode ? "text-slate-400 border-slate-600/40 hover:text-red-400 hover:border-red-500/30" : "text-gray-500 border-indigo-100 hover:text-red-500 hover:border-red-200"
                }`}>
                <Heart className="w-4 h-4" style={{ fill: isLiked ? "#ef4444" : "transparent" }} />
                {isLiked ? "Liked" : "Like"}
              </button>
              <a href={resource.resourceLink} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-sm font-bold text-white ml-auto"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 4px 16px rgba(99,102,241,0.35)" }}>
                <ExternalLink className="w-4 h-4" /> Open Resource
              </a>
            </div>
          </div>
        </div>

        {/* ── Reviews + Related ───────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Reviews */}
          <div className="lg:col-span-2 space-y-6">
            {/* Write review */}
            <div className={`rounded-2xl border p-4 sm:p-6 ${card}`}>
              <h3 className={`font-bold text-base sm:text-lg mb-4 sm:mb-5 flex items-center gap-2 ${textMain}`}>
                <Star className="w-5 h-5 text-amber-400" />
                Rate & Review
              </h3>
              <div className="mb-4">
                <p className={`text-sm mb-2 font-medium ${textSub}`}>Your rating</p>
                <Stars rating={myRating} interactive onRate={setMyRating} />
              </div>
              <textarea
                rows={3}
                placeholder="Share your thoughts about this resource…"
                value={comment}
                onChange={e => setComment(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border text-sm outline-none resize-none transition-all ${inputCls}`}
              />
              <button onClick={handleReview} disabled={submitting}
                className="mt-3 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all active:scale-95 disabled:opacity-70"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 4px 16px rgba(99,102,241,0.3)" }}>
                {submitting ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Submit Review
              </button>
            </div>

            {/* Reviews list */}
            <div className={`rounded-2xl border p-4 sm:p-6 ${card}`}>
              <h3 className={`font-bold text-base sm:text-lg mb-4 sm:mb-5 flex items-center gap-2 ${textMain}`}>
                <MessageSquare className="w-5 h-5 text-indigo-400" />
                Reviews ({resource.reviews?.length || 0})
              </h3>
              {(resource.reviews || []).length === 0 ? (
                <div className={`text-center py-8 ${textSub}`}>
                  <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-semibold">No reviews yet.</p>
                  <p className="text-xs mt-1 opacity-70">Be the first to review this resource!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {(resource.reviews || []).map(rev => (
                    <div key={rev._id} className={`p-4 rounded-2xl border ${isDarkMode ? "bg-slate-700/30 border-slate-600/30" : "bg-indigo-50/50 border-indigo-100"}`}>
                      <div className="flex items-center gap-3 mb-2">
                        <img
                          src={rev.user?.profileImage || rev.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(rev.user?.name || "U")}&background=6366f1&color=fff`}
                          alt={rev.user?.name}
                          className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500/20"
                        />
                        <div className="flex-1">
                          <div className={`font-bold text-sm ${textMain}`}>{rev.user?.name}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Stars rating={rev.rating} />
                            <span className={`text-xs ${textSub}`}>{new Date(rev.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      {rev.comment && <p className={`text-sm leading-relaxed ${textSub}`}>{rev.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Related Resources */}
          <div>
            <h3 className={`font-bold text-lg mb-4 flex items-center gap-2 ${textMain}`}>
              <BookOpen className="w-5 h-5 text-indigo-400" />
              Related Resources
            </h3>
            <div className="space-y-3">
              {(resource.related || []).length === 0 ? (
                <div className={`text-center py-8 rounded-2xl border-2 border-dashed ${isDarkMode ? "border-slate-700 text-slate-500" : "border-indigo-100 text-gray-400"}`}>
                  <p className="text-sm font-semibold">No related resources</p>
                </div>
              ) : (
                (resource.related || []).map(r => (
                  <div
                    key={r._id}
                    onClick={() => navigate(`/resources/${r._id}`)}
                    className={`flex gap-3 p-3 rounded-2xl border cursor-pointer transition-all duration-200 group hover:-translate-y-0.5 ${
                      isDarkMode ? "bg-slate-800/60 border-slate-700/50 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/10" : "bg-white border-indigo-100 hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-100/50"
                    }`}
                  >
                    {r.thumbnail ? (
                      <img src={r.thumbnail} alt={r.title} className="w-16 h-12 object-cover rounded-xl flex-shrink-0" />
                    ) : (
                      <div className="w-16 h-12 rounded-xl flex-shrink-0 flex items-center justify-center"
                        style={{ background: "rgba(99,102,241,0.1)" }}>
                        <BookOpen className="w-5 h-5 text-indigo-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold line-clamp-2 group-hover:text-indigo-400 transition-colors ${textMain}`}>{r.title}</p>
                      <p className={`text-xs mt-0.5 ${textSub}`}>{r.resourceType} · {r.difficultyLevel}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

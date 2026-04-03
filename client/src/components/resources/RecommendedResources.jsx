// components/resources/RecommendedResources.jsx
import { Sparkles, Brain } from "lucide-react";
import ResourceCard from "./ResourceCard";

export default function RecommendedResources({ resources, loading, onLike, onBookmark, likedIds, bookmarkedIds, isDarkMode, onView }) {
  return (
    <div>
      {/* Section header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 4px 16px rgba(99,102,241,0.35)" }}>
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className={`text-xl font-black ${isDarkMode ? "text-white" : "text-gray-900"}`}>Recommended For You</h2>
          <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
            Personalized based on your skills and learning goals
          </p>
        </div>
        <div className="ml-auto">
          <span className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-white"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 2px 8px rgba(99,102,241,0.3)" }}>
            <Brain className="w-3.5 h-3.5" /> AI Powered
          </span>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}
              className={`rounded-2xl border animate-pulse ${isDarkMode ? "bg-slate-800/60 border-slate-700/50" : "bg-white border-indigo-100"}`}
              style={{ height: 280 }} />
          ))}
        </div>
      ) : resources.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-5 ${
            isDarkMode ? "bg-indigo-500/10 border border-indigo-500/20" : "bg-indigo-50 border border-indigo-100"
          }`}>
            <Sparkles className={`w-10 h-10 ${isDarkMode ? "text-indigo-400" : "text-indigo-500"}`} />
          </div>
          <p className={`text-lg font-black mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>No recommendations yet</p>
          <p className={`text-sm text-center max-w-sm ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
            Complete your profile with skills to get AI-powered personalized suggestions
          </p>
        </div>
      ) : (
        <>
          <p className={`text-sm mb-5 ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
            <span className="font-bold" style={{ color: "#6366f1" }}>{resources.length}</span> resources curated just for you
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {resources.map(r => (
              <ResourceCard
                key={r._id} resource={r}
                isLiked={likedIds.has(r._id)}
                isBookmarked={bookmarkedIds.has(r._id)}
                onLike={() => onLike(r._id)}
                onBookmark={() => onBookmark(r._id)}
                onView={() => onView(r._id)}
                viewMode="grid"
                isDarkMode={isDarkMode}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

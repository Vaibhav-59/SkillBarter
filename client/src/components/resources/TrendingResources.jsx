// components/resources/TrendingResources.jsx
import { TrendingUp, Eye, Heart, Clock, Flame } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";

const SECTION_META = [
  { key: "mostViewed", label: "Most Viewed", icon: <Eye   className="w-4 h-4" />, color: "#6366f1", glow: "rgba(99,102,241,0.25)"  },
  { key: "mostLiked",  label: "Most Liked",  icon: <Heart className="w-4 h-4" />, color: "#ef4444", glow: "rgba(239,68,68,0.25)"   },
  { key: "recent",     label: "Newly Added", icon: <Clock className="w-4 h-4" />, color: "#10b981", glow: "rgba(16,185,129,0.25)"  },
];

function MiniCard({ resource, index, isDarkMode, onView, accentColor, glow }) {
  const MEDALS = ["🥇", "🥈", "🥉"];
  return (
    <div
      onClick={() => onView(resource._id)}
      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200 group hover:-translate-y-0.5 ${
        isDarkMode
          ? "bg-slate-700/30 border-slate-600/30 hover:border-opacity-50"
          : "bg-indigo-50/60 border-indigo-100 hover:border-indigo-200 hover:bg-indigo-50"
      }`}
      style={{ "--hover-border": accentColor }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = `${accentColor}55`; e.currentTarget.style.boxShadow = `0 4px 16px ${glow}`; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = ""; e.currentTarget.style.boxShadow = ""; }}
    >
      <span className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0 font-black"
        style={{ background: `${accentColor}20`, color: accentColor }}>
        {index < 3 ? MEDALS[index] : <span style={{ fontSize: 12 }}>{index + 1}</span>}
      </span>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-bold line-clamp-1 group-hover:transition-colors ${isDarkMode ? "text-white" : "text-gray-900"}`}
          style={{}} onMouseEnter={e => e.currentTarget.style.color = accentColor} onMouseLeave={e => e.currentTarget.style.color = ""}>
          {resource.title}
        </p>
        <p className={`text-xs mt-0.5 ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}>{resource.category}</p>
      </div>
    </div>
  );
}

export default function TrendingResources({ data, isDarkMode, onView }) {
  const card = isDarkMode
    ? "bg-slate-800/60 border-slate-700/50"
    : "bg-white border-indigo-100 shadow-sm";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
          style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 4px 16px rgba(99,102,241,0.3)" }}>
          <Flame className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className={`text-xl font-black ${isDarkMode ? "text-white" : "text-gray-900"}`}>Trending Now</h2>
          <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>Most popular resources this week</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {SECTION_META.map(({ key, label, icon, color, glow }) => (
          <div key={key} className={`rounded-2xl border p-5 ${card}`}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: `${color}18`, color }}>
                {icon}
              </div>
              <h3 className={`font-bold text-sm ${isDarkMode ? "text-white" : "text-gray-900"}`}>{label}</h3>
            </div>
            <div className="space-y-2">
              {(data[key] || []).length === 0 ? (
                <div className={`text-center py-6 rounded-xl border-2 border-dashed ${isDarkMode ? "border-slate-700 text-slate-500" : "border-indigo-100 text-gray-400"}`}>
                  <p className="text-sm font-semibold">No data yet</p>
                  <p className="text-xs mt-1">Check back soon</p>
                </div>
              ) : (
                (data[key] || []).map((r, i) => (
                  <MiniCard key={r._id} resource={r} index={i} isDarkMode={isDarkMode} onView={onView} accentColor={color} glow={glow} />
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

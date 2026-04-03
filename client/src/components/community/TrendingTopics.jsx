// components/community/TrendingTopics.jsx
import { TrendingUp, Hash, Flame } from "lucide-react";

const DEFAULT_TAGS = [
  { tag: "React",          count: 124 }, { tag: "Python",        count: 98  },
  { tag: "JavaScript",     count: 87  }, { tag: "AI",            count: 76  },
  { tag: "UI/UX",          count: 65  }, { tag: "Node.js",       count: 54  },
  { tag: "MongoDB",        count: 43  }, { tag: "TypeScript",    count: 38  },
  { tag: "DevOps",         count: 32  }, { tag: "Next.js",       count: 28  },
];

/* Rank badge colors */
const RANK_STYLE = [
  { bg: "rgba(99,102,241,0.18)",   color: "#818cf8"  },
  { bg: "rgba(139,92,246,0.15)",   color: "#a78bfa"  },
  { bg: "rgba(168,85,247,0.12)",   color: "#c084fc"  },
];

export default function TrendingTopics({ tags, isDarkMode, onTagClick, activeTag }) {
  const displayTags = (tags && tags.length > 0) ? tags : DEFAULT_TAGS;

  const card = isDarkMode
    ? "bg-slate-800/60 border-slate-700/50"
    : "bg-white border-indigo-100 shadow-sm";

  return (
    <div className={`rounded-2xl border p-5 ${card}`}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 3px 12px rgba(99,102,241,0.35)" }}>
          <Flame className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className={`font-bold text-sm ${isDarkMode ? "text-white" : "text-gray-900"}`}>Trending Topics</h3>
          <p className={`text-[10px] ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}>Popular this week</p>
        </div>
      </div>

      <div className="space-y-1.5">
        {displayTags.map(({ tag, count }, i) => {
          const isActive = activeTag === tag;
          const rankStyle = RANK_STYLE[i] || RANK_STYLE[2];

          return (
            <button
              key={tag}
              onClick={() => onTagClick(tag)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-200 text-left group border ${
                isActive
                  ? isDarkMode
                    ? "bg-indigo-500/12 border-indigo-500/30 text-indigo-300"
                    : "bg-indigo-50 border-indigo-200 text-indigo-700"
                  : isDarkMode
                    ? "border-transparent hover:bg-slate-700/50 text-slate-300 hover:text-white hover:border-slate-600/30"
                    : "border-transparent hover:bg-indigo-50/60 text-gray-700 hover:border-indigo-100"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={`text-[10px] font-black w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ${
                  i < 3 ? "text-white" : isDarkMode ? "text-slate-600 bg-transparent" : "text-gray-400 bg-transparent"
                }`}
                  style={ i < 3 ? { background: rankStyle.bg, color: rankStyle.color } : {}}>
                  {(i + 1).toString().padStart(2, "0")}
                </span>
                <Hash className={`w-3.5 h-3.5 transition-colors ${isActive ? "opacity-100" : "opacity-40 group-hover:opacity-70"}`} />
                <span className="text-sm font-semibold">{tag}</span>
              </div>
              <span className={`text-xs font-black px-2 py-0.5 rounded-lg transition-colors ${
                isActive
                  ? isDarkMode ? "bg-indigo-500/20 text-indigo-300" : "bg-indigo-100 text-indigo-700"
                  : isDarkMode ? "bg-slate-700/60 text-slate-500"   : "bg-indigo-50 text-indigo-400"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {activeTag && (
        <button
          onClick={() => onTagClick("")}
          className={`w-full mt-3 py-2 rounded-xl text-xs font-bold transition-all border ${
            isDarkMode
              ? "text-slate-400 hover:text-indigo-300 border-slate-600/30 hover:border-indigo-500/40 hover:bg-indigo-500/5"
              : "text-gray-400 hover:text-indigo-600 border-indigo-100 hover:border-indigo-300 hover:bg-indigo-50"
          }`}
        >
          Clear filter ✕
        </button>
      )}
    </div>
  );
}

// /client/src/components/matching/MatchList.jsx
import MatchCard from "./MatchCard";
import { useTheme } from "../../hooks/useTheme";

export default function MatchList({ matches, currentUserId, onRespond }) {
  const { isDarkMode } = useTheme();

  if (!matches || matches.length === 0) {
    return (
      <div className={`text-center py-16 rounded-2xl border-2 border-dashed ${
        isDarkMode ? "border-slate-700 text-slate-500" : "border-indigo-100 text-gray-400"
      }`}>
        <span className="text-4xl block mb-3">🎯</span>
        <p className="text-sm font-semibold">No matches found</p>
        <p className="text-xs mt-1 opacity-70">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {matches.map((match, index) => (
        <MatchCard
          key={match._id || index}
          match={match}
          currentUserId={currentUserId}
          onRespond={onRespond}
        />
      ))}
    </div>
  );
}

import { useTheme } from "../../hooks/useTheme";

export default function ProfileCard({ user }) {
  const { isDarkMode } = useTheme();

  const initials = (user?.name || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const location =
    user?.location
      ? typeof user.location === "object"
        ? [user.location.city, user.location.country].filter(Boolean).join(", ")
        : user.location
      : null;

  return (
    <div
      className={`rounded-2xl p-6 text-center transition-all duration-300 ${
        isDarkMode
          ? "bg-slate-800/60 border border-slate-700/50"
          : "bg-white border border-indigo-100 shadow-lg shadow-indigo-100/40"
      }`}
    >
      {/* Avatar */}
      <div className="relative inline-flex mb-4">
        <div
          className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 flex items-center justify-center text-white text-2xl font-black overflow-hidden shadow-xl"
          style={{ boxShadow: "0 8px 24px rgba(99,102,241,0.3)" }}
        >
          {user?.profileImage ? (
            <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <span>{initials}</span>
          )}
        </div>
        <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full shadow border-2"
          style={{ borderColor: isDarkMode ? "#0a0f1e" : "#fff" }} />
      </div>

      {/* Name */}
      <h3 className={`text-xl font-black mb-1 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
        {user?.name || "Anonymous User"}
      </h3>

      {/* Email */}
      <p className={`text-sm mb-2 ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
        {user?.email || ""}
      </p>

      {/* Location */}
      {location && (
        <div className={`flex items-center justify-center gap-1.5 text-xs font-medium mb-3 ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {location}
        </div>
      )}

      {/* Bio */}
      {user?.bio && (
        <p className={`text-xs leading-relaxed rounded-xl px-3 py-2.5 ${
          isDarkMode ? "bg-slate-700/40 text-slate-300 border border-slate-600/30" : "bg-indigo-50/60 text-gray-600 border border-indigo-100"
        }`}>
          {user.bio.length > 80 ? `${user.bio.slice(0, 80)}...` : user.bio}
        </p>
      )}
    </div>
  );
}

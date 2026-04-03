import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useState, useContext } from "react";
import { logout } from "../../redux/slices/authSlice";
import { clearAdminData, fetchAdminStatsAsync, fetchSystemHealthAsync, fetchUserAnalyticsAsync } from "../../redux/slices/adminSlice";
import { showSuccess, showError } from "../../utils/toast";
import { ThemeContext } from "../../contexts/ThemeContext";

const adminLinks = [
  { path: "/admin/dashboard",  label: "Dashboard" },
  { path: "/admin/users",      label: "User Management" },
  { path: "/admin/reviews",    label: "Review Management" },
  { path: "/admin/skills",     label: "Skill Management" },
  { path: "/admin/stats",      label: "Statistics" },
];

export default function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const d = theme === "dark";
  const [refreshing, setRefreshing] = useState(false);

  const handleLogout = async () => {
    try {
      dispatch(clearAdminData());
      dispatch(logout());
      showSuccess("Logged out successfully");
      navigate("/");
    } catch { showError("Failed to logout"); }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        dispatch(fetchAdminStatsAsync()).unwrap(),
        dispatch(fetchSystemHealthAsync()).unwrap(),
        dispatch(fetchUserAnalyticsAsync()).unwrap(),
      ]);
      showSuccess("Dashboard refreshed");
    } catch { showError("Failed to refresh data"); }
    finally { setRefreshing(false); }
  };

  return (
    <header className={`sticky top-0 z-50 backdrop-blur-md border-b transition-colors duration-300 ${
      d
        ? "bg-[#080c17]/95 border-indigo-500/15"
        : "bg-white/90 border-indigo-100 shadow-sm shadow-indigo-50"
    }`}>
      {/* top accent line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent pointer-events-none" />

      <div className="px-6 py-3">
        <div className="flex items-center justify-between">

          {/* Brand */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-500/25">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
              </svg>
            </div>
            <span className={`font-black text-lg ${d ? "text-white" : "text-slate-800"}`}>
              <span className="bg-gradient-to-r from-indigo-500 to-violet-600 bg-clip-text text-transparent">Skill</span>Barter
              <span className={`ml-2 px-2 py-0.5 rounded-lg text-xs font-bold ${d ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/25" : "bg-indigo-50 text-indigo-600 border border-indigo-200"}`}>
                Admin
              </span>
            </span>
          </div>

          {/* Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {adminLinks.map((link) => (
              <NavLink key={link.path} to={link.path}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-indigo-500/15 to-violet-500/15 text-indigo-400 border border-indigo-500/25"
                      : d
                        ? "text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/8"
                        : "text-slate-600 hover:text-indigo-600 hover:bg-indigo-50"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button onClick={handleRefresh} disabled={refreshing}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-medium transition-all duration-200 disabled:opacity-50 ${
                d
                  ? "bg-indigo-500/10 border-indigo-500/25 text-indigo-400 hover:bg-indigo-500/20"
                  : "bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100"
              }`}>
              <svg className={`w-4 h-4 transition-transform duration-500 ${refreshing ? "animate-spin" : ""}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              {refreshing ? "Refreshing…" : "Refresh"}
            </button>

            <button onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500/15 to-rose-500/15 border border-red-500/25 text-red-400 hover:from-red-500/25 hover:to-rose-500/25 rounded-xl font-medium transition-all duration-200 hover:scale-105">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
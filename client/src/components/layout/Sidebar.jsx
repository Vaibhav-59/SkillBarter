import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTheme } from "../../hooks/useTheme";

/* ─── nav links ────────────────────────────────────────── */
const links = [
  {
    path: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    path: "/profile",
    label: "Profile",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    path: "/skills",
    label: "Skills",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    path: "/skills/explore",
    label: "Skills & Experts",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    path: "/matches",
    label: "Matches",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
  {
    path: "/resources",
    label: "Resources",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253z" />
      </svg>
    ),
  },
  {
    path: "/community",
    label: "Community",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    path: "/chat",
    label: "Chat",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    path: "/meeting",
    label: "Meeting",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.362a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    path: "/sessions",
    label: "Sessions",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    path: "/contracts",
    label: "Contracts",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    path: "/reviews",
    label: "Reviews",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
  },
  {
    path: "/skill-hub",
    label: "Skill Hub",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    path: "/report-safety",
    label: "Report & Safety",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
];

/* ─── Logout success overlay ───────────────────────────── */
function LogoutSuccess({ show }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[999] p-4">
      <div
        className="relative max-w-md w-full mx-4 rounded-3xl p-10 text-center overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
          border: "1px solid rgba(99,102,241,0.3)",
          boxShadow: "0 32px 80px rgba(99,102,241,0.25)",
        }}
      >
        {/* Glow bg */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 via-violet-600/8 to-purple-600/10 animate-pulse rounded-3xl" />

        <div className="relative z-10">
          {/* Icon */}
          <div className="relative inline-flex mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 flex items-center justify-center shadow-2xl">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 blur-xl opacity-40 animate-pulse" />
          </div>

          <h3 className="text-3xl font-black bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent mb-3">
            Logged Out! 👋
          </h3>
          <p className="text-slate-400 text-base mb-8">
            Thanks for using SkillBarter. Redirecting...
          </p>

          {/* Progress bar */}
          <div className="w-full bg-slate-800 rounded-full h-1.5 mb-6 overflow-hidden">
            <div className="h-1.5 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600 animate-pulse" style={{ width: "100%" }} />
          </div>

          <div className="flex justify-center gap-2">
            {["bg-indigo-500", "bg-violet-500", "bg-purple-500"].map((c, i) => (
              <div key={i} className={`w-2.5 h-2.5 rounded-full ${c} animate-bounce`}
                style={{ animationDelay: `${i * 100}ms` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Tooltip ───────────────────────────────────────────── */
function Tooltip({ label, isDarkMode }) {
  return (
    <div
      className="absolute left-full ml-3 px-3 py-2 text-xs font-semibold rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-50 translate-x-1 group-hover:translate-x-0"
      style={{
        background: isDarkMode ? "rgba(15,23,42,0.98)" : "rgba(30,27,75,0.95)",
        color: "#e2e8f0",
        border: isDarkMode ? "1px solid rgba(99,102,241,0.3)" : "1px solid rgba(99,102,241,0.4)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
      }}
    >
      {label}
      {/* Arrow */}
      <div
        className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 rotate-45"
        style={{ background: isDarkMode ? "rgba(15,23,42,0.98)" : "rgba(30,27,75,0.95)" }}
      />
    </div>
  );
}

/* ─── Main Sidebar ──────────────────────────────────────── */
export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showLogoutSuccess, setShowLogoutSuccess] = useState(false);
  const { toggleTheme, isDarkMode } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setShowLogoutSuccess(true);
    setTimeout(() => { window.location.href = "/"; }, 2000);
  };

  /* ── theme tokens ─────────────────────────────────────── */
  const sidebarBg = isDarkMode
    ? "bg-[#0a0f1e] border-slate-800/60"
    : "bg-white border-indigo-100/80";

  const sidebarShadow = isDarkMode
    ? "0 0 0 1px rgba(99,102,241,0.08), 8px 0 32px rgba(0,0,0,0.4)"
    : "0 0 0 1px rgba(99,102,241,0.08), 8px 0 32px rgba(99,102,241,0.08)";

  const activeLinkBg = isDarkMode
    ? "bg-gradient-to-r from-indigo-500/20 via-violet-500/15 to-purple-500/20 border-indigo-500/30 text-indigo-300"
    : "bg-gradient-to-r from-indigo-50 via-violet-50 to-purple-50 border-indigo-200 text-indigo-700";

  const inactiveLinkHover = isDarkMode
    ? "hover:bg-slate-800/60 hover:text-white border-transparent hover:border-slate-700/50"
    : "hover:bg-indigo-50/80 hover:text-indigo-700 border-transparent hover:border-indigo-100";

  const inactiveLinkText = isDarkMode ? "text-slate-400" : "text-gray-500";

  const activeIconColor = isDarkMode ? "text-indigo-400" : "text-indigo-600";
  const inactiveIconHover = isDarkMode ? "group-hover:text-indigo-400" : "group-hover:text-indigo-600";

  const collapseBtn = isDarkMode
    ? "bg-slate-800/70 border-slate-700/60 text-slate-400 hover:text-indigo-400 hover:border-indigo-500/50 hover:bg-slate-700/60"
    : "bg-indigo-50 border-indigo-200 text-indigo-400 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-100";

  const dividerColor = isDarkMode ? "border-slate-800" : "border-indigo-100";

  const themeToggleBg = isDarkMode
    ? "bg-slate-800/60 border-slate-700/50 text-amber-400 hover:bg-slate-700/60 hover:border-amber-500/40"
    : "bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100 hover:border-amber-300";

  const navSectionLabel = isDarkMode ? "text-slate-600" : "text-indigo-200";

  return (
    <>
      {/* ── Sidebar ──────────────────────────────────────── */}
      <aside
        className={`${isCollapsed ? "w-[72px]" : "w-72"} h-screen border-r flex-shrink-0 transition-all duration-300 relative overflow-hidden ${sidebarBg} sticky top-0 z-50`}
        style={{ boxShadow: sidebarShadow }}
      >
        {/* Decorative blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {isDarkMode ? (
            <>
              <div className="absolute -top-20 -left-20 w-48 h-48 bg-indigo-600/6 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -right-10 w-40 h-40 bg-violet-600/5 rounded-full blur-3xl" />
              <div
                className="absolute inset-0 opacity-[0.025]"
                style={{
                  backgroundImage: "radial-gradient(circle at 1px 1px,rgba(139,92,246,1) 1px,transparent 0)",
                  backgroundSize: "28px 28px",
                }}
              />
            </>
          ) : (
            <>
              <div className="absolute -top-16 -left-16 w-40 h-40 bg-indigo-100/80 rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-violet-100/60 rounded-full blur-2xl" />
            </>
          )}
        </div>

        <div className="relative z-10 flex flex-col h-full">

          {/* ── Brand header ───────────────────────────── */}
          <div className={`flex items-center justify-between px-4 py-5 border-b ${dividerColor} flex-shrink-0`}>
            {!isCollapsed && (
              <div className="flex items-center gap-3 min-w-0">
                {/* Logo mark */}
                <div className="relative flex-shrink-0">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 flex items-center justify-center shadow-lg"
                    style={{ boxShadow: "0 4px 16px rgba(99,102,241,0.4)" }}>
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </div>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 blur-md opacity-30" />
                </div>

                <span className="text-lg font-black bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600 bg-clip-text text-transparent truncate">
                  SkillBarter
                </span>
              </div>
            )}

            {isCollapsed && (
              <div className="flex-1 flex justify-center">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 flex items-center justify-center shadow-lg"
                  style={{ boxShadow: "0 4px 16px rgba(99,102,241,0.4)" }}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
              </div>
            )}

            {/* Collapse toggle */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={`flex p-1.5 rounded-lg border transition-all duration-200 flex-shrink-0 ${collapseBtn}`}
            >
              <svg
                className={`w-4 h-4 transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          </div>

          {/* ── Navigation ─────────────────────────────── */}
          <nav
            className="flex-1 overflow-y-auto px-3 py-4 space-y-1"
            style={{ scrollbarWidth: "none" }}
          >
            {links.map((link, index) => {
              const isActive = location.pathname === link.path;
              return (
                <div key={link.path} className="relative group">
                  <NavLink
                    to={link.path}
                    onClick={() => {}}
                    className={`relative flex items-center ${
                      isCollapsed ? "justify-center px-0 py-3" : "gap-3 px-3 py-2.5"
                    } rounded-xl border transition-all duration-200 overflow-hidden ${
                      isActive
                        ? `${activeLinkBg} shadow-sm`
                        : `${inactiveLinkText} ${inactiveLinkHover}`
                    }`}
                    style={{
                      animationDelay: `${index * 40}ms`,
                      animation: "fadeLeft 0.4s ease both",
                    }}
                  >
                    {/* Active left bar */}
                    {isActive && (
                      <div
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r-full"
                        style={{ background: "linear-gradient(to bottom, #6366f1, #a855f7)" }}
                      />
                    )}

                    {/* Shimmer on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/4 to-indigo-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />

                    {/* Icon */}
                    <span
                      className={`relative z-10 flex-shrink-0 transition-colors duration-200 ${
                        isActive ? activeIconColor : `${inactiveLinkText} ${inactiveIconHover}`
                      }`}
                    >
                      {link.icon}
                    </span>

                    {/* Label */}
                    {!isCollapsed && (
                      <span
                        className={`relative z-10 text-sm font-semibold transition-colors duration-200 truncate ${
                          isActive
                            ? isDarkMode ? "text-indigo-200" : "text-indigo-700"
                            : isDarkMode ? "text-slate-400 group-hover:text-white" : "text-gray-600 group-hover:text-indigo-700"
                        }`}
                      >
                        {link.label}
                      </span>
                    )}
                  </NavLink>

                  {/* Tooltip (collapsed state) */}
                  {isCollapsed && <Tooltip label={link.label} isDarkMode={isDarkMode} />}
                </div>
              );
            })}
          </nav>

          {/* ── Bottom actions ──────────────────────────── */}
          <div className={`flex-shrink-0 px-3 pb-4 pt-3 border-t ${dividerColor} space-y-2`}>

            {/* Theme toggle */}
            <div className="relative group">
              <button
                onClick={toggleTheme}
                className={`relative w-full flex items-center ${
                  isCollapsed ? "justify-center px-0 py-3" : "gap-3 px-3 py-2.5"
                } rounded-xl border transition-all duration-200 overflow-hidden ${themeToggleBg}`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400/0 via-amber-400/5 to-amber-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />

                <span className="relative z-10 flex-shrink-0">
                  {isDarkMode ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  )}
                </span>

                {!isCollapsed && (
                  <span className={`relative z-10 text-sm font-semibold transition-colors duration-200 ${
                    isDarkMode ? "text-amber-300 group-hover:text-amber-200" : "text-amber-700 group-hover:text-amber-800"
                  }`}>
                    {isDarkMode ? "Light Mode" : "Dark Mode"}
                  </span>
                )}
              </button>

              {isCollapsed && (
                <Tooltip label={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"} isDarkMode={isDarkMode} />
              )}
            </div>

            {/* Logout */}
            <div className="relative group">
              <button
                onClick={handleLogout}
                className={`relative w-full flex items-center ${
                  isCollapsed ? "justify-center px-0 py-3" : "gap-3 px-3 py-2.5"
                } rounded-xl border transition-all duration-200 overflow-hidden ${
                  isDarkMode
                    ? "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-500/40"
                    : "bg-red-50 border-red-200 text-red-500 hover:bg-red-100 hover:border-red-300"
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/5 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />

                <span className="relative z-10 flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </span>

                {!isCollapsed && (
                  <span className="relative z-10 text-sm font-semibold">Logout</span>
                )}
              </button>

              {isCollapsed && <Tooltip label="Logout" isDarkMode={isDarkMode} />}
            </div>
          </div>
        </div>
      </aside>

      <LogoutSuccess show={showLogoutSuccess} />

      <style>{`
        @keyframes fadeLeft {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </>
  );
}
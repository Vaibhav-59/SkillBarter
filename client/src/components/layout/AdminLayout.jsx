import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../redux/slices/authSlice";
import { clearAdminData } from "../../redux/slices/adminSlice";
import { showSuccess, showError } from "../../utils/toast";
import { useTheme } from "../../hooks/useTheme";
import AdminPasswordGate from "../../pages/AdminPasswordGate";

/* ── Icon helpers ── */
const Ico = ({ d: path, strokeWidth = 2 }) => (
  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d={path} />
  </svg>
);

const menuGroups = [
  {
    label: "Core",
    items: [
      { path: "dashboard", label: "Dashboard",
        icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
      { path: "users", label: "Users",
        icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" },
      { path: "skills", label: "Skills",
        icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" },
      { path: "reviews", label: "Reviews",
        icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" },
    ],
  },
  {
    label: "Analytics",
    items: [
      { path: "stats", label: "Statistics",
        icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
      { path: "data-analysis", label: "Data Analysis",
        icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
      { path: "platform-analytics", label: "Platform",
        icon: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" },
      { path: "community-analytics", label: "Community",
        icon: "M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" },
      { path: "challenges-analytics", label: "Challenges",
        icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" },
      { path: "gamification-analytics", label: "Gamification",
        icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" },
      { path: "resources-analytics", label: "Resources",
        icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
    ],
  },
  {
    label: "Activity",
    items: [
      { path: "meetings", label: "Meetings",
        icon: "M15 10l4.553-2.069A1 1 0 0121 8.82v6.362a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" },
      { path: "sessions", label: "Sessions",
        icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
      { path: "contracts", label: "Contracts",
        icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
      { path: "reports", label: "Reports",
        icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
    ],
  },
];

/* Flat list of all items for mobile */
const allLinks = menuGroups.flatMap((g) => g.items);
/* Show first 7 in bottom bar + "More" button */
const BOTTOM_BAR_COUNT = 7;

export default function AdminLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const d = isDarkMode;

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(
    () => sessionStorage.getItem("sb_admin_auth") === "Vai3538"
  );

  const handleLogout = async () => {
    try {
      sessionStorage.removeItem("sb_admin_auth");
      setAuthenticated(false);
      dispatch(clearAdminData());
      showSuccess("Admin locked successfully");
      navigate("/admin");
    } catch { showError("Failed to logout"); }
    setShowLogoutModal(false);
  };

  /* ── style tokens ── */
  const sidebarBg = d
    ? "bg-[#0a0e1a] border-indigo-500/15"
    : "bg-white border-indigo-100 shadow-lg shadow-indigo-50";
  const headerBg = d
    ? "bg-[#080c17]/95 border-indigo-500/15"
    : "bg-white/90 border-indigo-100 shadow-sm shadow-indigo-50";
  const pageBg = d
    ? "bg-[#080c17]"
    : "bg-gradient-to-br from-slate-50 via-indigo-50/20 to-slate-50";
  const bottomBarBg = d
    ? "bg-[#0a0e1a]/95 border-indigo-500/20"
    : "bg-white/95 border-indigo-100 shadow-[0_-4px_24px_rgba(99,102,241,0.08)]";

  const primaryLinks = allLinks.slice(0, BOTTOM_BAR_COUNT);
  const hasMore = allLinks.length > BOTTOM_BAR_COUNT;

  if (!authenticated) {
    return <AdminPasswordGate onSuccess={() => setAuthenticated(true)} />;
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${pageBg}`}>

      {/* ════════════════════════════════════════
          DESKTOP SIDEBAR  (hidden on mobile)
          ════════════════════════════════════════ */}
      <div
        className={`hidden lg:block fixed top-0 left-0 z-40 h-screen transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-[70px]"
        }`}
      >
        <div className={`h-full border-r flex flex-col relative transition-colors duration-300 ${sidebarBg}`}>
          {/* top accent */}
          <div className="absolute top-0 right-0 left-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent pointer-events-none" />

          {/* Logo */}
          <div className={`p-5 border-b flex items-center gap-3 flex-shrink-0 ${d ? "border-indigo-500/10" : "border-indigo-100"}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/25">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            {sidebarOpen && (
              <div className="overflow-hidden">
                <h1 className="font-black text-lg bg-gradient-to-r from-indigo-500 to-violet-600 bg-clip-text text-transparent whitespace-nowrap">
                  SkillBarter
                </h1>
                <p className={`text-xs font-semibold ${d ? "text-indigo-400" : "text-indigo-500"}`}>Admin Panel</p>
              </div>
            )}
          </div>

          {/* Nav */}
          <nav className="flex-1 p-3 space-y-4 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {menuGroups.map((group) => (
              <div key={group.label}>
                {sidebarOpen && (
                  <p className={`px-3 mb-1 text-xs font-bold uppercase tracking-wider ${d ? "text-slate-600" : "text-slate-400"}`}>
                    {group.label}
                  </p>
                )}
                <div className="space-y-0.5">
                  {group.items.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      title={!sidebarOpen ? item.label : undefined}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                          isActive
                            ? "bg-gradient-to-r from-indigo-500/15 to-violet-500/15 text-indigo-400 border border-indigo-500/25"
                            : d
                              ? "text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/[0.08]"
                              : "text-slate-600 hover:text-indigo-600 hover:bg-indigo-50"
                        }`
                      }
                    >
                      <Ico d={item.icon} />
                      {sidebarOpen && <span className="font-medium whitespace-nowrap">{item.label}</span>}
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className={`p-4 border-t flex-shrink-0 ${d ? "border-indigo-500/10" : "border-indigo-100"}`}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                <span className="text-white font-black">A</span>
              </div>
              {sidebarOpen && (
                <>
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold truncate ${d ? "text-white" : "text-slate-800"}`}>Administrator</p>
                    <p className={`text-xs truncate ${d ? "text-indigo-400" : "text-indigo-500"}`}>System Admin</p>
                  </div>
                  <button
                    onClick={() => setShowLogoutModal(true)}
                    title="Logout"
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                      d ? "text-slate-500 hover:text-red-400 hover:bg-red-500/10" : "text-slate-400 hover:text-red-600 hover:bg-red-50"
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Toggle button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="absolute -right-3.5 top-20 w-7 h-7 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 hover:scale-110 transition-transform z-10"
          >
            <svg
              className={`w-4 h-4 transition-transform duration-300 ${sidebarOpen ? "" : "rotate-180"}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* ════════════════════════════════════════
          MAIN CONTENT AREA
          ════════════════════════════════════════ */}
      <div
        className={`flex flex-col min-h-screen transition-all duration-300 ${
          sidebarOpen ? "lg:ml-64" : "lg:ml-[70px]"
        }`}
      >
        {/* ── Header ── */}
        <header className={`sticky top-0 z-30 backdrop-blur-md border-b transition-colors duration-300 ${headerBg}`}>
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent pointer-events-none" />
          <div className="flex items-center justify-between px-4 lg:px-6 py-3">

            {/* Left: hamburger (mobile) + title */}
            <div className="flex items-center gap-3">
              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileDrawerOpen(true)}
                className={`lg:hidden w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                  d
                    ? "text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10"
                    : "text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* Mini logo on mobile */}
              <div className="flex items-center gap-2 lg:hidden">
                <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <span className="font-black text-sm bg-gradient-to-r from-indigo-500 to-violet-600 bg-clip-text text-transparent">
                  Admin
                </span>
              </div>

              {/* Desktop title */}
              <h2 className={`hidden lg:block text-lg font-black ${d ? "text-white" : "text-slate-800"}`}>
                Admin{" "}
                <span className="font-normal bg-gradient-to-r from-indigo-500 to-violet-600 bg-clip-text text-transparent">
                  Panel
                </span>
              </h2>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Live" />
            </div>

            {/* Right: actions */}
            <div className="flex items-center gap-2">
              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  d ? "text-amber-400 hover:bg-amber-500/10" : "text-indigo-500 hover:bg-indigo-50"
                }`}
                title="Toggle theme"
              >
                {d ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>

              {/* View Site (hidden on very small screens) */}
              <button
                onClick={() => navigate("/")}
                className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition-all duration-200 ${
                  d
                    ? "border-indigo-500/25 text-indigo-400 hover:bg-indigo-500/10"
                    : "border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span className="hidden md:inline">View Site</span>
              </button>

              {/* Logout (hidden on very small screens) */}
              <button
                onClick={() => setShowLogoutModal(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-red-500/10 border border-red-500/25 text-red-400 hover:bg-red-500/20 rounded-xl text-sm font-medium transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* ── Page Content ── */}
        {/* pb-20 on mobile to avoid content hiding behind bottom bar */}
        <main className="flex-1 p-4 lg:p-6 pb-24 lg:pb-6">
          <Outlet />
        </main>
      </div>

      {/* ════════════════════════════════════════
          MOBILE BOTTOM NAVIGATION BAR
          ════════════════════════════════════════ */}
      <nav
        className={`lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur-md ${bottomBarBg}`}
      >
        {/* top accent line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

        <div
          className="flex items-stretch overflow-x-auto"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {primaryLinks.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 py-2 px-2 flex-1 min-w-[56px] transition-all duration-200 relative ${
                  isActive
                    ? d
                      ? "text-indigo-400"
                      : "text-indigo-600"
                    : d
                      ? "text-slate-500"
                      : "text-slate-400"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* active indicator on top */}
                  {isActive && (
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" />
                  )}
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 ${
                      isActive
                        ? d
                          ? "bg-indigo-500/20"
                          : "bg-indigo-100"
                        : "bg-transparent"
                    }`}
                  >
                    <svg
                      className="w-[18px] h-[18px]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={isActive ? 2.5 : 1.8}
                        d={item.icon}
                      />
                    </svg>
                  </div>
                  <span
                    className={`text-[9px] font-semibold leading-none truncate max-w-[54px] ${
                      isActive ? "font-bold" : ""
                    }`}
                  >
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}

          {/* "More" button if there are extra links */}
          {hasMore && (
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className={`flex flex-col items-center justify-center gap-0.5 py-2 px-2 flex-1 min-w-[56px] transition-all duration-200 ${
                d ? "text-slate-500" : "text-slate-400"
              }`}
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center">
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
              </div>
              <span className="text-[9px] font-semibold leading-none">More</span>
            </button>
          )}
        </div>

        {/* iPhone home indicator spacer */}
        <div className="h-safe-area-inset-bottom" />
      </nav>

      {/* ════════════════════════════════════════
          MOBILE DRAWER  (full nav + logout)
          ════════════════════════════════════════ */}
      {mobileDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileDrawerOpen(false)}
          />

          {/* drawer panel */}
          <div
            className={`relative w-72 max-w-[85vw] h-full flex flex-col border-r shadow-2xl ${
              d ? "bg-[#0a0e1a] border-indigo-500/15" : "bg-white border-indigo-100"
            }`}
          >
            {/* top accent */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

            {/* Drawer header */}
            <div className={`p-5 border-b flex items-center justify-between flex-shrink-0 ${d ? "border-indigo-500/10" : "border-indigo-100"}`}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-black text-base bg-gradient-to-r from-indigo-500 to-violet-600 bg-clip-text text-transparent">
                    SkillBarter
                  </h2>
                  <p className={`text-xs font-semibold ${d ? "text-indigo-400" : "text-indigo-500"}`}>Admin Panel</p>
                </div>
              </div>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                  d ? "text-slate-500 hover:text-white hover:bg-white/10" : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Drawer nav */}
            <nav className="flex-1 p-3 space-y-4 overflow-y-auto [&::-webkit-scrollbar]:hidden">
              {menuGroups.map((group) => (
                <div key={group.label}>
                  <p className={`px-3 mb-1 text-xs font-bold uppercase tracking-wider ${d ? "text-slate-600" : "text-slate-400"}`}>
                    {group.label}
                  </p>
                  <div className="space-y-0.5">
                    {group.items.map((item) => (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileDrawerOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                            isActive
                              ? "bg-gradient-to-r from-indigo-500/15 to-violet-500/15 text-indigo-400 border border-indigo-500/25"
                              : d
                                ? "text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/[0.08]"
                                : "text-slate-600 hover:text-indigo-600 hover:bg-indigo-50"
                          }`
                        }
                      >
                        <Ico d={item.icon} />
                        <span>{item.label}</span>
                      </NavLink>
                    ))}
                  </div>
                </div>
              ))}
            </nav>

            {/* Drawer footer */}
            <div className={`p-4 border-t flex-shrink-0 space-y-2 ${d ? "border-indigo-500/10" : "border-indigo-100"}`}>
              {/* Admin info */}
              <div className="flex items-center gap-3 pb-2">
                <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-white font-black">A</span>
                </div>
                <div>
                  <p className={`font-bold ${d ? "text-white" : "text-slate-800"}`}>Administrator</p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className={`text-xs ${d ? "text-emerald-400" : "text-emerald-600"}`}>Online</span>
                  </div>
                </div>
              </div>

              {/* View Site */}
              <button
                onClick={() => { navigate("/"); setMobileDrawerOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  d
                    ? "border-indigo-500/25 text-indigo-400 hover:bg-indigo-500/10"
                    : "border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                View Site
              </button>

              {/* Logout */}
              <button
                onClick={() => { setShowLogoutModal(true); setMobileDrawerOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2.5 bg-red-500/10 border border-red-500/25 text-red-400 hover:bg-red-500/20 rounded-xl text-sm font-medium transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
          LOGOUT CONFIRMATION MODAL
          ════════════════════════════════════════ */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div
            className={`relative rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl border ${
              d ? "bg-[#0d1525] border-indigo-500/20" : "bg-white border-indigo-100"
            }`}
          >
            <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl bg-gradient-to-r from-transparent via-red-500/50 to-transparent pointer-events-none" />
            <div className="text-center">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${d ? "bg-red-500/10" : "bg-red-50"}`}>
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <h3 className={`text-xl font-bold mb-2 ${d ? "text-white" : "text-slate-800"}`}>Confirm Logout</h3>
              <p className={`mb-6 ${d ? "text-slate-400" : "text-slate-500"}`}>
                Are you sure you want to logout from the admin panel?
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className={`px-5 py-2.5 rounded-xl border font-semibold transition-all ${
                    d
                      ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                      : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-semibold rounded-xl shadow-lg shadow-red-500/25 transition-all hover:scale-105"
                >
                  Yes, Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

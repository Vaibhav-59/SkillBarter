import { useState, useContext, useEffect } from "react";
import { NavLink, useLocation, Link } from "react-router-dom";
import { ThemeContext } from "../../contexts/ThemeContext";
import { NAV_LINKS } from "./navLinks";
import { useSocket } from "../../contexts/SocketContext";
import api from "../../utils/api";

const PRIMARY_ROUTES = ["/dashboard", "/skills/explore", "/chat", "/matches"];

export default function MobileNav() {
  const { theme, toggleTheme } = useContext(ThemeContext) || { theme: "dark" };
  const d = theme === "dark";
  const location = useLocation();
  const { socket } = useSocket();

  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [showLogoutSuccess, setShowLogoutSuccess] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Close more menu when route changes
  useEffect(() => {
    setIsMoreOpen(false);
  }, [location.pathname]);

  // Fetch unread notification count
  useEffect(() => {
    api.get("/notifications").then((res) => {
      setUnreadCount(res.data.filter((n) => !n.isRead).length);
    }).catch(() => { });
  }, []);

  // Listen for real-time notifications
  useEffect(() => {
    if (!socket) return;
    const h = () => setUnreadCount((p) => p + 1);
    socket.on("notificationReceived", h);
    return () => socket.off("notificationReceived", h);
  }, [socket]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setShowLogoutSuccess(true);
    setTimeout(() => { window.location.href = "/"; }, 2000);
  };

  const primaryLinks = NAV_LINKS.filter(l => PRIMARY_ROUTES.includes(l.path));
  const moreLinks = NAV_LINKS.filter(l => !PRIMARY_ROUTES.includes(l.path));

  const bgStyles = d ? "bg-[#0f1220]/95 border-t border-slate-800" : "bg-white/95 border-t border-slate-200";
  const iconColor = d ? "text-slate-400" : "text-slate-500";
  const activeIconColor = d ? "text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]" : "text-indigo-600";
  const activeLabelColor = d ? "text-indigo-300 font-bold" : "text-indigo-700 font-bold";
  const labelColor = d ? "text-slate-500" : "text-slate-500";

  return (
    <>
      {/* ── Top Header ── */}
      <header className={`fixed top-0 left-0 right-0 h-16 z-40 md:hidden flex items-center justify-between px-4 backdrop-blur-xl transition-colors duration-300 ${d ? "bg-[#0b1020]/90 border-b border-white/5" : "bg-white/90 border-b border-slate-200 shadow-sm"}`}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
          <span className="text-lg font-black bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
            SkillBarter
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Notification Bell */}
          <Link
            to="/notifications"
            onClick={() => setUnreadCount(0)}
            className={`relative p-2 rounded-xl border ${d ? "bg-slate-800/80 border-slate-700/60 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-600"}`}
            title="Notifications"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] bg-red-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full px-0.5 shadow-md animate-pulse z-10">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Link>
          {/* Theme Toggle */}
          <button onClick={toggleTheme} className={`p-2 rounded-xl border ${d ? "bg-slate-800/80 border-slate-700/60 text-amber-400" : "bg-amber-50 border-amber-200 text-amber-600"}`}>
            {d ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* ── More Action Sheet ── */}
      {isMoreOpen && (
        <div className="fixed inset-0 z-[60] md:hidden flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMoreOpen(false)} />
          <div className={`relative w-full max-h-[85vh] rounded-t-3xl overflow-hidden shadow-2xl transition-transform flex flex-col ${d ? "bg-[#111629]" : "bg-white"}`} style={{ animation: "slideUp 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) forwards" }}>
            <div className={`flex justify-center p-3 border-b ${d ? "border-slate-800" : "border-slate-100"}`}>
              <div className={`w-12 h-1.5 rounded-full ${d ? "bg-slate-700" : "bg-slate-300"}`} />
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-1.5 hide-scrollbar">
              <h3 className={`px-2 pb-2 text-xs font-bold uppercase tracking-wider ${d ? "text-slate-500" : "text-slate-400"}`}>More Options</h3>
              <div className={`grid grid-cols-2 gap-2`}>
                {moreLinks.map(link => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className={({ isActive }) => `flex flex-col items-center justify-center gap-1.5 p-4 rounded-2xl border transition-all ${isActive
                        ? d ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400" : "bg-indigo-50 border-indigo-200 text-indigo-700"
                        : d ? "bg-slate-800/40 border-slate-800 hover:bg-slate-800 text-slate-300" : "bg-slate-50 border-slate-100 hover:bg-slate-100 text-slate-600"
                      }`}
                  >
                    <div className="mb-1">{link.icon}</div>
                    <span className="text-[11px] font-semibold text-center">{link.label}</span>
                  </NavLink>
                ))}

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className={`flex flex-col items-center justify-center gap-1.5 p-4 rounded-2xl border transition-all ${d ? "bg-red-500/5 border-red-500/10 hover:bg-red-500/10 text-red-400" : "bg-red-50 border-red-100 hover:bg-red-100 text-red-600"
                    }`}
                >
                  <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                  <span className="text-[11px] font-semibold text-center">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Fixed Bottom Navigation ── */}
      <nav className={`fixed bottom-0 left-0 right-0 z-50 md:hidden pb-safe backdrop-blur-xl ${bgStyles}`}>
        <div className="flex items-center justify-between px-2 h-[68px]">
          {primaryLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                className="flex flex-col items-center justify-center w-full h-full gap-1.5 relative group"
              >
                <div className={`transition-all duration-300 relative ${isActive ? "-translate-y-1" : "translate-y-0"}`}>
                  {isActive && <div className="absolute inset-0 bg-indigo-500/30 blur-md rounded-full" />}
                  <span className={`relative z-10 ${isActive ? activeIconColor : iconColor}`}>
                    {link.icon}
                  </span>
                </div>
                <span className={`text-[10px] sm:text-[11px] transition-all duration-300 leading-none ${isActive ? activeLabelColor : labelColor}`}>
                  {link.label}
                </span>
                {isActive && (
                  <div className="absolute top-0 w-8 h-[3px] rounded-b-full bg-gradient-to-r from-indigo-500 to-violet-500 shadow-[0_2px_8px_rgba(99,102,241,0.6)]" />
                )}
              </NavLink>
            );
          })}

          {/* More/Menu Toggle */}
          <button
            onClick={() => setIsMoreOpen(!isMoreOpen)}
            className="flex flex-col items-center justify-center w-full h-full gap-1.5 relative"
          >
            <div className={`transition-all duration-300 relative ${isMoreOpen ? "-translate-y-1" : "translate-y-0"}`}>
              {isMoreOpen && <div className="absolute inset-0 bg-indigo-500/30 blur-md rounded-full" />}
              <span className={`relative z-10 ${isMoreOpen ? activeIconColor : iconColor}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMoreOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </span>
            </div>
            <span className={`text-[10px] sm:text-[11px] transition-all duration-300 leading-none ${isMoreOpen ? activeLabelColor : labelColor}`}>
              More
            </span>
            {isMoreOpen && (
              <div className="absolute top-0 w-8 h-[3px] rounded-b-full bg-gradient-to-r from-indigo-500 to-violet-500" />
            )}
          </button>
        </div>
      </nav>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .pb-safe { padding-bottom: env(safe-area-inset-bottom); }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {showLogoutSuccess && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-[100] p-4 text-white font-bold animate-pulse">
          Logging out...
        </div>
      )}
    </>
  );
}

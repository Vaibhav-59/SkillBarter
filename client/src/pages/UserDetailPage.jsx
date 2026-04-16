import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { useTheme } from "../hooks/useTheme";
import VerificationBadge from "../components/verification/VerificationBadge";
import { useSocket } from "../contexts/SocketContext";

/* ─── tiny reusable section card ─────────────────────────── */
function SectionCard({ children, className = "", isDarkMode }) {
  return (
    <div
      className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${
        isDarkMode
          ? "bg-slate-800/60 border border-slate-700/50 hover:border-slate-600/60"
          : "bg-white border border-indigo-100/80 shadow-lg shadow-indigo-100/30 hover:border-indigo-200"
      } ${className}`}
    >
      {children}
    </div>
  );
}

/* ─── section header ──────────────────────────────────────── */
function SectionHeader({ icon, title, subtitle, gradient, isDarkMode }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0 bg-gradient-to-br ${gradient}`}
      >
        {icon}
      </div>
      <div>
        <h3
          className={`text-lg font-bold ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}
        >
          {title}
        </h3>
        {subtitle && (
          <p
            className={`text-xs mt-0.5 ${
              isDarkMode ? "text-slate-400" : "text-gray-500"
            }`}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

export default function UserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { isUserOnline } = useSocket();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ── theme tokens (mirror dashboard palette) ─────────────── */
  const t = {
    pageBg: isDarkMode
      ? "bg-[#0a0f1e]"
      : "bg-gradient-to-br from-slate-50 via-indigo-50/40 to-violet-50/30",
    heroCard: isDarkMode
      ? "bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50"
      : "bg-white border border-indigo-100/80 shadow-xl shadow-indigo-100/40",
    metaPill: isDarkMode
      ? "bg-slate-700/60 border border-slate-600/50 text-slate-300"
      : "bg-indigo-50 border border-indigo-200 text-indigo-700",
    bioBox: isDarkMode
      ? "bg-slate-700/40 border border-slate-600/30 text-slate-300"
      : "bg-indigo-50/60 border border-indigo-100 text-gray-700",
    btnPrimary:
      "bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600 hover:from-indigo-400 hover:via-violet-400 hover:to-purple-500 text-white shadow-lg hover:shadow-indigo-500/25",
    btnSecondary: isDarkMode
      ? "bg-slate-700/60 border border-slate-600/50 text-slate-200 hover:bg-slate-700 hover:border-slate-500"
      : "bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300 shadow-sm",
    btnWarning: isDarkMode
      ? "bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 hover:border-amber-400/50"
      : "bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 hover:border-amber-300",
    skillRowTeach: isDarkMode
      ? "bg-emerald-900/20 border border-emerald-700/30 hover:border-emerald-600/40"
      : "bg-emerald-50 border border-emerald-200 hover:border-emerald-300",
    skillRowLearn: isDarkMode
      ? "bg-indigo-900/20 border border-indigo-700/30 hover:border-indigo-600/40"
      : "bg-indigo-50 border border-indigo-200 hover:border-indigo-300",
    pillTeach: isDarkMode
      ? "bg-emerald-500/20 text-emerald-300"
      : "bg-emerald-600 text-white",
    pillLearn: isDarkMode
      ? "bg-indigo-500/20 text-indigo-300"
      : "bg-indigo-600 text-white",
    skillName: isDarkMode ? "text-white" : "text-gray-800",
    statCard: isDarkMode
      ? "bg-slate-700/40 border border-slate-600/40"
      : "bg-indigo-50/60 border border-indigo-100",
    availPill: isDarkMode
      ? "bg-violet-900/20 border border-violet-700/30 text-violet-300 hover:border-violet-600/50"
      : "bg-violet-50 border border-violet-200 text-violet-700 hover:border-violet-300",
    certCard: isDarkMode
      ? "bg-slate-700/40 border border-slate-600/30 hover:border-amber-500/40"
      : "bg-amber-50/60 border border-amber-200 hover:border-amber-300",
    socialLink: isDarkMode
      ? "bg-slate-700/40 border border-slate-600/40 text-slate-300 hover:border-slate-500"
      : "bg-white border border-indigo-100 text-gray-700 hover:border-indigo-300 hover:bg-indigo-50 shadow-sm",
    expertiseCard: isDarkMode
      ? "bg-slate-700/30 border border-slate-600/30"
      : "bg-white border border-indigo-100 shadow-sm",
    sectionTitle: isDarkMode ? "text-white" : "text-gray-900",
    subText: isDarkMode ? "text-slate-400" : "text-gray-500",
    onlineDot: isDarkMode ? "border-slate-900" : "border-white",
    videoBg: isDarkMode ? "bg-black/60" : "bg-gray-900",
    badgeCard: (cat) => {
      if (cat === "cosmetic")
        return isDarkMode
          ? "bg-amber-900/20 border border-amber-600/30 hover:border-amber-500/50"
          : "bg-amber-50 border border-amber-200 hover:border-amber-400";
      if (cat === "reward")
        return isDarkMode
          ? "bg-pink-900/20 border border-pink-600/30 hover:border-pink-500/50"
          : "bg-pink-50 border border-pink-200 hover:border-pink-400";
      return isDarkMode
        ? "bg-slate-700/30 border border-slate-600/30 hover:border-indigo-500/40"
        : "bg-indigo-50 border border-indigo-200 hover:border-indigo-400";
    },
  };

  /* ── helpers ─────────────────────────────────────────────── */
  const handleFileDownload = async (url, defaultFilename) => {
    try {
      let filename = defaultFilename || "Document";
      if (!filename.toLowerCase().endsWith(".pdf")) filename += ".pdf";
      const response = await fetch(url);
      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(objectUrl);
    } catch {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  useEffect(() => {
    api
      .get(`/users/${id}`)
      .then((res) => setUser(res.data))
      .catch(() => navigate("/dashboard"))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleSendMessage = async () => {
    try {
      const matchRes = await api.get(`/matches/check/${user._id}`);
      if (matchRes.data.data?.exists && matchRes.data.data?.match) {
        const match = matchRes.data.data.match;
        if (match.status !== "accepted") {
          alert("Please wait for match approval before messaging!");
          return;
        }
        const convRes = await api.get(`/chats/conversations/match/${match._id}`);
        navigate("/chat", {
          state: { conversationId: convRes.data._id, userName: user.name },
        });
      } else {
        alert("Please wait for match approval before messaging!");
      }
    } catch {
      alert("Failed to start conversation. Please try again.");
    }
  };

  const handleSendMatchRequest = async () => {
    try {
      const currentUserRes = await api.get("/users/me");
      const currentUser = currentUserRes.data;
      const existingMatchRes = await api.get(`/matches/check/${user._id}?t=${Date.now()}`);
      if (existingMatchRes.data?.data?.exists) {
        const { status } = existingMatchRes.data.data;
        if (status === "pending") { alert("Match request already sent!"); return; }
        if (status === "accepted") { alert("You are already matched with this user!"); return; }
      }
      const skillOffered = currentUser.teachSkills?.[0]?.name || "General Knowledge";
      const skillRequested = user.teachSkills?.[0]?.name || "General Knowledge";
      await api.post("/matches", {
        receiverId: user._id,
        message: `I'd like to learn ${skillRequested} and can teach ${skillOffered}`,
        skillsInvolved: [skillOffered, skillRequested],
      });
      alert("Match request sent!");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to send match request");
    }
  };

  const getCerts = () => {
    const newCerts = user?.certificates || [];
    const oldCerts = (user?.skillCertificates || []).filter(
      (c) => c && typeof c === "string" && c.trim()
    );
    const normalizedOld = oldCerts.map((url) => ({
      fileUrl: url,
      fileType: /\.(jpg|jpeg|png|gif|webp)$/i.test(url) ? "image" : "pdf",
      fileName: url.split("/").pop() || "Certificate",
    }));
    const seen = new Set();
    return [...newCerts, ...normalizedOld].filter((c) => {
      if (!c?.fileUrl || seen.has(c.fileUrl)) return false;
      seen.add(c.fileUrl);
      return true;
    });
  };

  const getLocation = () => {
    if (!user?.location) return null;
    if (typeof user.location === "string") return user.location;
    return [user.location.city, user.location.country].filter(Boolean).join(", ");
  };

  const initials = (user?.name || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  /* ──────────────────── LOADING ──────────────────────────── */
  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${t.pageBg}`}>
        <div className="text-center space-y-5">
          <div className="relative inline-flex">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/40">
              <div
                className="w-10 h-10 rounded-full border-white border-t-transparent animate-spin"
                style={{ borderWidth: "3px", borderStyle: "solid" }}
              />
            </div>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 blur-xl opacity-40 animate-pulse" />
          </div>
          <p className="text-lg font-bold bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  /* ──────────────────── NOT FOUND ────────────────────────── */
  if (!user) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${t.pageBg}`}>
        <div
          className={`max-w-sm w-full mx-4 rounded-2xl p-10 text-center ${t.heroCard}`}
        >
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>User not found</h2>
          <button onClick={() => navigate("/dashboard")} className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${t.btnPrimary}`}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const allCerts = getCerts();
  const location = getLocation();
  const teachSkills = user.teachSkills || [];
  const learnSkills = user.learnSkills || [];
  const hasSocial = user.linkedinUrl || user.githubUrl || user.twitterUrl || user.portfolioUrl;

  /* ──────────────────── MAIN RENDER ─────────────────────── */
  return (
    <div className={`min-h-screen ${t.pageBg} transition-colors duration-500`}>
      {/* ── Decorative blobs ──────────────────────────────── */}
      {isDarkMode ? (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-indigo-600/8 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-violet-600/6 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: "radial-gradient(circle at 1px 1px,rgba(139,92,246,1) 1px,transparent 0)", backgroundSize: "40px 40px" }} />
        </div>
      ) : (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-gradient-to-bl from-violet-100/60 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[400px] bg-gradient-to-tr from-indigo-100/60 to-transparent rounded-full blur-3xl" />
        </div>
      )}

      <div className="relative z-10 max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:py-8 pb-24 md:pb-8 space-y-5 sm:space-y-6">

        {/* ══════════════════════════════════════════════════
            HERO CARD
        ══════════════════════════════════════════════════ */}
        <div className={`rounded-2xl overflow-hidden ${t.heroCard} transition-all duration-300`}
          style={{ boxShadow: isDarkMode ? "0 24px 60px rgba(0,0,0,0.5)" : "0 24px 60px rgba(99,102,241,0.13)" }}>

          {/* Gradient banner */}
          <div className="h-24 sm:h-32 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 animate-pulse" />
            <div className="absolute inset-0"
              style={{ backgroundImage: "radial-gradient(circle at 2px 2px,rgba(255,255,255,0.08) 1px,transparent 0)", backgroundSize: "24px 24px" }} />
          </div>

          <div className="px-4 sm:px-6 pb-6 sm:pb-8">
            {/* Avatar lifted above banner */}
            <div className="-mt-12 sm:-mt-14 mb-3 sm:mb-4 flex items-end gap-4">
              <div className="relative flex-shrink-0">
                <div
                  className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 flex items-center justify-center text-white text-2xl sm:text-4xl font-black overflow-hidden shadow-2xl"
                  style={{
                    boxShadow: isDarkMode
                      ? "0 8px 32px rgba(99,102,241,0.45), 0 0 0 4px #0f172a"
                      : "0 8px 32px rgba(99,102,241,0.30), 0 0 0 4px #ffffff",
                  }}
                >
                  {user.profileImage ? (
                    <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>
                {/* Online dot — only visible when user is connected */}
                {isUserOnline(user._id) && (
                  <span
                    className="absolute bottom-0.5 right-0.5 w-5 h-5 bg-green-400 rounded-full shadow-md"
                    style={{ border: `2px solid ${isDarkMode ? "#0a0f1e" : "#ffffff"}` }}
                    title="Online"
                  />
                )}
              </div>

              {/* Spacer that pushes layout down alongside avatar */}
              <div className="pb-2 flex-1 min-w-0" />
            </div>

            {/* Name, badges & role — always below the banner, never clipped */}
            <div className="mb-5">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <h1
                  className={`text-2xl sm:text-3xl lg:text-4xl font-black break-words leading-tight ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {user.name || "Anonymous User"}
                </h1>
                {user.mentorTag && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-pink-500/15 text-pink-400 border border-pink-500/30">
                    🧑‍🏫 Mentor
                  </span>
                )}
                {user.profileFrame === "crown" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    👑 Crown
                  </span>
                )}
                {user.profileFrame === "golden" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-yellow-500/15 text-yellow-400 border border-yellow-500/30">
                    🖼️ Golden
                  </span>
                )}
              </div>
              {user.role && (
                <p
                  className={`text-sm font-semibold tracking-wide ${
                    isDarkMode ? "text-indigo-400" : "text-indigo-600"
                  }`}
                >
                  {user.role}
                </p>
              )}
            </div>

            {/* Meta pills */}
            <div className="flex flex-wrap gap-2 mb-5">
              {location && (
                <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${t.metaPill}`}>
                  📍 {location}
                </span>
              )}
              {user.experienceLevel && (
                <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${t.metaPill} capitalize`}>
                  🏆 {user.experienceLevel} Level
                </span>
              )}
              {user.yearsOfExperience > 0 && (
                <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${t.metaPill}`}>
                  📅 {user.yearsOfExperience} yrs experience
                </span>
              )}
              {user.languages?.length > 0 && user.languages.slice(0, 2).map((l) => (
                <span key={l} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${t.metaPill}`}>
                  🌐 {l}
                </span>
              ))}
            </div>

            {/* Bio */}
            {user.bio && (
              <div className={`rounded-xl p-4 mb-5 text-sm leading-relaxed ${t.bioBox}`}>
                {user.bio}
              </div>
            )}

            {/* Quick stats */}
            <div className={`grid grid-cols-3 divide-x rounded-xl mb-6 ${t.statCard} ${isDarkMode ? "divide-slate-600/40" : "divide-indigo-100"}`}>
              {[
                { val: teachSkills.length, label: "Teaching" },
                { val: learnSkills.length, label: "Learning" },
                { val: allCerts.length, label: "Certs" },
              ].map(({ val, label }) => (
                <div key={label} className="p-4 text-center">
                  <p className={`text-2xl font-black ${isDarkMode ? "text-white" : "text-gray-900"}`}>{val}</p>
                  <p className={`text-[11px] font-semibold mt-0.5 ${t.subText}`}>{label}</p>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
              <button onClick={handleSendMessage}
                className={`group relative flex items-center justify-center gap-2.5 py-3.5 px-5 rounded-xl font-bold text-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] overflow-hidden ${t.btnPrimary}`}>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <svg className="w-4 h-4 relative" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="relative">Send Message</span>
              </button>

              <button onClick={handleSendMatchRequest}
                className={`flex items-center justify-center gap-2.5 py-3.5 px-5 rounded-xl font-bold text-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] border ${t.btnSecondary}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
                </svg>
                Match Request
              </button>

              <button onClick={() => navigate(`/user/${user._id}/reviews`)}
                className={`flex items-center justify-center gap-2.5 py-3.5 px-5 rounded-xl font-bold text-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] border ${t.btnWarning}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                View Reviews
              </button>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            EXPERTISE INFO
        ══════════════════════════════════════════════════ */}
        <SectionCard isDarkMode={isDarkMode}>
          <div className="p-4 sm:p-6">
            <SectionHeader
              isDarkMode={isDarkMode}
              gradient="from-indigo-500 to-violet-600"
              title="Expertise Details"
              icon={
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              }
            />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Teaching Style", val: user.teachingStyle, color: "text-emerald-500" },
                { label: "Learning Style", val: user.learningStyle, color: "text-indigo-500" },
                { label: "Experience", val: user.yearsOfExperience ? `${user.yearsOfExperience} Yrs` : null, color: "text-violet-500" },
                { label: "Languages", val: user.languages?.length > 0 ? user.languages.join(", ") : null, color: "text-sky-500" },
              ].map(({ label, val, color }) => (
                <div key={label} className={`rounded-xl p-4 ${t.expertiseCard}`}>
                  <p className={`text-[10px] font-bold uppercase tracking-widest mb-1.5 ${t.subText}`}>{label}</p>
                  <p className={`text-sm font-bold truncate ${val ? color : t.subText}`}>{val || "Not set"}</p>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        {/* ══════════════════════════════════════════════════
            SKILLS
        ══════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Teaching */}
          <SectionCard isDarkMode={isDarkMode}>
            <div className="p-4 sm:p-6">
              <SectionHeader
                isDarkMode={isDarkMode}
                gradient="from-emerald-500 to-teal-600"
                title="Can Teach"
                subtitle={`${teachSkills.length} skill${teachSkills.length !== 1 ? "s" : ""}`}
                icon={
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                }
              />
              {teachSkills.length > 0 ? (
                <div className="space-y-2.5">
                  {teachSkills.map((skill, i) => (
                    <div key={i} className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${t.skillRowTeach}`}>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold ${t.skillName}`}>{skill.name}</span>
                        {user.verifiedSkills?.some((v) => v.toLowerCase() === skill.name.toLowerCase()) && (
                          <VerificationBadge size="sm" />
                        )}
                      </div>
                      {skill.level && (
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${t.pillTeach}`}>
                          {skill.level}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`text-center py-10 rounded-xl border-2 border-dashed ${isDarkMode ? "border-slate-700 text-slate-500" : "border-indigo-100 text-gray-400"}`}>
                  <p className="text-sm">No teaching skills listed</p>
                </div>
              )}
            </div>
          </SectionCard>

          {/* Learning */}
          <SectionCard isDarkMode={isDarkMode}>
            <div className="p-4 sm:p-6">
              <SectionHeader
                isDarkMode={isDarkMode}
                gradient="from-indigo-500 to-violet-600"
                title="Wants to Learn"
                subtitle={`${learnSkills.length} skill${learnSkills.length !== 1 ? "s" : ""}`}
                icon={
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                }
              />
              {learnSkills.length > 0 ? (
                <div className="space-y-2.5">
                  {learnSkills.map((skill, i) => (
                    <div key={i} className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${t.skillRowLearn}`}>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold ${t.skillName}`}>{skill.name}</span>
                        {user.verifiedSkills?.some((v) => v.toLowerCase() === skill.name.toLowerCase()) && (
                          <VerificationBadge size="sm" />
                        )}
                      </div>
                      {skill.level && (
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${t.pillLearn}`}>
                          {skill.level}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`text-center py-10 rounded-xl border-2 border-dashed ${isDarkMode ? "border-slate-700 text-slate-500" : "border-indigo-100 text-gray-400"}`}>
                  <p className="text-sm">No learning goals listed</p>
                </div>
              )}
            </div>
          </SectionCard>
        </div>

        {/* ══════════════════════════════════════════════════
            BADGES
        ══════════════════════════════════════════════════ */}
        {user.gamificationBadges?.length > 0 && (
          <SectionCard isDarkMode={isDarkMode}>
            <div className="p-4 sm:p-6">
              <SectionHeader
                isDarkMode={isDarkMode}
                gradient="from-amber-500 to-orange-600"
                title="Earned Badges"
                subtitle={`${user.gamificationBadges.length} badge${user.gamificationBadges.length !== 1 ? "s" : ""}`}
                icon={<span className="text-xl">🏅</span>}
              />
              <div className="flex flex-wrap gap-3">
                {user.gamificationBadges.map((badge, i) => (
                  <div key={i} title={badge.description}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 hover:scale-105 cursor-default ${t.badgeCard(badge.category)}`}>
                    <span className="text-2xl">{badge.icon}</span>
                    <div>
                      <p className={`text-sm font-bold leading-none ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                        {badge.badgeName}
                      </p>
                      <p className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${
                        badge.category === "cosmetic" ? "text-amber-500" :
                        badge.category === "reward" ? "text-pink-500" :
                        "text-indigo-500"
                      }`}>{badge.category}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>
        )}

        {/* ══════════════════════════════════════════════════
            AVAILABILITY
        ══════════════════════════════════════════════════ */}
        {user.availability?.length > 0 && (
          <SectionCard isDarkMode={isDarkMode}>
            <div className="p-4 sm:p-6">
              <SectionHeader
                isDarkMode={isDarkMode}
                gradient="from-violet-500 to-purple-600"
                title="Availability"
                subtitle="When this person is free to connect"
                icon={
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />
              <div className="flex flex-wrap gap-2.5">
                {user.availability.map((time, i) => (
                  <span key={i} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 ${t.availPill}`}>
                    {time}
                  </span>
                ))}
              </div>
            </div>
          </SectionCard>
        )}

        {/* ══════════════════════════════════════════════════
            SHOWCASE VIDEO
        ══════════════════════════════════════════════════ */}
        {user.skillShowcaseVideo && (
          <SectionCard isDarkMode={isDarkMode}>
            <div className="p-4 sm:p-6">
              <SectionHeader
                isDarkMode={isDarkMode}
                gradient="from-rose-500 to-pink-600"
                title="Showcase Video"
                subtitle="Skill demonstration"
                icon={<span className="text-lg">🎥</span>}
              />
              <div className={`rounded-xl overflow-hidden ${t.videoBg}`}>
                <video
                  src={user.skillShowcaseVideo}
                  className="w-full h-auto max-h-96 object-contain"
                  controls
                />
              </div>
            </div>
          </SectionCard>
        )}

        {/* ══════════════════════════════════════════════════
            CERTIFICATES
        ══════════════════════════════════════════════════ */}
        {allCerts.length > 0 && (
          <SectionCard isDarkMode={isDarkMode}>
            <div className="p-4 sm:p-6">
              <SectionHeader
                isDarkMode={isDarkMode}
                gradient="from-amber-500 to-yellow-600"
                title={`Skill Certificates (${allCerts.length})`}
                subtitle="Verified skill credentials"
                icon={
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                }
              />
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {allCerts.map((cert, i) => {
                  const isPdf = cert.fileType === "pdf" || cert.fileType === "document";
                  const isImage = cert.fileType === "image";
                  const fileName = cert.fileName || `Certificate ${i + 1}`;
                  return (
                    <div key={i} className={`group rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.03] ${t.certCard}`}>
                      {isPdf ? (
                        <div onClick={() => handleFileDownload(cert.fileUrl, fileName)} role="button"
                          className="flex flex-col items-center justify-center h-28 cursor-pointer gap-2 hover:opacity-80 transition-opacity">
                          <svg className="w-12 h-12 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                          </svg>
                          <span className={`text-[11px] font-medium flex items-center gap-1 ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download PDF
                          </span>
                        </div>
                      ) : isImage ? (
                        <a href={cert.fileUrl} target="_blank" rel="noopener noreferrer" className="block">
                          <img src={cert.fileUrl} alt={fileName} className="w-full h-28 object-cover hover:opacity-90 transition-opacity" loading="lazy" />
                        </a>
                      ) : (
                        <a href={cert.fileUrl} target="_blank" rel="noopener noreferrer"
                          className="flex flex-col items-center justify-center h-28 gap-2 hover:opacity-80 transition-opacity">
                          <svg className="w-10 h-10 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className={`text-[11px] font-medium ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>View File</span>
                        </a>
                      )}
                      <div className={`px-3 py-2 flex items-center justify-between border-t ${isDarkMode ? "border-slate-700/50" : "border-amber-200/50"}`}>
                        <span className={`text-[11px] truncate max-w-[70%] ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>{fileName}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${isPdf ? (isDarkMode ? "bg-red-900/40 text-red-400" : "bg-red-100 text-red-600") : (isDarkMode ? "bg-blue-900/40 text-blue-400" : "bg-blue-100 text-blue-600")}`}>
                          {isPdf ? "PDF" : "IMG"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </SectionCard>
        )}

        {/* ══════════════════════════════════════════════════
            SOCIAL LINKS
        ══════════════════════════════════════════════════ */}
        {hasSocial && (
          <SectionCard isDarkMode={isDarkMode}>
            <div className="p-4 sm:p-6">
              <SectionHeader
                isDarkMode={isDarkMode}
                gradient="from-sky-500 to-blue-600"
                title="Public Profiles"
                subtitle="Connect on other platforms"
                icon={
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                }
              />
              <div className="flex flex-wrap gap-3">
                {user.linkedinUrl && (
                  <a href={user.linkedinUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 bg-blue-600/10 border border-blue-600/30 text-blue-500 hover:bg-blue-600/20 hover:border-blue-500/50">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.238 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                    LinkedIn
                  </a>
                )}
                {user.githubUrl && (
                  <a href={user.githubUrl} target="_blank" rel="noopener noreferrer"
                    className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 ${t.socialLink}`}>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                    GitHub
                  </a>
                )}
                {user.twitterUrl && (
                  <a href={user.twitterUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 bg-sky-400/10 border border-sky-400/30 text-sky-500 hover:bg-sky-400/20 hover:border-sky-500/50">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                    Twitter / X
                  </a>
                )}
                {user.portfolioUrl && (
                  <a href={user.portfolioUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/20 hover:border-emerald-500/50">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                    Portfolio
                  </a>
                )}
              </div>
            </div>
          </SectionCard>
        )}
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>
    </div>
  );
}
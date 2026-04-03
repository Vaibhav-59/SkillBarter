// client/src/pages/ProfilePage.jsx
import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import api from "../utils/api";
import { showSuccess, showError } from "../utils/toast";
import { loginUser, updateUser } from "../redux/slices/authSlice";
import { setProfile, updateProfile } from "../redux/slices/userSlice";
import { fetchReviewStatsAsync } from "../redux/slices/reviewSlice";
import { fetchSmartMatches } from "../redux/slices/smartMatchSlice";
import EditProfile from "../components/profile/EditProfile";
import VerificationBadge from "../components/verification/VerificationBadge";
import { useTheme } from "../hooks/useTheme";

/* ── Reusable card wrapper ─────────────────────────────── */
function Card({ children, className = "", isDarkMode }) {
  return (
    <div className={`rounded-2xl border transition-all duration-300 ${
      isDarkMode
        ? "bg-slate-800/60 border-slate-700/50"
        : "bg-white border-indigo-100 shadow-lg shadow-indigo-100/30"
    } ${className}`}>
      {children}
    </div>
  );
}

/* ── Section header ────────────────────────────────────── */
function SHead({ gradient, icon, title, sub, isDarkMode }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${gradient} shadow-md`}>
        {icon}
      </div>
      <div>
        <h3 className={`text-base font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{title}</h3>
        {sub && <p className={`text-xs mt-0.5 ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>{sub}</p>}
      </div>
    </div>
  );
}

/* ── Star rater ────────────────────────────────────────── */
const LEVELS = ["Beginner", "Intermediate", "Advanced"];
function levelToStars(level) {
  if (!level) return 0;
  const idx = LEVELS.findIndex(l => l.toLowerCase() === level.toLowerCase());
  return idx === -1 ? 1 : idx + 1;
}

export default function ProfilePage() {
  const dispatch = useDispatch();
  const user = useSelector(s => s.auth.user);
  const reviewStats = useSelector(s => s.review.reviewStats);
  const { isDarkMode } = useTheme();

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const emptyForm = {
    name: "", email: "", bio: "", location: { city: "", country: "" },
    role: "", experienceLevel: "", availability: [], skillCertificates: [],
    certificates: [], certificatePreviews: [], skillShowcaseVideo: "",
    learningStyle: "", teachingStyle: "", linkedinUrl: "", twitterUrl: "",
    githubUrl: "", portfolioUrl: "", languages: [], yearsOfExperience: 0,
  };

  const [form, setForm] = useState(emptyForm);
  const [videoFile, setVideoFile] = useState(null);
  const [removeVideo, setRemoveVideo] = useState(false);
  const [certificateFiles, setCertificateFiles] = useState([]);
  const [certificatePreviews, setCertificatePreviews] = useState([]);
  const [profileData, setProfileData] = useState({ ...emptyForm, createdAt: null });
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showImageMenu, setShowImageMenu] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({ matches: 0, completed: 0, receivedReviews: 0 });
  const [hoverStars, setHoverStars] = useState({});

  /* ── data fetching ──────────────────────────────────── */
  useEffect(() => {
    const load = async () => {
      try {
        const r = await api.get("/users/dashboard-stats");
        setDashboardStats(r.data);
      } catch {}
      dispatch(fetchReviewStatsAsync());
    };
    load();
    const onVisible = () => { if (!document.hidden) load(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [dispatch]);

  useEffect(() => {
    const handler = (e) => {
      if (showImageMenu && !e.target.closest(".img-menu")) setShowImageMenu(false);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [showImageMenu]);

  const populate = (data) => ({
    name: data.name || "", email: data.email || "", bio: data.bio || "",
    location: data.location || { city: "", country: "" }, role: data.role || "",
    experienceLevel: data.experienceLevel || "", availability: data.availability || [],
    certificates: data.certificates || [], skillCertificates: data.skillCertificates || [],
    skillShowcaseVideo: data.skillShowcaseVideo || "", learningStyle: data.learningStyle || "",
    teachingStyle: data.teachingStyle || "", linkedinUrl: data.linkedinUrl || "",
    twitterUrl: data.twitterUrl || "", githubUrl: data.githubUrl || "",
    portfolioUrl: data.portfolioUrl || "", languages: data.languages || [],
    yearsOfExperience: data.yearsOfExperience || 0,
  });

  useEffect(() => {
    api.get("/users/me").then(res => {
      const d = res.data;
      setForm(populate(d));
      setProfileData({ ...populate(d), createdAt: d.createdAt || null });
      dispatch(setProfile(d));
      setSkills([
        ...(d.teachSkills || []).map(s => ({ ...s, type: "teach" })),
        ...(d.learnSkills || []).map(s => ({ ...s, type: "learn" })),
      ]);
    }).catch(() => showError("Failed to load profile"));
  }, [dispatch]);

  const openEditModal = () => {
    setForm(populate(profileData));
    setCertificateFiles([]); setCertificatePreviews([]);
    setVideoFile(null); setRemoveVideo(false);
    setIsEditing(true);
  };

  /* ── image handlers ─────────────────────────────────── */
  const handleProfileImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { showError("Image < 5MB please"); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("profileImage", file);
      const res = await api.put("/users/profile", fd, { headers: { "Content-Type": "multipart/form-data" } });
      showSuccess("Profile picture updated");
      dispatch(updateUser(res.data)); dispatch(updateProfile(res.data)); dispatch(setProfile(res.data));
      setProfileData(p => ({ ...p, profileImage: res.data.profileImage }));
      setShowImageModal(false);
    } catch (err) { showError(err.response?.data?.message || "Upload failed"); }
    finally { setLoading(false); document.querySelectorAll('input[type="file"]').forEach(i => i.value = ""); }
  };

  const handleRemoveProfileImage = async () => {
    setLoading(true);
    try {
      const res = await api.delete("/users/profile-image");
      showSuccess("Picture removed");
      dispatch(updateUser(res.data)); dispatch(updateProfile(res.data)); dispatch(setProfile(res.data));
      setProfileData(p => ({ ...p, profileImage: res.data.profileImage }));
      setShowImageMenu(false);
    } catch (err) { showError(err.response?.data?.message || "Remove failed"); }
    finally { setLoading(false); }
  };

  /* ── submit ─────────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const fd = new FormData();
      ["name","bio","role","experienceLevel","learningStyle","teachingStyle",
       "linkedinUrl","twitterUrl","githubUrl","portfolioUrl"].forEach(k => fd.append(k, form[k] || ""));
      fd.append("location", JSON.stringify(form.location || {}));
      fd.append("yearsOfExperience", form.yearsOfExperience || 0);
      (form.availability || []).forEach(s => fd.append("availability", s));
      (form.languages || []).forEach(l => fd.append("languages", l));
      (certificateFiles || []).forEach(f => fd.append("skillCertificates", f));
      if (videoFile) fd.append("skillShowcaseVideo", videoFile);
      else if (removeVideo) fd.append("removeVideo", "true");

      await api.put("/users/profile", fd, { headers: { "Content-Type": "multipart/form-data" } });
      showSuccess("Profile updated!");
      const { data: d } = await api.get("/users/me");
      setProfileData({ ...populate(d), createdAt: d.createdAt || null });
      setForm(populate(d));
      dispatch(updateProfile(d)); dispatch(setProfile(d));
      dispatch(fetchSmartMatches({ refresh: true }));
      setCertificateFiles([]); setCertificatePreviews([]);
      setVideoFile(null); setRemoveVideo(false); setIsEditing(false);
      window.dispatchEvent(new Event("profileUpdated"));
    } catch (err) { showError(err.response?.data?.message || "Update failed"); }
    finally { setLoading(false); }
  };

  const handleDeleteCertificate = async (index) => {
    try {
      await api.delete(`/users/certificate/${index}`);
      const updated = (profileData.certificates || []).filter((_, i) => i !== index);
      setProfileData({ ...profileData, certificates: updated });
      setForm({ ...form, certificates: updated });
      dispatch(setProfile({ ...user, certificates: updated }));
      showSuccess("Certificate deleted");
      window.dispatchEvent(new Event("profileUpdated"));
    } catch { showError("Delete failed"); }
  };

  /* ── skill level updater ─────────────────────────────── */
  const updateSkillLevel = useCallback(async (skillName, newStars, type) => {
    const newLevel = LEVELS[newStars - 1];
    setSkills(prev => prev.map(s => s.name === skillName && s.type === type ? { ...s, level: newLevel } : s));
    dispatch(updateProfile({
      ...(type === "teach"
        ? { teachSkills: (user?.teachSkills || []).map(s => s.name === skillName ? { ...s, level: newLevel } : s) }
        : { learnSkills: (user?.learnSkills || []).map(s => s.name === skillName ? { ...s, level: newLevel } : s) })
    }));
    try {
      await api.patch(`/skills/${type}/level?name=${encodeURIComponent(skillName)}`, { level: newLevel });
      showSuccess(`${skillName} → ${newLevel}`);
    } catch {
      showError("Level update failed");
      const { data } = await api.get("/users/me");
      setSkills([...(data.teachSkills||[]).map(s=>({...s,type:"teach"})),...(data.learnSkills||[]).map(s=>({...s,type:"learn"}))]);
    }
  }, [dispatch, user]);

  /* ── StarRater ───────────────────────────────────────── */
  const StarRater = ({ skill, type, accent }) => {
    const current = levelToStars(skill.level);
    const hovered = hoverStars[skill.name] ?? 0;
    const display = hovered || current;
    return (
      <div className="flex flex-col items-end gap-1">
        <div className="flex items-center gap-0.5">
          {[1,2,3].map(star => (
            <button key={star} type="button"
              onClick={() => updateSkillLevel(skill.name, star, type)}
              onMouseEnter={() => setHoverStars(h => ({ ...h, [skill.name]: star }))}
              onMouseLeave={() => setHoverStars(h => ({ ...h, [skill.name]: 0 }))}
              className="p-0.5 rounded transition-transform duration-150 hover:scale-125 active:scale-95 focus:outline-none">
              <svg className={`w-5 h-5 transition-all duration-150 ${star <= display ? "text-yellow-400" : isDarkMode ? "text-slate-700" : "text-gray-200"}`}
                fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}
        </div>
        <span className={`text-[10px] font-bold ${accent}`}>{LEVELS[display-1] || skill.level}</span>
      </div>
    );
  };

  /* ── derived state ───────────────────────────────────── */
  const teachSkills = skills.filter(s => s.type === "teach");
  const learnSkills = skills.filter(s => s.type === "learn");
  const effectiveTeachCount = Math.max(teachSkills.length, (user?.teachSkills||[]).length);
  const effectiveLearnCount = Math.max(learnSkills.length, (user?.learnSkills||[]).length);

  const profileCompletion = (() => {
    const checks = [
      !!(profileData.name || user?.name), !!(profileData.bio || user?.bio),
      !!(profileData.location || user?.location), !!(profileData.role || user?.role),
      effectiveTeachCount > 0, effectiveLearnCount > 0,
      (profileData.certificates?.length || profileData.skillCertificates?.length || 0) > 0,
      !!(profileData.skillShowcaseVideo || user?.skillShowcaseVideo),
      !!(profileData.learningStyle || user?.learningStyle),
      !!(profileData.teachingStyle || user?.teachingStyle),
      (profileData.languages?.length || user?.languages?.length || 0) > 0,
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  })();

  const memberSince = (() => {
    const d = profileData.createdAt || user?.createdAt;
    return d ? new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "N/A";
  })();

  const allCerts = (() => {
    const nc = user?.certificates || [];
    const oc = (user?.skillCertificates || []).filter(c => c && typeof c === "string");
    const norm = oc.map(url => ({
      fileUrl: url, fileName: url.split("/").pop() || "Certificate",
      fileType: /\.(jpg|jpeg|png|gif|webp)$/i.test(url) ? "image" : "pdf",
    }));
    const seen = new Set();
    return [...nc, ...norm].filter(c => { if (!c?.fileUrl || seen.has(c.fileUrl)) return false; seen.add(c.fileUrl); return true; });
  })();

  const initials = (profileData.name || user?.name || "U").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  const pageBg = isDarkMode
    ? "bg-[#0a0f1e]"
    : "bg-gradient-to-br from-slate-50 via-indigo-50/40 to-violet-50/30";

  const statCards = [
    { label: "Teaching", val: effectiveTeachCount, icon: "🎓", grad: "from-emerald-500 to-teal-600" },
    { label: "Learning",  val: effectiveLearnCount,
      icon: "📚", grad: "from-indigo-500 to-violet-600" },
    { label: "Connections", val: dashboardStats.completed || 0, icon: "🤝", grad: "from-violet-500 to-purple-600" },
    { label: "Reviews", val: reviewStats?.received?.totalReviews || dashboardStats.receivedReviews || 0, icon: "⭐", grad: "from-amber-500 to-orange-600" },
  ];

  const tabs = [
    { id: "overview", label: "Overview", icon: "👤" },
    { id: "skills",   label: "Skills",   icon: "⚡" },
  ];

  /* ────────────────────────────────────────────────────────
     RENDER
  ──────────────────────────────────────────────────────── */
  return (
    <div className={`min-h-screen transition-colors duration-500 ${pageBg}`}>

      {/* Decorative blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {isDarkMode ? (
          <>
            <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-indigo-600/6 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
            <div className="absolute inset-0 opacity-[0.03]"
              style={{ backgroundImage: "radial-gradient(circle at 1px 1px,rgba(139,92,246,1) 1px,transparent 0)", backgroundSize: "40px 40px" }} />
          </>
        ) : (
          <>
            <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-gradient-to-bl from-violet-100/60 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[400px] bg-gradient-to-tr from-indigo-100/60 to-transparent rounded-full blur-3xl" />
          </>
        )}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* ══ TOP ROW: Profile card + Stats ═════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Profile card */}
          <div className="lg:col-span-1">
            <Card isDarkMode={isDarkMode} className="p-6 h-full">
              <div className="text-center">
                {/* Avatar */}
                <div className="relative inline-block mb-4 img-menu">
                  <div
                    className="w-28 h-28 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 flex items-center justify-center text-white text-4xl font-black overflow-hidden cursor-pointer transition-transform duration-300 hover:scale-105"
                    onClick={() => setShowImageMenu(!showImageMenu)}
                    style={{ boxShadow: "0 8px 32px rgba(99,102,241,0.35)" }}
                  >
                    {user?.profileImage
                      ? <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                      : <span>{initials}</span>}
                  </div>

                  {/* Camera button */}
                  <label htmlFor="profile-upload"
                    className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-full border-2 flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-transform z-20"
                    style={{ borderColor: isDarkMode ? "#0a0f1e" : "#fff" }}
                    onClick={e => e.stopPropagation()}>
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </label>
                  <input id="profile-upload" type="file" accept="image/*" className="hidden" onChange={handleProfileImageChange} />

                  {/* Image dropdown */}
                  {showImageMenu && (
                    <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 rounded-xl border shadow-xl overflow-hidden z-50 ${
                      isDarkMode ? "bg-slate-800/95 border-slate-700/60" : "bg-white border-indigo-100 shadow-indigo-100/40"
                    }`}>
                      <button onClick={e => { e.stopPropagation(); document.getElementById("profile-upload-menu").click(); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${isDarkMode ? "text-slate-200 hover:bg-indigo-500/10 hover:text-indigo-300" : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"}`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Upload New Photo
                      </button>
                      <input id="profile-upload-menu" type="file" accept="image/*" className="hidden" onChange={handleProfileImageChange} />
                      {user?.profileImage && (
                        <>
                          <button onClick={e => { e.stopPropagation(); setShowImageMenu(false); setShowImageModal(true); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${isDarkMode ? "text-slate-200 hover:bg-indigo-500/10 hover:text-indigo-300" : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"}`}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View Photo
                          </button>
                          <button onClick={e => { e.stopPropagation(); handleRemoveProfileImage(); }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Remove Photo
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Name + role */}
                <h2 className={`text-2xl font-black mb-1 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  {profileData.name || user?.name || "Your Name"}
                </h2>
                {(profileData.role || user?.role) && (
                  <p className={`text-sm font-semibold mb-3 ${isDarkMode ? "text-indigo-400" : "text-indigo-600"}`}>
                    {profileData.role || user?.role}
                  </p>
                )}

                {/* Location */}
                {(() => {
                  const loc = profileData.location || user?.location;
                  const str = loc ? (typeof loc === "object" ? [loc.city, loc.country].filter(Boolean).join(", ") : loc) : null;
                  return str ? (
                    <p className={`text-xs flex items-center justify-center gap-1 mb-3 ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
                      📍 {str}
                    </p>
                  ) : null;
                })()}

                {/* Bio */}
                {(profileData.bio || user?.bio) && (
                  <p className={`text-xs leading-relaxed rounded-xl px-3 py-2.5 mb-4 text-left ${
                    isDarkMode ? "bg-slate-700/40 text-slate-300 border border-slate-600/30" : "bg-indigo-50/60 text-gray-600 border border-indigo-100"
                  }`}>
                    {profileData.bio || user?.bio}
                  </p>
                )}

                {/* Profile completion */}
                <div className={`rounded-xl p-3 mb-4 ${isDarkMode ? "bg-slate-700/40" : "bg-indigo-50/60"}`}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className={isDarkMode ? "text-slate-400" : "text-gray-500"}>Profile Completion</span>
                    <span className={`font-bold ${
                      profileCompletion === 100 ? "text-emerald-400" :
                      profileCompletion >= 70  ? "text-indigo-400" :
                      profileCompletion >= 40  ? "text-amber-400"  : "text-red-400"
                    }`}>{profileCompletion}%</span>
                  </div>
                  <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDarkMode ? "bg-slate-600" : "bg-indigo-100"}`}>
                    <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600 transition-all duration-700"
                      style={{ width: `${profileCompletion}%` }} />
                  </div>
                </div>

                {/* Edit button */}
                <button onClick={openEditModal}
                  className="group relative w-full py-3 px-5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600 hover:from-indigo-400 hover:via-violet-400 hover:to-purple-500 transition-all duration-300 hover:scale-[1.02] overflow-hidden shadow-lg shadow-indigo-500/30">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <span className="relative flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Profile
                  </span>
                </button>
              </div>
            </Card>
          </div>

          {/* Stats + Tabs */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {statCards.map((s, i) => (
                <Card key={s.label} isDarkMode={isDarkMode} className="p-5 text-center group hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">{s.icon}</div>
                  <div className={`text-2xl font-black bg-gradient-to-r ${s.grad} bg-clip-text text-transparent mb-1`}>{s.val}</div>
                  <div className={`text-[11px] font-semibold uppercase tracking-wide ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}>{s.label}</div>
                </Card>
              ))}
            </div>

            {/* Tabs */}
            <div className={`flex gap-2 p-1.5 rounded-2xl ${isDarkMode ? "bg-slate-800/60 border border-slate-700/50" : "bg-white border border-indigo-100 shadow-sm"}`}>
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold transition-all duration-300 ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30"
                      : isDarkMode ? "text-slate-400 hover:text-white hover:bg-slate-700/50" : "text-gray-500 hover:text-indigo-700 hover:bg-indigo-50"
                  }`}>
                  <span>{tab.icon}</span>{tab.label}
                </button>
              ))}
            </div>

            {/* Member since */}
            <div className={`flex items-center justify-between px-5 py-3 rounded-xl ${
              isDarkMode ? "bg-slate-800/40 border border-slate-700/40" : "bg-indigo-50/60 border border-indigo-100"
            }`}>
              <span className={`text-xs font-semibold ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>Member Since</span>
              <span className={`text-xs font-bold ${isDarkMode ? "text-indigo-400" : "text-indigo-600"}`}>{memberSince}</span>
            </div>
          </div>
        </div>

        {/* ══ TAB: Overview ════════════════════════════════ */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Certificates */}
            <Card isDarkMode={isDarkMode} className="p-6">
              <SHead isDarkMode={isDarkMode} gradient="from-amber-500 to-yellow-600"
                title={`Certificates (${allCerts.length})`} sub="Your verified credentials"
                icon={<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>}
              />
              {allCerts.length > 0 ? (
                <div className="space-y-2">
                  {allCerts.map((cert, i) => {
                    const isPdf = cert.fileType === "pdf" || cert.fileType === "document";
                    return (
                      <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 ${
                        isDarkMode ? "bg-slate-700/40 border-slate-600/40 hover:border-amber-500/30" : "bg-amber-50/60 border-amber-100 hover:border-amber-300"
                      }`}>
                        {isPdf ? (
                          <div className="w-9 h-9 bg-red-500/15 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                            </svg>
                          </div>
                        ) : (
                          <img src={cert.fileUrl} alt={cert.fileName} className="w-9 h-9 object-cover rounded-lg flex-shrink-0" loading="lazy" />
                        )}
                        <span className={`flex-1 text-xs truncate ${isDarkMode ? "text-slate-300" : "text-gray-600"}`}>{cert.fileName || `Cert ${i+1}`}</span>
                        <a href={cert.fileUrl} target="_blank" rel="noopener noreferrer"
                          className="text-xs px-2 py-0.5 rounded-md font-semibold bg-blue-500/15 text-blue-400 hover:text-blue-300 transition">
                          {isPdf ? "PDF" : "View"}
                        </a>
                        <button onClick={() => handleDeleteCertificate(i)}
                          className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className={`text-center py-8 rounded-xl border-2 border-dashed ${isDarkMode ? "border-slate-700 text-slate-500" : "border-indigo-100 text-gray-400"}`}>
                  <p className="text-sm">No certificates yet</p>
                </div>
              )}
            </Card>

            {/* Showcase + Quick info */}
            <Card isDarkMode={isDarkMode} className="p-6">
              <SHead isDarkMode={isDarkMode} gradient="from-violet-500 to-purple-600"
                title="About Me" sub="Quick profile info"
                icon={<span className="text-lg">🧑‍💻</span>}
              />
              <div className="space-y-3">
                {[
                  { label: "Teaching Style", val: profileData.teachingStyle || user?.teachingStyle },
                  { label: "Learning Style", val: profileData.learningStyle || user?.learningStyle },
                  { label: "Experience", val: (profileData.yearsOfExperience || user?.yearsOfExperience) ? `${profileData.yearsOfExperience || user?.yearsOfExperience} years` : null },
                  { label: "Level", val: profileData.experienceLevel || user?.experienceLevel },
                  { label: "Languages", val: (profileData.languages || user?.languages || []).join(", ") || null },
                ].map(({ label, val }) => val ? (
                  <div key={label} className={`flex justify-between items-center px-4 py-2.5 rounded-xl ${
                    isDarkMode ? "bg-slate-700/40 border border-slate-600/30" : "bg-indigo-50/60 border border-indigo-100"
                  }`}>
                    <span className={`text-xs font-semibold ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>{label}</span>
                    <span className={`text-xs font-bold ${isDarkMode ? "text-indigo-300" : "text-indigo-700"} capitalize`}>{val}</span>
                  </div>
                ) : null)}

                {/* Video */}
                {(user?.skillShowcaseVideo) && (
                  <div className="rounded-xl overflow-hidden mt-2">
                    <video src={user.skillShowcaseVideo} className="w-full rounded-xl" controls />
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* ══ TAB: Skills ══════════════════════════════════ */}
        {activeTab === "skills" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Teaching */}
            <Card isDarkMode={isDarkMode} className="p-6">
              <SHead isDarkMode={isDarkMode} gradient="from-emerald-500 to-teal-600"
                title="Skills I Teach" sub={`${teachSkills.length} skill${teachSkills.length !== 1 ? "s" : ""}`}
                icon={<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
              />
              {teachSkills.length > 0 ? (
                <div className="space-y-2.5">
                  {teachSkills.map((skill, i) => (
                    <div key={i} className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-200 hover:scale-[1.01] ${
                      isDarkMode ? "bg-emerald-900/15 border-emerald-700/30 hover:border-emerald-600/50" : "bg-emerald-50 border-emerald-200 hover:border-emerald-300"
                    }`}>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>{skill.name}</span>
                        {user?.verifiedSkills?.includes(skill.name) && <VerificationBadge size="sm" />}
                      </div>
                      <StarRater skill={skill} type="teach" accent={isDarkMode ? "text-emerald-400" : "text-emerald-600"} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`text-center py-10 rounded-xl border-2 border-dashed ${isDarkMode ? "border-slate-700 text-slate-500" : "border-emerald-100 text-gray-400"}`}>
                  <p className="text-sm">No teaching skills yet</p>
                </div>
              )}
            </Card>

            {/* Learning */}
            <Card isDarkMode={isDarkMode} className="p-6">
              <SHead isDarkMode={isDarkMode} gradient="from-indigo-500 to-violet-600"
                title="Skills I Learn" sub={`${learnSkills.length} skill${learnSkills.length !== 1 ? "s" : ""}`}
                icon={<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>}
              />
              {learnSkills.length > 0 ? (
                <div className="space-y-2.5">
                  {learnSkills.map((skill, i) => (
                    <div key={i} className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-200 hover:scale-[1.01] ${
                      isDarkMode ? "bg-indigo-900/15 border-indigo-700/30 hover:border-indigo-600/50" : "bg-indigo-50 border-indigo-200 hover:border-indigo-300"
                    }`}>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>{skill.name}</span>
                        {user?.verifiedSkills?.includes(skill.name) && <VerificationBadge size="sm" />}
                      </div>
                      <StarRater skill={skill} type="learn" accent={isDarkMode ? "text-indigo-400" : "text-indigo-600"} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`text-center py-10 rounded-xl border-2 border-dashed ${isDarkMode ? "border-slate-700 text-slate-500" : "border-indigo-100 text-gray-400"}`}>
                  <p className="text-sm">No learning goals yet</p>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>

      {/* ══ Edit Modal ════════════════════════════════════ */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`relative rounded-2xl border w-full max-w-xl max-h-[92vh] overflow-hidden flex flex-col ${
            isDarkMode
              ? "bg-[#0a0f1e] border-indigo-500/20 shadow-2xl shadow-indigo-500/10"
              : "bg-white border-indigo-200 shadow-2xl shadow-indigo-200/50"
          }`}>
            {/* Header */}
            <div className={`flex items-center justify-between px-6 py-4 border-b flex-shrink-0 ${isDarkMode ? "border-slate-800" : "border-indigo-100"}`}>
              <h3 className={`text-xl font-black bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600 bg-clip-text text-transparent`}>
                Edit Profile
              </h3>
              <button onClick={() => setIsEditing(false)}
                className={`p-2 rounded-xl transition-all duration-200 hover:rotate-90 ${isDarkMode ? "text-slate-400 hover:text-white hover:bg-slate-800" : "text-gray-400 hover:text-gray-700 hover:bg-indigo-50"}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-6 py-4" style={{ scrollbarWidth: "thin" }}>
              <EditProfile
                key={isEditing}
                form={form} setForm={setForm}
                onSubmit={handleSubmit} loading={loading}
                certificateFiles={certificateFiles} setCertificateFiles={setCertificateFiles}
                certificatePreviews={certificatePreviews} setCertificatePreviews={setCertificatePreviews}
                onDeleteCertificate={handleDeleteCertificate}
                onRemoveCertificate={idx => setForm({ ...form, certificates: (form.certificates||[]).filter((_,i)=>i!==idx) })}
                videoFile={videoFile} setVideoFile={setVideoFile}
                removeVideo={removeVideo} setRemoveVideo={setRemoveVideo}
              />
            </div>
          </div>
        </div>
      )}

      {/* ══ Image View Modal ══════════════════════════════ */}
      {showImageModal && user?.profileImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowImageModal(false)}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div className={`relative rounded-2xl border overflow-hidden max-w-md w-full ${
            isDarkMode ? "bg-slate-900 border-indigo-500/20" : "bg-white border-indigo-200"
          }`} onClick={e => e.stopPropagation()}>
            <div className={`flex items-center justify-between p-5 border-b ${isDarkMode ? "border-slate-800" : "border-indigo-100"}`}>
              <h3 className={`font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>Profile Photo</h3>
              <button onClick={() => setShowImageModal(false)}
                className={`p-1.5 rounded-lg transition-all ${isDarkMode ? "text-slate-400 hover:text-white hover:bg-slate-800" : "text-gray-400 hover:text-gray-700 hover:bg-indigo-50"}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 flex justify-center">
              <img src={user.profileImage} alt={user.name} className="w-64 h-64 rounded-2xl object-cover shadow-xl" />
            </div>
            <div className={`flex gap-3 p-5 border-t ${isDarkMode ? "border-slate-800" : "border-indigo-100"}`}>
              <label htmlFor="profile-upload-modal"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 cursor-pointer transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Change Photo
              </label>
              <input id="profile-upload-modal" type="file" accept="image/*" className="hidden" onChange={handleProfileImageChange} />
              <button onClick={() => { setShowImageModal(false); handleRemoveProfileImage(); }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-red-400 border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
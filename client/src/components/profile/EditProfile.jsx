// client/src/components/profile/EditProfile.jsx
import React, { useRef } from "react";
import Spinner from "../common/Spinner";
import { useTheme } from "../../hooks/useTheme";

const AVAILABILITY_SLOTS = [
  { id: "morning",   label: "Morning",   icon: "🌅" },
  { id: "afternoon", label: "Afternoon", icon: "☀️" },
  { id: "evening",   label: "Evening",   icon: "🌆" },
  { id: "night",     label: "Night",     icon: "🌙" },
  { id: "weekdays",  label: "Weekdays",  icon: "📅" },
  { id: "weekends",  label: "Weekends",  icon: "🎉" },
  { id: "flexible",  label: "Flexible",  icon: "⚡" },
];

const EXPERIENCE_LEVELS = [
  { id: "beginner",     label: "Beginner",     icon: "🌱", desc: "Just starting out" },
  { id: "intermediate", label: "Intermediate", icon: "⚡", desc: "Comfortable & growing" },
  { id: "advanced",     label: "Advanced",     icon: "🔥", desc: "Expert level mastery" },
];

/* ── tiny section wrapper ───────────────────────────────── */
function Section({ title, emoji, children, isDarkMode }) {
  return (
    <div className={`rounded-2xl border p-5 space-y-4 ${
      isDarkMode
        ? "bg-slate-800/50 border-slate-700/50"
        : "bg-white border-indigo-100 shadow-sm"
    }`}>
      <h4 className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${
        isDarkMode ? "text-indigo-400" : "text-indigo-600"
      }`}>
        <span>{emoji}</span>{title}
      </h4>
      {children}
    </div>
  );
}

export default function EditProfile({
  form, setForm, onSubmit, loading = false,
  certificateFiles, setCertificateFiles,
  certificatePreviews, setCertificatePreviews,
  onDeleteCertificate, onRemoveCertificate,
  videoFile, setVideoFile, removeVideo, setRemoveVideo,
}) {
  const { isDarkMode } = useTheme();
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const [existingCerts, setExistingCerts] = React.useState(form.certificates || form.skillCertificates || []);
  const [langInput, setLangInput] = React.useState("");

  React.useEffect(() => {
    setExistingCerts(form.certificates || form.skillCertificates || []);
  }, [form.certificates, form.skillCertificates]);

  const location = form.location || {};
  const setLocation = (key, val) => setForm({ ...form, location: { ...location, [key]: val } });

  const availability = form.availability || [];
  const toggleAvailability = (slot) => {
    const updated = availability.includes(slot)
      ? availability.filter((s) => s !== slot)
      : [...availability, slot];
    setForm({ ...form, availability: updated });
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    Promise.all(files.map(f => new Promise(resolve => {
      const r = new FileReader();
      r.onloadend = () => resolve(r.result);
      r.readAsDataURL(f);
    }))).then(results => {
      setCertificateFiles(p => [...p, ...files]);
      setCertificatePreviews(p => [...p, ...results]);
    });
    e.target.value = "";
  };

  const handleVideoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 105000000) return alert("Video should be under 100MB");
      setVideoFile(file);
      setRemoveVideo(false);
    }
    e.target.value = "";
  };

  const handleAddLanguage = (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const val = langInput.trim();
    if (val && !(form.languages || []).includes(val))
      setForm({ ...form, languages: [...(form.languages || []), val] });
    setLangInput("");
  };

  const removeLanguage = (idx) => {
    const langs = [...(form.languages || [])];
    langs.splice(idx, 1);
    setForm({ ...form, languages: langs });
  };

  const handleDeleteFile = (i) => {
    setCertificateFiles(certificateFiles.filter((_, idx) => idx !== i));
    setCertificatePreviews((certificatePreviews || []).filter((_, idx) => idx !== i));
  };

  const handleDeleteExistingCert = async (cert, i) => {
    try {
      setExistingCerts(existingCerts.filter((_, idx) => idx !== i));
      if (onDeleteCertificate) await onDeleteCertificate(i);
    } catch {
      setExistingCerts([...existingCerts]);
    }
  };

  // ── Shared classes ──────────────────────────────────────
  const inputCls = isDarkMode
    ? "w-full px-4 py-2.5 rounded-xl border border-slate-600/60 bg-slate-900/60 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/60 transition-all duration-200 text-sm"
    : "w-full px-4 py-2.5 rounded-xl border border-indigo-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/40 focus:border-indigo-400 transition-all duration-200 text-sm";

  const labelCls = `block text-xs font-semibold mb-1.5 ${isDarkMode ? "text-slate-300" : "text-gray-700"}`;

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-lg mx-auto" encType="multipart/form-data">

      {/* Personal Info */}
      <Section title="Personal Info" emoji="👤" isDarkMode={isDarkMode}>
        <div>
          <label className={labelCls}>Full Name</label>
          <input className={inputCls} type="text" placeholder="Your full name"
            value={form.name || ""} onChange={e => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className={labelCls}>Email Address</label>
          <input className={`${inputCls} opacity-50 cursor-not-allowed`} type="email"
            value={form.email || ""} disabled />
        </div>
        <div>
          <label className={labelCls}>Role / Title</label>
          <input className={inputCls} type="text" placeholder="e.g., Developer, Designer"
            value={form.role || ""} onChange={e => setForm({ ...form, role: e.target.value })} />
        </div>
        <div>
          <label className={labelCls}>Bio</label>
          <textarea className={inputCls} rows={3}
            placeholder="Tell others about yourself — interests, goals, what you can teach or learn."
            value={form.bio || ""} onChange={e => setForm({ ...form, bio: e.target.value })} />
        </div>
      </Section>

      {/* Expertise */}
      <Section title="Expertise" emoji="🎓" isDarkMode={isDarkMode}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Learning Style</label>
            <select className={inputCls} value={form.learningStyle || ""}
              onChange={e => setForm({ ...form, learningStyle: e.target.value })}>
              <option value="">Select...</option>
              {["Visual","Auditory","Reading/Writing","Hands-on","Interactive"].map(o =>
                <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Teaching Style</label>
            <select className={inputCls} value={form.teachingStyle || ""}
              onChange={e => setForm({ ...form, teachingStyle: e.target.value })}>
              <option value="">Select...</option>
              {["Hands-on","Lecture-based","Project-based","Step-by-step guidance","Discussion-based"].map(o =>
                <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Years of Experience</label>
            <input className={inputCls} type="number" min="0" placeholder="e.g., 3"
              value={form.yearsOfExperience || ""} onChange={e => setForm({ ...form, yearsOfExperience: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>Languages (press Enter)</label>
            <input className={inputCls} type="text" placeholder="e.g., English"
              value={langInput} onChange={e => setLangInput(e.target.value)} onKeyDown={handleAddLanguage} />
            {(form.languages || []).length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.languages.map((lang, idx) => (
                  <span key={idx} className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${
                    isDarkMode ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                               : "bg-indigo-100 text-indigo-700 border border-indigo-200"
                  }`}>
                    {lang}
                    <button type="button" onClick={() => removeLanguage(idx)}
                      className="w-3.5 h-3.5 rounded-full hover:text-red-400 transition-colors">&times;</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </Section>

      {/* Social Links */}
      <Section title="Social Links" emoji="🔗" isDarkMode={isDarkMode}>
        {[
          { label: "LinkedIn", key: "linkedinUrl", ph: "https://linkedin.com/in/username" },
          { label: "Twitter / X", key: "twitterUrl", ph: "https://twitter.com/username" },
          { label: "GitHub", key: "githubUrl", ph: "https://github.com/username" },
          { label: "Portfolio", key: "portfolioUrl", ph: "https://yourwebsite.com" },
        ].map(({ label, key, ph }) => (
          <div key={key}>
            <label className={labelCls}>{label}</label>
            <input className={inputCls} type="url" placeholder={ph}
              value={form[key] || ""} onChange={e => setForm({ ...form, [key]: e.target.value })} />
          </div>
        ))}
      </Section>

      {/* Location */}
      <Section title="Location" emoji="📍" isDarkMode={isDarkMode}>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>City</label>
            <input className={inputCls} type="text" placeholder="e.g., Vadodara"
              value={location.city || ""} onChange={e => setLocation("city", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Country</label>
            <input className={inputCls} type="text" placeholder="e.g., India"
              value={location.country || ""} onChange={e => setLocation("country", e.target.value)} />
          </div>
        </div>
      </Section>

      {/* Experience Level */}
      <Section title="Experience Level" emoji="🏆" isDarkMode={isDarkMode}>
        <div className="grid grid-cols-3 gap-2">
          {EXPERIENCE_LEVELS.map(lvl => {
            const isActive = (form.experienceLevel || "").toLowerCase() === lvl.id;
            return (
              <button key={lvl.id} type="button"
                onClick={() => setForm({ ...form, experienceLevel: isActive ? "" : lvl.id })}
                className={`relative flex flex-col items-center p-3 rounded-xl border-2 text-center transition-all duration-200 ${
                  isActive
                    ? isDarkMode
                      ? "bg-indigo-500/20 border-indigo-400 text-indigo-300 shadow-lg shadow-indigo-500/20 scale-[1.04]"
                      : "bg-indigo-50 border-indigo-400 text-indigo-700 shadow-lg shadow-indigo-200/60 scale-[1.04]"
                    : isDarkMode
                      ? "bg-slate-700/30 border-slate-600/50 text-slate-400 hover:border-slate-500"
                      : "bg-gray-50 border-gray-200 text-gray-500 hover:border-indigo-200"
                }`}>
                {isActive && (
                  <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                <div className="text-xl mb-1">{lvl.icon}</div>
                <div className="font-bold text-xs">{lvl.label}</div>
                <div className={`text-[10px] mt-0.5 ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}>{lvl.desc}</div>
              </button>
            );
          })}
        </div>
      </Section>

      {/* Availability */}
      <Section title="Availability" emoji="🕐" isDarkMode={isDarkMode}>
        <div className="flex flex-wrap gap-2">
          {AVAILABILITY_SLOTS.map(slot => {
            const isActive = availability.includes(slot.id);
            return (
              <button key={slot.id} type="button" onClick={() => toggleAvailability(slot.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? isDarkMode
                      ? "bg-indigo-500/20 border-indigo-400/60 text-indigo-300 scale-[1.04]"
                      : "bg-indigo-100 border-indigo-400 text-indigo-700 scale-[1.04]"
                    : isDarkMode
                      ? "bg-slate-700/40 border-slate-600/50 text-slate-400 hover:border-slate-500"
                      : "bg-gray-50 border-gray-200 text-gray-500 hover:border-indigo-200"
                }`}>
                <span>{slot.icon}</span><span>{slot.label}</span>
              </button>
            );
          })}
        </div>
        {availability.length > 0 && (
          <p className={`text-xs font-medium ${isDarkMode ? "text-indigo-400" : "text-indigo-600"}`}>
            ✓ {availability.length} slot{availability.length > 1 ? "s" : ""} selected
          </p>
        )}
      </Section>

      {/* Certificates */}
      <Section title="Skill Certificates" emoji="🏅" isDarkMode={isDarkMode}>
        <input ref={fileInputRef} type="file" accept="image/*,.pdf" multiple onChange={handleFileSelect} className="hidden" />
        <button type="button" onClick={() => fileInputRef.current.click()}
          className={`w-full py-3 rounded-xl border-2 border-dashed text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
            isDarkMode
              ? "border-indigo-500/40 text-indigo-400 hover:border-indigo-400/70 hover:bg-indigo-500/10"
              : "border-indigo-300 text-indigo-500 hover:border-indigo-400 hover:bg-indigo-50"
          }`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Upload Certificate / Image
        </button>

        {((certificateFiles?.length || 0) + (existingCerts?.length || 0)) > 0 && (
          <div className="space-y-2">
            {existingCerts.map((cert, i) => {
              const isObj = cert && typeof cert === "object" && cert.fileUrl;
              const url = isObj ? cert.fileUrl : cert;
              const type = isObj ? cert.fileType : (/\.(jpg|jpeg|png|gif|webp)$/i.test(url) ? "image" : "pdf");
              const name = isObj ? cert.fileName : (url?.split("/").pop() || "Certificate");
              const isPdf = type === "pdf" || type === "document";
              return (
                <div key={`ex-${i}`} className={`flex items-center gap-3 p-3 rounded-xl border ${
                  isDarkMode ? "bg-slate-700/40 border-slate-600/40" : "bg-indigo-50/60 border-indigo-100"
                }`}>
                  {isPdf ? (
                    <div className="w-9 h-9 bg-red-500/15 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  ) : (
                    <img src={url} alt="cert" className="w-9 h-9 object-cover rounded-lg flex-shrink-0" />
                  )}
                  <span className={`flex-1 text-xs truncate ${isDarkMode ? "text-slate-300" : "text-gray-600"}`}>{name}</span>
                  <a href={url} target="_blank" rel="noopener noreferrer"
                    className="text-xs px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-400 hover:text-blue-300 transition">
                    View
                  </a>
                  <button type="button" onClick={() => handleDeleteExistingCert(cert, i)}
                    className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              );
            })}
            {certificateFiles?.map((file, i) => (
              <div key={`new-${i}`} className={`flex items-center gap-3 p-3 rounded-xl border ${
                isDarkMode ? "bg-indigo-900/20 border-indigo-700/30" : "bg-indigo-50 border-indigo-200"
              }`}>
                {file.type?.includes("image") ? (
                  <img src={certificatePreviews?.[i]} alt="preview" className="w-9 h-9 object-cover rounded-lg flex-shrink-0" />
                ) : (
                  <div className="w-9 h-9 bg-red-500/15 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                <span className={`flex-1 text-xs truncate ${isDarkMode ? "text-slate-300" : "text-gray-600"}`}>{file.name}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                  isDarkMode ? "bg-indigo-500/20 text-indigo-300" : "bg-indigo-100 text-indigo-600"
                }`}>New</span>
                <button type="button" onClick={() => handleDeleteFile(i)}
                  className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Showcase Video */}
      <Section title="Skill Showcase Video" emoji="🎥" isDarkMode={isDarkMode}>
        <p className={`text-xs ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
          Upload a short video showcasing your skills (mp4, mov, webm — max 100MB)
        </p>
        <input ref={videoInputRef} type="file" accept="video/mp4,video/quicktime,video/webm"
          onChange={handleVideoSelect} className="hidden" />
        {!videoFile && (!form.skillShowcaseVideo || removeVideo) ? (
          <button type="button" onClick={() => videoInputRef.current.click()}
            className={`w-full py-3 rounded-xl border-2 border-dashed text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
              isDarkMode
                ? "border-violet-500/40 text-violet-400 hover:border-violet-400/70 hover:bg-violet-500/10"
                : "border-violet-300 text-violet-500 hover:border-violet-400 hover:bg-violet-50"
            }`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Upload Showcase Video
          </button>
        ) : (
          <div className="relative rounded-xl overflow-hidden border border-indigo-500/30 bg-black/40">
            <video src={videoFile ? URL.createObjectURL(videoFile) : form.skillShowcaseVideo}
              controls className="w-full max-h-48 object-cover" />
            <button type="button" onClick={() => { setVideoFile(null); setRemoveVideo(true); }}
              className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 text-white rounded-full p-1.5 shadow backdrop-blur-sm transition-all z-10">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </Section>

      {/* Submit */}
      <button type="submit" disabled={loading}
        className="w-full py-3.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600 hover:from-indigo-400 hover:via-violet-400 hover:to-purple-500 text-white font-bold rounded-xl transition-all duration-300 hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/30">
        {loading ? (
          <><Spinner size={20} color="#fff" /> Saving...</>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Save Changes
          </>
        )}
      </button>
    </form>
  );
}

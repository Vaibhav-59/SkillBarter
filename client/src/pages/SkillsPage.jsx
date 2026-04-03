import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { showSuccess, showError } from "../utils/toast";
import SkillList from "../components/profile/SkillList";
import { useTheme } from "../hooks/useTheme";
import { updateProfile } from "../redux/slices/userSlice";

/* ── shared card ─────────────────────────────────────── */
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

/* ── spinner ─────────────────────────────────────────── */
function Spin() {
  return (
    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

export default function SkillsPage() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { isDarkMode } = useTheme();

  const [teachSkill, setTeachSkill] = useState("");
  const [teachLevel, setTeachLevel] = useState("Beginner");
  const [learnSkill, setLearnSkill] = useState("");
  const [learnLevel, setLearnLevel] = useState("Beginner");
  const [skills,       setSkills]       = useState([]);
  const [learnSkills,  setLearnSkills]  = useState([]);
  const [verifiedSkills, setVerifiedSkills] = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [learnLoading, setLearnLoading] = useState(false);

  /* ── input / select style tokens ─────────────────── */
  const inputCls = isDarkMode
    ? "w-full px-4 py-3 rounded-xl border border-slate-600/50 bg-slate-900/60 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/60 transition-all duration-200 text-sm"
    : "w-full px-4 py-3 rounded-xl border border-indigo-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/40 focus:border-indigo-400 transition-all duration-200 text-sm";

  /* ── fetch ────────────────────────────────────────── */
  const fetchSkills = async () => {
    try {
      const res = await api.get("/users/me");
      setSkills(res.data?.teachSkills || []);
      setLearnSkills(res.data?.learnSkills || []);
      setVerifiedSkills(res.data?.verifiedSkills || []);
    } catch { showError("Failed to load skills"); }
  };

  useEffect(() => { fetchSkills(); }, []);

  /* ── add / remove ─────────────────────────────────── */
  const addSkill = async () => {
    if (!teachSkill || !teachLevel) return;
    setLoading(true);
    try {
      await api.post("/skills/teach", { name: teachSkill, level: teachLevel });
      showSuccess("Skill added");
      setTeachSkill(""); setTeachLevel("Beginner");
      await fetchSkills();
      const res = await api.get("/users/me");
      dispatch(updateProfile({ teachSkills: res.data.teachSkills, learnSkills: res.data.learnSkills }));
    } catch (err) { showError(err.response?.data?.message || "Error adding skill"); }
    finally { setLoading(false); }
  };

  const removeSkill = async (name) => {
    try {
      await api.delete(`/skills/teach?name=${encodeURIComponent(name)}`);
      showSuccess("Skill removed");
      const updated = skills.filter(s => s.name !== name);
      setSkills(updated);
      dispatch(updateProfile({ teachSkills: updated }));
    } catch { showError("Failed to remove skill"); }
  };

  const addLearnSkill = async () => {
    if (!learnSkill || !learnLevel) return;
    setLearnLoading(true);
    try {
      await api.post("/skills/learn", { name: learnSkill, level: learnLevel });
      showSuccess("Learn skill added");
      setLearnSkill(""); setLearnLevel("Beginner");
      await fetchSkills();
      const res = await api.get("/users/me");
      dispatch(updateProfile({ teachSkills: res.data.teachSkills, learnSkills: res.data.learnSkills }));
    } catch (err) { showError(err.response?.data?.message || "Error adding learn skill"); }
    finally { setLearnLoading(false); }
  };

  const removeLearnSkill = async (name) => {
    try {
      await api.delete(`/skills/learn?name=${encodeURIComponent(name)}`);
      showSuccess("Learn skill removed");
      const updated = learnSkills.filter(s => s.name !== name);
      setLearnSkills(updated);
      dispatch(updateProfile({ learnSkills: updated }));
    } catch { showError("Failed to remove learn skill"); }
  };

  /* ── shared add-form ─────────────────────────────── */
  const AddForm = ({ value, onChange, level, onLevel, onAdd, isLoading, placeholder, accent }) => (
    <div className={`rounded-xl border p-4 mb-6 space-y-3 ${
      isDarkMode
        ? `bg-${accent}-900/10 border-${accent}-700/25`
        : `bg-${accent}-50/60 border-${accent}-100`
    }`}
      style={{
        background: isDarkMode
          ? (accent === "emerald" ? "rgba(6,78,59,0.12)" : "rgba(49,46,129,0.12)")
          : (accent === "emerald" ? "rgba(236,253,245,0.6)"  : "rgba(238,242,255,0.6)"),
        border: `1px solid ${isDarkMode
          ? (accent === "emerald" ? "rgba(16,185,129,0.2)" : "rgba(99,102,241,0.2)")
          : (accent === "emerald" ? "rgba(167,243,208,0.8)" : "rgba(199,210,254,0.8)")}`,
      }}>
      <input
        type="text"
        placeholder={placeholder}
        className={inputCls}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => e.key === "Enter" && onAdd()}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <select value={level} onChange={e => onLevel(e.target.value)} className={`${inputCls} appearance-none pr-9`}>
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>
          <svg className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${isDarkMode ? "text-slate-400" : "text-gray-400"}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        <button onClick={onAdd} disabled={isLoading || !value.trim()}
          className="group relative flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600 hover:from-indigo-400 hover:via-violet-400 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.02] disabled:hover:scale-100 overflow-hidden shadow-md shadow-indigo-500/20">
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          <span className="relative z-10 flex items-center gap-2">
            {isLoading ? <><Spin />Adding...</> : <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Skill
            </>}
          </span>
        </button>
      </div>
    </div>
  );

  const pageBg = isDarkMode
    ? "bg-[#0a0f1e]"
    : "bg-gradient-to-br from-slate-50 via-indigo-50/40 to-violet-50/30";

  /* ───────────────────────────────────────────────────
     RENDER
  ─────────────────────────────────────────────────── */
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

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ═══ Page Header ════════════════════════════ */}
        <div>
          <h1 className={`text-3xl font-black mb-1 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            My Skills
          </h1>
          <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
            Manage what you teach and what you want to learn
          </p>
        </div>

        {/* ═══ Stat cards ═════════════════════════════ */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: "🎓", val: skills.length,                    label: "Teaching", grad: "from-emerald-500 to-teal-600" },
            { icon: "📚", val: learnSkills.length,               label: "Learning", grad: "from-indigo-500 to-violet-600" },
            { icon: "🎯", val: skills.length + learnSkills.length, label: "Total",    grad: "from-violet-500 to-purple-600" },
          ].map(s => (
            <Card key={s.label} isDarkMode={isDarkMode} className="p-5 text-center group hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">{s.icon}</div>
              <div className={`text-2xl font-black bg-gradient-to-r ${s.grad} bg-clip-text text-transparent mb-0.5`}>{s.val}</div>
              <div className={`text-xs font-semibold uppercase tracking-wide ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}>{s.label}</div>
            </Card>
          ))}
        </div>

        {/* ═══ Teaching + Learning columns ════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Teaching Skills */}
          <Card isDarkMode={isDarkMode} className="p-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg flex-shrink-0">
                <span className="text-white text-lg">🎓</span>
              </div>
              <div>
                <h2 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>Skills I Teach</h2>
                <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>Share your expertise with others</p>
              </div>
            </div>

            {/* Add form */}
            <AddForm
              value={teachSkill} onChange={setTeachSkill}
              level={teachLevel} onLevel={setTeachLevel}
              onAdd={addSkill} isLoading={loading}
              placeholder="Enter skill name…"
              accent="emerald"
            />

            {/* List */}
            {skills.length > 0 ? (
              <SkillList skills={skills} verifiedSkills={verifiedSkills} editable onRemove={removeSkill} />
            ) : (
              <div className={`text-center py-10 rounded-xl border-2 border-dashed ${
                isDarkMode ? "border-slate-700 text-slate-500" : "border-emerald-100 text-gray-400"
              }`}>
                <span className="text-3xl block mb-2">🎯</span>
                <p className="text-sm font-medium">No teaching skills yet</p>
                <p className="text-xs mt-0.5 opacity-70">Add your first skill above</p>
              </div>
            )}
          </Card>

          {/* Learning Skills */}
          <Card isDarkMode={isDarkMode} className="p-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg flex-shrink-0">
                <span className="text-white text-lg">📚</span>
              </div>
              <div>
                <h2 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>Skills I Want to Learn</h2>
                <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>Discover new areas of knowledge</p>
              </div>
            </div>

            {/* Add form */}
            <AddForm
              value={learnSkill} onChange={setLearnSkill}
              level={learnLevel} onLevel={setLearnLevel}
              onAdd={addLearnSkill} isLoading={learnLoading}
              placeholder="Enter skill you want to learn…"
              accent="indigo"
            />

            {/* List */}
            {learnSkills.length > 0 ? (
              <SkillList skills={learnSkills} verifiedSkills={verifiedSkills} editable onRemove={removeLearnSkill} />
            ) : (
              <div className={`text-center py-10 rounded-xl border-2 border-dashed ${
                isDarkMode ? "border-slate-700 text-slate-500" : "border-indigo-100 text-gray-400"
              }`}>
                <span className="text-3xl block mb-2">🎯</span>
                <p className="text-sm font-medium">No learning goals yet</p>
                <p className="text-xs mt-0.5 opacity-70">Add skills you want to master</p>
              </div>
            )}
          </Card>
        </div>

        {/* ═══ Explore Skills & Experts Banner ════════ */}
        <div className={`relative overflow-hidden rounded-3xl border ${
          isDarkMode
            ? "bg-slate-800/60 border-indigo-500/20"
            : "bg-white border-indigo-100 shadow-xl shadow-indigo-100/30"
        }`}>
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/8 via-violet-500/5 to-purple-500/8 pointer-events-none" />
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-indigo-500/8 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 p-7 lg:p-10">
            <div className="flex flex-col lg:flex-row items-center gap-8">

              {/* Left: text */}
              <div className="flex-1 text-center lg:text-left">
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold mb-4 border ${
                  isDarkMode ? "bg-indigo-500/15 border-indigo-500/30 text-indigo-300" : "bg-indigo-50 border-indigo-200 text-indigo-600"
                }`}>
                  <span>🌟</span> Featured Section
                </div>

                <h2 className={`text-3xl lg:text-4xl font-black mb-3 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  Explore Skills &{" "}
                  <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600 bg-clip-text text-transparent">
                    Find Experts
                  </span>
                </h2>
                <p className={`text-lg mb-6 max-w-lg mx-auto lg:mx-0 ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
                  Discover all skills on the platform and connect with verified experts who can teach them
                </p>

                {/* Feature bullets */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                  {[
                    { icon: "🔍", text: "Search any skill" },
                    { icon: "👨‍🏫", text: "Browse expert profiles" },
                    { icon: "⭐", text: "See ratings & reviews" },
                    { icon: "🤝", text: "Send match requests" },
                  ].map(f => (
                    <div key={f.text} className={`flex items-center gap-3 p-3 rounded-xl border text-sm font-medium ${
                      isDarkMode
                        ? "bg-slate-700/40 border-slate-600/40 text-slate-300"
                        : "bg-indigo-50/60 border-indigo-100 text-gray-700"
                    }`}>
                      <span className="text-lg">{f.icon}</span>{f.text}
                    </div>
                  ))}
                </div>

                <button
                  id="btn-explore-skills"
                  onClick={() => navigate("/skills/explore")}
                  className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600 hover:from-indigo-400 hover:via-violet-400 hover:to-purple-500 text-white font-bold text-lg rounded-2xl transition-all duration-300 hover:scale-105 shadow-2xl shadow-indigo-500/25 overflow-hidden relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <span className="relative z-10 flex items-center gap-3">
                    🚀 Explore Skills & Experts
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </button>
              </div>

              {/* Right: mini skill grid */}
              <div className="hidden lg:grid grid-cols-2 gap-3 w-60 flex-shrink-0">
                {[
                  { icon: "⚡", name: "JavaScript", experts: 5, color: "from-yellow-400 to-orange-500" },
                  { icon: "🐍", name: "Python",     experts: 8, color: "from-blue-400 to-cyan-500" },
                  { icon: "⚛️", name: "React",      experts: 6, color: "from-cyan-400 to-blue-500" },
                  { icon: "🎨", name: "UI/UX",      experts: 3, color: "from-pink-400 to-rose-500" },
                ].map(sk => (
                  <div key={sk.name} onClick={() => navigate("/skills/explore")}
                    className={`p-4 rounded-2xl border text-center cursor-pointer transition-all duration-300 hover:scale-105 hover:-translate-y-1 ${
                      isDarkMode
                        ? "bg-slate-700/50 border-slate-600/50 hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/10"
                        : "bg-indigo-50/50 border-indigo-100 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-100/60"
                    }`}>
                    <div className={`w-10 h-10 mx-auto mb-2 rounded-xl bg-gradient-to-br ${sk.color} flex items-center justify-center text-xl shadow-md`}>
                      {sk.icon}
                    </div>
                    <p className={`text-xs font-bold mb-0.5 ${isDarkMode ? "text-white" : "text-gray-800"}`}>{sk.name}</p>
                    <p className={`text-[10px] ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>{sk.experts} experts</p>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

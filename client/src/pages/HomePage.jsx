import React from "react";
import { useTheme } from "../hooks/useTheme";
import { Link } from "react-router-dom";

// ── Inline Icon Components ────────────────────────────────────────
const Icon = ({ d: path, cls = "w-5 h-5" }) => (
  <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={path} />
  </svg>
);

const SunIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" /></svg>;
const MoonIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>;

// ── Platform Features / Pages Showcase data ──────────────────────
const PLATFORM_FEATURES = [
  {
    emoji: "🏆",
    label: "Skill Hub",
    desc: "Your central hub for skill discovery, gamification, challenges, learning paths, group sessions, and more.",
    path: "/skill-hub",
    color: "indigo",
    tags: ["Gamification", "Challenges", "Learning Path", "Group Sessions"],
  },
  {
    emoji: "💬",
    label: "Community",
    desc: "Engage in topic-based discussions, share knowledge, ask questions, post insights and collaborate with peers.",
    path: "/community",
    color: "violet",
    tags: ["Posts", "Q&A", "Trending Topics", "Saved Posts"],
  },
  {
    emoji: "📅",
    label: "Session Scheduler",
    desc: "Schedule live 1-on-1 or group skill-exchange sessions. Integrated reminders, calendar view, and smart scheduling.",
    path: "/sessions",
    color: "blue",
    tags: ["Calendar", "Reminders", "1-on-1", "Group"],
  },
  {
    emoji: "🎥",
    label: "Live Meetings",
    desc: "Join real-time video meetings with your skill partners. HD video, screen share, and whiteboard included.",
    path: "/meeting",
    color: "emerald",
    tags: ["HD Video", "Screen Share", "Whiteboard", "Real-time"],
  },
  {
    emoji: "💡",
    label: "Skill Matches",
    desc: "Our AI matching algorithm connects you with the perfect skill partners based on your goals and expertise.",
    path: "/matches",
    color: "teal",
    tags: ["AI Matching", "Smart Filter", "Partner Discovery"],
  },
  {
    emoji: "📚",
    label: "Learning Resources",
    desc: "A curated library of educational resources, articles, tutorials, and guides across hundreds of skill domains.",
    path: "/resources",
    color: "amber",
    tags: ["Articles", "Tutorials", "Guides", "Curated"],
  },
  {
    emoji: "📝",
    label: "Smart Contracts",
    desc: "Create binding digital learning agreements with milestones, deliverables, and transparent progress tracking.",
    path: "/contracts",
    color: "rose",
    tags: ["Agreements", "Milestones", "Progress", "Binding"],
  },
  {
    emoji: "💬",
    label: "Real-time Chat",
    desc: "Private messaging with file sharing, voice notes, and emoji reactions. Stay connected with your learning partners.",
    path: "/chat",
    color: "purple",
    tags: ["Voice Notes", "Files", "Reactions", "Real-time"],
  },
  {
    emoji: "⭐",
    label: "Reviews & Ratings",
    desc: "Read and leave detailed reviews for skill sessions. Build trust through transparent community-verified ratings.",
    path: "/reviews",
    color: "yellow",
    tags: ["Verified Reviews", "Ratings", "Feedback", "Trust"],
  },
];

const COLOR_MAP = {
  indigo:  { dark: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",  light: "text-indigo-600 bg-indigo-50 border-indigo-200",  grad: "from-indigo-500 to-violet-500",   glow: "shadow-indigo-500/20", hoverBorderDark: "hover:border-indigo-500/30", hoverBorderLight: "hover:border-indigo-300", bgLightGrad: "from-indigo-50/50", hoverTextDark: "group-hover:text-indigo-400", hoverTextLight: "group-hover:text-indigo-600", textDark: "text-indigo-400", textLight: "text-indigo-600" },
  violet:  { dark: "text-violet-400 bg-violet-500/10 border-violet-500/20",  light: "text-violet-600 bg-violet-50 border-violet-200",  grad: "from-violet-500 to-purple-500",   glow: "shadow-violet-500/20", hoverBorderDark: "hover:border-violet-500/30", hoverBorderLight: "hover:border-violet-300", bgLightGrad: "from-violet-50/50", hoverTextDark: "group-hover:text-violet-400", hoverTextLight: "group-hover:text-violet-600", textDark: "text-violet-400", textLight: "text-violet-600" },
  blue:    { dark: "text-blue-400 bg-blue-500/10 border-blue-500/20",        light: "text-blue-600 bg-blue-50 border-blue-200",        grad: "from-blue-500 to-indigo-500",     glow: "shadow-blue-500/20", hoverBorderDark: "hover:border-blue-500/30", hoverBorderLight: "hover:border-blue-300", bgLightGrad: "from-blue-50/50", hoverTextDark: "group-hover:text-blue-400", hoverTextLight: "group-hover:text-blue-600", textDark: "text-blue-400", textLight: "text-blue-600" },
  emerald: { dark: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",light:"text-emerald-600 bg-emerald-50 border-emerald-200",grad: "from-emerald-500 to-teal-500",   glow: "shadow-emerald-500/20", hoverBorderDark: "hover:border-emerald-500/30", hoverBorderLight: "hover:border-emerald-300", bgLightGrad: "from-emerald-50/50", hoverTextDark: "group-hover:text-emerald-400", hoverTextLight: "group-hover:text-emerald-600", textDark: "text-emerald-400", textLight: "text-emerald-600" },
  teal:    { dark: "text-teal-400 bg-teal-500/10 border-teal-500/20",        light: "text-teal-600 bg-teal-50 border-teal-200",        grad: "from-teal-500 to-emerald-500",   glow: "shadow-teal-500/20", hoverBorderDark: "hover:border-teal-500/30", hoverBorderLight: "hover:border-teal-300", bgLightGrad: "from-teal-50/50", hoverTextDark: "group-hover:text-teal-400", hoverTextLight: "group-hover:text-teal-600", textDark: "text-teal-400", textLight: "text-teal-600" },
  amber:   { dark: "text-amber-400 bg-amber-500/10 border-amber-500/20",     light: "text-amber-600 bg-amber-50 border-amber-200",     grad: "from-amber-500 to-orange-500",   glow: "shadow-amber-500/20", hoverBorderDark: "hover:border-amber-500/30", hoverBorderLight: "hover:border-amber-300", bgLightGrad: "from-amber-50/50", hoverTextDark: "group-hover:text-amber-400", hoverTextLight: "group-hover:text-amber-600", textDark: "text-amber-400", textLight: "text-amber-600" },
  rose:    { dark: "text-rose-400 bg-rose-500/10 border-rose-500/20",        light: "text-rose-600 bg-rose-50 border-rose-200",        grad: "from-rose-500 to-red-500",       glow: "shadow-rose-500/20", hoverBorderDark: "hover:border-rose-500/30", hoverBorderLight: "hover:border-rose-300", bgLightGrad: "from-rose-50/50", hoverTextDark: "group-hover:text-rose-400", hoverTextLight: "group-hover:text-rose-600", textDark: "text-rose-400", textLight: "text-rose-600" },
  purple:  { dark: "text-purple-400 bg-purple-500/10 border-purple-500/20",  light: "text-purple-600 bg-purple-50 border-purple-200",  grad: "from-purple-500 to-indigo-500",  glow: "shadow-purple-500/20", hoverBorderDark: "hover:border-purple-500/30", hoverBorderLight: "hover:border-purple-300", bgLightGrad: "from-purple-50/50", hoverTextDark: "group-hover:text-purple-400", hoverTextLight: "group-hover:text-purple-600", textDark: "text-purple-400", textLight: "text-purple-600" },
  yellow:  { dark: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",  light: "text-yellow-600 bg-yellow-50 border-yellow-200",  grad: "from-yellow-500 to-amber-500",   glow: "shadow-yellow-500/20", hoverBorderDark: "hover:border-yellow-500/30", hoverBorderLight: "hover:border-yellow-300", bgLightGrad: "from-yellow-50/50", hoverTextDark: "group-hover:text-yellow-400", hoverTextLight: "group-hover:text-yellow-600", textDark: "text-yellow-400", textLight: "text-yellow-600" },
};

const STATS = [
  { value: "10K+", label: "Active Learners",  grad: "from-indigo-400 to-violet-500" },
  { value: "500+", label: "Skills Available", grad: "from-violet-400 to-purple-500" },
  { value: "95%",  label: "Success Rate",     grad: "from-emerald-400 to-teal-500" },
  { value: "30+",  label: "Platform Features",grad: "from-blue-400 to-indigo-500" },
];

const HOW_IT_WORKS = [
  { emoji: "🎯", step: "01", title: "Create Your Profile", desc: "Sign up and tell us what skills you have to offer and what you want to learn. Our AI does the rest." },
  { emoji: "🤝", step: "02", title: "Get Matched Instantly", desc: "Our intelligent matching engine connects you with the perfect skill-exchange partners in your area of interest." },
  { emoji: "📅", step: "03", title: "Schedule & Meet", desc: "Book live video sessions, join group classes, or collaborate async — on your own terms and schedule." },
  { emoji: "🌟", step: "04", title: "Grow & Earn XP", desc: "Complete sessions, earn achievement badges, climb leaderboards, and watch your skills grow with every interaction." },
];

const TESTIMONIALS = [
  {
    name: "Sarah Chen",
    role: "UI/UX → Full-Stack Designer",
    duration: "6 months on SkillBarter",
    initials: "SC",
    grad: "from-indigo-500 to-violet-500",
    quote: "SkillBarter completely transformed my career! I taught design and learned coding from incredible developers. Now I'm a full-stack designer earning 40% more. The community here is absolutely incredible!",
  },
  {
    name: "Marcus Johnson",
    role: "Marketing → Growth Expert",
    duration: "1 year on SkillBarter",
    initials: "MJ",
    grad: "from-emerald-500 to-teal-500",
    quote: "The connections I've made here are invaluable. I've mastered photography, data analytics, and psychology while teaching digital marketing. It's not just learning — it's building lifelong professional bonds.",
  },
  {
    name: "Priya Sharma",
    role: "Data Analyst → ML Engineer",
    duration: "8 months on SkillBarter",
    initials: "PS",
    grad: "from-violet-500 to-purple-500",
    quote: "The Skill Hub's gamification and challenges kept me motivated like never before. Learning paths are brilliant — I went from spreadsheets to building ML models in under a year!",
  },
];

// ── FeatureCard ──────────────────────────────────────────────────
function FeatureCard({ feature, d }) {
  const c = COLOR_MAP[feature.color] || COLOR_MAP.indigo;
  return (
    <Link to={feature.path} className={`group relative flex flex-col gap-4 p-6 rounded-2xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${c.glow} overflow-hidden cursor-pointer ${d ? `bg-[#0d1120]/80 border-white/5 ${c.hoverBorderDark}` : `bg-white border-slate-200/70 ${c.hoverBorderLight}`}`}>
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-gradient-to-br ${d ? "from-white/[0.02] to-transparent" : `${c.bgLightGrad} to-transparent`}`} />
      <div className={`absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500 bg-gradient-to-r ${c.grad} rounded-full`} />
      
      <div className="flex items-start gap-4 relative">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl border ${d ? c.dark : c.light}`}>
          {feature.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`text-base font-bold mb-1 transition-colors ${d ? `text-slate-100 ${c.hoverTextDark}` : `text-slate-800 ${c.hoverTextLight}`}`}>
            {feature.label}
          </h3>
          <p className={`text-sm leading-relaxed ${d ? "text-slate-400" : "text-slate-500"}`}>
            {feature.desc}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 relative">
        {feature.tags.map(tag => (
          <span key={tag} className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide ${d ? c.dark : c.light}`}>
            {tag}
          </span>
        ))}
      </div>

      <div className={`flex items-center gap-1.5 text-xs font-bold relative transition-colors ${d ? c.textDark : c.textLight}`}>
        Explore feature
        <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7"/></svg>
      </div>
    </Link>
  );
}

// ── Main HomePage ────────────────────────────────────────────────
export default function HomePage() {
  const { theme, toggleTheme, isDarkMode: d } = useTheme();

  return (
    <div className={`min-h-screen w-full relative overflow-x-hidden transition-all duration-500 ${d ? "bg-[#060912]" : "bg-slate-50"}`}>
      
      {/* Background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-0">
        <div className={`absolute -top-60 -right-60 w-[500px] h-[500px] rounded-full blur-3xl animate-pulse ${d ? "bg-indigo-600/10" : "bg-indigo-200/50"}`} />
        <div className={`absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl animate-pulse delay-1000 ${d ? "bg-violet-600/10" : "bg-violet-200/40"}`} />
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl ${d ? "bg-indigo-500/5" : "bg-indigo-100/30"}`} />
        {/* Fine dot grid */}
        <div className={`absolute inset-0 ${d ? "opacity-[0.04]" : "opacity-[0.07]"}`} style={{ backgroundImage: `radial-gradient(circle at 2px 2px, ${d ? "rgb(99,102,241)" : "rgb(99,102,241)"} 1px, transparent 0)`, backgroundSize: "36px 36px" }} />
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
      </div>

      {/* ── NAVBAR ────────────────────────────────────────────── */}
      <nav className={`relative z-20 border-b backdrop-blur-xl transition-colors duration-300 ${d ? "bg-[#060912]/80 border-white/5" : "bg-white/80 border-slate-200/60"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 text-white font-black text-lg">S</div>
            <span className="text-xl font-black bg-gradient-to-r from-indigo-500 to-violet-600 bg-clip-text text-transparent">SkillBarter</span>
          </div>

          {/* Nav links */}
          <div className={`hidden md:flex items-center gap-1 rounded-xl p-1.5 ${d ? "bg-white/[0.03] border border-white/5" : "bg-slate-100/80 border border-slate-200/50"}`}>
            {[
              { label: "Features", path: "#features" },
              { label: "How it Works", path: "/how-it-works" },
              { label: "About", path: "/about" },
              { label: "Contact", path: "/contact" }
            ].map((l) => (
              l.path.startsWith("#") ? (
                <a key={l.label} href={l.path}
                   className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 ${d ? "text-slate-400 hover:text-white hover:bg-white/5" : "text-slate-600 hover:text-slate-900 hover:bg-white"}`}>
                  {l.label}
                </a>
              ) : (
                <Link key={l.label} to={l.path}
                   className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 ${d ? "text-slate-400 hover:text-white hover:bg-white/5" : "text-slate-600 hover:text-slate-900 hover:bg-white"}`}>
                  {l.label}
                </Link>
              )
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme}
              className={`p-2 rounded-xl border transition-all hover:scale-105 ${d ? "bg-white/5 border-white/10 text-yellow-400 hover:border-yellow-500/30" : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300"}`}>
              {d ? <SunIcon /> : <MoonIcon />}
            </button>
            <Link to="/login" className={`hidden md:block text-sm font-semibold px-4 py-2 rounded-xl transition-colors ${d ? "text-slate-300 hover:text-white" : "text-slate-700 hover:text-indigo-600"}`}>
              Sign In
            </Link>
            <Link to="/login"
              className="relative bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-indigo-500/40 transition-all hover:scale-105 overflow-hidden group">
              <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <span className="relative">Get Started</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-16 text-center">
        {/* Badge */}
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold uppercase tracking-widest mb-8 ${d ? "bg-indigo-500/10 border-indigo-500/25 text-indigo-300" : "bg-indigo-50 border-indigo-200 text-indigo-600"}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
          Platform v2.0 — 30+ Features Live
        </div>

        <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6">
          <span className={`block ${d ? "bg-gradient-to-br from-white via-slate-100 to-slate-300 bg-clip-text text-transparent" : "text-slate-900"}`}>
            Learn Together.
          </span>
          <span className="block bg-gradient-to-r from-indigo-400 via-violet-500 to-purple-500 bg-clip-text text-transparent mt-1">
            Grow Faster.
          </span>
        </h1>

        <p className={`text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-10 ${d ? "text-slate-400" : "text-slate-600"}`}>
          Elevate your career with <span className="font-semibold bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">peer-powered learning</span>. 
          Connect, exchange skills, join challenges, and grow with a community built for real collaboration.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          <Link to="/login"
            className="relative group bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-bold px-10 py-4 rounded-2xl text-base hover:shadow-2xl hover:shadow-indigo-500/40 transition-all duration-300 hover:scale-105 flex items-center gap-2 overflow-hidden">
            <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <span className="relative">🚀 Get Started Free</span>
            <span className="relative group-hover:translate-x-1 transition-transform">→</span>
          </Link>
          <Link to="/login"
            className={`font-bold px-10 py-4 rounded-2xl text-base border transition-all duration-300 hover:scale-105 flex items-center gap-2 ${d ? "border-white/10 text-slate-300 hover:bg-white/5 hover:border-indigo-500/40" : "border-slate-200 text-slate-700 hover:bg-white hover:border-indigo-300 bg-white"}`}>
            👋 Sign In
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((s, i) => (
            <div key={i} className={`group rounded-2xl border p-5 transition-all duration-300 hover:scale-105 cursor-pointer ${d ? "bg-[#0d1120]/80 border-white/5 hover:border-indigo-500/20" : "bg-white border-slate-200/70 hover:border-indigo-200 shadow-sm hover:shadow-md"}`}>
              <div className={`text-3xl font-black bg-gradient-to-r ${s.grad} bg-clip-text text-transparent mb-1`}>{s.value}</div>
              <div className={`text-xs font-semibold ${d ? "text-slate-400" : "text-slate-500"}`}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────── */}
      <section id="how-it-works" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-12">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-widest mb-4 ${d ? "bg-violet-500/10 border-violet-500/25 text-violet-300" : "bg-violet-50 border-violet-200 text-violet-600"}`}>
            How it works
          </div>
          <h2 className={`text-3xl md:text-4xl font-black mb-3 ${d ? "text-white" : "text-slate-900"}`}>Your Learning Journey</h2>
          <p className={`text-base max-w-2xl mx-auto ${d ? "text-slate-400" : "text-slate-600"}`}>
            From signup to skill mastery — everything is designed to be simple, intuitive, and rewarding.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {HOW_IT_WORKS.map((item, i) => (
            <div key={i} className={`group relative p-6 rounded-2xl border transition-all duration-300 hover:scale-[1.02] ${d ? "bg-[#0d1120]/80 border-white/5 hover:border-indigo-500/20" : "bg-white border-slate-200/70 hover:border-indigo-200 shadow-sm"}`}>
              <div className={`text-xs font-black mb-3 ${d ? "text-indigo-400/50" : "text-indigo-300"}`}>Step {item.step}</div>
              <div className="text-3xl mb-3">{item.emoji}</div>
              <h3 className={`text-base font-bold mb-2 ${d ? "text-white" : "text-slate-800"}`}>{item.title}</h3>
              <p className={`text-sm leading-relaxed ${d ? "text-slate-400" : "text-slate-500"}`}>{item.desc}</p>
              {i < HOW_IT_WORKS.length - 1 && (
                <div className={`hidden md:block absolute top-1/2 -right-3 w-6 h-px ${d ? "bg-indigo-500/30" : "bg-indigo-200"}`} />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES / PAGES SHOWCASE ─────────────────────────── */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-12">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-widest mb-4 ${d ? "bg-indigo-500/10 border-indigo-500/25 text-indigo-300" : "bg-indigo-50 border-indigo-200 text-indigo-600"}`}>
            Platform Features
          </div>
          <h2 className={`text-3xl md:text-4xl font-black mb-3 ${d ? "text-white" : "text-slate-900"}`}>Everything You Need to Grow</h2>
          <p className={`text-base max-w-2xl mx-auto ${d ? "text-slate-400" : "text-slate-600"}`}>
            30+ powerful features spanning skill exchange, live collaboration, gamification, community, and intelligent matching — all in one platform.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PLATFORM_FEATURES.map((f) => (
            <FeatureCard key={f.label} feature={f} d={d} />
          ))}
        </div>
      </section>

      {/* ── EXPERT MATCHING BANNER ─────────────────────────────── */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className={`relative overflow-hidden rounded-3xl border p-8 md:p-12 ${d ? "bg-gradient-to-br from-indigo-500/10 to-violet-600/10 border-indigo-500/20" : "bg-gradient-to-br from-indigo-50 to-violet-50 border-indigo-200"}`}>
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4 ${d ? "bg-indigo-500/15 text-indigo-300" : "bg-indigo-100 text-indigo-700"}`}>
                🔍 Explore Experts
              </div>
              <h2 className={`text-2xl md:text-3xl font-black mb-3 ${d ? "text-white" : "text-slate-900"}`}>Find Skill Experts Near You</h2>
              <p className={`text-sm mb-6 leading-relaxed ${d ? "text-slate-400" : "text-slate-600"}`}>
                Browse verified experts across 500+ skills. View expert profiles, session history, peer reviews, and book a session instantly.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/skills/explore"
                  className="bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-bold px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all hover:scale-105">
                  Browse Experts →
                </Link>
                <Link to="/skills"
                  className={`text-sm font-bold px-6 py-3 rounded-xl border transition-all hover:scale-105 ${d ? "border-white/10 text-slate-300 hover:bg-white/5" : "border-slate-200 text-slate-700 bg-white hover:border-indigo-300"}`}>
                  My Skills
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { emoji: "🎨", skill: "UI/UX Design",    experts: "42 Experts" },
                { emoji: "⚛️", skill: "React / Next.js",  experts: "78 Experts" },
                { emoji: "📊", skill: "Data Science",     experts: "55 Experts" },
                { emoji: "🤖", skill: "Machine Learning", experts: "31 Experts" },
              ].map((s) => (
                <Link to="/skills/explore" key={s.skill}
                  className={`group p-4 rounded-xl border text-center transition-all hover:scale-105 ${d ? "bg-white/[0.03] border-white/5 hover:border-indigo-500/30" : "bg-white border-slate-200 hover:border-indigo-300 shadow-sm"}`}>
                  <div className="text-2xl mb-1">{s.emoji}</div>
                  <div className={`text-sm font-bold ${d ? "text-slate-200" : "text-slate-800"}`}>{s.skill}</div>
                  <div className={`text-xs mt-0.5 ${d ? "text-indigo-400" : "text-indigo-600"}`}>{s.experts}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────── */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-12">
          <h2 className={`text-3xl md:text-4xl font-black mb-3 ${d ? "text-white" : "text-slate-900"}`}>Success Stories</h2>
          <p className={`text-base ${d ? "text-slate-400" : "text-slate-600"}`}>Real people. Real transformations. Real results.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className={`group relative p-6 rounded-2xl border transition-all duration-300 hover:scale-[1.02] overflow-hidden ${d ? "bg-[#0d1120]/80 border-white/5 hover:border-indigo-500/20" : "bg-white border-slate-200/70 hover:border-indigo-200 shadow-sm hover:shadow-md"}`}>
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br ${d ? "from-white/[0.02]" : "from-indigo-50/50"} to-transparent pointer-events-none`} />
              <div className={`absolute bottom-0 left-0 h-px w-0 group-hover:w-full transition-all duration-500 bg-gradient-to-r ${t.grad}`} />
              <div className="flex items-center gap-3 mb-4 relative">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg bg-gradient-to-br ${t.grad} shadow-md`}>
                  {t.initials}
                </div>
                <div>
                  <div className={`text-sm font-bold ${d ? "text-white" : "text-slate-800"}`}>{t.name}</div>
                  <div className={`text-xs font-semibold bg-gradient-to-r ${t.grad} bg-clip-text text-transparent`}>{t.role}</div>
                  <div className={`text-[10px] ${d ? "text-slate-500" : "text-slate-400"}`}>{t.duration}</div>
                </div>
              </div>
              <div className="flex gap-0.5 mb-3 relative">
                {[...Array(5)].map((_, j) => <span key={j} className="text-yellow-400 text-sm">★</span>)}
              </div>
              <p className={`text-sm leading-relaxed italic relative ${d ? "text-slate-300" : "text-slate-600"}`}>"{t.quote}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA SECTION ──────────────────────────────────────── */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className={`relative overflow-hidden rounded-3xl border p-10 md:p-16 ${d ? "bg-gradient-to-br from-indigo-500/10 to-violet-600/10 border-indigo-500/20" : "bg-gradient-to-br from-indigo-50 to-violet-50 border-indigo-200"}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-violet-500/5 pointer-events-none" />
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6 ${d ? "bg-indigo-500/15 text-indigo-300" : "bg-indigo-100 text-indigo-700"}`}>
            ✨ Ready to Start?
          </div>
          <h2 className={`text-3xl md:text-5xl font-black mb-4 relative ${d ? "text-white" : "text-slate-900"}`}>
            Your Journey Starts Now
          </h2>
          <p className={`text-base md:text-lg mb-8 max-w-2xl mx-auto leading-relaxed relative ${d ? "text-slate-400" : "text-slate-600"}`}>
            Join thousands of professionals transforming their careers through 
            <span className="font-bold bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent"> skill exchange</span>.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-6 relative">
            <Link to="/login"
              className="group relative bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-bold px-10 py-4 rounded-2xl text-base hover:shadow-2xl hover:shadow-indigo-500/40 transition-all hover:scale-105 flex items-center gap-2 overflow-hidden">
              <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <span className="relative">⚡ Start Learning Today</span>
              <span className="relative group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
          <div className={`flex flex-wrap justify-center gap-6 text-sm relative ${d ? "text-slate-400" : "text-slate-500"}`}>
            <span className="flex items-center gap-1.5"><span>💳</span> No credit card required</span>
            <span className="flex items-center gap-1.5"><span>🎯</span> First match in minutes</span>
            <span className="flex items-center gap-1.5"><span>🌟</span> Join 10,000+ learners</span>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────── */}
      <footer className={`relative z-10 border-t transition-colors duration-300 ${d ? "bg-[#060912] border-white/5" : "bg-white border-slate-200/60"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid md:grid-cols-5 gap-10 mb-10">
            {/* Branding */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-500/25">S</div>
                <span className="text-lg font-black bg-gradient-to-r from-indigo-500 to-violet-600 bg-clip-text text-transparent">SkillBarter</span>
              </div>
              <p className={`text-sm leading-relaxed max-w-xs mb-5 ${d ? "text-slate-400" : "text-slate-600"}`}>
                Empowering professional growth through collaborative learning and meaningful connections in our global community.
              </p>
              <div className="flex gap-3">
                {["💼", "🌐", "📧", "📱"].map((icon, i) => (
                  <div key={i} className={`w-9 h-9 rounded-xl flex items-center justify-center border cursor-pointer transition-all hover:scale-110 ${d ? "bg-white/5 border-white/10 hover:border-indigo-500/40" : "bg-slate-50 border-slate-200 hover:border-indigo-300"}`}>
                    <span className="text-base">{icon}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Platform */}
            <div>
              <h4 className={`text-xs font-black uppercase tracking-widest mb-4 ${d ? "text-slate-300" : "text-slate-700"}`}>Platform</h4>
              <div className={`space-y-2.5 text-sm ${d ? "text-slate-500" : "text-slate-500"}`}>
                {[["Skill Hub", "/skill-hub"], ["Community", "/community"], ["Sessions", "/sessions"], ["Live Meetings", "/meeting"], ["Resources", "/resources"]].map(([l, p]) => (
                  <Link key={l} to={p} className={`flex items-center gap-1.5 transition-all hover:translate-x-1 ${d ? "hover:text-indigo-400" : "hover:text-indigo-600"}`}>
                    <span className="text-xs opacity-50">→</span> {l}
                  </Link>
                ))}
              </div>
            </div>

            {/* Features */}
            <div>
              <h4 className={`text-xs font-black uppercase tracking-widest mb-4 ${d ? "text-slate-300" : "text-slate-700"}`}>Features</h4>
              <div className={`space-y-2.5 text-sm ${d ? "text-slate-500" : "text-slate-500"}`}>
                {[["Skill Matches", "/matches"], ["Challenges", "/skill-hub/challenges"], ["Gamification", "/skill-hub/gamification"], ["Smart Contracts", "/contracts"], ["Real-time Chat", "/chat"]].map(([l, p]) => (
                  <Link key={l} to={p} className={`flex items-center gap-1.5 transition-all hover:translate-x-1 ${d ? "hover:text-violet-400" : "hover:text-violet-600"}`}>
                    <span className="text-xs opacity-50">→</span> {l}
                  </Link>
                ))}
              </div>
            </div>

            {/* Company */}
            <div>
              <h4 className={`text-xs font-black uppercase tracking-widest mb-4 ${d ? "text-slate-300" : "text-slate-700"}`}>Company</h4>
              <div className={`space-y-2.5 text-sm ${d ? "text-slate-500" : "text-slate-500"}`}>
                {["About Us", "Careers", "Blog", "Privacy Policy", "Terms of Service"].map(l => (
                  <div key={l} className={`flex items-center gap-1.5 cursor-pointer transition-all hover:translate-x-1 ${d ? "hover:text-teal-400" : "hover:text-teal-600"}`}>
                    <span className="text-xs opacity-50">→</span> {l}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={`pt-6 border-t flex flex-col md:flex-row items-center justify-between gap-3 text-xs font-semibold ${d ? "border-white/5 text-slate-600" : "border-slate-100 text-slate-400"}`}>
            <span>© 2025 SkillBarter. All rights reserved.</span>
            <span className={`px-3 py-1 rounded-full border ${d ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-emerald-50 text-emerald-600 border-emerald-200"}`}>
              🟢 All systems operational
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
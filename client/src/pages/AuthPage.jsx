import { useState, useContext } from "react";
import LoginForm from "../components/auth/LoginForm";
import RegisterForm from "../components/auth/RegisterForm";
import { ThemeContext } from "../contexts/ThemeContext";
import { Link } from "react-router-dom";

const SunIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
  </svg>
);
const MoonIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
  </svg>
);

export default function AuthPage() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const d = theme === "dark";
  const [mode, setMode] = useState("login");

  return (
    <div className={`min-h-screen relative flex items-center justify-center p-4 transition-colors duration-500 overflow-hidden ${d ? "bg-[#060912]" : "bg-slate-50"}`}>

      {/* Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-60 -right-40 w-[700px] h-[700px] rounded-full blur-3xl animate-pulse transition-colors duration-700 ${d ? "bg-indigo-600/10" : "bg-indigo-300/25"}`} />
        <div className={`absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full blur-3xl transition-colors duration-700 ${d ? "bg-violet-500/6" : "bg-violet-200/40"}`} />
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-3xl transition-colors duration-700 ${d ? "bg-emerald-500/4" : "bg-emerald-200/25"}`} />
        <div className={`absolute inset-0 transition-opacity duration-500 ${d ? "opacity-[0.04]" : "opacity-[0.06]"}`}
          style={{ backgroundImage: "radial-gradient(circle at 2px 2px, rgb(99,102,241) 1px, transparent 0)", backgroundSize: "36px 36px" }} />
        {/* micro particles */}
        <div className={`absolute top-28 left-20 w-2 h-2 rounded-full animate-pulse ${d ? "bg-indigo-400/40" : "bg-indigo-500/50"}`} />
        <div className={`absolute top-52 right-28 w-1.5 h-1.5 rounded-full animate-pulse delay-150 ${d ? "bg-violet-400/30" : "bg-violet-500/40"}`} />
        <div className={`absolute bottom-44 left-1/3 w-2 h-2 rounded-full animate-pulse delay-300 ${d ? "bg-emerald-400/30" : "bg-emerald-500/40"}`} />
      </div>

      {/* Theme Toggle */}
      <button onClick={toggleTheme}
        className={`fixed top-5 right-5 z-50 p-2.5 rounded-xl border transition-all duration-300 hover:scale-105 ${d ? "bg-white/5 border-white/10 text-yellow-300 hover:bg-white/10" : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300 shadow-sm"}`}>
        {d ? <SunIcon /> : <MoonIcon />}
      </button>

      {/* Back to Home */}
      <Link to="/" className={`fixed top-5 left-5 z-50 flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-semibold transition-all duration-300 hover:scale-105 ${d ? "bg-white/5 border-white/10 text-slate-300 hover:text-white" : "bg-white border-slate-200 text-slate-600 hover:text-indigo-600 shadow-sm"}`}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Home
      </Link>

      {/* Two-column Card */}
      <div className={`relative z-10 w-full rounded-3xl overflow-hidden transition-all duration-500 grid lg:grid-cols-2 ${mode === "login" ? "max-w-5xl" : "max-w-5xl"} ${d ? "shadow-[0_0_80px_-20px_rgba(99,102,241,0.3)]" : "shadow-2xl shadow-slate-300/50"}`}>

        {/* LEFT: Branding Panel */}
        <div className="relative hidden lg:flex flex-col justify-center items-center p-14 overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700">
          <div className="absolute top-10 right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-pulse" />
          <div className="absolute bottom-16 left-10 w-32 h-32 bg-white/8 rounded-full blur-xl" />
          <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)", backgroundSize: "40px 40px" }} />

          <div className="relative z-10 text-center max-w-xs">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm border border-white/30 rounded-3xl mb-8 shadow-2xl">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h1 className="text-4xl font-black text-white mb-4 leading-tight">
              {mode === "login" ? "Welcome Back." : "Join the Exchange."}
            </h1>
            <p className="text-white/80 text-lg leading-relaxed mb-10">
              {mode === "login"
                ? "Your skills, your community, your journey — all here."
                : "Thousands of learners are ready to swap skills with you."}
            </p>
            <div className="space-y-3 text-left">
              {[
                { icon: "🔒", text: "Secure & privacy-first" },
                { icon: "⚡", text: "AI-powered skill matching" },
                { icon: "🌟", text: "Live HD video sessions" },
                { icon: "🏆", text: "XP, badges & leaderboards" },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/15 border border-white/20 rounded-full flex items-center justify-center flex-shrink-0">{icon}</div>
                  <span className="text-white/90 font-medium text-sm">{text}</span>
                </div>
              ))}
            </div>
            <div className="mt-10 pt-8 border-t border-white/20">
              <p className="text-white/60 text-sm">{mode === "login" ? "Don't have an account?" : "Already have an account?"}</p>
              <button onClick={() => setMode(mode === "login" ? "register" : "login")}
                className="mt-1.5 text-white font-bold underline underline-offset-4 hover:text-white/80 transition-colors text-sm">
                {mode === "login" ? "Create one free →" : "Sign in →"}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: Form Panel */}
        <div className={`relative flex flex-col justify-center px-8 py-10 lg:px-14 lg:py-12 transition-colors duration-500 ${d ? "bg-[#0d1120]/95 border-l border-indigo-500/10" : "bg-white border-l border-slate-100"}`}>
          {/* Accent line */}
          <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r transition-all duration-500 ${mode === "login" ? "from-indigo-500 to-violet-500" : "from-emerald-400 to-teal-500"}`} />

          {/* Mobile header */}
          <div className="lg:hidden flex items-center justify-between mb-8">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <span className="text-white font-black text-sm">S</span>
              </div>
              <span className="text-lg font-black bg-gradient-to-r from-indigo-500 to-violet-600 bg-clip-text text-transparent">SkillBarter</span>
            </div>
            <button onClick={() => setMode(mode === "login" ? "register" : "login")}
              className={`text-sm font-semibold ${d ? "text-slate-400 hover:text-indigo-400" : "text-slate-500 hover:text-indigo-600"}`}>
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </div>

          <div className={`w-full ${mode === "register" ? "max-w-md" : "max-w-sm"} mx-auto transition-all duration-300`}>
            {mode === "login"
              ? <LoginForm isDarkMode={d} onSwitchMode={() => setMode("register")} />
              : <RegisterForm isDarkMode={d} onSwitchMode={() => setMode("login")} />}
          </div>
        </div>
      </div>
    </div>
  );
}

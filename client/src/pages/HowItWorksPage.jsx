import React from "react";
import { useTheme } from "../hooks/useTheme";
import { Link } from "react-router-dom";

// Standard icon components
const SunIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" /></svg>;
const MoonIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>;

const STEPS = [
  {
    step: "01",
    title: "Create Your Profile",
    desc: "Tell us what skills you possess and what you wish to learn. Provide a brief bio and set your preferred learning style.",
    emoji: "📝",
    color: "from-indigo-400 to-indigo-600",
    bgDark: "bg-indigo-500/10 border-indigo-500/20",
    bgLight: "bg-indigo-50 border-indigo-200"
  },
  {
    step: "02",
    title: "Smart AI Matching",
    desc: "Our intelligent engine scans the community and surfaces perfect skill-exchange partners who want what you have, and have what you want.",
    emoji: "🤖",
    color: "from-violet-400 to-purple-600",
    bgDark: "bg-violet-500/10 border-violet-500/20",
    bgLight: "bg-violet-50 border-violet-200"
  },
  {
    step: "03",
    title: "Schedule & Verify",
    desc: "Message your matches securely, align on a learning schedule, and optionally sign a digital smart contract to formalize your mutual goals.",
    emoji: "📅",
    color: "from-blue-400 to-sky-600",
    bgDark: "bg-blue-500/10 border-blue-500/20",
    bgLight: "bg-blue-50 border-blue-200"
  },
  {
    step: "04",
    title: "Meet & Collaborate",
    desc: "Join high-definition live video sessions natively through our platform. Utilize screen sharing, whiteboarding, and record sessions for later review.",
    emoji: "🎥",
    color: "from-emerald-400 to-teal-600",
    bgDark: "bg-emerald-500/10 border-emerald-500/20",
    bgLight: "bg-emerald-50 border-emerald-200"
  },
  {
    step: "05",
    title: "Review & Grow",
    desc: "After sessions end, leave transparent community reviews. Earn XP, gain badges, and unlock new challenges across the Skill Hub.",
    emoji: "📈",
    color: "from-yellow-400 to-amber-600",
    bgDark: "bg-yellow-500/10 border-yellow-500/20",
    bgLight: "bg-yellow-50 border-yellow-200"
  }
];

export default function HowItWorksPage() {
  const { theme, toggleTheme, isDarkMode: d } = useTheme();

  return (
    <div className={`min-h-screen w-full relative overflow-x-hidden transition-all duration-500 ${d ? "bg-[#060912]" : "bg-slate-50"}`}>
      {/* Background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-0">
        <div className={`absolute top-20 -left-60 w-[500px] h-[500px] rounded-full blur-3xl animate-pulse ${d ? "bg-emerald-600/10" : "bg-emerald-200/50"}`} />
        <div className={`absolute bottom-40 -right-40 w-[600px] h-[600px] rounded-full blur-3xl rounded-full ${d ? "bg-indigo-500/5" : "bg-indigo-100/30"}`} />
        <div className={`absolute inset-0 ${d ? "opacity-[0.04]" : "opacity-[0.07]"}`} style={{ backgroundImage: `radial-gradient(circle at 2px 2px, ${d ? "rgb(99,102,241)" : "rgb(99,102,241)"} 1px, transparent 0)`, backgroundSize: "36px 36px" }} />
      </div>

      {/* NAVBAR */}
      <nav className={`relative z-20 border-b backdrop-blur-xl transition-colors duration-300 ${d ? "bg-[#060912]/80 border-white/5" : "bg-white/80 border-slate-200/60"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 text-white font-black text-lg">S</div>
            <span className="text-xl font-black bg-gradient-to-r from-indigo-500 to-violet-600 bg-clip-text text-transparent">SkillBarter</span>
          </Link>

          <div className={`hidden md:flex items-center gap-1 rounded-xl p-1.5 ${d ? "bg-white/[0.03] border border-white/5" : "bg-slate-100/80 border border-slate-200/50"}`}>
            {[
              { label: "Home", path: "/" },
              { label: "How it Works", path: "/how-it-works" },
              { label: "About", path: "/about" },
              { label: "Contact", path: "/contact" }
            ].map((l) => (
              <Link key={l.label} to={l.path} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 ${d ? "text-slate-400 hover:text-white hover:bg-white/5" : "text-slate-600 hover:text-slate-900 hover:bg-white"}`}>
                {l.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className={`p-2 rounded-xl border transition-all hover:scale-105 ${d ? "bg-white/5 border-white/10 text-yellow-400 hover:border-yellow-500/30" : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300"}`}>
              {d ? <SunIcon /> : <MoonIcon />}
            </button>
            <Link to="/login" className={`hidden md:block text-sm font-semibold px-4 py-2 rounded-xl border transition-colors ${d ? "text-slate-300 border-white/10 hover:bg-white/5" : "text-slate-700 bg-white border-slate-200 hover:text-indigo-600"}`}>
              Sign In
            </Link>
            <Link to="/register" className="hidden md:block text-sm font-bold bg-gradient-to-r from-indigo-500 to-violet-600 text-white px-4 py-2 rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all">
              Join Free
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-4xl mx-auto px-4 py-16 pb-32">
        <div className="text-center mb-16">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-widest mb-6 ${d ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-300" : "bg-emerald-50 border-emerald-200 text-emerald-600"}`}>
            The Process
          </div>
          <h1 className={`text-4xl md:text-6xl font-black mb-6 leading-tight ${d ? "text-white" : "text-slate-900"}`}>
            How <span className="bg-gradient-to-r from-indigo-400 to-violet-500 bg-clip-text text-transparent">SkillBarter</span> Works.
          </h1>
          <p className={`text-xl max-w-2xl mx-auto leading-relaxed ${d ? "text-slate-400" : "text-slate-600"}`}>
            Our platform is designed to make skill matching, communication, and learning completely frictionless. 
          </p>
        </div>

        <div className="space-y-6">
          {STEPS.map((s, idx) => (
            <div key={idx} className={`group relative flex flex-col md:flex-row gap-6 p-8 rounded-3xl border transition-all duration-300 hover:scale-[1.02] cursor-default ${d ? `${s.bgDark} hover:bg-[#0e1222]` : `${s.bgLight} hover:bg-white shadow-sm`}`}>
              <div className="flex-shrink-0 relative">
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-xl transition-transform duration-500 group-hover:rotate-6 bg-gradient-to-r ${s.color}`}>{s.emoji}</div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`text-sm font-black tracking-widest uppercase bg-gradient-to-r ${s.color} bg-clip-text text-transparent`}>STEP {s.step}</span>
                </div>
                <h3 className={`text-2xl font-bold mb-3 ${d ? "text-white" : "text-slate-900"}`}>{s.title}</h3>
                <p className={`text-lg leading-relaxed ${d ? "text-slate-400" : "text-slate-600"}`}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
            <Link to="/register" className="inline-block bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-bold px-10 py-5 rounded-2xl text-xl hover:shadow-2xl hover:shadow-indigo-500/40 transition-all duration-300 hover:scale-105">
              🚀 Start Your Journey Today
            </Link>
        </div>
      </main>
    </div>
  );
}

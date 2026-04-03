import React from "react";
import { useTheme } from "../hooks/useTheme";
import { Link } from "react-router-dom";

// Standard icon components
const SunIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" /></svg>;
const MoonIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>;

export default function AboutPage() {
  const { theme, toggleTheme, isDarkMode: d } = useTheme();

  return (
    <div className={`min-h-screen w-full relative overflow-x-hidden transition-all duration-500 ${d ? "bg-[#060912]" : "bg-slate-50"}`}>
      {/* Background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-0">
        <div className={`absolute -top-60 -right-60 w-[500px] h-[500px] rounded-full blur-3xl animate-pulse ${d ? "bg-indigo-600/10" : "bg-indigo-200/50"}`} />
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-3xl ${d ? "bg-violet-500/5" : "bg-violet-100/30"}`} />
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
            <Link to="/login" className={`hidden md:block text-sm font-semibold px-4 py-2 rounded-xl transition-colors ${d ? "text-slate-300 hover:text-white" : "text-slate-700 hover:text-indigo-600"}`}>
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-4xl mx-auto px-4 py-20 pb-40">
        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-widest mb-8 ${d ? "bg-violet-500/10 border-violet-500/25 text-violet-300" : "bg-violet-50 border-violet-200 text-violet-600"}`}>
          About Us
        </div>

        <h1 className={`text-4xl md:text-5xl font-black mb-10 leading-tight ${d ? "text-white" : "text-slate-900"}`}>
          Our Mission is to <br />
          <span className="bg-gradient-to-r from-violet-500 to-indigo-500 bg-clip-text text-transparent">Democratize Knowledge</span>
        </h1>

        <div className={`space-y-6 text-lg leading-relaxed ${d ? "text-slate-300" : "text-slate-700"}`}>
          <p>
            Traditional education can be expensive and inaccessible. Meanwhile, millions of talented individuals worldwide hold incredibly valuable skills that they are willing to share — if they could just find someone to learn from in return.
          </p>
          <p>
            <strong>SkillBarter</strong> was born from a simple idea: What if we built an economy based entirely on the exchange of knowledge?
          </p>
          <p>
            Today, our platform connects thousands of learners globally. Whether you are a senior software engineer looking to learn conversational Spanish, or a graphic designer eager to master digital marketing, SkillBarter finds your perfect match.
          </p>

          <div className={`my-12 p-8 rounded-3xl border ${d ? "bg-[#0d1120]/80 border-white/5" : "bg-white shadow-xl border-slate-100"}`}>
            <h2 className={`text-2xl font-bold mb-4 ${d ? "text-white" : "text-slate-900"}`}>Our Core Values</h2>
            <ul className="space-y-4">
              <li className="flex gap-3"><span className="text-xl">🤝</span> <span><strong>Collaboration over Competition:</strong> We believe that we grow fastest when we lift others up.</span></li>
              <li className="flex gap-3"><span className="text-xl">🌍</span> <span><strong>Global Accessibility:</strong> Free skill exchange, unbound by geographical or financial barriers.</span></li>
              <li className="flex gap-3"><span className="text-xl">⭐</span> <span><strong>Quality & Trust:</strong> Transparent ratings, verified reviews, and a supportive, safe ecosystem.</span></li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}

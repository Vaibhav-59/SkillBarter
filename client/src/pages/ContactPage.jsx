import React from "react";
import { useTheme } from "../hooks/useTheme";
import { Link } from "react-router-dom";

// Standard icon components
const SunIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" /></svg>;
const MoonIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>;

export default function ContactPage() {
  const { theme, toggleTheme, isDarkMode: d } = useTheme();

  return (
    <div className={`min-h-screen w-full relative overflow-x-hidden transition-all duration-500 ${d ? "bg-[#060912]" : "bg-slate-50"}`}>
      {/* Background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-0">
        <div className={`absolute -bottom-60 -left-60 w-[500px] h-[500px] rounded-full blur-3xl animate-pulse ${d ? "bg-blue-600/10" : "bg-blue-200/50"}`} />
        <div className={`absolute top-0 right-0 w-[400px] h-[400px] rounded-full blur-3xl ${d ? "bg-violet-500/5" : "bg-violet-100/30"}`} />
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

      <main className="relative z-10 max-w-2xl mx-auto px-4 py-20 pb-40 text-center">
        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-widest mb-8 ${d ? "bg-blue-500/10 border-blue-500/25 text-blue-300" : "bg-blue-50 border-blue-200 text-blue-600"}`}>
          Contact Us
        </div>

        <h1 className={`text-4xl md:text-5xl font-black mb-6 leading-tight ${d ? "text-white" : "text-slate-900"}`}>
          We'd love to hear from you.
        </h1>
        <p className={`text-lg mb-10 ${d ? "text-slate-400" : "text-slate-600"}`}>
          Have a question about a feature? Want to partner with us? Just want to say hello? Drop us a line below.
        </p>

        <form className={`p-8 rounded-3xl border text-left ${d ? "bg-[#0d1120]/80 border-white/5" : "bg-white border-slate-200 shadow-xl"}`}>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${d ? "text-slate-400" : "text-slate-500"}`}>Name</label>
              <input type="text" className={`w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${d ? "bg-[#060912] border-white/10 text-white" : "bg-slate-50 border-slate-200"}`} placeholder="John Doe" />
            </div>
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${d ? "text-slate-400" : "text-slate-500"}`}>Email</label>
              <input type="email" className={`w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${d ? "bg-[#060912] border-white/10 text-white" : "bg-slate-50 border-slate-200"}`} placeholder="john@example.com" />
            </div>
          </div>
          <div className="mb-6">
            <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${d ? "text-slate-400" : "text-slate-500"}`}>Subject</label>
            <input type="text" className={`w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${d ? "bg-[#060912] border-white/10 text-white" : "bg-slate-50 border-slate-200"}`} placeholder="How can we help?" />
          </div>
          <div className="mb-8">
            <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${d ? "text-slate-400" : "text-slate-500"}`}>Message</label>
            <textarea rows={5} className={`w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${d ? "bg-[#060912] border-white/10 text-white" : "bg-slate-50 border-slate-200"}`} placeholder="Your message here..."></textarea>
          </div>
          <button type="button" className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 font-bold text-white py-4 rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all outline-none">
            Send Message 🚀
          </button>
        </form>
      </main>
    </div>
  );
}

import { useContext } from "react";
import { ThemeContext } from "../../contexts/ThemeContext";

const quickLinks = ["About Us", "How It Works", "Success Stories", "Community Guidelines", "Help Center"];
const legalLinks = ["Privacy Policy", "Terms of Service", "Cookie Policy"];
const socials = [
  { name: "Twitter",  emoji: "𝕏",  color: "from-sky-500 to-blue-600" },
  { name: "LinkedIn", emoji: "in", color: "from-blue-600 to-blue-800" },
  { name: "Discord",  emoji: "◈",  color: "from-indigo-500 to-violet-600" },
  { name: "GitHub",   emoji: "⬡",  color: "from-slate-600 to-slate-800" },
];

export default function Footer() {
  const { theme } = useContext(ThemeContext);
  const d = theme === "dark";

  return (
    <footer className={`relative w-full border-t overflow-hidden ${
      d
        ? "bg-[#080c17] border-indigo-500/10"
        : "bg-white border-indigo-100"
    }`}>
      {/* Ambient blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute -bottom-24 -left-24 w-64 h-64 rounded-full blur-3xl ${d ? "bg-indigo-500/5" : "bg-indigo-100/60"}`} />
        <div className={`absolute -bottom-24 -right-24 w-64 h-64 rounded-full blur-3xl ${d ? "bg-violet-500/4" : "bg-violet-100/50"}`} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">

          {/* ── Brand ── */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                </svg>
              </div>
              <span className="text-xl font-black bg-gradient-to-r from-indigo-500 to-violet-600 bg-clip-text text-transparent">
                SkillBarter
              </span>
            </div>
            <p className={`leading-relaxed mb-4 max-w-sm ${d ? "text-slate-400" : "text-slate-500"}`}>
              Connecting passionate learners and skilled teachers worldwide. Build your expertise, share your knowledge, and grow together.
            </p>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
              </span>
              <span className={`font-medium ${d ? "text-indigo-400" : "text-indigo-600"}`}>
                Empowering growth through skill exchange
              </span>
            </div>
          </div>

          {/* ── Quick Links ── */}
          <div>
            <h3 className={`font-bold mb-4 flex items-center gap-2 ${d ? "text-white" : "text-slate-800"}`}>
              <svg className={`w-4 h-4 ${d ? "text-indigo-400" : "text-indigo-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
              </svg>
              Quick Links
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link}>
                  <a href="#"
                    className={`flex items-center gap-2 transition-colors duration-200 group ${
                      d ? "text-slate-400 hover:text-indigo-400" : "text-slate-500 hover:text-indigo-600"
                    }`}>
                    <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-200 ${
                      d ? "bg-slate-700 group-hover:bg-indigo-400" : "bg-slate-300 group-hover:bg-indigo-500"
                    }`} />
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Connect ── */}
          <div>
            <h3 className={`font-bold mb-4 flex items-center gap-2 ${d ? "text-white" : "text-slate-800"}`}>
              <svg className={`w-4 h-4 ${d ? "text-violet-400" : "text-violet-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              Connect
            </h3>

            {/* Socials */}
            <div className="flex gap-2 mb-5">
              {socials.map((s) => (
                <a key={s.name} href="#" title={s.name}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold hover:scale-110 transition-all duration-200 shadow-md bg-gradient-to-br ${s.color}`}>
                  <span className="text-xs">{s.emoji}</span>
                </a>
              ))}
            </div>

            {/* Newsletter */}
            <p className={`mb-2 ${d ? "text-slate-400" : "text-slate-500"}`}>
              Stay updated with features
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className={`flex-1 px-3 py-2 rounded-xl border outline-none transition-all focus:ring-2 ${
                  d
                    ? "bg-slate-800/60 border-indigo-500/20 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-indigo-500/20"
                    : "bg-slate-50 border-indigo-200 text-slate-800 placeholder-slate-400 focus:border-indigo-400 focus:ring-indigo-200/50"
                }`}
              />
              <button className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-semibold rounded-xl transition-all hover:scale-105 shadow-md shadow-indigo-500/25 whitespace-nowrap">
                Join
              </button>
            </div>
          </div>
        </div>

        {/* ── Bottom Bar ── */}
        <div className={`pt-5 border-t ${d ? "border-indigo-500/10" : "border-indigo-100"} flex flex-col md:flex-row items-center justify-between gap-3`}>
          <span className={`${d ? "text-slate-500" : "text-slate-400"}`}>
            © {new Date().getFullYear()} SkillBarter. All rights reserved.
          </span>
          <span className="font-semibold bg-gradient-to-r from-indigo-500 to-violet-600 bg-clip-text text-transparent">
            Learn What You Love. Teach What You Know.
          </span>
          <div className="flex items-center gap-4">
            {legalLinks.map((l) => (
              <a key={l} href="#"
                className={`transition-colors duration-200 ${d ? "text-slate-500 hover:text-indigo-400" : "text-slate-400 hover:text-indigo-600"}`}>
                {l}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
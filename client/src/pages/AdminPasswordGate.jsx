import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";

const ADMIN_PASSWORD = "Vai3538";
const SESSION_KEY = "sb_admin_auth";

// ── tiny icon helper ──────────────────────────────────────────────
const Ico = ({ d: path }) => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={path} />
  </svg>
);

// ── Sun / Moon ────────────────────────────────────────────────────
const SunIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
  </svg>
);
const MoonIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
  </svg>
);

export default function AdminPasswordGate({ onSuccess }) {
  const navigate = useNavigate();
  const { isDarkMode: d, toggleTheme } = useTheme();

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [dots, setDots] = useState([false, false, false, false, false, false, false]);



  // Animate password dots
  useEffect(() => {
    setDots(Array.from({ length: 7 }, (_, i) => i < password.length));
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate slight delay for authenticity
    await new Promise((r) => setTimeout(r, 600));

    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, ADMIN_PASSWORD);
      if (onSuccess) onSuccess();
      setError("");
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setError(
        newAttempts >= 3
          ? `Incorrect password. ${newAttempts} failed attempt${newAttempts !== 1 ? "s" : ""}.`
          : "Incorrect password. Please try again."
      );
      setPassword("");
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }
    setLoading(false);
  };



  // ── Password Gate UI ─────────────────────────────────────────
  return (
    <div
      className={`min-h-screen w-full flex items-center justify-center relative overflow-hidden transition-colors duration-300 ${
        d ? "bg-[#060912]" : "bg-slate-50"
      }`}
    >
      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full blur-3xl animate-pulse ${
            d ? "bg-indigo-600/10" : "bg-indigo-200/40"
          }`}
        />
        <div
          className={`absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full blur-3xl animate-pulse delay-1000 ${
            d ? "bg-violet-600/8" : "bg-violet-200/30"
          }`}
        />
        {/* dot grid */}
        <div
          className={`absolute inset-0 ${d ? "opacity-[0.04]" : "opacity-[0.06]"}`}
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgb(99,102,241) 1px, transparent 0)`,
            backgroundSize: "36px 36px",
          }}
        />
        {/* top accent */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
      </div>

      {/* Theme toggle top-right */}
      <button
        onClick={toggleTheme}
        className={`absolute top-5 right-5 w-9 h-9 rounded-xl border flex items-center justify-center transition-all hover:scale-110 z-10 ${
          d
            ? "bg-white/5 border-white/10 text-yellow-400 hover:border-yellow-500/30"
            : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300"
        }`}
      >
        {d ? <SunIcon /> : <MoonIcon />}
      </button>

      {/* Card */}
      <div
        className={`relative z-10 w-full max-w-sm mx-4 rounded-3xl border shadow-2xl overflow-hidden ${
          d
            ? "bg-[#0d1120]/90 border-indigo-500/20 shadow-indigo-500/10"
            : "bg-white border-indigo-100 shadow-indigo-100"
        }`}
      >
        {/* top accent line */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />

        <div className="p-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/30 mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h1 className={`text-2xl font-black ${d ? "text-white" : "text-slate-900"}`}>
              Admin{" "}
              <span className="bg-gradient-to-r from-indigo-500 to-violet-600 bg-clip-text text-transparent">
                Access
              </span>
            </h1>
            <p className={`text-sm mt-1 ${d ? "text-slate-500" : "text-slate-500"}`}>
              SkillBarter Control Panel
            </p>
          </div>

          {/* Security badge */}
          <div
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl mb-6 border ${
              d
                ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-300"
                : "bg-indigo-50 border-indigo-200 text-indigo-600"
            }`}
          >
            <Ico d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            <span className="text-xs font-bold">Restricted Area · Authorised Only</span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Password input */}
            <div>
              <label
                className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
                  d ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Admin Password
              </label>

              {/* Visual dot indicator */}
              <div
                className={`flex justify-center gap-2.5 mb-3 p-3 rounded-xl border transition-all ${
                  shake ? "animate-[shake_0.3s_ease-in-out]" : ""
                } ${
                  d
                    ? "bg-slate-900/60 border-indigo-500/20"
                    : "bg-slate-50 border-indigo-100"
                }`}
                style={
                  shake
                    ? {
                        animation: "shake 0.4s ease-in-out",
                      }
                    : {}
                }
              >
                {dots.map((filled, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full transition-all duration-200 ${
                      filled
                        ? "bg-gradient-to-br from-indigo-500 to-violet-600 scale-110 shadow-md shadow-indigo-500/30"
                        : d
                        ? "bg-slate-700"
                        : "bg-slate-200"
                    }`}
                  />
                ))}
              </div>

              {/* Actual input */}
              <div className="relative">
                <input
                  id="admin-password-input"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    if (e.target.value.length <= 7) {
                      setPassword(e.target.value);
                      setError("");
                    }
                  }}
                  maxLength={7}
                  placeholder="Enter 7-character password"
                  autoComplete="off"
                  autoFocus
                  className={`w-full px-4 py-3 pr-12 rounded-xl border outline-none font-mono text-center tracking-[0.3em] text-lg transition-all focus:ring-2 ${
                    error
                      ? d
                        ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20 bg-red-500/5 text-red-300"
                        : "border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50 text-red-700"
                      : d
                      ? "bg-[#060912] border-indigo-500/25 text-white focus:border-indigo-500 focus:ring-indigo-500/20 placeholder-slate-700"
                      : "bg-white border-indigo-200 text-slate-800 focus:border-indigo-500 focus:ring-indigo-200 placeholder-slate-300"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${
                    d ? "text-slate-600 hover:text-slate-400" : "text-slate-300 hover:text-slate-600"
                  }`}
                >
                  {showPassword ? (
                    <Ico d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  ) : (
                    <Ico d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  )}
                </button>
              </div>

              {/* Character counter */}
              <div className={`flex justify-end mt-1 text-xs ${d ? "text-slate-600" : "text-slate-400"}`}>
                {password.length}/7
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium ${
                  d
                    ? "bg-red-500/10 border-red-500/20 text-red-400"
                    : "bg-red-50 border-red-200 text-red-600"
                }`}
              >
                <Ico d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                {error}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              id="admin-unlock-btn"
              disabled={loading || password.length === 0}
              className="w-full relative bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-bold py-3.5 rounded-xl transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden group"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
              <span className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Verifying…
                  </>
                ) : (
                  <>
                    <Ico d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    Unlock Admin Panel
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Footer hint */}
          <p className={`text-center text-xs mt-6 ${d ? "text-slate-700" : "text-slate-300"}`}>
            This area is restricted to authorised administrators only.
          </p>
        </div>

        {/* bottom accent */}
        <div className="h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
      </div>

      {/* Back to site link */}
      <button
        onClick={() => navigate("/")}
        className={`absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-sm font-medium transition-colors ${
          d ? "text-slate-600 hover:text-indigo-400" : "text-slate-400 hover:text-indigo-600"
        }`}
      >
        <Ico d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        Back to SkillBarter
      </button>

      {/* Shake keyframe */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
}

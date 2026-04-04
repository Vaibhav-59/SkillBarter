import { useState, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ThemeContext } from "../../contexts/ThemeContext";

const Spinner = () => (
  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
);

const EyeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);

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

const SuccessModal = ({ show, d }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className={`rounded-3xl p-8 max-w-sm w-full shadow-2xl border relative overflow-hidden ${d ? "bg-gradient-to-br from-[#0d1120] to-[#060912] border-indigo-500/30" : "bg-white border-indigo-200"}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-violet-500/5 animate-pulse" />
        <div className="text-center relative z-10">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-indigo-500/40 animate-pulse">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-3xl font-black bg-gradient-to-r from-indigo-400 to-violet-500 bg-clip-text text-transparent mb-3">Password Reset! 🔐</h3>
          <p className={`text-lg mb-6 ${d ? "text-slate-300" : "text-slate-600"}`}>Your password has been reset. Redirecting to login...</p>
          <div className={`w-full rounded-full h-2 overflow-hidden ${d ? "bg-white/5" : "bg-slate-100"}`}>
            <div className="bg-gradient-to-r from-indigo-500 to-violet-600 h-2 rounded-full animate-pulse" style={{ width: "100%" }} />
          </div>
          <div className="flex justify-center space-x-2 mt-4">
            <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce" />
            <div className="w-2.5 h-2.5 bg-violet-500 rounded-full animate-bounce delay-100" />
            <div className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-bounce delay-200" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const d = theme === "dark";

  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const validateField = (name, value) => {
    if (name === "password") {
      if (!value) return "Password is required";
      if (value.length < 6) return "Must be at least 6 characters";
    }
    if (name === "confirmPassword") {
      if (!value) return "Please confirm your password";
      if (value !== form.password) return "Passwords do not match";
    }
    return "";
  };

  const validateForm = () => {
    const e = {};
    Object.keys(form).forEach((k) => {
      const err = validateField(k, form[k]);
      if (err) e[k] = err;
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (name, value) => {
    setForm((p) => ({ ...p, [name]: value }));
    if (touched[name]) setErrors((p) => ({ ...p, [name]: validateField(name, value) }));
  };

  const handleBlur = (name) => {
    setTouched((p) => ({ ...p, [name]: true }));
    setErrors((p) => ({ ...p, [name]: validateField(name, form[name]) }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setTouched({ password: true, confirmPassword: true });
    if (!validateForm()) return;
    setLoading(true);
    setErrors({});
    try {
      const BASE = "https://skillbarter-2.onrender.com/api" || "http://localhost:5000/api";
      const res = await fetch(`${BASE}/auth/reset-password/${token}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to reset password");
      setShowSuccess(true);
      setForm({ password: "", confirmPassword: "" });
      setErrors({}); setTouched({});
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setErrors({ submit: err.message || "Failed to reset password" });
    } finally {
      setLoading(false);
    }
  };

  // Identical input style system as LoginForm & RegisterForm
  const inputBase = d
    ? "w-full px-4 py-3 border rounded-xl focus:outline-none transition-all duration-300 bg-[#060912] text-white placeholder-slate-600"
    : "w-full px-4 py-3 border rounded-xl focus:outline-none transition-all duration-300 bg-slate-50 text-slate-900 placeholder-slate-400";
  const inputNormal = d
    ? `${inputBase} border-white/10 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20`
    : `${inputBase} border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20`;
  const inputErr = `${inputBase} border-red-500/60 focus:ring-2 focus:ring-red-400/20`;
  const getInputCls = (field) => (errors[field] && touched[field] ? inputErr : inputNormal);
  const labelCls = `block text-xs font-bold tracking-wider uppercase mb-1.5 ${d ? "text-slate-400" : "text-slate-500"}`;
  const errorMsg = (field) =>
    errors[field] && touched[field]
      ? <p className="mt-1 text-xs text-red-400 flex items-center gap-1"><span>⚠</span>{errors[field]}</p>
      : null;

  return (
    <div className={`min-h-screen relative flex items-center justify-center p-4 transition-colors duration-500 overflow-hidden ${d ? "bg-[#060912]" : "bg-slate-50"}`}>

      {/* Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-60 -right-40 w-[700px] h-[700px] rounded-full blur-3xl animate-pulse ${d ? "bg-indigo-600/10" : "bg-indigo-300/25"}`} />
        <div className={`absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full blur-3xl ${d ? "bg-violet-500/6" : "bg-violet-200/40"}`} />
        <div className={`absolute inset-0 ${d ? "opacity-[0.04]" : "opacity-[0.06]"}`}
          style={{ backgroundImage: "radial-gradient(circle at 2px 2px, rgb(99,102,241) 1px, transparent 0)", backgroundSize: "36px 36px" }} />
      </div>

      {/* Theme Toggle */}
      <button onClick={toggleTheme}
        className={`fixed top-5 right-5 z-50 p-2.5 rounded-xl border transition-all duration-300 hover:scale-105 ${d ? "bg-white/5 border-white/10 text-yellow-300 hover:bg-white/10" : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300 shadow-sm"}`}>
        {d ? <SunIcon /> : <MoonIcon />}
      </button>

      {/* Back to Login */}
      <Link to="/login"
        className={`fixed top-5 left-5 z-50 flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-semibold transition-all duration-300 hover:scale-105 ${d ? "bg-white/5 border-white/10 text-slate-300 hover:text-white" : "bg-white border-slate-200 text-slate-600 hover:text-indigo-600 shadow-sm"}`}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Login
      </Link>

      {/* Two-column Card — same structure as AuthPage */}
      <div className={`relative z-10 w-full max-w-5xl grid lg:grid-cols-2 rounded-3xl overflow-hidden transition-all duration-500 ${d ? "shadow-[0_0_80px_-20px_rgba(99,102,241,0.3)]" : "shadow-2xl shadow-slate-300/50"}`}>

        {/* LEFT: Branding Panel */}
        <div className="relative hidden lg:flex flex-col justify-center items-center p-14 overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700">
          <div className="absolute top-10 right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-pulse" />
          <div className="absolute bottom-16 left-10 w-32 h-32 bg-white/8 rounded-full blur-xl" />
          <div className="absolute inset-0 opacity-[0.06]"
            style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)", backgroundSize: "40px 40px" }} />

          <div className="relative z-10 text-center max-w-xs">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm border border-white/30 rounded-3xl mb-8 shadow-2xl">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h1 className="text-4xl font-black text-white mb-4 leading-tight">Reset Your Password.</h1>
            <p className="text-white/80 text-lg leading-relaxed mb-10">
              Create a strong new password to keep your account safe and secure.
            </p>
            <div className="space-y-3 text-left">
              {[
                { icon: "🔒", text: "Minimum 6 characters" },
                { icon: "🛡️", text: "Strong encryption" },
                { icon: "⚡", text: "Instant account access" },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/15 border border-white/20 rounded-full flex items-center justify-center flex-shrink-0">{icon}</div>
                  <span className="text-white/90 font-medium text-sm">{text}</span>
                </div>
              ))}
            </div>
            <div className="mt-10 pt-8 border-t border-white/20">
              <p className="text-white/60 text-sm">Remember your password?</p>
              <Link to="/login" className="mt-1.5 inline-block text-white font-bold underline underline-offset-4 hover:text-white/80 transition-colors text-sm">
                Sign in →
              </Link>
            </div>
          </div>
        </div>

        {/* RIGHT: Form Panel */}
        <div className={`relative flex flex-col justify-center px-8 py-10 lg:px-14 lg:py-12 transition-colors duration-500 ${d ? "bg-[#0d1120]/95 border-l border-indigo-500/10" : "bg-white border-l border-slate-100"}`}>
          {/* Accent line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 to-violet-500" />

          <div className="w-full max-w-sm mx-auto">
            {/* Heading */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-black bg-gradient-to-r from-indigo-500 to-violet-600 bg-clip-text text-transparent relative inline-block">
                New Password
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-gradient-to-r from-indigo-400 to-violet-500 rounded-full" />
              </h2>
              <p className={`text-sm mt-3 ${d ? "text-slate-500" : "text-slate-500"}`}>
                Enter your new password below
              </p>
            </div>

            <div className="space-y-4">
              {/* New Password */}
              <div>
                <label className={labelCls}>New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`${getInputCls("password")} pr-10`}
                    value={form.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    onBlur={() => handleBlur("password")}
                    disabled={loading}
                    autoComplete="new-password"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${d ? "text-slate-600 hover:text-indigo-400" : "text-slate-400 hover:text-indigo-600"}`}>
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {errorMsg("password")}
              </div>

              {/* Confirm Password */}
              <div>
                <label className={labelCls}>Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="••••••••"
                    className={`${getInputCls("confirmPassword")} pr-10`}
                    value={form.confirmPassword}
                    onChange={(e) => handleChange("confirmPassword", e.target.value)}
                    onBlur={() => handleBlur("confirmPassword")}
                    disabled={loading}
                    autoComplete="new-password"
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${d ? "text-slate-600 hover:text-indigo-400" : "text-slate-400 hover:text-indigo-600"}`}>
                    {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {errorMsg("confirmPassword")}
              </div>

              {/* Submit error */}
              {errors.submit && <p className="text-red-400 text-sm text-center">{errors.submit}</p>}

              {/* CTA Button — identical style to LoginForm/RegisterForm */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="relative w-full py-3.5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-bold rounded-xl transition-all duration-300 hover:scale-[1.015] active:scale-95 shadow-lg shadow-indigo-500/25 disabled:opacity-70 overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span className="relative flex items-center justify-center gap-2">
                  {loading && <Spinner />}
                  {loading ? "Resetting…" : "Reset Password →"}
                </span>
              </button>

              <div className="text-center pt-1">
                <p className={`text-sm ${d ? "text-slate-500" : "text-slate-500"}`}>
                  Remember it?&nbsp;
                  <Link to="/login" className="font-bold text-indigo-500 hover:text-indigo-400 hover:underline transition-colors">
                    Back to Sign In
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SuccessModal show={showSuccess} d={d} />
    </div>
  );
}

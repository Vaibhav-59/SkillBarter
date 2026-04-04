import { useState } from "react";
import { validatePassword } from "../../utils/validation";

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

const SuccessModal = ({ show, userRole }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-[#0d1120] to-[#060912] rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-indigo-500/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-violet-500/5 animate-pulse" />
        <div className="text-center relative z-10">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-indigo-500/40 animate-pulse">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-3xl font-black bg-gradient-to-r from-indigo-400 to-violet-500 bg-clip-text text-transparent mb-3">Welcome Back! 🎉</h3>
          <p className="text-slate-300 text-lg mb-6">Login successful! Redirecting to {userRole === "admin" ? "admin " : ""}dashboard...</p>
          <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
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

export default function LoginForm({ isDarkMode = true, onSwitchMode }) {
  const d = isDarkMode;
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showOtpPanel, setShowOtpPanel] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpInfoMessage, setOtpInfoMessage] = useState("");

  const nav = (path) => { window.location.href = path; };

  const validateField = (name, value) => {
    if (name === "email") {
      if (!value.trim()) return "Email is required";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return "Invalid email format";
    }
    if (name === "password") {
      if (!value) return "Password is required";
      return validatePassword(value);
    }
    return "";
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(form).forEach((key) => {
      const e = validateField(key, form[key]);
      if (e) newErrors[key] = e;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (name, value) => {
    setForm((p) => ({ ...p, [name]: value }));
    if (touched[name]) setErrors((p) => ({ ...p, [name]: validateField(name, value) }));
  };

  const handleBlur = (name) => {
    setTouched((p) => ({ ...p, [name]: true }));
    setErrors((p) => ({ ...p, [name]: validateField(name, form[name]) }));
  };

  const openOtpPanel = async (e) => {
    if (e) e.preventDefault();
    setTouched({ email: true, password: true });
    if (!validateForm()) return;
    setLoading(true);
    setOtp(""); setOtpError(""); setOtpInfoMessage("");
    try {
      const BASE = "https://skillbarter-2.onrender.com/api" || "http://localhost:5000/api";
      const res = await fetch(`${BASE}/auth/send-login-otp`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 404) setErrors((p) => ({ ...p, email: data?.message || "Email not registered." }));
        else setErrors((p) => ({ ...p, submit: data?.message || "Something went wrong." }));
        return;
      }
      setShowOtpPanel(true);
      if (data?.message) setOtpInfoMessage(data.message);
    } catch {
      setErrors((p) => ({ ...p, email: "Could not verify email. Please try again." }));
    } finally { setLoading(false); }
  };

  const handleVerifyAndLogin = async () => {
    const trimmed = otp.trim();
    if (!trimmed) { setOtpError("OTP is required"); return; }
    if (!/^\d{6}$/.test(trimmed)) { setOtpError("Enter a valid 6-digit OTP"); return; }
    setLoading(true); setOtpError("");
    try {
      const BASE = "https://skillbarter-2.onrender.com/api" || "http://localhost:5000/api";
      const res = await fetch(`${BASE}/auth/verify-login-otp`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, otp: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid OTP");
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUserRole(data.user.role);
      setShowSuccess(true);
      setShowOtpPanel(false);
      setForm({ email: "", password: "" });
      setErrors({}); setTouched({}); setOtp("");
      setTimeout(() => { window.location.href = data.user.role === "admin" ? "/admin/dashboard" : "/dashboard"; }, 200);
    } catch (err) {
      setOtpError(err.message || "Invalid OTP. Please try again.");
    } finally { setLoading(false); }
  };

  // Theme-aware input styles
  const inputBase = d
    ? "w-full px-4 py-3 bg-[#060912] border rounded-xl text-white placeholder-slate-600 focus:outline-none transition-all duration-300"
    : "w-full px-4 py-3 bg-slate-50 border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none transition-all duration-300";
  const inputNormal = d
    ? `${inputBase} border-white/10 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20`
    : `${inputBase} border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20`;
  const inputError = `${inputBase} border-red-500/60 focus:ring-2 focus:ring-red-400/20`;

  const getInputCls = (field) =>
    errors[field] && touched[field] ? inputError : inputNormal;

  const labelCls = `block text-xs font-bold tracking-wider uppercase mb-1.5 ${d ? "text-slate-400" : "text-slate-500"}`;
  const errorCls = "mt-1 text-xs text-red-400 flex items-center gap-1";

  return (
    <>
      {/* Form Body */}
      <div className="space-y-1">

        {/* Heading */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-black bg-gradient-to-r from-indigo-500 to-violet-600 bg-clip-text text-transparent relative inline-block">
            Sign In
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-gradient-to-r from-indigo-400 to-violet-500 rounded-full" />
          </h2>
          <p className={`text-sm mt-3 ${d ? "text-slate-500" : "text-slate-500"}`}>Welcome back — your workspace is ready</p>
        </div>

        <div className="space-y-4">
          {/* Email */}
          <div>
            <label className={labelCls}>Email</label>
            <input type="email" placeholder="you@example.com" className={getInputCls("email")}
              value={form.email} onChange={(e) => handleChange("email", e.target.value)}
              onBlur={() => handleBlur("email")} disabled={loading} autoComplete="email" />
            {errors.email && touched.email && (
              <p className={errorCls}><span>⚠</span>{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className={labelCls}>Password</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} placeholder="••••••••" className={getInputCls("password")}
                value={form.password} onChange={(e) => handleChange("password", e.target.value)}
                onBlur={() => handleBlur("password")} disabled={loading} autoComplete="current-password" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${d ? "text-slate-600 hover:text-indigo-400" : "text-slate-400 hover:text-indigo-600"}`}>
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {errors.password && touched.password && (
              <p className={errorCls}><span>⚠</span>{errors.password}</p>
            )}
          </div>

          {/* Submit error */}
          {errors.submit && <p className="text-red-400 text-sm text-center">{errors.submit}</p>}

          {/* CTA Button */}
          <button type="button" onClick={openOtpPanel} disabled={loading}
            className="relative w-full py-3.5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-bold rounded-xl transition-all duration-300 hover:scale-[1.015] active:scale-95 shadow-lg shadow-indigo-500/25 disabled:opacity-70 overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <span className="relative flex items-center justify-center gap-2">
              {loading && <Spinner />}
              {loading ? "Signing In…" : "Sign In →"}
            </span>
          </button>

          <div className="flex items-center justify-between pt-1">
            <button onClick={() => nav("/forgot-password")}
              className={`text-sm transition-colors hover:underline ${d ? "text-slate-500 hover:text-indigo-400" : "text-slate-400 hover:text-indigo-600"}`}>
              Forgot password?
            </button>
            <button onClick={() => onSwitchMode ? onSwitchMode() : nav("/register")}
              className="text-sm font-bold text-indigo-500 hover:text-indigo-400 hover:underline transition-colors">
              Create account
            </button>
          </div>
        </div>
      </div>

      {/* OTP Panel */}
      {showOtpPanel && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-40 p-4">
          <div className={`rounded-2xl p-6 w-full max-w-sm shadow-2xl border relative ${d ? "bg-[#0d1120] border-indigo-500/30" : "bg-white border-slate-200 shadow-xl"}`}>
            <div className={`absolute inset-0 rounded-2xl pointer-events-none ${d ? "bg-gradient-to-br from-indigo-500/5 to-violet-500/5" : "bg-gradient-to-br from-indigo-50/50 to-violet-50/30"}`} />
            <div className="relative z-10 space-y-4">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-indigo-500/30">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-black bg-gradient-to-r from-indigo-400 to-violet-500 bg-clip-text text-transparent">Verify Your Identity</h3>
                <p className={`text-xs mt-1 ${d ? "text-slate-400" : "text-slate-500"}`}>A 6-digit code was sent to your email.</p>
              </div>
              <div>
                <label className={labelCls}>One-Time Password</label>
                <input type="text" inputMode="numeric" maxLength={6} value={otp}
                  onChange={(e) => { setOtp(e.target.value); if (otpError) setOtpError(""); }}
                  className={`w-full px-4 py-3 border rounded-xl tracking-[0.35em] text-center text-lg font-bold focus:outline-none focus:ring-2 transition-all ${d ? "bg-[#060912] border-white/10 text-white placeholder-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20" : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-300 focus:border-indigo-400 focus:ring-indigo-400/20"}`}
                  placeholder="000000" disabled={loading} />
                {otpError && <p className="text-xs text-red-400 mt-1">{otpError}</p>}
                {otpInfoMessage && !otpError && <p className="text-xs text-indigo-400 mt-1">{otpInfoMessage}</p>}
                {errors.submit && !otpError && <p className="text-xs text-red-400 mt-1">{errors.submit}</p>}
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => { if (!loading) { setShowOtpPanel(false); setOtp(""); setOtpError(""); } }}
                  className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-colors ${d ? "border-white/10 text-slate-400 hover:bg-white/5" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`} disabled={loading}>
                  Cancel
                </button>
                <button type="button" onClick={handleVerifyAndLogin} disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-bold text-sm flex items-center justify-center gap-2 hover:from-indigo-600 hover:to-violet-700 shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-70">
                  {loading && <Spinner />}
                  {loading ? "Verifying…" : "Verify & Login"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <SuccessModal show={showSuccess} userRole={userRole} />
    </>
  );
}

import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { validatePassword as validateStrongPassword } from "../../utils/validation";

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

const SuccessModal = ({ show }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-[#0d1120] to-[#060912] rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-violet-500/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-violet-500/5 animate-pulse" />
        <div className="text-center relative z-10">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-indigo-500/40 animate-pulse">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-3xl font-black bg-gradient-to-r from-indigo-400 to-violet-500 bg-clip-text text-transparent mb-3">Account Created! 🎉</h3>
          <p className="text-slate-300 text-lg mb-6">Welcome to SkillBarter! Redirecting to login...</p>
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

export default function RegisterForm({ isDarkMode = true, onSwitchMode }) {
  const d = isDarkMode;
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get("ref");

  useEffect(() => {
    if (showSuccess) {
      const t = setTimeout(handleSuccessClose, 1200);
      return () => clearTimeout(t);
    }
  }, [showSuccess]);

  const validateName = (v) => {
    if (!v.trim()) return "Full name is required";
    if (v.trim().length < 2) return "Name must be at least 2 characters";
    if (!/^[a-zA-Z\s]+$/.test(v.trim())) return "Name can only contain letters";
    return "";
  };
  const validateEmail = (v) => {
    if (!v.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Please enter a valid email";
    return "";
  };
  const validatePassword = (v) => validateStrongPassword(v);
  const validateConfirm = (v, pw) => {
    if (!v) return "Please confirm your password";
    if (v !== pw) return "Passwords do not match";
    return "";
  };

  const validateField = (field, value) => {
    switch (field) {
      case "name": return validateName(value);
      case "email": return validateEmail(value);
      case "password": return validatePassword(value);
      case "confirmPassword": return validateConfirm(value, form.password);
      default: return "";
    }
  };

  const handleChange = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: "" }));
    if (field === "password" && form.confirmPassword)
      setErrors((p) => ({ ...p, confirmPassword: validateConfirm(form.confirmPassword, value) }));
  };

  const handleBlur = (field) => {
    setTouched((p) => ({ ...p, [field]: true }));
    setErrors((p) => ({ ...p, [field]: validateField(field, form[field]) }));
  };

  const validateForm = () => {
    const e = {
      name: validateName(form.name),
      email: validateEmail(form.email),
      password: validatePassword(form.password),
      confirmPassword: validateConfirm(form.confirmPassword, form.password),
    };
    setErrors(e);
    setTouched({ name: true, email: true, password: true, confirmPassword: true });
    return !Object.values(e).some((v) => v !== "");
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    setForm({ name: "", email: "", password: "", confirmPassword: "" });
    setErrors({}); setTouched({});
    window.location.href = "/login";
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const BASE = "https://skillbarter-2.onrender.com/api" || "http://localhost:5000/api";
      const res = await fetch(`${BASE}/auth/register`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password, referralCode: refCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");
      setShowSuccess(true);
    } catch (error) {
      alert(error.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Identical input style system as LoginForm
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
    <>
      <div className="space-y-1">
        {/* Heading — same style as LoginForm "Sign In" */}
        <div className="text-center mb-6">
          <h2 className={`text-2xl font-black bg-gradient-to-r from-indigo-500 to-violet-600 bg-clip-text text-transparent relative inline-block`}>
            Create Account
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-gradient-to-r from-indigo-400 to-violet-500 rounded-full" />
          </h2>
          <p className={`text-sm mt-3 ${d ? "text-slate-500" : "text-slate-500"}`}>
            Join thousands already learning &amp; sharing
          </p>
        </div>

        <div className="space-y-4">
          {/* Full Name */}
          <div>
            <label className={labelCls}>Full Name</label>
            <input
              type="text"
              placeholder="John Doe"
              className={getInputCls("name")}
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              onBlur={() => handleBlur("name")}
              disabled={loading}
            />
            {errorMsg("name")}
          </div>

          {/* Email */}
          <div>
            <label className={labelCls}>Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              className={getInputCls("email")}
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              onBlur={() => handleBlur("email")}
              disabled={loading}
              autoComplete="email"
            />
            {errorMsg("email")}
          </div>

          {/* Password */}
          <div>
            <label className={labelCls}>Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className={`${getInputCls("password")} pr-10`}
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
                onBlur={() => handleBlur("password")}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${d ? "text-slate-600 hover:text-indigo-400" : "text-slate-400 hover:text-indigo-600"}`}
              >
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
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                className={`${getInputCls("confirmPassword")} pr-10`}
                value={form.confirmPassword}
                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                onBlur={() => handleBlur("confirmPassword")}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${d ? "text-slate-600 hover:text-indigo-400" : "text-slate-400 hover:text-indigo-600"}`}
              >
                {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {errorMsg("confirmPassword")}
          </div>

          {/* Submit — same style as LoginForm "Sign In →" */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="relative w-full py-3.5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-bold rounded-xl transition-all duration-300 hover:scale-[1.015] active:scale-95 shadow-lg shadow-indigo-500/25 disabled:opacity-70 overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <span className="relative flex items-center justify-center gap-2">
              {loading && <Spinner />}
              {loading ? "Creating Account…" : "Create Account →"}
            </span>
          </button>

          <div className="flex items-center justify-center pt-1">
            <p className={`text-sm ${d ? "text-slate-500" : "text-slate-500"}`}>
              Already have an account?&nbsp;
              <button
                onClick={() => onSwitchMode ? onSwitchMode() : (window.location.href = "/login")}
                className="font-bold text-indigo-500 hover:text-indigo-400 hover:underline transition-colors"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>

      <SuccessModal show={showSuccess} />
    </>
  );
}
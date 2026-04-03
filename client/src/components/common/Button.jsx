import React from "react";

export default function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  className = "",
  disabled = false,
}) {
  const baseStyles =
    "relative inline-flex justify-center items-center px-6 py-3.5 rounded-xl font-bold transition-all duration-500 active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none group overflow-hidden focus:outline-none";

  const variants = {
    primary:
      "bg-[length:200%_100%] bg-gradient-to-r from-indigo-500 via-violet-600 to-indigo-500 hover:bg-[position:100%_0] text-white shadow-[0_4px_20px_-4px_rgba(99,102,241,0.5)] hover:shadow-indigo-500/40 hover:-translate-y-0.5",
    secondary:
      "bg-[length:200%_100%] bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-400 hover:bg-[position:100%_0] text-white shadow-[0_4px_20px_-4px_rgba(52,211,153,0.5)] hover:shadow-emerald-500/40 hover:-translate-y-0.5",
    danger:
      "bg-[length:200%_100%] bg-gradient-to-r from-red-500 via-rose-600 to-red-500 hover:bg-[position:100%_0] text-white shadow-[0_4px_20px_-4px_rgba(239,68,68,0.5)] hover:shadow-red-500/40 hover:-translate-y-0.5",
    outline:
      "border-[2px] border-indigo-500 text-indigo-500 hover:bg-indigo-50 hover:shadow-md dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-500/10",
    dark: 
      "bg-slate-900 text-white shadow-xl hover:shadow-slate-500/20 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 dark:hover:shadow-white/20 hover:-translate-y-0.5",
  };

  const selectedVariant = variants[variant] || variants.primary;

  // Render shimmer effect only on gradient buttons
  const isGradient = ["primary", "secondary", "danger"].includes(variant);

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${selectedVariant} ${className}`}
    >
      {isGradient && (
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
      )}
      <span className="relative flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  );
}

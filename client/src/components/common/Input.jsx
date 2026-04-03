import React from "react";

export default function Input({
  label,
  type = "text",
  value,
  onChange,
  placeholder = "",
  name,
  className = "",
  disabled = false,
  readOnly = false,
  required = false,
}) {
  return (
    <div className="w-full space-y-2">
      {label && (
        <label
          htmlFor={name}
          className="block text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400"
        >
          {label}
          {required && <span className="text-red-500 ml-1.5 inline-block">*</span>}
        </label>
      )}
      <input
        id={name}
        type={type}
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        className={`w-full px-4 py-3 rounded-xl focus:outline-none transition-all duration-300
          bg-white border-slate-200 text-slate-900 placeholder-slate-400 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]
          hover:border-slate-300 hover:shadow-md
          focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/20
          dark:bg-[#060912]/80 dark:backdrop-blur-xl dark:border-white/5 dark:text-white dark:placeholder-slate-500 dark:shadow-[inset_0_1px_4px_rgba(0,0,0,0.5)]
          dark:hover:border-white/20
          dark:focus:border-indigo-500 dark:focus:ring-[3px] dark:focus:ring-indigo-500/30
          disabled:opacity-60 disabled:cursor-not-allowed
          ${className}`}
      />
    </div>
  );
}

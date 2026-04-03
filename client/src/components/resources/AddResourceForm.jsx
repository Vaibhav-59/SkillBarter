// components/resources/AddResourceForm.jsx
import { useState } from "react";
import { X, Link, Tag, BookOpen, Loader, Sparkles } from "lucide-react";
import { toast } from "react-toastify";
import * as resourceApi from "../../services/resourceApi";

const CATEGORIES = ["Web Development", "Data Science", "UI/UX Design", "Mobile Development", "AI & Machine Learning", "DevOps", "Other"];
const TYPES      = ["Video", "Article", "Course", "Documentation", "Book", "Tutorial"];
const LEVELS     = ["Beginner", "Intermediate", "Advanced"];

const inputClass = (isDark) =>
  `w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all ${
    isDark
      ? "bg-slate-900/60 border-slate-600/50 text-white placeholder-slate-500 focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20"
      : "bg-white border-indigo-200 text-gray-900 placeholder-gray-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 shadow-sm"
  }`;

export default function AddResourceForm({ isDarkMode, onClose, onAdded }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", category: "Web Development",
    resourceType: "Article", resourceLink: "", thumbnail: "",
    tags: "", difficultyLevel: "Beginner", duration: "",
  });
  const [errors, setErrors] = useState({});

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: "" })); };

  const validate = () => {
    const e = {};
    if (!form.title.trim())        e.title        = "Title is required";
    if (!form.description.trim())  e.description  = "Description is required";
    if (!form.resourceLink.trim()) e.resourceLink = "Resource link is required";
    else {
      try { new URL(form.resourceLink); }
      catch { e.resourceLink = "Must be a valid URL (include https://)"; }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await resourceApi.createResource(form);
      onAdded(res.data);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add resource");
    } finally { setLoading(false); }
  };

  const modal = isDarkMode
    ? "bg-slate-900 border border-slate-700/50"
    : "bg-white border border-indigo-100 shadow-2xl";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}>
      <div className={`w-full max-w-2xl rounded-3xl overflow-hidden ${modal}`}>

        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-5 border-b ${isDarkMode ? "border-slate-700/40" : "border-indigo-100"}`}
          style={{ background: isDarkMode ? "rgba(99,102,241,0.06)" : "rgba(99,102,241,0.04)" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 4px 16px rgba(99,102,241,0.35)" }}>
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className={`font-black text-lg ${isDarkMode ? "text-white" : "text-gray-900"}`}>Add Resource</h2>
              <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>Share a learning resource with the community</p>
            </div>
          </div>
          <button onClick={onClose}
            className={`p-2 rounded-xl transition-all hover:scale-105 ${isDarkMode ? "text-slate-400 hover:text-white hover:bg-slate-700/60" : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"}`}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">

          {/* Title */}
          <div>
            <label className={`block text-sm font-bold mb-1.5 ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>Title *</label>
            <input type="text" placeholder="e.g. React Hooks Deep Dive"
              value={form.title} onChange={e => set("title", e.target.value)}
              className={inputClass(isDarkMode)} />
            {errors.title && <p className="text-red-400 text-xs mt-1 flex items-center gap-1">⚠ {errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className={`block text-sm font-bold mb-1.5 ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>Description *</label>
            <textarea rows={3} placeholder="Brief description of what this resource covers…"
              value={form.description} onChange={e => set("description", e.target.value)}
              className={`${inputClass(isDarkMode)} resize-none`} />
            {errors.description && <p className="text-red-400 text-xs mt-1 flex items-center gap-1">⚠ {errors.description}</p>}
          </div>

          {/* Category + Type */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Category *",  key: "category",     opts: CATEGORIES },
              { label: "Type *",      key: "resourceType", opts: TYPES      },
            ].map(({ label, key, opts }) => (
              <div key={key}>
                <label className={`block text-sm font-bold mb-1.5 ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>{label}</label>
                <select value={form[key]} onChange={e => set(key, e.target.value)} className={inputClass(isDarkMode)}>
                  {opts.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>

          {/* Level + Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-bold mb-1.5 ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>Difficulty</label>
              <select value={form.difficultyLevel} onChange={e => set("difficultyLevel", e.target.value)} className={inputClass(isDarkMode)}>
                {LEVELS.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className={`block text-sm font-bold mb-1.5 ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>Duration</label>
              <input type="text" placeholder="e.g. 2h 30m"
                value={form.duration} onChange={e => set("duration", e.target.value)}
                className={inputClass(isDarkMode)} />
            </div>
          </div>

          {/* Link */}
          <div>
            <label className={`block text-sm font-bold mb-1.5 ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>Resource Link *</label>
            <div className="relative">
              <Link className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDarkMode ? "text-slate-500" : "text-gray-400"}`} />
              <input type="url" placeholder="https://..."
                value={form.resourceLink} onChange={e => set("resourceLink", e.target.value)}
                className={`${inputClass(isDarkMode)} pl-10`} />
            </div>
            {errors.resourceLink && <p className="text-red-400 text-xs mt-1 flex items-center gap-1">⚠ {errors.resourceLink}</p>}
          </div>

          {/* Thumbnail */}
          <div>
            <label className={`block text-sm font-bold mb-1.5 ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>
              Thumbnail URL <span className={`font-normal ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}>(optional)</span>
            </label>
            <input type="url" placeholder="https://..."
              value={form.thumbnail} onChange={e => set("thumbnail", e.target.value)}
              className={inputClass(isDarkMode)} />
          </div>

          {/* Tags */}
          <div>
            <label className={`block text-sm font-bold mb-1.5 ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>
              Tags <span className={`font-normal ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}>(comma separated)</span>
            </label>
            <div className="relative">
              <Tag className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDarkMode ? "text-slate-500" : "text-gray-400"}`} />
              <input type="text" placeholder="react, hooks, state management"
                value={form.tags} onChange={e => set("tags", e.target.value)}
                className={`${inputClass(isDarkMode)} pl-10`} />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className={`flex-1 py-3 rounded-xl text-sm font-bold border transition-all hover:scale-[1.01] ${
                isDarkMode ? "border-slate-600/50 text-slate-400 hover:text-white hover:border-indigo-500/40" : "border-indigo-100 text-gray-600 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700"
              }`}>
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all active:scale-95 disabled:opacity-70 hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 4px 16px rgba(99,102,241,0.35)" }}>
              {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {loading ? "Adding…" : "Add Resource"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

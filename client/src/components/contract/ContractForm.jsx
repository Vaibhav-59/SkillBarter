// client/src/components/contract/ContractForm.jsx
import { useState, useEffect, useContext } from "react";
import api from "../../utils/api";
import { showSuccess, showError } from "../../utils/toast";
import { ThemeContext } from "../../contexts/ThemeContext";

const FIELD_ICON = {
  user: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  down: "M19 9l-7 7-7-7",
};

export default function ContractForm({ onCreated, onClose }) {
  const { theme } = useContext(ThemeContext) || { theme: "dark" };
  const d = theme === "dark";

  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    userBId: "", skillTeach: "", skillLearn: "",
    totalSessions: 4, sessionDuration: 60, startDate: "", notes: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/matches?status=accepted").then((r) => {
      const myId = JSON.parse(localStorage.getItem("user") || "{}")._id;
      const partners = (r.data.data || []).map((m) =>
        m.requester._id === myId ? m.receiver : m.requester
      );
      const seen = new Set();
      setUsers(partners.filter((u) => { if (seen.has(u._id)) return false; seen.add(u._id); return true; }));
    }).catch(() => {});
  }, []);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.userBId || !form.skillTeach || !form.skillLearn || !form.startDate) {
      showError("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/contracts/create", form);
      showSuccess("Contract created! Waiting for partner approval.");
      onCreated?.();
      onClose?.();
    } catch (err) {
      showError(err?.response?.data?.message || "Failed to create contract");
    } finally {
      setLoading(false);
    }
  };

  /* ── Shared classes ── */
  const sectionCls = `rounded-2xl p-5 border space-y-4 ${
    d
      ? "bg-[#0d1525] border-indigo-500/15"
      : "bg-slate-50/80 border-slate-200"
  }`;

  const inputCls = `w-full px-4 py-2.5 rounded-xl border outline-none transition-all duration-200 ${
    d
      ? "bg-[#0a0f1e] border-indigo-500/25 text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:bg-[#0d1323]"
      : "bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
  }`;

  const labelCls = `block font-bold uppercase tracking-widest mb-2 ${
    d ? "text-indigo-400" : "text-indigo-600"
  }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
      <div className={`w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl flex flex-col ${
        d
          ? "bg-[#080d1a] border border-indigo-500/20 shadow-indigo-500/15"
          : "bg-white border border-slate-200 shadow-slate-300/40"
      }`}>

        {/* ── Header ── */}
        <div className={`relative overflow-hidden flex-shrink-0 ${
          d ? "bg-gradient-to-br from-[#0d1525] to-[#080d1a]" : "bg-gradient-to-br from-indigo-50 to-violet-50/60"
        }`}>
          {/* glow blobs */}
          {d && (
            <>
              <div className="absolute top-0 left-0 w-48 h-24 bg-indigo-600/15 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
              <div className="absolute top-0 right-0 w-32 h-24 bg-violet-600/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none" />
            </>
          )}

          <div className={`relative z-10 flex items-center justify-between px-7 py-5 border-b ${
            d ? "border-indigo-500/15" : "border-indigo-100"
          }`}>
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className={`font-black text-xl leading-tight ${d ? "text-white" : "text-slate-900"}`}>
                  New Skill Contract
                </h2>
                <p className={`mt-0.5 font-medium ${d ? "text-indigo-400" : "text-indigo-600"}`} style={{ fontSize: "12px" }}>
                  Define your skill exchange agreement
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all duration-200 hover:scale-110 flex-shrink-0 ${
                d
                  ? "bg-indigo-500/10 border-indigo-500/20 text-slate-400 hover:bg-red-500/15 hover:border-red-500/25 hover:text-red-400"
                  : "bg-slate-100 border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-500"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Form body ── */}
        <form
          onSubmit={handleSubmit}
          className={`flex-1 overflow-y-auto px-7 py-6 space-y-4 ${d ? "bg-[#080d1a]" : "bg-white"}`}
          style={{ scrollbarWidth: "thin", scrollbarColor: d ? "#4338ca40 transparent" : "#c7d2fe transparent", maxHeight: "70vh" }}
        >

          {/* Section 1 – Partner */}
          <div className={sectionCls}>
            <p className={`flex items-center gap-2 font-black uppercase tracking-wider mb-1 ${d ? "text-slate-300" : "text-slate-700"}`} style={{ fontSize: "11px" }}>
              <span className="w-5 h-5 rounded-md bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white flex-shrink-0" style={{ fontSize: "9px" }}>1</span>
              Select Partner
            </p>

            <div>
              <label className={labelCls} style={{ fontSize: "9px" }}>
                Partner User <span className={d ? "text-violet-400" : "text-violet-500"}>*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className={`w-4 h-4 ${d ? "text-indigo-500/70" : "text-slate-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={FIELD_ICON.user} />
                  </svg>
                </div>
                <select
                  value={form.userBId}
                  onChange={(e) => set("userBId", e.target.value)}
                  required
                  className={`${inputCls} pl-10 pr-9 appearance-none cursor-pointer`}
                  style={{ colorScheme: d ? "dark" : "light" }}
                >
                  <option value="">Select a matched partner…</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                  ))}
                </select>
                <div className={`absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${d ? "text-indigo-500/50" : "text-slate-400"}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={FIELD_ICON.down} />
                  </svg>
                </div>
              </div>
              {users.length === 0 && (
                <p className={`mt-2 flex items-center gap-1.5 ${d ? "text-slate-600" : "text-slate-400"}`} style={{ fontSize: "11px" }}>
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  You need accepted matches to create a contract.
                </p>
              )}
            </div>
          </div>

          {/* Section 2 – Skills */}
          <div className={sectionCls}>
            <p className={`flex items-center gap-2 font-black uppercase tracking-wider mb-1 ${d ? "text-slate-300" : "text-slate-700"}`} style={{ fontSize: "11px" }}>
              <span className="w-5 h-5 rounded-md bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white flex-shrink-0" style={{ fontSize: "9px" }}>2</span>
              Skill Exchange
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls} style={{ fontSize: "9px" }}>
                  You Teach <span className={d ? "text-indigo-400" : "text-indigo-500"}>*</span>
                </label>
                <input
                  type="text"
                  value={form.skillTeach}
                  onChange={(e) => set("skillTeach", e.target.value)}
                  required
                  placeholder="e.g. Python"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls} style={{ fontSize: "9px" }}>
                  You Learn <span className={d ? "text-violet-400" : "text-violet-500"}>*</span>
                </label>
                <input
                  type="text"
                  value={form.skillLearn}
                  onChange={(e) => set("skillLearn", e.target.value)}
                  required
                  placeholder="e.g. UI Design"
                  className={inputCls}
                />
              </div>
            </div>

            {/* Live preview pill */}
            {(form.skillTeach || form.skillLearn) && (
              <div className={`flex items-center justify-center gap-3 px-5 py-3 rounded-xl border font-semibold transition-all ${
                d
                  ? "bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border-indigo-500/20"
                  : "bg-gradient-to-r from-indigo-50 to-violet-50 border-indigo-100"
              }`}>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${d ? "bg-indigo-400" : "bg-indigo-500"}`} />
                  <span className={`font-bold ${d ? "text-indigo-300" : "text-indigo-700"}`}>
                    {form.skillTeach || "?"}
                  </span>
                </div>
                <span className={`font-black text-lg ${d ? "text-slate-600" : "text-slate-300"}`}>↔</span>
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${d ? "text-violet-300" : "text-violet-700"}`}>
                    {form.skillLearn || "?"}
                  </span>
                  <div className={`w-2 h-2 rounded-full ${d ? "bg-violet-400" : "bg-violet-500"}`} />
                </div>
              </div>
            )}
          </div>

          {/* Section 3 – Schedule */}
          <div className={sectionCls}>
            <p className={`flex items-center gap-2 font-black uppercase tracking-wider mb-1 ${d ? "text-slate-300" : "text-slate-700"}`} style={{ fontSize: "11px" }}>
              <span className="w-5 h-5 rounded-md bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white flex-shrink-0" style={{ fontSize: "9px" }}>3</span>
              Schedule &amp; Duration
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls} style={{ fontSize: "9px" }}>
                  Total Sessions <span className={d ? "text-indigo-400" : "text-indigo-500"}>*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={form.totalSessions}
                  onChange={(e) => set("totalSessions", e.target.value)}
                  required
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls} style={{ fontSize: "9px" }}>
                  Per Session <span className={d ? "text-indigo-400" : "text-indigo-500"}>*</span>
                </label>
                <div className="relative">
                  <select
                    value={form.sessionDuration}
                    onChange={(e) => set("sessionDuration", e.target.value)}
                    className={`${inputCls} appearance-none pr-9 cursor-pointer`}
                    style={{ colorScheme: d ? "dark" : "light" }}
                  >
                    {[30, 45, 60, 90, 120].map((m) => (
                      <option key={m} value={m}>{m} min</option>
                    ))}
                  </select>
                  <div className={`absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${d ? "text-indigo-500/50" : "text-slate-400"}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={FIELD_ICON.down} />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className={labelCls} style={{ fontSize: "9px" }}>
                Start Date <span className={d ? "text-indigo-400" : "text-indigo-500"}>*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className={`w-4 h-4 ${d ? "text-indigo-500/70" : "text-slate-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => set("startDate", e.target.value)}
                  required
                  min={new Date().toISOString().split("T")[0]}
                  style={{ colorScheme: d ? "dark" : "light" }}
                  className={`${inputCls} pl-10`}
                />
              </div>
            </div>
          </div>

          {/* Section 4 – Notes (optional) */}
          <div className={sectionCls}>
            <p className={`flex items-center gap-2 font-black uppercase tracking-wider mb-1 ${d ? "text-slate-300" : "text-slate-700"}`} style={{ fontSize: "11px" }}>
              <span className="w-5 h-5 rounded-md bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white flex-shrink-0" style={{ fontSize: "9px" }}>4</span>
              Notes
              <span className={`normal-case font-normal tracking-normal ml-1 ${d ? "text-slate-600" : "text-slate-400"}`} style={{ fontSize: "11px" }}>(optional)</span>
            </p>
            <textarea
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              rows={3}
              placeholder="Any terms, goals, or expectations for this contract…"
              className={`${inputCls} resize-none`}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600
              hover:from-indigo-400 hover:via-violet-400 hover:to-purple-500
              text-white font-bold rounded-2xl
              shadow-xl shadow-indigo-500/30
              transition-all duration-300 hover:scale-[1.02] hover:shadow-indigo-500/40
              disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100
              flex items-center justify-center gap-2.5"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creating Contract…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                Create Contract
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

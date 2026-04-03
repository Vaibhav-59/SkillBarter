import { useState, useEffect, useContext } from "react";
import api from "../utils/api";
import { showSuccess, showError } from "../utils/toast";
import { ThemeContext } from "../contexts/ThemeContext";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function SchedulePage() {
  const [slots, setSlots] = useState([]);
  const [day, setDay] = useState("");
  const [time, setTime] = useState("");
  const { theme } = useContext(ThemeContext) || { theme: "dark" };
  const isDark = theme === "dark";

  const fetchSlots = async () => {
    try {
      const res = await api.get("/schedule");
      setSlots(res.data || []);
    } catch {
      showError("Failed to load schedule");
    }
  };

  useEffect(() => { fetchSlots(); }, []);

  const addSlot = async () => {
    if (!day || !time) return;
    try {
      const res = await api.post("/schedule", { day, time });
      setSlots([...slots, res.data]);
      showSuccess("Slot added");
      setDay("");
      setTime("");
    } catch {
      showError("Failed to add slot");
    }
  };

  const removeSlot = async (id) => {
    try {
      await api.delete(`/schedule/${id}`);
      setSlots(slots.filter((s) => s._id !== id));
      showSuccess("Slot removed");
    } catch {
      showError("Failed to remove slot");
    }
  };

  // Group slots by day
  const grouped = DAYS.reduce((acc, d) => {
    acc[d] = slots.filter((s) => s.day === d);
    return acc;
  }, {});

  const d = isDark;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${d ? "bg-[#0f1117]" : "bg-[#f0f4ff]"}`}>
      {/* Ambient */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full blur-3xl animate-pulse ${d ? "bg-indigo-500/10" : "bg-indigo-300/20"}`} />
        <div className={`absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full blur-3xl animate-pulse delay-1000 ${d ? "bg-violet-500/8" : "bg-violet-300/15"}`} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 className={`font-extrabold text-2xl ${d ? "text-white" : "text-slate-800"}`}>
                My Availability
              </h1>
            </div>
            <p className={`text-sm ml-[52px] ${d ? "text-slate-400" : "text-slate-500"}`}>
              Set your available time slots so partners can book sessions with you
            </p>
          </div>

          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border ${d ? "bg-[#161b2e] border-white/10" : "bg-white border-slate-200"} shadow-sm`}>
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
            <span className={`text-sm font-semibold ${d ? "text-slate-300" : "text-slate-700"}`}>
              {slots.length} slot{slots.length !== 1 ? "s" : ""} set
            </span>
          </div>
        </div>

        {/* Add slot card */}
        <div className={`rounded-3xl border shadow-xl mb-8 overflow-hidden ${d ? "bg-[#161b2e] border-white/10 shadow-indigo-500/5" : "bg-white border-slate-200 shadow-slate-200/80"}`}>
          <div className={`px-6 pt-6 pb-4 border-b ${d ? "border-white/8" : "border-slate-100"}`}>
            <h2 className={`font-bold text-base ${d ? "text-white" : "text-slate-800"}`}>Add New Time Slot</h2>
            <p className={`text-xs mt-0.5 ${d ? "text-slate-400" : "text-slate-500"}`}>Pick a day and time when you're available</p>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-3">
              {/* Day select */}
              <div className="flex-1 min-w-[160px]">
                <label className={`block text-xs font-semibold mb-1.5 ${d ? "text-slate-400" : "text-slate-500"}`}>Day</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <svg className={`w-4 h-4 ${d ? "text-slate-500" : "text-slate-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <select
                    value={day}
                    onChange={(e) => setDay(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none transition-all duration-200 ${
                      d
                        ? "bg-white/5 border-white/10 text-white focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20"
                        : "bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    }`}
                  >
                    <option value="">Select day…</option>
                    {DAYS.map((d_) => <option key={d_} value={d_}>{d_}</option>)}
                  </select>
                </div>
              </div>

              {/* Time input */}
              <div className="flex-1 min-w-[140px]">
                <label className={`block text-xs font-semibold mb-1.5 ${d ? "text-slate-400" : "text-slate-500"}`}>Time</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <svg className={`w-4 h-4 ${d ? "text-slate-500" : "text-slate-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    style={{ colorScheme: d ? "dark" : "light" }}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none transition-all duration-200 ${
                      d
                        ? "bg-white/5 border-white/10 text-white focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20"
                        : "bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    }`}
                  />
                </div>
              </div>

              {/* Add button */}
              <div className="flex items-end">
                <button
                  onClick={addSlot}
                  disabled={!day || !time}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600
                    hover:from-indigo-400 hover:via-violet-400 hover:to-purple-500
                    text-white font-semibold rounded-xl text-sm transition-all duration-300
                    hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/30
                    disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100
                    flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Slot
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly grid */}
        {slots.length === 0 ? (
          <div className={`rounded-3xl border p-16 flex flex-col items-center justify-center text-center ${d ? "bg-[#161b2e] border-white/10" : "bg-white border-slate-200"}`}>
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${d ? "bg-white/5" : "bg-slate-100"}`}>
              <svg className={`w-8 h-8 ${d ? "text-slate-500" : "text-slate-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className={`font-bold text-base mb-1 ${d ? "text-white" : "text-slate-800"}`}>No slots yet</p>
            <p className={`text-sm ${d ? "text-slate-400" : "text-slate-500"}`}>Add your first availability slot above</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {DAYS.filter((d_) => grouped[d_].length > 0).map((d_) => (
              <div
                key={d_}
                className={`rounded-2xl border overflow-hidden transition-all duration-200 ${d ? "bg-[#161b2e] border-white/10 hover:border-indigo-500/30" : "bg-white border-slate-200 hover:border-indigo-200 hover:shadow-md"}`}
              >
                {/* Day header */}
                <div className={`px-4 py-3 border-b flex items-center justify-between ${d ? "border-white/8 bg-white/3" : "border-slate-100 bg-slate-50"}`}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full" />
                    <span className={`font-bold text-sm ${d ? "text-white" : "text-slate-800"}`}>{d_}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${d ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/20" : "bg-indigo-50 text-indigo-600 border border-indigo-100"}`}>
                    {grouped[d_].length}
                  </span>
                </div>

                {/* Slots */}
                <div className="p-3 space-y-2">
                  {grouped[d_].map((slot) => (
                    <div
                      key={slot._id}
                      className={`group flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all duration-200 ${
                        d
                          ? "bg-white/4 border-white/8 hover:bg-indigo-500/10 hover:border-indigo-500/25"
                          : "bg-slate-50 border-slate-100 hover:bg-indigo-50 hover:border-indigo-100"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <svg className={`w-3.5 h-3.5 ${d ? "text-slate-500" : "text-slate-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className={`text-sm font-semibold ${d ? "text-slate-200" : "text-slate-700"}`}>{slot.time}</span>
                      </div>
                      <button
                        onClick={() => removeSlot(slot._id)}
                        className={`opacity-0 group-hover:opacity-100 w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-200 ${
                          d ? "bg-red-500/15 hover:bg-red-500/30 text-red-400" : "bg-red-50 hover:bg-red-100 text-red-500"
                        }`}
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

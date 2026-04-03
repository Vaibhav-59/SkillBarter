import React, { useState, useEffect } from "react";
import api from "../../utils/api";
import { toast } from "react-toastify";
import { LucideVideo, LucideCalendar, LucideUser, LucideClock, LucideBookOpen, LucideGraduationCap, LucideAlignLeft, LucideLink, LucideSparkles } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";

const generateMeetingId = () =>
  Math.random().toString(36).slice(2, 7) + "-" + Math.random().toString(36).slice(2, 7);

const SessionForm = ({ onSessionCreated }) => {
  const { isDarkMode: d } = useTheme();
  const [partners, setPartners] = useState([]);
  const [formData, setFormData] = useState({
    participantUser: "", skillTeach: "", skillLearn: "",
    date: "", startTime: "", endTime: "", notes: "", meetingLink: "",
  });
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    api.get("/users/discover")
      .then((res) => setPartners(res.data.data || res.data))
      .catch(() => {});
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleCreateMeeting = () => {
    const id  = generateMeetingId();
    const url = `${window.location.origin}/meeting/${id}`;
    setFormData({ ...formData, meetingLink: url });
    setGenerated(true);
    toast.success("Meeting link generated!", { icon: "🔗" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { participantUser, skillTeach, skillLearn, date, startTime, endTime } = formData;
    if (!participantUser || !skillTeach || !skillLearn || !date || !startTime || !endTime)
      return toast.error("Please fill all required fields");
    try {
      setLoading(true);
      const res = await api.post("/sessions", formData);
      toast.success("Session scheduled successfully! 🎉");
      onSessionCreated(res.data.data);
      setFormData({ participantUser: "", skillTeach: "", skillLearn: "", date: "", startTime: "", endTime: "", notes: "", meetingLink: "" });
      setGenerated(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to schedule session");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = `w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none transition-all duration-200 ${
    d
      ? "bg-white/5 border-white/10 text-white placeholder-slate-500 focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20"
      : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
  }`;

  const labelCls = `block text-xs font-bold uppercase tracking-wider mb-1.5 ${d ? "text-slate-400" : "text-slate-500"}`;
  const iconCls  = `absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${d ? "text-slate-500" : "text-slate-400"}`;

  const FieldIcon = ({ icon: Icon }) => (
    <div className="absolute left-3 top-3.5 pointer-events-none">
      <Icon className={`w-4 h-4 ${d ? "text-slate-500" : "text-slate-400"}`} />
    </div>
  );

  return (
    <div className={`rounded-3xl border overflow-hidden shadow-xl transition-all duration-300 ${
      d ? "bg-[#161b2e] border-white/10 shadow-indigo-500/5 hover:border-indigo-500/20" : "bg-white border-slate-200 shadow-slate-200/80 hover:shadow-indigo-100"
    }`}>
      {/* Card header */}
      <div className={`px-6 pt-6 pb-4 border-b ${d ? "border-white/8 bg-white/2" : "border-slate-100 bg-slate-50/60"}`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/30">
            <LucideCalendar className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className={`font-bold text-base leading-tight ${d ? "text-white" : "text-slate-800"}`}>Schedule Session</h3>
            <p className={`text-xs mt-0.5 ${d ? "text-slate-500" : "text-slate-400"}`}>Book a new skill-barter meeting</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {/* Partner */}
        <div>
          <label className={labelCls}>Partner</label>
          <div className="relative">
            <FieldIcon icon={LucideUser} />
            <select
              name="participantUser"
              value={formData.participantUser}
              onChange={handleChange}
              className={`${inputCls} appearance-none`}
              required
            >
              <option value="">Select a barter partner…</option>
              {Array.isArray(partners) && partners.map((u) => (
                <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
              ))}
            </select>
            <div className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${d ? "text-slate-500" : "text-slate-400"}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>You Teach</label>
            <div className="relative">
              <FieldIcon icon={LucideGraduationCap} />
              <input
                type="text" name="skillTeach" placeholder="e.g. React"
                value={formData.skillTeach} onChange={handleChange}
                className={inputCls} required
              />
            </div>
          </div>
          <div>
            <label className={labelCls}>They Teach</label>
            <div className="relative">
              <FieldIcon icon={LucideBookOpen} />
              <input
                type="text" name="skillLearn" placeholder="e.g. Node.js"
                value={formData.skillLearn} onChange={handleChange}
                className={inputCls} required
              />
            </div>
          </div>
        </div>

        {/* Skill exchange preview */}
        {(formData.skillTeach || formData.skillLearn) && (
          <div className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold ${
            d ? "bg-indigo-500/8 border-indigo-500/20 text-indigo-300" : "bg-indigo-50 border-indigo-100 text-indigo-600"
          }`}>
            <span>{formData.skillTeach || "?"}</span>
            <span className="text-lg">↔</span>
            <span>{formData.skillLearn || "?"}</span>
          </div>
        )}

        {/* Date */}
        <div>
          <label className={labelCls}>Date</label>
          <div className="relative">
            <FieldIcon icon={LucideCalendar} />
            <input
              type="date" name="date"
              value={formData.date} onChange={handleChange}
              style={{ colorScheme: d ? "dark" : "light" }}
              className={inputCls} required
            />
          </div>
        </div>

        {/* Times */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Start Time</label>
            <div className="relative">
              <FieldIcon icon={LucideClock} />
              <input
                type="time" name="startTime"
                value={formData.startTime} onChange={handleChange}
                style={{ colorScheme: d ? "dark" : "light" }}
                className={inputCls} required
              />
            </div>
          </div>
          <div>
            <label className={labelCls}>End Time</label>
            <div className="relative">
              <FieldIcon icon={LucideClock} />
              <input
                type="time" name="endTime"
                value={formData.endTime} onChange={handleChange}
                style={{ colorScheme: d ? "dark" : "light" }}
                className={inputCls} required
              />
            </div>
          </div>
        </div>

        {/* Meeting link */}
        <div>
          <label className={labelCls}>Meeting Link</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <FieldIcon icon={LucideLink} />
              <input
                type="text" name="meetingLink" placeholder="https://… or auto-generate"
                value={formData.meetingLink} onChange={handleChange}
                className={`${inputCls} ${generated ? (d ? "border-indigo-500/40" : "border-indigo-300") : ""}`}
              />
              {generated && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleCreateMeeting}
              title="Auto-generate meeting link"
              className={`px-4 py-3 rounded-xl flex items-center gap-1.5 text-xs font-bold transition-all duration-200 hover:scale-105 flex-shrink-0 border ${
                d
                  ? "bg-indigo-500/12 text-indigo-400 hover:bg-indigo-500/25 border-indigo-500/20"
                  : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-indigo-100"
              }`}
            >
              <LucideSparkles className="w-3.5 h-3.5" />
              Auto
            </button>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className={labelCls}>Notes <span className={`normal-case font-normal ${d ? "text-slate-500" : "text-slate-400"}`}>(optional)</span></label>
          <div className="relative">
            <div className="absolute left-3 top-3 pointer-events-none">
              <LucideAlignLeft className={`w-4 h-4 ${d ? "text-slate-500" : "text-slate-400"}`} />
            </div>
            <textarea
              name="notes" rows={2}
              placeholder="Agenda, topics, prerequisites…"
              value={formData.notes} onChange={handleChange}
              className={`${inputCls} resize-none`}
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 mt-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600
            hover:from-indigo-400 hover:via-violet-400 hover:to-purple-500
            text-white font-bold rounded-xl text-sm transition-all duration-300
            hover:scale-[1.02] hover:shadow-xl hover:shadow-indigo-500/30
            disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100
            flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Scheduling…
            </>
          ) : (
            <>
              <LucideCalendar className="w-4 h-4" />
              Confirm Session
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default SessionForm;

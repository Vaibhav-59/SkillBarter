import { useState, useEffect } from "react";
import api from "../../utils/api";
import { showError } from "../../utils/toast";
import { useTheme } from "../../hooks/useTheme";

// ── Icon Components ──────────────────────────────────────────────
const VideoIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.362a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);
const RefreshIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);
const UsersIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
  </svg>
);
const CheckIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const ClockIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// ── Stat Card ────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, accent, live, d }) {
  const accentMap = {
    indigo:  { ring: "ring-indigo-500/30",  iconBg: "from-indigo-500 to-violet-600",  val: d ? "text-indigo-300"  : "text-indigo-600",  badge: d ? "text-indigo-400"  : "text-indigo-500" },
    emerald: { ring: "ring-emerald-500/30", iconBg: "from-emerald-500 to-teal-500",   val: d ? "text-emerald-300" : "text-emerald-600", badge: d ? "text-emerald-400" : "text-emerald-500" },
    violet:  { ring: "ring-violet-500/30",  iconBg: "from-violet-500 to-purple-600",  val: d ? "text-violet-300"  : "text-violet-600",  badge: d ? "text-violet-400"  : "text-violet-500" },
    slate:   { ring: "ring-slate-500/20",   iconBg: "from-slate-500 to-slate-600",    val: d ? "text-slate-200"   : "text-slate-700",   badge: d ? "text-slate-400"   : "text-slate-500" },
  };
  const c = accentMap[accent] || accentMap.indigo;

  return (
    <div className={`relative overflow-hidden rounded-2xl border p-5 ring-1 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group ${
      d
        ? `bg-[#0d1120]/80 border-white/5 ${c.ring} shadow-black/30`
        : `bg-white border-slate-200/70 ${c.ring} shadow-slate-200/60`
    } shadow-lg`}>
      {/* subtle gradient shimmer */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br ${
        d ? "from-white/[0.02] to-transparent" : "from-indigo-50/60 to-transparent"
      }`} />

      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className={`text-xs font-semibold uppercase tracking-widest mb-2 ${d ? "text-slate-400" : "text-slate-500"}`}>
            {label}
          </p>
          <div className="flex items-end gap-2.5">
            <span className={`text-4xl font-black leading-none ${c.val}`}>{value}</span>
            {live && value > 0 && (
              <span className="flex items-center gap-1 mb-0.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <span className={`text-xs font-semibold ${d ? "text-emerald-400" : "text-emerald-600"}`}>LIVE</span>
              </span>
            )}
          </div>
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${c.iconBg} shadow-lg`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* bottom accent bar */}
      <div className={`absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r ${c.iconBg} opacity-50`} />
    </div>
  );
}

// ── Status Badge ─────────────────────────────────────────────────
function StatusBadge({ status, d }) {
  if (status === "active") {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
        d ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-emerald-50 text-emerald-700 border-emerald-200"
      }`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
        Live
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
      d ? "bg-slate-500/15 text-slate-400 border-slate-500/25" : "bg-slate-100 text-slate-500 border-slate-200"
    }`}>
      <CheckIcon className="w-3 h-3" />
      Ended
    </span>
  );
}

// ── Avatar ───────────────────────────────────────────────────────
function Avatar({ name, size = "sm" }) {
  const initials = name ? name.slice(0, 2).toUpperCase() : "??";
  const sz = size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm";
  const colors = ["from-indigo-500 to-violet-600", "from-emerald-500 to-teal-500", "from-violet-500 to-purple-600", "from-pink-500 to-rose-500", "from-amber-500 to-orange-500"];
  const idx = name ? name.charCodeAt(0) % colors.length : 0;
  return (
    <div className={`${sz} rounded-full bg-gradient-to-br ${colors[idx]} flex items-center justify-center text-white font-bold flex-shrink-0 shadow-sm`}>
      {initials}
    </div>
  );
}

// ── Duration helper ───────────────────────────────────────────────
function formatDuration(startedAt, endedAt) {
  const end = endedAt ? new Date(endedAt) : new Date();
  const diffMs = end - new Date(startedAt);
  if (diffMs < 0) return "—";
  const mins = Math.floor(diffMs / 60000);
  const hrs = Math.floor(mins / 60);
  if (hrs > 0) return `${hrs}h ${mins % 60}m`;
  return `${mins}m`;
}

// ── Main Component ───────────────────────────────────────────────
export default function ActiveMeetings() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all | active | ended
  const { isDarkMode: d } = useTheme();

  const fetchMeetings = async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/meetings");
      if (response.data.success) {
        setMeetings(response.data.data);
      } else {
        showError("Failed to fetch active meetings");
      }
    } catch (err) {
      showError(err.response?.data?.message || "Failed to fetch active meetings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
    const interval = setInterval(fetchMeetings, 15000);
    return () => clearInterval(interval);
  }, []);

  const totalMeetings = meetings.length;
  const activeCount = meetings.filter(m => m.status === "active").length;
  const endedCount = totalMeetings - activeCount;
  const totalParticipants = meetings.reduce((sum, m) => sum + (m.participants?.length || 0), 0);

  const filtered = filter === "active"
    ? meetings.filter(m => m.status === "active")
    : filter === "ended"
    ? meetings.filter(m => m.status !== "active")
    : meetings;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      d ? "bg-[#060912]" : "bg-slate-50"
    }`}>
      {/* top accent line */}
      <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <VideoIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-2xl font-black tracking-tight ${d ? "text-white" : "text-slate-900"}`}>
                Meetings Monitor
              </h1>
              <p className={`text-sm font-medium ${d ? "text-slate-400" : "text-slate-500"}`}>
                Real-time video session analytics · auto-refreshes every 15s
              </p>
            </div>
          </div>

          <button
            onClick={fetchMeetings}
            disabled={loading}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-60 shadow-md ${
              d
                ? "bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/25 hover:border-indigo-400/40"
                : "bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 hover:border-indigo-300"
            }`}
          >
            <RefreshIcon className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={VideoIcon}  label="Total Sessions"   value={totalMeetings}    accent="indigo"  d={d} />
          <StatCard icon={VideoIcon}  label="Live Now"         value={activeCount}       accent="emerald" live d={d} />
          <StatCard icon={CheckIcon}  label="Completed"        value={endedCount}        accent="violet"  d={d} />
          <StatCard icon={UsersIcon}  label="Total Connected"  value={totalParticipants} accent="slate"   d={d} />
        </div>

        {/* ── Table Card ── */}
        <div className={`rounded-2xl border overflow-hidden shadow-xl transition-colors duration-300 ${
          d ? "bg-[#0d1120]/90 border-white/5 shadow-black/40" : "bg-white border-slate-200/80 shadow-slate-200/50"
        }`}>

          {/* table header */}
          <div className={`px-5 py-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            d ? "border-white/5 bg-white/[0.02]" : "border-slate-100 bg-slate-50/60"
          }`}>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold ${d ? "text-white" : "text-slate-800"}`}>
                Session Log
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                d ? "bg-indigo-500/15 text-indigo-400" : "bg-indigo-50 text-indigo-600"
              }`}>
                {filtered.length} records
              </span>
            </div>

            {/* filter pills */}
            <div className={`flex items-center gap-1 p-1 rounded-xl ${d ? "bg-white/5" : "bg-slate-100"}`}>
              {[
                { id: "all",    label: "All" },
                { id: "active", label: "Live" },
                { id: "ended",  label: "Ended" },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all duration-200 ${
                    filter === f.id
                      ? d
                        ? "bg-indigo-500 text-white shadow-sm shadow-indigo-500/30"
                        : "bg-white text-indigo-600 shadow-sm shadow-slate-200"
                      : d
                        ? "text-slate-400 hover:text-slate-200"
                        : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* body */}
          {loading && meetings.length === 0 ? (
            // Skeleton loader
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className={`h-14 rounded-xl animate-pulse ${d ? "bg-white/5" : "bg-slate-100"}`} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-24 flex flex-col items-center justify-center gap-4">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center border-2 border-dashed ${
                d ? "border-slate-700 bg-white/[0.02]" : "border-slate-200 bg-slate-50"
              }`}>
                <VideoIcon className={`w-9 h-9 ${d ? "text-slate-600" : "text-slate-300"}`} />
              </div>
              <div className="text-center">
                <p className={`font-bold text-base ${d ? "text-slate-300" : "text-slate-700"}`}>No meetings found</p>
                <p className={`text-sm mt-1 ${d ? "text-slate-500" : "text-slate-400"}`}>
                  {filter === "all" ? "No meeting data available yet." : `No ${filter} sessions.`}
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className={`border-b ${d ? "border-white/5" : "border-slate-100"}`}>
                    {["Status", "Meeting ID", "Host", "Participants", "Started", "Duration"].map(col => (
                      <th
                        key={col}
                        className={`px-5 py-3 text-left text-xs font-semibold uppercase tracking-widest ${
                          d ? "text-slate-500" : "text-slate-400"
                        }`}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className={`divide-y ${d ? "divide-white/[0.04]" : "divide-slate-50"}`}>
                  {filtered.map((meeting, idx) => (
                    <tr
                      key={meeting._id}
                      className={`group transition-colors duration-150 ${
                        d ? "hover:bg-indigo-500/[0.04]" : "hover:bg-indigo-50/50"
                      }`}
                    >
                      {/* Status */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <StatusBadge status={meeting.status} d={d} />
                      </td>

                      {/* Meeting ID */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`font-mono text-xs px-2.5 py-1 rounded-lg ${
                          d ? "bg-slate-800 text-indigo-300" : "bg-slate-100 text-slate-600"
                        }`}>
                          #{meeting.meetingId?.slice(-8) || meeting._id?.slice(-8)}
                        </span>
                      </td>

                      {/* Host */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        {meeting.host ? (
                          <div className="flex items-center gap-2.5">
                            <Avatar name={meeting.host.name} />
                            <div>
                              <p className={`text-sm font-semibold leading-tight ${d ? "text-slate-100" : "text-slate-800"}`}>
                                {meeting.host.name}
                              </p>
                              {meeting.host.email && (
                                <p className={`text-xs leading-tight mt-0.5 ${d ? "text-slate-500" : "text-slate-400"}`}>
                                  {meeting.host.email}
                                </p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className={`text-sm italic ${d ? "text-slate-600" : "text-slate-400"}`}>
                            Unknown / Deleted
                          </span>
                        )}
                      </td>

                      {/* Participants */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${
                            (meeting.participants?.length || 0) > 0
                              ? d ? "bg-violet-500/15 text-violet-300" : "bg-violet-50 text-violet-600"
                              : d ? "bg-slate-800 text-slate-500" : "bg-slate-100 text-slate-400"
                          }`}>
                            <UsersIcon className="w-3.5 h-3.5" />
                            <span className="text-xs font-bold">{meeting.participants?.length || 0}</span>
                          </div>
                        </div>
                      </td>

                      {/* Started */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div>
                          <p className={`text-xs font-medium ${d ? "text-slate-300" : "text-slate-600"}`}>
                            {new Date(meeting.startedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </p>
                          <p className={`text-xs mt-0.5 ${d ? "text-slate-500" : "text-slate-400"}`}>
                            {new Date(meeting.startedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </td>

                      {/* Duration */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <ClockIcon className={`w-3.5 h-3.5 flex-shrink-0 ${
                            meeting.status === "active"
                              ? d ? "text-emerald-400" : "text-emerald-500"
                              : d ? "text-slate-500" : "text-slate-400"
                          }`} />
                          <span className={`text-xs font-semibold ${
                            meeting.status === "active"
                              ? d ? "text-emerald-400" : "text-emerald-600"
                              : d ? "text-slate-400" : "text-slate-500"
                          }`}>
                            {meeting.status === "active"
                              ? `${formatDuration(meeting.startedAt, null)} ongoing`
                              : formatDuration(meeting.startedAt, meeting.endedAt)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* table footer */}
          {filtered.length > 0 && (
            <div className={`px-5 py-3 border-t flex items-center justify-between ${
              d ? "border-white/5 bg-white/[0.015]" : "border-slate-100 bg-slate-50/40"
            }`}>
              <p className={`text-xs ${d ? "text-slate-500" : "text-slate-400"}`}>
                Showing <span className={`font-semibold ${d ? "text-slate-300" : "text-slate-600"}`}>{filtered.length}</span> of{" "}
                <span className={`font-semibold ${d ? "text-slate-300" : "text-slate-600"}`}>{totalMeetings}</span> sessions
              </p>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className={`text-xs ${d ? "text-slate-500" : "text-slate-400"}`}>Auto-refreshing</span>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

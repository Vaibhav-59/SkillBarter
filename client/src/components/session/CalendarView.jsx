import React from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useTheme } from "../../hooks/useTheme";

const localizer = momentLocalizer(moment);

const STATUS_COLORS = {
  accepted:  { grad: "linear-gradient(135deg,#6366f1,#8b5cf6)", shadow: "rgba(99,102,241,0.4)"  },
  pending:   { grad: "linear-gradient(135deg,#f59e0b,#d97706)", shadow: "rgba(245,158,11,0.4)"  },
  rejected:  { grad: "linear-gradient(135deg,#ef4444,#b91c1c)", shadow: "rgba(239,68,68,0.4)"   },
  completed: { grad: "linear-gradient(135deg,#3b82f6,#1d4ed8)", shadow: "rgba(59,130,246,0.4)"  },
  default:   { grad: "linear-gradient(135deg,#6366f1,#8b5cf6)", shadow: "rgba(99,102,241,0.3)"  },
};

const CalendarView = ({ sessions, onSelectSession }) => {
  const { isDarkMode: d } = useTheme();

  const events = sessions.map((s) => {
    const start = new Date(s.date);
    const [sh, sm] = s.startTime.split(":");
    start.setHours(+sh, +sm);

    const end = new Date(s.date);
    const [eh, em] = s.endTime.split(":");
    end.setHours(+eh, +em);

    return { title: `${s.skillTeach} ↔ ${s.skillLearn}`, start, end, resource: s };
  });

  const EventComponent = ({ event }) => (
    <div className="flex items-center h-full px-1 overflow-hidden">
      <div className="flex-1 text-xs font-semibold truncate z-10 leading-tight">
        {event.title}
      </div>
    </div>
  );

  const eventPropGetter = (event) => {
    const cfg = STATUS_COLORS[event.resource.status] || STATUS_COLORS.default;
    return {
      style: {
        background: cfg.grad,
        borderRadius: "0.5rem",
        color: "white",
        border: "none",
        boxShadow: `0 2px 8px ${cfg.shadow}`,
        fontSize: "0.75rem",
        fontWeight: 600,
        transition: "transform .15s, box-shadow .15s",
      },
    };
  };

  const [view, setView] = React.useState(Views.MONTH);
  const [date, setDate] = React.useState(new Date());

  const bg     = d ? "rgba(22,27,46,0.95)"    : "rgba(255,255,255,0.97)";
  const border = d ? "rgba(99,102,241,0.18)"  : "rgba(224,231,255,0.8)";
  const text   = d ? "#e2e8f0"                : "#374151";
  const dim    = d ? "#6b7280"                : "#9ca3af";
  const hdr    = d ? "rgba(17,21,37,0.5)"    : "rgba(249,250,251,0.6)";
  const todayBg = d ? "rgba(99,102,241,0.10)" : "rgba(99,102,241,0.07)";
  const offrange = d ? "rgba(15,17,23,0.4)"  : "rgba(248,250,252,0.6)";
  const btnBg  = d ? "rgba(17,24,48,0.9)"    : "rgba(255,255,255,0.9)";
  const btnHov = d ? "rgba(49,46,129,0.4)"   : "rgba(238,242,255,1)";
  const activeBg = d ? "rgba(99,102,241,0.2)" : "rgba(199,210,254,0.6)";


  return (
    <div className={`h-[650px] w-full rounded-3xl border overflow-hidden shadow-2xl backdrop-blur-xl relative ${
      d ? "bg-[#10152b]/80 border-indigo-500/15 shadow-indigo-500/8" : "bg-white/90 border-slate-200 shadow-slate-200/80"
    }`}>
      {/* Ambient glows */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-violet-500/6 rounded-full blur-3xl pointer-events-none" />

      {/* ─── Global calendar CSS overrides ─── */}
      <style>{`
        .rbc-calendar {
          font-family: 'Inter', 'Segoe UI', sans-serif;
          color: ${text};
        }
        /* ── Views ── */
        .rbc-month-view,
        .rbc-time-view,
        .rbc-agenda-view {
          border-color: ${border};
          border-radius: 1rem;
          overflow: hidden;
          background: ${bg};
        }
        /* ── Headers ── */
        .rbc-header {
          padding: 0.65rem 0.5rem;
          font-weight: 700;
          text-transform: uppercase;
          font-size: 0.7rem;
          letter-spacing: 0.08em;
          color: ${dim};
          background: ${hdr};
          border-bottom: 1px solid ${border};
          border-left: 1px solid ${border};
        }
        .rbc-header + .rbc-header { border-left: 1px solid ${border}; }
        /* ── Rows ── */
        .rbc-month-row + .rbc-month-row { border-top: 1px solid ${border}; }
        .rbc-day-bg + .rbc-day-bg       { border-left: 1px solid ${border}; }
        .rbc-day-bg.rbc-today           { background-color: ${todayBg}; }
        .rbc-off-range-bg               { background: ${offrange}; }
        /* ── Time grid ── */
        .rbc-day-slot .rbc-time-slot   { border-top: 1px dashed ${border}; }
        .rbc-time-content              { border-top: 1px solid ${border}; }
        .rbc-time-header-content       { border-left: 1px solid ${border}; }
        .rbc-timeslot-group            { border-bottom: 1px solid ${border}; }
        .rbc-time-view .rbc-allday-cell {
          background: ${hdr};
          border-bottom: 1px solid ${border};
        }
        .rbc-time-view .rbc-time-gutter {
          color: ${dim};
          background: ${hdr};
          font-size: 0.7rem;
          font-weight: 600;
        }
        /* ── Date cells ── */
        .rbc-date-cell {
          padding: 0.25rem 0.5rem;
          font-weight: 500;
          font-size: 0.8rem;
          color: ${text};
        }
        .rbc-date-cell.rbc-now {
          font-weight: 800;
          color: #818cf8;
        }
        /* ── Events ── */
        .rbc-event {
          padding: 2px 5px;
          transition: transform .15s ease, box-shadow .15s ease;
        }
        .rbc-event:hover {
          transform: translateY(-1px) scale(1.02) !important;
          box-shadow: 0 6px 20px rgba(99,102,241,0.4) !important;
          opacity: 1 !important;
        }
        .rbc-selected { outline: 2px solid rgba(165,180,252,0.8); outline-offset: 1px; }
        /* ── Toolbar ── */
        .rbc-toolbar {
          margin-bottom: 1.25rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.5rem;
          padding: 0 0.25rem;
        }
        .rbc-toolbar button {
          color: ${text};
          border: 1px solid ${border};
          background: ${btnBg};
          padding: 0.45rem 0.9rem;
          font-weight: 600;
          font-size: 0.8rem;
          border-radius: 0.65rem;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .rbc-toolbar button:hover {
          background: ${btnHov};
          color: #818cf8;
          border-color: rgba(99,102,241,0.4);
        }
        .rbc-toolbar button:active,
        .rbc-toolbar button.rbc-active {
          background: ${activeBg} !important;
          color: #818cf8 !important;
          border-color: rgba(99,102,241,0.5) !important;
          box-shadow: none !important;
        }
        .rbc-toolbar .rbc-toolbar-label {
          font-weight: 800;
          font-size: 1.25rem;
          color: ${d ? "transparent" : "#1e293b"};
          background: ${d ? "linear-gradient(to right,#a5b4fc,#c4b5fd,#818cf8)" : "none"};
          -webkit-background-clip: ${d ? "text" : "border-box"};
          background-clip: ${d ? "text" : "border-box"};
        }
        /* ── Agenda ── */
        .rbc-agenda-view table.rbc-agenda-table {
          border: 1px solid ${border};
          border-radius: 0.5rem;
        }
        .rbc-agenda-view table.rbc-agenda-table tbody > tr > td + td { border-left: 1px solid ${border}; }
        .rbc-agenda-view table.rbc-agenda-table tbody > tr + tr       { border-top: 1px solid ${border}; }
        .rbc-agenda-view table.rbc-agenda-table thead > tr > th {
          border-bottom: 1px solid ${border};
          padding: 0.6rem 0.5rem;
          color: ${dim};
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .rbc-agenda-time-cell,
        .rbc-agenda-date-cell,
        .rbc-agenda-event-cell {
          color: ${text};
          padding: 0.65rem 0.5rem;
          font-size: 0.8rem;
        }
        /* ── Show-more ── */
        .rbc-show-more {
          color: #818cf8;
          font-weight: 700;
          font-size: 0.72rem;
          background: none;
          border: none;
          padding: 1px 4px;
        }
        .rbc-show-more:hover { color: #a5b4fc; }
      `}</style>

      <div className="relative z-10 h-full p-4 md:p-5">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "100%" }}
          onSelectEvent={(e) => onSelectSession(e.resource)}
          views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
          view={view}
          onView={setView}
          date={date}
          onNavigate={setDate}
          components={{ event: EventComponent }}
          eventPropGetter={eventPropGetter}
          popup
          selectable
        />
      </div>
    </div>
  );
};

export default CalendarView;

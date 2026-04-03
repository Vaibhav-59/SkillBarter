import { useState, useContext } from "react";
import { ThemeContext } from "../../contexts/ThemeContext";

function ControlBtn({ onClick, active, activeClass, inactiveClass, label, icon, danger, hideOnMobile = false }) {
  return (
    <button
      onClick={onClick}
      className={`group flex flex-col items-center gap-1 sm:gap-1.5 focus:outline-none ${
        hideOnMobile ? "hidden sm:flex" : "flex"
      }`}
      title={label}
    >
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center border font-medium
        transition-all duration-200 group-hover:scale-110 group-active:scale-95
        ${active ? activeClass : inactiveClass}`}>
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {icon}
        </svg>
      </div>
      <span className={`hidden sm:block text-xs font-medium transition-colors ${
        active
          ? danger ? "text-red-400" : "text-indigo-300"
          : "text-slate-400 group-hover:text-slate-200"
      }`}>
        {label}
      </span>
    </button>
  );
}

export default function MeetingControls({
  isMuted,
  isCamOff,
  isScreenSharing,
  isChatOpen,
  isParticipantsOpen,
  isRecording,
  participantCount,
  meetingId,
  onToggleMute,
  onToggleCam,
  onToggleScreen,
  onToggleChat,
  onToggleParticipants,
  onToggleRecording,
  onLeave,
}) {
  const [copied, setCopied] = useState(false);
  const { theme } = useContext(ThemeContext) || { theme: "dark" };
  const isDark = theme === "dark";

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/meeting/${meetingId}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const panelBg   = isDark ? "bg-[#11152a]/90 border-white/8 shadow-2xl"   : "bg-white/80 border-slate-200 shadow-[0_-8px_30px_rgba(0,0,0,0.04)]";
  const btnBase   = isDark ? "bg-[#1e2540] border-white/10 text-slate-300 hover:bg-[#252d4a] hover:text-white hover:border-white/20 hover:shadow-lg"
                           : "bg-white border-slate-200 shadow-sm text-slate-600 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-300 hover:shadow-md";
  const activeRed = isDark ? "bg-red-500/20 border-red-500/40 text-red-400 hover:bg-red-500/30" : "bg-red-50 border-red-200 text-red-600 shadow-sm hover:bg-red-100";
  const activeBlu = isDark ? "bg-blue-500/20 border-blue-500/40 text-blue-400 hover:bg-blue-500/30" : "bg-blue-50 border-blue-200 text-blue-600 shadow-sm hover:bg-blue-100";
  const activeInd = isDark ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-400 hover:bg-indigo-500/30" : "bg-indigo-50 border-indigo-200 text-indigo-600 shadow-sm hover:bg-indigo-100";
  const recActive = isDark ? "bg-red-500/30 border-red-500/60 text-red-400 animate-pulse" : "bg-red-100 border-red-300 text-red-600 shadow-sm animate-pulse";

  return (
    <div className={`relative flex items-center justify-between px-3 sm:px-6 py-3 sm:py-3.5 backdrop-blur-xl border-t ${panelBg}`}>

      {/* Left: Meeting info */}
      <div className="flex items-center gap-4 min-w-0 flex-1">
        {/* Participant count badge — dot only, no text label */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-semibold transition-colors duration-300 ${
          isDark ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-300"
                 : "bg-indigo-50/80 border-indigo-100 shadow-sm text-indigo-600"
        }`}>
          <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
          {participantCount}
        </div>

        {/* Meeting ID */}
        <div className="hidden sm:flex flex-col">
          <span className={`text-xs transition-colors duration-300 ${isDark ? "text-slate-500" : "text-slate-500"}`}>Meeting ID</span>
          <span className={`text-sm font-mono font-semibold tracking-widest transition-colors duration-300 ${isDark ? "text-slate-300" : "text-slate-800"}`}>
            {meetingId}
          </span>
        </div>

        {/* Copy link */}
        <button
          onClick={copyLink}
          title="Copy meeting link"
          className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium
            transition-all duration-300 hover:scale-105 ${
            isDark
              ? "bg-white/5 border-white/10 text-slate-400 hover:bg-indigo-500/20 hover:border-indigo-500/30 hover:text-indigo-300"
              : "bg-white border-slate-200 shadow-sm text-slate-600 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600"
          }`}
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy Link
            </>
          )}
        </button>

        {/* Status pills */}
        <div className="flex items-center gap-2">
          {isRecording && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500/15 border border-red-500/30 rounded-full">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              <span className="text-red-400 text-xs font-bold">REC</span>
            </div>
          )}
          {isScreenSharing && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/15 border border-blue-500/30 rounded-full">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
              <span className="text-blue-400 text-xs font-bold">Sharing</span>
            </div>
          )}
        </div>
      </div>

      {/* Center: Controls */}
      <div className="flex items-center gap-1.5 sm:gap-3">
        {/* Mic */}
        <ControlBtn
          onClick={onToggleMute}
          active={isMuted}
          activeClass={activeRed}
          inactiveClass={btnBase}
          label={isMuted ? "Unmute" : "Mute"}
          danger={isMuted}
          icon={isMuted ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          )}
        />

        {/* Camera */}
        <ControlBtn
          onClick={onToggleCam}
          active={isCamOff}
          activeClass={activeRed}
          inactiveClass={btnBase}
          label={isCamOff ? "Start Cam" : "Stop Cam"}
          danger={isCamOff}
          icon={isCamOff ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.362a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8M3 8v8a2 2 0 002 2h8M3 8l18 8" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.362a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          )}
        />

        {/* Screen share */}
        <ControlBtn
          onClick={onToggleScreen}
          active={isScreenSharing}
          activeClass={activeBlu}
          inactiveClass={btnBase}
          label={isScreenSharing ? "Stop Share" : "Share"}
          icon={
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          }
        />

        {/* Record */}
        <ControlBtn
          onClick={onToggleRecording}
          active={isRecording}
          activeClass={recActive}
          inactiveClass={btnBase}
          label={isRecording ? "Stop Rec" : "Record"}
          icon={
            isRecording ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z M9 10h6v4H9z" />
            ) : (
              <circle cx="12" cy="12" r="5" strokeWidth={2} />
            )
          }
        />

        {/* Participants */}
        <ControlBtn
          onClick={onToggleParticipants}
          active={isParticipantsOpen}
          activeClass={activeInd}
          inactiveClass={btnBase}
          label="People"
          icon={
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          }
        />

        {/* Chat */}
        <ControlBtn
          onClick={onToggleChat}
          active={isChatOpen}
          activeClass={activeInd}
          inactiveClass={btnBase}
          label="Chat"
          icon={
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          }
        />

        {/* Leave — always standalone red pill */}
        <button
          onClick={onLeave}
          title="Leave meeting"
          className="group flex flex-col items-center gap-1 sm:gap-1.5 ml-1 sm:ml-2"
        >
          <div className="w-12 h-10 sm:w-14 sm:h-12 bg-gradient-to-r from-red-500 to-rose-600
            hover:from-red-400 hover:to-rose-500
            rounded-2xl flex items-center justify-center
            shadow-lg shadow-red-500/30 hover:shadow-red-500/50
            group-hover:scale-110 group-active:scale-95 transition-all duration-200
            border border-red-400/30">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white rotate-[135deg]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <span className="hidden sm:block text-xs font-medium text-red-400">Leave</span>
        </button>
      </div>

      {/* Right: spacer for balance */}
      <div className="flex-1" />
    </div>
  );
}

import { useState, useRef, useEffect, useCallback } from "react";

function fmt(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, "0");
  const s = String(sec % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function getSupportedMimeType() {
  const types = ["audio/webm;codecs=opus","audio/webm","audio/ogg;codecs=opus","audio/ogg","audio/mp4"];
  for (const t of types) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(t)) return t;
  }
  return "";
}

/**
 * Voice Note Recorder — indigo/violet theme, light/dark aware
 * Props: onSend(blob, durationSecs), disabled, isDarkMode
 */
export default function VoiceRecorder({ onSend, disabled, isDarkMode }) {
  const [state,    setState]   = useState("idle"); // idle | recording | preview
  const [seconds,  setSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [bars,     setBars]    = useState(Array(30).fill(3));

  const mediaRecorderRef = useRef(null);
  const chunksRef        = useRef([]);
  const timerRef         = useRef(null);
  const animFrameRef     = useRef(null);
  const streamRef        = useRef(null);
  const audioCtxRef      = useRef(null);
  const blobRef          = useRef(null);
  const durationRef      = useRef(0);
  const cancelledRef     = useRef(false);
  const audioUrlRef      = useRef(null);

  const stopTimerAndAnimation = () => {
    clearInterval(timerRef.current);
    cancelAnimationFrame(animFrameRef.current);
    setBars(Array(30).fill(3));
  };
  const stopStream = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
  };
  const revokeUrl = () => {
    if (audioUrlRef.current) { URL.revokeObjectURL(audioUrlRef.current); audioUrlRef.current = null; }
  };

  const startRecording = useCallback(async () => {
    if (disabled) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      cancelledRef.current = false;

      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const src      = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      src.connect(analyser);

      const draw = () => {
        animFrameRef.current = requestAnimationFrame(draw);
        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        setBars(Array.from(data).slice(0, 30).map(v => Math.max(3, Math.round((v / 255) * 40))));
      };
      draw();

      const mimeType = getSupportedMimeType();
      const mr = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = mr;
      chunksRef.current = [];

      mr.ondataavailable = e => { if (e.data && e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        if (cancelledRef.current) return;
        const mime = mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: mime });
        blobRef.current = blob;
        const url = URL.createObjectURL(blob);
        audioUrlRef.current = url;
        setAudioUrl(url);
        setState("preview");
      };

      mr.start(100);
      setState("recording");
      setSeconds(0);
      durationRef.current = 0;
      timerRef.current = setInterval(() => {
        setSeconds(s => { const next = s + 1; durationRef.current = next; return next; });
      }, 1000);
    } catch {
      alert("Could not access microphone. Please check permissions.");
    }
  }, [disabled]);

  const stopRecording = useCallback(() => {
    stopTimerAndAnimation(); stopStream();
    const mr = mediaRecorderRef.current;
    if (mr && mr.state !== "inactive") mr.stop();
  }, []);

  const cancel = useCallback(() => {
    cancelledRef.current = true;
    stopTimerAndAnimation(); stopStream();
    const mr = mediaRecorderRef.current;
    if (mr && mr.state !== "inactive") mr.stop();
    revokeUrl();
    blobRef.current = null; chunksRef.current = [];
    setAudioUrl(null); setSeconds(0); durationRef.current = 0;
    setState("idle");
  }, []);

  const send = useCallback(() => {
    const blob = blobRef.current;
    if (!blob) return;
    const dur = durationRef.current || seconds;
    onSend(blob, dur);
    revokeUrl();
    blobRef.current = null; chunksRef.current = [];
    setAudioUrl(null); setSeconds(0); durationRef.current = 0;
    setState("idle");
  }, [onSend, seconds]);

  useEffect(() => () => {
    clearInterval(timerRef.current);
    cancelAnimationFrame(animFrameRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    audioCtxRef.current?.close().catch(() => {});
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
  }, []);

  /* ── shared icon helpers ─────────────────────────────── */
  const btnBase = `flex-shrink-0 flex items-center justify-center rounded-xl transition-all duration-200`;
  const cancelBtn = `w-8 h-8 ${btnBase} bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 active:scale-95`;
  const sendGrad  = { background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 2px 10px rgba(99,102,241,0.3)" };

  const stopIcon = (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  );
  const sendIcon = (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  );
  const trashIcon = (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
  const xIcon = (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
  const micIcon = (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2a3 3 0 013 3v6a3 3 0 01-6 0V5a3 3 0 013-3zM5.5 10.5a6.5 6.5 0 0013 0H20a8 8 0 01-7 7.93V21h-2v-2.57A8 8 0 014 10.5H5.5z" />
    </svg>
  );

  /* ── IDLE ────────────────────────────────────────────── */
  if (state === "idle") {
    return (
      <button
        type="button" onClick={startRecording} disabled={disabled}
        title="Record voice note"
        className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl border transition-all duration-200 ${
          disabled
            ? "opacity-40 cursor-not-allowed border-gray-300/30 bg-gray-100/20"
            : isDarkMode
              ? "border-slate-600/40 bg-slate-800/60 text-slate-400 hover:text-indigo-300 hover:border-indigo-500/40 hover:bg-indigo-500/10 active:scale-95"
              : "border-indigo-100 bg-indigo-50/60 text-gray-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-100/60 active:scale-95"
        }`}
      >
        {micIcon}
      </button>
    );
  }

  /* ── RECORDING ───────────────────────────────────────── */
  if (state === "recording") {
    return (
      <div className={`flex-1 flex items-center gap-2.5 px-3 py-2 rounded-2xl border ${
        isDarkMode ? "bg-slate-800/60 border-red-500/30" : "bg-red-50/60 border-red-200"
      }`}>
        {/* Cancel */}
        <button type="button" onClick={cancel} title="Cancel" className={cancelBtn}>{xIcon}</button>

        {/* Waveform */}
        <div className="flex-1 flex items-center gap-[2px] h-8 overflow-hidden">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-1 flex-shrink-0" />
          {bars.map((h, i) => (
            <div key={i} className="flex-shrink-0 w-[3px] rounded-full transition-all duration-75"
              style={{ height: `${h}px`, background: "linear-gradient(to top, #6366f1, #8b5cf6)" }} />
          ))}
        </div>

        {/* Timer */}
        <span className="text-sm font-mono font-bold text-red-400 tabular-nums flex-shrink-0">{fmt(seconds)}</span>

        {/* Stop */}
        <button type="button" onClick={stopRecording} title="Stop recording"
          className={`flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl text-white active:scale-95 transition-all`}
          style={sendGrad}>
          {stopIcon}
        </button>
      </div>
    );
  }

  /* ── PREVIEW ─────────────────────────────────────────── */
  return (
    <div className={`flex-1 flex items-center gap-2.5 px-3 py-2 rounded-2xl border ${
      isDarkMode ? "bg-slate-800/60 border-indigo-500/30" : "bg-indigo-50/60 border-indigo-200"
    }`}>
      {/* Discard */}
      <button type="button" onClick={cancel} title="Discard" className={cancelBtn}>{trashIcon}</button>

      {/* Audio preview */}
      <div className="flex-1 flex items-center gap-2 min-w-0">
        <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center ${isDarkMode ? "text-indigo-400" : "text-indigo-500"}`}>
          {micIcon}
        </div>
        <audio src={audioUrl} controls className="w-full h-8 opacity-90"
          style={{ filter: isDarkMode ? "invert(0.05) hue-rotate(220deg)" : "hue-rotate(220deg) saturate(0.8)" }} />
        <span className={`text-xs font-mono flex-shrink-0 ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>{fmt(seconds)}</span>
      </div>

      {/* Send */}
      <button type="button" onClick={send} title="Send voice note"
        className={`flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl text-white active:scale-95 transition-all hover:opacity-90`}
        style={sendGrad}>
        {sendIcon}
      </button>
    </div>
  );
}

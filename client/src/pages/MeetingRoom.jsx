import { useState, useEffect, useRef, useCallback, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import socketService from "../utils/socket";
import VideoGrid from "../components/meeting/VideoGrid";
import MeetingControls from "../components/meeting/MeetingControls";
import MeetingChat from "../components/meeting/MeetingChat";
import ParticipantsPanel from "../components/meeting/ParticipantsPanel";
import { ThemeContext } from "../contexts/ThemeContext";

const ICE_CONFIG = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
};

export default function MeetingRoom() {
  const { meetingId: urlMeetingId } = useParams();
  const navigate = useNavigate();

  // Read user info once — stable reference
  const currentUser = useRef(JSON.parse(localStorage.getItem("user") || "{}")).current;
  const displayName = currentUser?.name || "You";

  const [meetingId]           = useState(urlMeetingId || "");
  const [nameInput, setNameInput] = useState(displayName);
  const [error, setError]     = useState("");
  const [copied, setCopied]   = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isChatOpen, setIsChatOpen]             = useState(false);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isHost, setIsHost]           = useState(false);
  const [peers, setPeers]     = useState(new Map());
  const [localStream, setLocalStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  const [hasJoined, setHasJoined] = useState(false);
  const [meetingDuration, setMeetingDuration] = useState(0);

  useEffect(() => {
    let timer;
    if (hasJoined) {
      timer = setInterval(() => {
        setMeetingDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [hasJoined]);

  const formatDuration = (sec) => {
    const hrs = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (hrs > 0) return `${hrs}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const { theme } = useContext(ThemeContext) || { theme: "dark" };
  const isDark = theme === "dark";

  // ── Refs (stable, not re-rendered) ─────────────────────────────────────────
  const localStreamRef    = useRef(null);
  const screenStreamRef   = useRef(null);
  const peerConnsRef      = useRef(new Map());
  const mediaRecorderRef  = useRef(null);
  const recordedChunksRef = useRef([]);
  const removePeerRef     = useRef(null);
  const stopRecordingRef  = useRef(null);

  /**
   * Mutable ref mirrors — give stable callbacks access to latest state
   * WITHOUT adding those state values to useCallback / useEffect deps
   * (which would cause the signaling effect to re-run on every toggle).
   */
  const isMutedRef        = useRef(isMuted);
  const isCamOffRef       = useRef(isCamOff);
  const isScreenSharingRef = useRef(isScreenSharing);
  const isRecordingRef    = useRef(isRecording);
  const meetingIdRef      = useRef(meetingId);
  const nameInputRef      = useRef(nameInput);

  useEffect(() => { isMutedRef.current        = isMuted;        }, [isMuted]);
  useEffect(() => { isCamOffRef.current        = isCamOff;       }, [isCamOff]);
  useEffect(() => { isScreenSharingRef.current = isScreenSharing; }, [isScreenSharing]);
  useEffect(() => { isRecordingRef.current     = isRecording;    }, [isRecording]);
  useEffect(() => { nameInputRef.current       = nameInput;      }, [nameInput]);

  const socket = socketService.socket;

  // ── Get local media ────────────────────────────────────────────────────────
  const getLocalStream = useCallback(async () => {
    if (localStreamRef.current?.active) return localStreamRef.current;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      localStreamRef.current = stream;
      setLocalStream(stream);
      return stream;
    } catch {
      try {
        const audioOnly = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
        localStreamRef.current = audioOnly;
        setLocalStream(audioOnly);
        setIsCamOff(true);
        return audioOnly;
      } catch (err) {
        setError("Cannot access camera/microphone. Check browser permissions.");
        throw err;
      }
    }
  }, []);

  // ── Peer connection factory ─────────────────────────────────────────────────
  const getOrCreatePC = useCallback((remoteSocketId) => {
    if (peerConnsRef.current.has(remoteSocketId)) {
      return peerConnsRef.current.get(remoteSocketId);
    }

    const pc = new RTCPeerConnection(ICE_CONFIG);
    pc.iceQueue = [];

    pc.onicecandidate = ({ candidate }) => {
      if (candidate) {
        socket?.emit("meetingIceCandidate", { targetSocketId: remoteSocketId, candidate });
      }
    };

    pc.ontrack = ({ streams }) => {
      const stream = streams[0];
      if (!stream) return;
      setPeers((prev) => {
        const next  = new Map(prev);
        const entry = next.get(remoteSocketId);
        if (entry) next.set(remoteSocketId, { ...entry, stream });
        return next;
      });
    };

    pc.onconnectionstatechange = () => {
      if (["disconnected", "failed", "closed"].includes(pc.connectionState)) {
        removePeerRef.current?.(remoteSocketId);
      }
    };

    pc.onnegotiationneeded = async () => {
      try {
        if (pc.signalingState !== "stable") return;
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket?.emit("meetingOffer", { targetSocketId: remoteSocketId, offer });
      } catch (err) {
        console.error("Negotiation error:", err);
      }
    };

    // Attach all current local tracks to this new PC
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) =>
        pc.addTrack(t, localStreamRef.current)
      );
    }

    peerConnsRef.current.set(remoteSocketId, pc);
    return pc;
  }, [socket]);

  // ── Remove peer ─────────────────────────────────────────────────────────────
  const removePeer = useCallback((remoteSocketId) => {
    const pc = peerConnsRef.current.get(remoteSocketId);
    if (pc) {
      pc.onconnectionstatechange = null;
      pc.close();
      peerConnsRef.current.delete(remoteSocketId);
    }
    setPeers((prev) => {
      const next = new Map(prev);
      next.delete(remoteSocketId);
      return next;
    });
  }, []);

  removePeerRef.current = removePeer;

  // ── Join meeting ────────────────────────────────────────────────────────────
  const joinMeeting = useCallback(async () => {
    if (!meetingId)        { setError("No meeting ID"); return; }
    if (!nameInput.trim()) { setError("Please enter your name."); return; }
    try { await getLocalStream(); } catch { return; }
    setHasJoined(true);
  }, [meetingId, nameInput, getLocalStream]);

  // Auto-join when name is pre-filled from localStorage
  useEffect(() => {
    if (urlMeetingId && nameInput.trim() && !hasJoined) {
      joinMeeting();
    }
  }, [urlMeetingId, nameInput, hasJoined, joinMeeting]);

  // ── Leave ───────────────────────────────────────────────────────────────────
  const leaveMeeting = useCallback(() => {
    if (isRecordingRef.current) stopRecordingRef.current?.();
    socket?.emit("leaveMeeting", { meetingId: meetingIdRef.current });

    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current  = null;
    screenStreamRef.current = null;
    setLocalStream(null);
    setScreenStream(null);

    peerConnsRef.current.forEach((pc) => pc.close());
    peerConnsRef.current.clear();
    setPeers(new Map());
    navigate("/meeting");
  }, [socket, navigate]);

  // ── Toggle mute ─────────────────────────────────────────────────────────────
  /**
   * FIX: Read ground-truth from the actual track's enabled state,
   * not from the stale `isMuted` state variable.
   * This makes mic toggle reliable regardless of React render timing.
   */
  const toggleMute = useCallback(() => {
    const audioTracks = localStreamRef.current?.getAudioTracks() ?? [];
    if (audioTracks.length === 0) return;

    // Flip based on the TRACK's actual current state (source of truth)
    const currentlyEnabled = audioTracks[0].enabled;
    const newEnabled = !currentlyEnabled;
    audioTracks.forEach((t) => { t.enabled = newEnabled; });

    const newIsMuted = !newEnabled;
    setIsMuted(newIsMuted);
    socket?.emit("toggleMedia", {
      meetingId: meetingIdRef.current,
      type: "audio",
      isOff: newIsMuted,
    });
  }, [socket]);

  // ── Toggle camera ───────────────────────────────────────────────────────────
  /**
   * FIX: Use replaceTrack() instead of addTrack() when turning cam back on.
   *
   * addTrack() triggers onnegotiationneeded → new offer/answer cycle →
   * the remote side fires onOffer again → setPeers adds a duplicate entry
   * → participant count jumps to 2 (same user appears twice).
   *
   * replaceTrack() swaps the track inline with NO renegotiation.
   */
  const toggleCam = useCallback(async () => {
    const videoTracks = localStreamRef.current?.getVideoTracks() ?? [];

    if (videoTracks.length === 0) {
      // Camera was never granted — acquire a new track
      try {
        const vidStream   = await navigator.mediaDevices.getUserMedia({ video: true });
        const newVidTrack = vidStream.getVideoTracks()[0];
        localStreamRef.current.addTrack(newVidTrack);

        peerConnsRef.current.forEach((pc) => {
          // If a video sender already exists (track may be null), replace it
          const sender = pc.getSenders().find(
            (s) => s.track?.kind === "video" || s.track === null
          );
          if (sender) {
            sender.replaceTrack(newVidTrack); // no renegotiation
          } else {
            pc.addTrack(newVidTrack, localStreamRef.current); // first time only
          }
        });

        setIsCamOff(false);
        setLocalStream(new MediaStream(localStreamRef.current.getTracks()));
        socket?.emit("toggleMedia", {
          meetingId: meetingIdRef.current,
          type: "video",
          isOff: false,
        });
      } catch (err) {
        console.error("Failed to enable camera:", err);
      }
      return;
    }

    // Track exists — just flip enabled (no signaling, no renegotiation)
    const currentlyEnabled = videoTracks[0].enabled;
    const newEnabled = !currentlyEnabled;
    videoTracks.forEach((t) => { t.enabled = newEnabled; });

    const newIsCamOff = !newEnabled;
    setIsCamOff(newIsCamOff);
    // Refresh state object so VideoCard re-renders
    setLocalStream(new MediaStream(localStreamRef.current.getTracks()));
    socket?.emit("toggleMedia", {
      meetingId: meetingIdRef.current,
      type: "video",
      isOff: newIsCamOff,
    });
  }, [socket]);

  // ── Toggle screen share ─────────────────────────────────────────────────────
  const toggleScreenShare = useCallback(async () => {
    // ── STOP ──────────────────────────────────────────────────────────────────
    if (isScreenSharingRef.current) {
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
      setScreenStream(null);
      setIsScreenSharing(false);

      // Restore cam track (or null if cam was off)
      const camTrack = localStreamRef.current?.getVideoTracks()[0] ?? null;
      peerConnsRef.current.forEach((pc) => {
        const sender = pc.getSenders().find(
          (s) => s.track?.kind === "video" || s.track === null
        );
        if (sender) {
          sender.replaceTrack(
            camTrack && !isCamOffRef.current ? camTrack : null
          );
        }
      });
      socket?.emit("toggleMedia", {
        meetingId: meetingIdRef.current,
        type: "screen",
        isOff: true,
      });
      return;
    }

    // ── START ─────────────────────────────────────────────────────────────────
    try {
      const sStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
      screenStreamRef.current = sStream;
      setScreenStream(sStream);
      setIsScreenSharing(true);

      const screenTrack = sStream.getVideoTracks()[0];

      peerConnsRef.current.forEach((pc) => {
        const sender = pc.getSenders().find(
          (s) => s.track?.kind === "video" || s.track === null
        );
        if (sender) {
          sender.replaceTrack(screenTrack); // no renegotiation
        } else {
          pc.addTrack(screenTrack, sStream); // no prior video sender
        }
      });

      socket?.emit("toggleMedia", {
        meetingId: meetingIdRef.current,
        type: "screen",
        isOff: false,
      });

      // Handle browser's "Stop sharing" button
      screenTrack.onended = () => {
        screenStreamRef.current = null;
        setScreenStream(null);
        setIsScreenSharing(false);
        const camTrack = localStreamRef.current?.getVideoTracks()[0] ?? null;
        peerConnsRef.current.forEach((pc) => {
          const s = pc.getSenders().find(
            (s) => s.track?.kind === "video" || s.track === null
          );
          if (s) s.replaceTrack(camTrack && !isCamOffRef.current ? camTrack : null);
        });
        socket?.emit("toggleMedia", {
          meetingId: meetingIdRef.current,
          type: "screen",
          isOff: true,
        });
      };
    } catch (err) {
      if (err.name !== "NotAllowedError") setError("Screen share failed.");
    }
  }, [socket]);

  // ── Recording ───────────────────────────────────────────────────────────────
  /**
   * FIX: Recording captures a canvas stream — it does NOT touch localStreamRef
   * or any media tracks at all. Camera and mic remain unaffected.
   * We use localStreamRef.current directly (not the stale `localStream` state)
   * to avoid closure issues.
   */
  const startRecording = useCallback(() => {
    const canvas = document.createElement("canvas");
    const ctx    = canvas.getContext("2d");
    canvas.width = 1280;
    canvas.height = 720;

    let rafId = null;
    const drawFrame = () => {
      ctx.fillStyle = "#111827";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      // Draw current local video frame
      const videoEls = document.querySelectorAll("video");
      videoEls.forEach((v, i) => {
        if (v && !v.paused && !v.ended) {
          const cols = Math.ceil(Math.sqrt(videoEls.length));
          const rows = Math.ceil(videoEls.length / cols);
          const w    = canvas.width / cols;
          const h    = canvas.height / rows;
          const col  = i % cols;
          const row  = Math.floor(i / cols);
          ctx.drawImage(v, col * w, row * h, w, h);
        }
      });
      rafId = requestAnimationFrame(drawFrame);
    };

    const canvasStream  = canvas.captureStream(30);
    const mediaRecorder = new MediaRecorder(canvasStream, {
      mimeType: MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : "video/webm",
    });

    recordedChunksRef.current = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = () => {
      cancelAnimationFrame(rafId);
      const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `meeting-${meetingIdRef.current}-${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      recordedChunksRef.current = [];
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start(1000);
    setIsRecording(true);
    rafId = requestAnimationFrame(drawFrame);
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecordingRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
      setIsRecording(false);
    }
  }, []);

  stopRecordingRef.current = stopRecording;

  // ── Copy meeting link ───────────────────────────────────────────────────────
  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(
      `${window.location.origin}/meeting/${meetingIdRef.current}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }, []);

  // ── Socket signaling ────────────────────────────────────────────────────────
  /**
   * CRITICAL FIX — dependency array:
   *
   * The old code had [socket, hasJoined, meetingId, getOrCreatePC, removePeer, isCamOff, isMuted].
   * Because `isCamOff` and `isMuted` were deps, the entire effect re-ran on every
   * toggle → re-emitted joinMeeting → server added the same socket again →
   * existingParticipants list contained YOURSELF → duplicate peer + count = 2.
   *
   * Fix: Remove isCamOff / isMuted from deps entirely. Use refs to read
   * their current values in the once-per-session setTimeout below.
   */
  useEffect(() => {
    if (!socket || !hasJoined || !meetingId) return;

    const flushIceQueue = async (pc) => {
      for (const c of (pc.iceQueue ?? [])) {
        try { await pc.addIceCandidate(new RTCIceCandidate(c)); }
        catch (e) { console.error("ICE queue error:", e); }
      }
      pc.iceQueue = [];
    };

    // ── Incoming: list of everyone already in the room ─────────────────────
    const onExistingParticipants = async ({ existingParticipants }) => {
      if (existingParticipants.length === 0) {
        setIsHost(true);
      }
      for (const p of existingParticipants) {
        setPeers((prev) => {
          const next = new Map(prev);
          if (!next.has(p.socketId)) next.set(p.socketId, { ...p, stream: null });
          return next;
        });
        const pc = getOrCreatePC(p.socketId);
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit("meetingOffer", { targetSocketId: p.socketId, offer });
        } catch (err) { console.error("Offer error:", err); }
      }
    };

    // ── Incoming: someone new joined after me ──────────────────────────────
    const onUserJoined = (p) => {
      setPeers((prev) => {
        const next = new Map(prev);
        if (!next.has(p.socketId)) next.set(p.socketId, { ...p, stream: null });
        return next;
      });
    };

    // ── Incoming: offer from a peer ────────────────────────────────────────
    const onOffer = async ({ fromSocketId, fromUserId, fromUserName, offer }) => {
      setPeers((prev) => {
        const next = new Map(prev);
        if (!next.has(fromSocketId)) {
          next.set(fromSocketId, {
            socketId: fromSocketId,
            userId:   fromUserId,
            userName: fromUserName,
            stream:   null,
          });
        }
        return next;
      });

      const pc = getOrCreatePC(fromSocketId);
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        await flushIceQueue(pc);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("meetingAnswer", { targetSocketId: fromSocketId, answer });
      } catch (err) { console.error("Answer error:", err); }
    };

    // ── Incoming: answer from a peer ───────────────────────────────────────
    const onAnswer = async ({ fromSocketId, answer }) => {
      const pc = peerConnsRef.current.get(fromSocketId);
      if (!pc) return;
      try {
        if (pc.signalingState === "have-local-offer") {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
          await flushIceQueue(pc);
        }
      } catch (err) { console.error("setRemoteDesc error:", err); }
    };

    // ── Incoming: ICE candidate ────────────────────────────────────────────
    const onIce = async ({ fromSocketId, candidate }) => {
      const pc = peerConnsRef.current.get(fromSocketId);
      if (!pc || !candidate) return;
      try {
        if (pc.remoteDescription) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
          pc.iceQueue = pc.iceQueue || [];
          pc.iceQueue.push(candidate);
        }
      } catch (err) { console.error("ICE error:", err); }
    };

    // ── Incoming: someone left ─────────────────────────────────────────────
    const onUserLeft = ({ socketId }) => removePeer(socketId);

    // ── Incoming: remote peer toggled their media ──────────────────────────
    const onPeerMediaToggled = ({ socketId, type, isOff }) => {
      setPeers((prev) => {
        const next    = new Map(prev);
        const p       = next.get(socketId);
        if (!p) return next;
        const updated = { ...p };
        if (type === "video")  updated.isCamOff        = isOff;
        if (type === "audio")  updated.isMuted         = isOff;
        if (type === "screen") updated.isScreenSharing = !isOff;
        next.set(socketId, updated);
        return next;
      });
    };

    // Register all listeners
    socket.on("existingParticipants", onExistingParticipants);
    socket.on("userJoined",           onUserJoined);
    socket.on("meetingOffer",         onOffer);
    socket.on("meetingAnswer",        onAnswer);
    socket.on("meetingIceCandidate",  onIce);
    socket.on("userLeft",             onUserLeft);
    socket.on("peerMediaToggled",     onPeerMediaToggled);

    // ── Announce join — send name so server can broadcast it to others ─────
    socket.emit("joinMeeting", {
      meetingId,
      userName: nameInputRef.current || displayName,
    });

    // Broadcast initial media state ONCE using refs (not stale state values)
    const mediaTimer = setTimeout(() => {
      socket.emit("toggleMedia", {
        meetingId,
        type: "video",
        isOff: isCamOffRef.current,
      });
      socket.emit("toggleMedia", {
        meetingId,
        type: "audio",
        isOff: isMutedRef.current,
      });
    }, 600);

    return () => {
      clearTimeout(mediaTimer);
      socket.off("existingParticipants", onExistingParticipants);
      socket.off("userJoined",           onUserJoined);
      socket.off("meetingOffer",         onOffer);
      socket.off("meetingAnswer",        onAnswer);
      socket.off("meetingIceCandidate",  onIce);
      socket.off("userLeft",             onUserLeft);
      socket.off("peerMediaToggled",     onPeerMediaToggled);
    };
    // ⚠️  isCamOff and isMuted are intentionally NOT in this dep array.
    //     They are read via refs inside the setTimeout above.
    //     Adding them here would re-emit joinMeeting on every toggle.
  }, [socket, hasJoined, meetingId, getOrCreatePC, removePeer, displayName]); // eslint-disable-line

  // ── Cleanup on unmount ──────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      stopRecordingRef.current?.();
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      peerConnsRef.current.forEach((pc) => pc.close());
    };
  }, []);

  // ══════════════════════════════════════════════════════════════════════════
  //  PRE-JOIN LOBBY
  // ══════════════════════════════════════════════════════════════════════════
  if (!hasJoined) {
    return (
      <div className={`fixed inset-0 flex items-center justify-center p-6 overflow-auto transition-colors duration-500 ${
        isDark ? "bg-[#0c0f1a]" : "bg-[#f4f7fa]"
      }`}>
        {/* Ambient orbs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full blur-3xl animate-pulse ${
            isDark ? "bg-indigo-500/10" : "bg-indigo-400/15"
          }`} />
          <div className={`absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full blur-3xl animate-pulse delay-1000 ${
            isDark ? "bg-violet-500/8" : "bg-violet-400/15"
          }`} />
          {!isDark && (
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, black 1px, transparent 0)", backgroundSize: "32px 32px" }} />
          )}
        </div>

        <div className="relative z-10 w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-7 sm:mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 rounded-3xl shadow-2xl shadow-indigo-500/30 mb-4 sm:mb-5 relative">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-400 to-purple-600 blur-xl opacity-50 animate-pulse" />
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.362a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className={`text-3xl sm:text-4xl font-extrabold mb-2 ${
              isDark
                ? "bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent"
                : "text-slate-800"
            }`}>
              Join Meeting
            </h1>
            <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Ready to join your session?
            </p>
          </div>

          {/* Card */}
          <div className={`rounded-3xl border overflow-hidden transition-all duration-300 ${
            isDark
              ? "bg-[#161b2e]/90 backdrop-blur-2xl border-white/10 shadow-[0_0_40px_-10px_rgba(99,102,241,0.1)]"
              : "bg-white border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.06)]"
          }`}>
            {/* Card header */}
            <div className={`px-5 sm:px-8 pt-6 sm:pt-8 pb-5 sm:pb-6 border-b ${
              isDark ? "border-white/8" : "border-slate-100"
            }`}>
              <h2 className={`font-bold text-lg mb-1 ${
                isDark ? "text-white" : "text-slate-800"
              }`}>Meeting Room</h2>
              <div className={`flex items-center gap-2 font-mono text-sm font-semibold tracking-widest ${
                isDark ? "text-indigo-300" : "text-indigo-600"
              }`}>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
                {meetingId}
              </div>
            </div>

            <div className="p-5 sm:p-8 space-y-5">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? "text-slate-300" : "text-slate-600"
                }`}>Your Display Name</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <svg className={`w-4 h-4 ${
                      isDark ? "text-slate-500" : "text-slate-400"
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && joinMeeting()}
                    placeholder="Enter your name..."
                    autoFocus
                    className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm transition-all duration-300 outline-none ${
                        isDark
                          ? "bg-[#0c0f1a]/80 backdrop-blur-xl border-white/10 text-white placeholder-slate-500 hover:border-white/20 focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/20 shadow-[inset_0_1px_4px_rgba(0,0,0,0.3)]"
                          : "bg-white border-slate-200 text-slate-800 placeholder-slate-400 hover:border-slate-300 hover:shadow-md focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/20 shadow-sm"
                      }`}
                  />
                </div>
              </div>

              {error && (
                <div className={`flex items-center gap-2 p-3 rounded-xl border text-sm ${
                  isDark
                    ? "bg-red-500/10 border-red-500/20 text-red-400"
                    : "bg-red-50 border-red-100 text-red-600"
                }`}>
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}

              <button
                onClick={joinMeeting}
                disabled={!nameInput.trim()}
                className="relative w-full py-3.5 bg-[length:200%_100%] bg-gradient-to-r from-indigo-500 via-violet-600 to-indigo-500 hover:bg-[position:100%_0]
                  text-white font-bold rounded-xl transition-all duration-500
                  hover:-translate-y-0.5 active:scale-[0.98] shadow-[0_4px_20px_-4px_rgba(99,102,241,0.5)] hover:shadow-indigo-500/40
                  disabled:opacity-40 disabled:pointer-events-none
                  flex items-center justify-center text-sm overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
                <span className="relative flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.362a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Join Meeting
                </span>
              </button>
            </div>

            {/* Card footer */}
            <div className={`px-5 sm:px-8 py-4 border-t ${
              isDark ? "border-white/8 bg-white/2" : "border-slate-100 bg-slate-50"
            }`}>
              <p className={`text-xs text-center ${
                isDark ? "text-slate-500" : "text-slate-400"
              }`}>
                🔒 End-to-end encrypted · HD quality · No install required
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  MEETING ROOM
  // ══════════════════════════════════════════════════════════════════════════
  const remotePeersArray = Array.from(peers.values());
  const participantList  = [
    {
      id: "local",
      name: nameInputRef.current || displayName,
      isLocal: true,
      isMuted,
      isCamOff,
      isHost,
    },
    ...remotePeersArray.map((p) => ({
      ...p,
      name: p.userName, // Fix missing name property for remote peers!
      isLocal: false,
    })),
  ];

  return (
    <div
      className={`fixed inset-0 overflow-hidden transition-colors duration-500 ${
        isDark ? "bg-[#0c0f1a]" : "bg-[#f4f7fa]"
      }`}
      style={{ display: "flex", flexDirection: "column", fontFamily: "'Inter', sans-serif" }}
    >
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className={`flex items-center justify-between px-5 py-3 backdrop-blur-xl border-b z-20 flex-shrink-0 transition-colors duration-500 ${
        isDark ? "bg-[#0f1220]/90 border-white/8 shadow-md" : "bg-white/80 border-slate-200 shadow-sm"
      }`}>
        {/* Left: brand */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25 flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.362a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="min-w-0">
            <h2 className={`font-bold text-sm leading-tight transition-colors duration-300 ${isDark ? "text-white" : "text-slate-900"}`}>SkillBarter Meet</h2>
            <p className={`text-xs font-mono truncate transition-colors duration-300 ${isDark ? "text-slate-400" : "text-slate-500"}`}>{meetingId}</p>
          </div>
        </div>

        {/* Right: status + copy */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-colors duration-300 ${
            isDark ? "bg-white/5 border-white/10" : "bg-white border-slate-200 shadow-sm"
          }`}>
            <svg className={`w-3.5 h-3.5 ${isDark ? "text-slate-400" : "text-slate-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className={`text-xs font-mono font-bold tracking-wider ${isDark ? "text-slate-300" : "text-slate-700"}`}>
              {formatDuration(meetingDuration)}
            </span>
          </div>

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
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-500/15 border border-indigo-500/30 rounded-full">
            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
            <span className="text-indigo-300 text-xs font-bold">
              {1 + remotePeersArray.length}
            </span>
          </div>
          <button
            onClick={copyLink}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all duration-300 ${
              isDark 
                ? "bg-white/5 border-white/10 hover:border-indigo-500/40 text-slate-300 hover:text-indigo-300 hover:bg-indigo-500/10" 
                : "bg-white border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50"
            }`}
          >
            {copied ? (
              <>
                <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span className={isDark ? "text-indigo-300" : "text-indigo-600"}>Copied!</span>
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
        </div>
      </div>

      {/* ── Main area ─────────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        <div className="flex-1 min-w-0 min-h-0 overflow-hidden">
          <VideoGrid
            localStream={localStream}
            localName={nameInput || displayName}
            isMuted={isMuted}
            isCamOff={isCamOff}
            isScreenSharing={isScreenSharing}
            screenStream={screenStream}
            remoteParticipants={remotePeersArray}
          />
        </div>

        {isChatOpen && (
          <MeetingChat
            socket={socket}
            meetingId={meetingId}
            userName={nameInput || displayName}
            onClose={() => setIsChatOpen(false)}
          />
        )}

        {isParticipantsOpen && (
          <ParticipantsPanel
            participants={participantList}
            onClose={() => setIsParticipantsOpen(false)}
          />
        )}
      </div>

      {/* ── Controls ──────────────────────────────────────────────────────── */}
      <MeetingControls
        isMuted={isMuted}
        isCamOff={isCamOff}
        isScreenSharing={isScreenSharing}
        isChatOpen={isChatOpen}
        isParticipantsOpen={isParticipantsOpen}
        isRecording={isRecording}
        participantCount={1 + remotePeersArray.length}
        meetingId={meetingId}
        onToggleMute={toggleMute}
        onToggleCam={toggleCam}
        onToggleScreen={toggleScreenShare}
        onToggleChat={() => { setIsChatOpen((p) => !p); setIsParticipantsOpen(false); }}
        onToggleParticipants={() => { setIsParticipantsOpen((p) => !p); setIsChatOpen(false); }}
        onToggleRecording={() => (isRecordingRef.current ? stopRecording() : startRecording())}
        onLeave={leaveMeeting}
      />
    </div>
  );
}

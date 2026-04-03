import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useSocket } from "../contexts/SocketContext";
import { useTheme } from "../hooks/useTheme";
import api from "../utils/api";
import VideoCall from "../components/VideoCall";
import VoiceRecorder from "../components/chat/VoiceRecorder";

/* ── Mic icon (SVG inline) ─────────────────────────────── */
const MicIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-7a3 3 0 01-3-3V5a3 3 0 016 0v6a3 3 0 01-3 3z" />
  </svg>
);
const SendIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);
const ChatIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);
const VideoIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.362a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);
const DocIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);
const CheckIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);
const WarnIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 15.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
);
const PlusIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
  </svg>
);
const ExtLinkIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
);
const XIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default function ChatPage() {
  const location = useLocation();
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const {
    isConnected,
    joinConversation,
    leaveConversation,
    onMessageReceived,
    offMessageReceived,
    onMessageDeleted,
    offMessageDeleted,
  } = useSocket();

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  // Mobile: 'list' shows sidebar, 'chat' shows chat window
  const [mobilePanel, setMobilePanel] = useState("list");
  // Delete / Clear chat
  const [activeMessageMenu, setActiveMessageMenu] = useState(null);   // messageId with open menu
  const [deleteModal, setDeleteModal] = useState(null);   // { messageId }
  const [clearModal, setClearModal] = useState(false);
  const [showChatMenu, setShowChatMenu] = useState(false);  // header ⋮ dropdown
  // Voice player
  const [playingVoiceId, setPlayingVoiceId] = useState(null);

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const userId = JSON.parse(localStorage.getItem("user"))?._id;
  const isInitialLoad = useRef(true);

  const scrollToBottom = (smooth = true) => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: smooth ? "smooth" : "instant",
      });
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true); setError("");
        if (matchId) {
          try {
            const matchRes = await api.get(`/chats/conversations/match/${matchId}`);
            setSelectedConversation(matchRes.data);
            const allRes = await api.get("/chats/conversations");
            setConversations(allRes.data);
          } catch (e) {
            if (e.response?.status === 403) setError(e.response.data.message || "Please wait for match approval before messaging!");
            else setError("Failed to load conversation");
            try { const allRes = await api.get("/chats/conversations"); setConversations(allRes.data); } catch { }
          }
        } else {
          const res = await api.get("/chats/conversations");
          setConversations(res.data);
          if (location.state?.userId) {
            const conv = res.data.find(c => c.participants.some(p => p._id === location.state.userId));
            if (conv) setSelectedConversation(conv);
          } else if (res.data.length > 0) {
            setSelectedConversation(res.data[0]);
          }
        }
      } catch { setError("Failed to load conversations"); }
      finally { setLoading(false); }
    };
    load();
  }, [location.state, matchId]);

  useEffect(() => {
    if (selectedConversation && !error) {
      loadMessages(selectedConversation._id);
      joinConversation(selectedConversation._id);
      return () => leaveConversation(selectedConversation._id);
    }
  }, [selectedConversation, error, joinConversation, leaveConversation]);

  useEffect(() => {
    const handleNewMessage = (message) => {
      const msgConvId = message.conversationId?.toString();
      const currConvId = selectedConversation?._id?.toString();
      if (msgConvId && currConvId && msgConvId === currConvId) {
        setMessages(prev => {
          const exists = prev.some(m => m._id?.toString() === message._id?.toString());
          return exists ? prev : [...prev, message];
        });
      }
      setConversations(prev => prev.map(conv =>
        conv._id?.toString() === msgConvId
          ? { ...conv, lastMessage: message, lastMessageAt: message.createdAt || new Date() }
          : conv
      ));
    };
    if (onMessageReceived) {
      onMessageReceived(handleNewMessage);
      return () => { if (offMessageReceived) offMessageReceived(handleNewMessage); };
    }
  }, [selectedConversation, onMessageReceived, offMessageReceived]);

  /* ── Real-time: messageDeleted from socket ──────────────── */
  useEffect(() => {
    const handleMessageDeleted = ({ messageId, deletedBy }) => {
      // Only remove from local state if the deletion was done by the current user
      // (the socket event fires for everyone in the room, but we only hide it for
      //  the user who requested the delete — other users keep seeing it)
      if (deletedBy === userId) {
        setMessages(prev => prev.filter(m => m._id?.toString() !== messageId?.toString()));
      }
    };
    if (onMessageDeleted) {
      onMessageDeleted(handleMessageDeleted);
      return () => { if (offMessageDeleted) offMessageDeleted(handleMessageDeleted); };
    }
  }, [onMessageDeleted, offMessageDeleted, userId]);

  useEffect(() => {
    if (messages.length > 0 && !isInitialLoad.current) scrollToBottom(true);
    if (isInitialLoad.current && messages.length > 0) isInitialLoad.current = false;
  }, [messages]);

  const loadMessages = async (conversationId) => {
    try {
      const res = await api.get(`/chats/conversations/${conversationId}/messages`);
      isInitialLoad.current = true;
      setMessages(res.data.messages || []);
      setTimeout(() => scrollToBottom(false), 50);
    } catch { }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "video/mp4", "video/quicktime", "video/x-msvideo", "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowed.includes(file.type)) { setError("Invalid file type. Allowed: jpg, png, mp4, mov, pdf, docx"); return; }
    if (file.size > 100 * 1024 * 1024) { setError("File size must be less than 100MB"); return; }
    setSelectedFile(file); setError("");
    if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
      const reader = new FileReader();
      reader.onload = e => setFilePreview(e.target.result);
      reader.readAsDataURL(file);
    } else { setFilePreview(null); }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null); setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadFile = async () => {
    if (!selectedFile || !selectedConversation) return null;
    const formData = new FormData();
    formData.append("file", selectedFile);
    const response = await api.post("/chats/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
    return response.data;
  };

  const sendFileMessage = async (fileData) => {
    if (!selectedConversation || sending || error) return;
    setSending(true);
    const tempId = `temp-${Date.now()}`;
    const tempMessage = {
      _id: tempId, text: "",
      sender: { _id: userId, name: "You" },
      createdAt: new Date().toISOString(),
      conversationId: selectedConversation._id,
      isTemporary: true, media: fileData.fileUrl,
      messageType: fileData.messageType,
      fileName: fileData.fileName, fileSize: fileData.fileSize, mimeType: fileData.mimeType,
    };
    setMessages(prev => [...prev, tempMessage]);
    clearSelectedFile();
    try {
      const response = await api.post("/chats/messages", {
        conversationId: selectedConversation._id, text: "",
        messageType: fileData.messageType, media: fileData.fileUrl,
        fileName: fileData.fileName, fileSize: fileData.fileSize, mimeType: fileData.mimeType,
      });
      setMessages(prev => {
        const filtered = prev.filter(msg => msg._id !== tempId);
        if (filtered.some(msg => msg._id === response.data._id)) return filtered;
        return [...filtered, response.data];
      });
    } catch (err) {
      setMessages(prev => prev.filter(msg => msg._id !== tempId));
      setError(err.response?.data?.message || "Failed to send file");
    } finally { setSending(false); }
  };

  const handleSendWithFile = async () => {
    if (!selectedFile) return;
    setUploading(true);
    try { const fileData = await uploadFile(); await sendFileMessage(fileData); }
    catch (err) { setError(err.response?.data?.message || "Failed to upload file"); }
    finally { setUploading(false); }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || sending || error) return;
    setSending(true);
    const tempId = `temp-${Date.now()}`;
    const messageText = newMessage.trim();
    setMessages(prev => [...prev, {
      _id: tempId, text: messageText, messageType: "text",
      sender: { _id: userId, name: "You" },
      createdAt: new Date().toISOString(),
      conversationId: selectedConversation._id, isTemporary: true,
    }]);
    setNewMessage("");
    try {
      const response = await api.post("/chats/messages", {
        conversationId: selectedConversation._id, text: messageText, messageType: "text",
      });
      setMessages(prev => {
        const filtered = prev.filter(msg => msg._id !== tempId);
        if (filtered.some(msg => msg._id === response.data._id)) return filtered;
        return [...filtered, response.data];
      });
    } catch (err) {
      setMessages(prev => prev.filter(msg => msg._id !== tempId));
      setNewMessage(messageText);
      if (err.response?.status === 403) setError(err.response.data.message || "Please wait for match approval before messaging!");
      else if (err.response?.status === 404) setError(err.response.data.message || "Conversation not found");
      else setError(err.response?.data?.message || "Failed to send message");
    } finally { setSending(false); }
  };

  /* ── Delete single message (for this user only) ─────────── */
  const handleDeleteMessage = async (messageId) => {
    setDeleteModal(null);
    setActiveMessageMenu(null);
    // Optimistically remove from UI
    setMessages(prev => prev.filter(m => m._id?.toString() !== messageId?.toString()));
    try {
      await api.delete(`/chats/messages/${messageId}`);
    } catch {
      // If it fails re-fetch messages to restore correct state
      if (selectedConversation) loadMessages(selectedConversation._id);
    }
  };

  /* ── Clear entire chat (for this user only) ─────────────── */
  const handleClearChat = async () => {
    setClearModal(false);
    setShowChatMenu(false);
    if (!selectedConversation) return;
    // Optimistically clear UI
    setMessages([]);
    try {
      await api.post(`/chats/conversations/${selectedConversation._id}/clear`);
    } catch {
      // Restore on failure
      if (selectedConversation) loadMessages(selectedConversation._id);
    }
  };

  const sendVoiceNote = async (audioBlob, durationSecs) => {
    if (!selectedConversation || error) return;
    setSending(true);
    const tempId = `temp-voice-${Date.now()}`;
    const tempUrl = URL.createObjectURL(audioBlob);
    setMessages(prev => [...prev, {
      _id: tempId, text: "", messageType: "voice",
      media: tempUrl, duration: durationSecs,
      sender: { _id: userId, name: "You" },
      createdAt: new Date().toISOString(),
      conversationId: selectedConversation._id, isTemporary: true,
    }]);
    try {
      const ext = audioBlob.type.includes("ogg") ? "ogg" : "webm";
      const formData = new FormData();
      formData.append("file", audioBlob, `voice-note.${ext}`);
      formData.append("duration", String(Math.round(durationSecs)));
      const uploadRes = await api.post("/chats/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
      const fd = uploadRes.data;
      const msgRes = await api.post("/chats/messages", {
        conversationId: selectedConversation._id, text: "",
        messageType: "voice", media: fd.fileUrl, mimeType: fd.mimeType,
        duration: fd.duration ?? Math.round(durationSecs),
      });
      URL.revokeObjectURL(tempUrl);
      setMessages(prev => {
        const filtered = prev.filter(m => m._id !== tempId);
        if (filtered.some(m => m._id === msgRes.data._id)) return filtered;
        return [...filtered, msgRes.data];
      });
    } catch (err) {
      URL.revokeObjectURL(tempUrl);
      setMessages(prev => prev.filter(m => m._id !== tempId));
      setError(err.response?.data?.message || "Failed to send voice note.");
    } finally { setSending(false); }
  };

  const handleDocumentDownload = async (url, fileName, isPdf = false) => {
    try {
      let finalName = fileName || "document";
      if (isPdf && !finalName.toLowerCase().endsWith(".pdf")) finalName += ".pdf";
      const response = await fetch(url);
      if (!response.ok) throw new Error("Fetch failed");
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl; link.download = finalName;
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
    } catch { window.open(url, "_blank", "noopener,noreferrer"); }
  };

  const formatTime = (date) => new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const formatDate = (date) => {
    const d = new Date(date), today = new Date(), yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString();
  };

  /* ── filtered conversations ─────────────────────────── */
  const filteredConversations = conversations.filter(conv => {
    const other = conv.participants.find(p => p._id !== userId);
    return (other?.name || "").toLowerCase().includes(searchQuery.toLowerCase());
  });

  /* ── theme tokens ────────────────────────────────────── */
  const pageBg = isDarkMode ? "bg-[#0a0f1e]" : "bg-gradient-to-br from-slate-100 via-indigo-50/50 to-violet-50/40";
  const sideCard = isDarkMode ? "bg-slate-900/80 border-slate-700/40" : "bg-white/90 border-indigo-100 shadow-xl shadow-indigo-100/30";
  const chatCard = isDarkMode ? "bg-slate-900/70 border-slate-700/40" : "bg-white/95 border-indigo-100 shadow-xl shadow-indigo-100/30";
  const textMain = isDarkMode ? "text-white" : "text-gray-900";
  const textSub = isDarkMode ? "text-slate-400" : "text-gray-500";
  const inputCls = isDarkMode
    ? "bg-slate-800/60 border-slate-600/50 text-white placeholder-slate-500 focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20"
    : "bg-indigo-50/40 border-indigo-100 text-gray-900 placeholder-gray-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20";
  const hdrBorder = isDarkMode ? "border-slate-700/30" : "border-indigo-100/80";

  /* ─────────────────────────────── LOADING ─────────────────────────────── */
  if (loading) return (
    <div className={`min-h-screen flex items-center justify-center ${pageBg}`}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl"
          style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 8px 32px rgba(99,102,241,0.35)" }}>
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
        <p className="font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent text-lg">Loading conversations…</p>
        <p className={`text-sm ${textSub}`}>Please wait a moment</p>
      </div>
    </div>
  );

  /* ─────────────────────────────── ERROR (matchId) ─────────────────────── */
  if (error && matchId) return (
    <div className={`min-h-screen flex items-center justify-center px-4 ${pageBg}`}>
      <div className={`text-center backdrop-blur-xl border rounded-3xl p-12 max-w-md shadow-2xl ${isDarkMode ? "bg-slate-900/60 border-slate-700/40" : "bg-white border-indigo-100"}`}>
        <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 ${isDarkMode ? "bg-red-500/10" : "bg-red-50"}`}
          style={{ border: "1px solid rgba(239,68,68,0.25)" }}>
          <WarnIcon className="w-10 h-10 text-red-400" />
        </div>
        <h3 className={`text-2xl font-black mb-3 ${textMain}`}>Chat Not Available</h3>
        <p className="text-red-400 mb-8 text-base leading-relaxed">{error}</p>
        <div className="space-y-3">
          <button onClick={() => navigate("/matches")}
            className="w-full px-6 py-3 text-white font-bold rounded-xl transition-all hover:opacity-90 active:scale-95"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 4px 16px rgba(99,102,241,0.35)" }}>
            View Matches
          </button>
          <button onClick={() => navigate("/dashboard")}
            className={`w-full px-6 py-3 font-bold rounded-xl border transition-all ${isDarkMode ? "border-slate-600/40 text-slate-400 hover:text-white" : "border-indigo-100 text-gray-600 hover:bg-indigo-50"}`}>
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );

  /* ─────────────────────────────── MAIN LAYOUT ─────────────────────────── */
  return (
    <div className={`h-screen overflow-hidden transition-colors duration-500 ${pageBg}`}>

      {/* Ambient decorative blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {isDarkMode ? (
          <>
            <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-indigo-600/6 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-3xl" />
            <div className="absolute inset-0 opacity-[0.02]"
              style={{ backgroundImage: "radial-gradient(circle at 1px 1px,rgba(139,92,246,1) 1px,transparent 0)", backgroundSize: "40px 40px" }} />
          </>
        ) : (
          <>
            <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-gradient-to-bl from-violet-100/50 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[400px] bg-gradient-to-tr from-indigo-100/50 to-transparent rounded-full blur-3xl" />
          </>
        )}
      </div>

      <div className="relative z-10 p-2 sm:p-4 h-screen flex gap-4">

        {/* ── SIDEBAR ─────────────────────────────────────── */}
        {/* Mobile: only show when mobilePanel==='list' | Desktop: always show */}
        <div className={`
          flex-shrink-0 backdrop-blur-xl border rounded-3xl flex flex-col overflow-hidden
          ${sideCard}
          w-full md:w-80
          ${mobilePanel === 'list' ? 'flex' : 'hidden'} md:flex
        `}>

          {/* Sidebar header */}
          <div className={`px-5 py-4 border-b ${hdrBorder}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md"
                  style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                  <ChatIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className={`text-lg font-black ${textMain}`}>Messages</h3>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-400" : "bg-red-400"} animate-pulse`} />
                    <span className={`text-xs font-semibold ${isConnected ? (isDarkMode ? "text-emerald-400" : "text-emerald-600") : "text-red-400"}`}>
                      {isConnected ? "Online" : "Offline"}
                    </span>
                  </div>
                </div>
              </div>
              <div className={`px-2 py-1 rounded-lg text-xs font-bold ${isDarkMode ? "bg-indigo-500/15 text-indigo-300" : "bg-indigo-50 text-indigo-700"}`}>
                {conversations.length} chats
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <svg className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text" placeholder="Search conversations…"
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm outline-none transition-all ${inputCls}`}
              />
            </div>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-6 py-10">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${isDarkMode ? "bg-indigo-500/10 border border-indigo-500/20" : "bg-indigo-50 border border-indigo-100"}`}>
                  <ChatIcon className={`w-8 h-8 ${isDarkMode ? "text-indigo-400" : "text-indigo-500"}`} />
                </div>
                <h4 className={`text-sm font-black mb-1 ${textMain}`}>No conversations</h4>
                <p className={`text-xs ${textSub} mb-4 leading-relaxed`}>
                  Start connecting with other learners
                </p>
                <button onClick={() => navigate("/matches")}
                  className="px-4 py-2 text-white text-xs font-bold rounded-xl transition-all hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 2px 10px rgba(99,102,241,0.3)" }}>
                  Find Matches
                </button>
              </div>
            ) : (
              <div className="p-3 space-y-1.5">
                {filteredConversations.map(conv => {
                  const other = conv.participants.find(p => p._id !== userId);
                  const isSelected = selectedConversation?._id === conv._id;
                  const lastMsgText =
                    conv.lastMessage?.messageType === "image" ? "📷 Image"
                      : conv.lastMessage?.messageType === "video" ? "🎬 Video"
                        : conv.lastMessage?.messageType === "document" ? "📄 Document"
                          : conv.lastMessage?.messageType === "voice" ? "🎙️ Voice note"
                            : conv.lastMessage?.text || "";

                  return (
                    <div
                      key={conv._id}
                      onClick={() => { setSelectedConversation(conv); setError(""); setMobilePanel("chat"); }}
                      className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all duration-200 border group ${isSelected
                        ? isDarkMode
                          ? "bg-indigo-500/15 border-indigo-500/30"
                          : "bg-indigo-50 border-indigo-200"
                        : isDarkMode
                          ? "border-transparent hover:bg-slate-800/60 hover:border-slate-700/40"
                          : "border-transparent hover:bg-indigo-50/60 hover:border-indigo-100"
                        }`}
                    >
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center overflow-hidden font-bold text-sm ${isSelected
                          ? "ring-2 ring-indigo-500/50"
                          : isDarkMode ? "ring-1 ring-slate-700/50" : "ring-1 ring-indigo-100"
                          }`}
                          style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                          {other?.profileImage ? (
                            <img src={other.profileImage} alt={other.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-white">{other?.name?.charAt(0)?.toUpperCase() || "U"}</span>
                          )}
                        </div>
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 ${isDarkMode ? "border-slate-900" : "border-white"
                          } ${isConnected ? "bg-emerald-400" : "bg-gray-400"}`} />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`font-bold text-sm truncate ${isSelected ? isDarkMode ? "text-indigo-200" : "text-indigo-700" : textMain}`}>
                            {other?.name || "Unknown User"}
                          </p>
                          {conv.lastMessageAt && (
                            <span className={`text-[10px] flex-shrink-0 ml-1 ${isSelected ? isDarkMode ? "text-indigo-300" : "text-indigo-500" : textSub}`}>
                              {formatTime(conv.lastMessageAt)}
                            </span>
                          )}
                        </div>
                        {lastMsgText && (
                          <p className={`text-xs truncate mt-0.5 ${isSelected ? isDarkMode ? "text-indigo-300" : "text-indigo-600" : textSub}`}>
                            {lastMsgText}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── CHAT WINDOW ─────────────────────────────────── */}
        {/* Mobile: only show when mobilePanel==='chat' | Desktop: always show */}
        <div className={`
          backdrop-blur-xl border rounded-3xl flex flex-col overflow-hidden
          ${chatCard}
          flex-1 w-full
          ${mobilePanel === 'chat' ? 'flex' : 'hidden'} md:flex
        `}>
          {selectedConversation && !error ? (
            <>
              {/* Chat Header */}
              <div className={`px-3 sm:px-6 py-3 sm:py-4 border-b flex items-center justify-between ${hdrBorder}`}
                style={{ background: isDarkMode ? "rgba(15,23,42,0.4)" : "rgba(238,242,255,0.4)" }}>
                <div className="flex items-center gap-2 sm:gap-4">
                  {/* Back button — mobile only */}
                  <button
                    onClick={() => setMobilePanel("list")}
                    className={`md:hidden flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl transition-colors ${isDarkMode ? "bg-slate-800/60 text-slate-300 hover:bg-slate-700" : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                      }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-12 h-12 rounded-xl overflow-hidden ring-2 ring-indigo-500/30 shadow-md"
                      style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                      {selectedConversation.participants.find(p => p._id !== userId)?.profileImage ? (
                        <img
                          src={selectedConversation.participants.find(p => p._id !== userId).profileImage}
                          alt="Profile" className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                          {selectedConversation.participants.find(p => p._id !== userId)?.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                      )}
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 ${isDarkMode ? "border-slate-900" : "border-white"
                      } ${isConnected ? "bg-emerald-400" : "bg-gray-400"} animate-pulse`} />
                  </div>
                  <div>
                    <h3 className={`text-sm sm:text-lg font-black ${textMain}`}>
                      {selectedConversation.participants.find(p => p._id !== userId)?.name || "Unknown User"}
                    </h3>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? "bg-emerald-400" : "bg-gray-400"}`} />
                      <p className={`text-xs font-semibold ${isConnected ? isDarkMode ? "text-emerald-400" : "text-emerald-600" : textSub}`}>
                        {isConnected ? "Active now" : "Offline"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Video Call + Header ⋮ menu */}
                <div className="flex items-center gap-1">
                  <VideoCall
                    currentUser={JSON.parse(localStorage.getItem("user") || "{}")}
                    remoteUser={selectedConversation.participants.find(p => p._id !== userId)}
                    conversationId={selectedConversation._id}
                    onCallMessage={msg => setMessages(prev => {
                      const exists = prev.some(m => m._id?.toString() === msg._id?.toString());
                      return exists ? prev : [...prev, msg];
                    })}
                    onClose={() => setShowVideoCall(false)}
                  />
                  {/* ⋮ more options */}
                  <div className="relative">
                    <button
                      onClick={() => setShowChatMenu(v => !v)}
                      className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${isDarkMode ? "text-slate-400 hover:text-white hover:bg-slate-700/60" : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                        }`}
                      title="More options"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
                      </svg>
                    </button>
                    {showChatMenu && (
                      <>
                        {/* Backdrop */}
                        <div className="fixed inset-0 z-40" onClick={() => setShowChatMenu(false)} />
                        <div className={`absolute right-0 top-11 z-50 w-48 rounded-2xl border shadow-xl py-1.5 ${isDarkMode ? "bg-slate-800 border-slate-700/50" : "bg-white border-indigo-100"
                          }`}>
                          <button
                            onClick={() => { setShowChatMenu(false); setClearModal(true); }}
                            className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold transition-colors ${isDarkMode ? "text-red-400 hover:bg-red-500/10" : "text-red-600 hover:bg-red-50"
                              }`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Clear Chat
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div ref={messagesContainerRef} className="flex-1 overflow-y-auto custom-scrollbar px-3 sm:px-6 py-4">
                <div className="space-y-4">
                  {messages.map((message, index) => {
                    const isOwn = message.sender?._id === userId;
                    const showDate = index === 0 || formatDate(messages[index - 1].createdAt) !== formatDate(message.createdAt);

                    return (
                      <div key={message._id}>
                        {/* Date divider */}
                        {showDate && (
                          <div className="flex items-center justify-center my-4">
                            <div className={`px-4 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm border ${isDarkMode ? "bg-slate-800/60 border-slate-700/40 text-slate-400" : "bg-indigo-50/80 border-indigo-100 text-indigo-500"
                              }`}>
                              {formatDate(message.createdAt)}
                            </div>
                          </div>
                        )}

                        {/* Call summary */}
                        {message.messageType === "call" && (
                          <div className="flex justify-center my-3">
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${isDarkMode ? "bg-slate-800/60 border-slate-700/40" : "bg-indigo-50/80 border-indigo-100"
                              }`}>
                              <VideoIcon className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                              <span className={`text-xs font-semibold ${textSub}`}>{message.text}</span>
                              <span className={`text-xs ${textSub} opacity-60`}>{formatTime(message.createdAt)}</span>
                            </div>
                          </div>
                        )}

                        {/* Regular bubble */}
                        {message.messageType !== "call" && (
                          <div
                            className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                            onMouseLeave={() => setActiveMessageMenu(null)}
                          >
                            <div className={`chat-bubble-row group relative flex items-end gap-2.5 max-w-[72%] ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
                              {/* Avatar (other user only) */}
                              {!isOwn && (
                                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 ring-1 ring-indigo-500/20"
                                  style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                                  {message.sender?.profileImage ? (
                                    <img src={message.sender.profileImage} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                                      {message.sender?.name?.charAt(0)?.toUpperCase() || "U"}
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Bubble */}
                              <div className={`relative px-4 py-3 rounded-2xl shadow-md transition-all ${message.isTemporary ? "opacity-70" : ""
                                } ${isOwn
                                  ? isDarkMode
                                    ? "text-white rounded-tr-sm"
                                    : "text-white rounded-tr-sm"
                                  : isDarkMode
                                    ? "bg-slate-800/70 border border-slate-700/40 text-white rounded-tl-sm"
                                    : "bg-white border border-indigo-100 text-gray-900 rounded-tl-sm shadow-indigo-100/50"
                                }`}
                                style={isOwn ? { background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 4px 16px rgba(99,102,241,0.25)" } : {}}>

                                {/* Image */}
                                {message.messageType === "image" && message.media && (
                                  <div className="mb-2">
                                    <img
                                      src={message.media} alt="Shared image"
                                      className="chat-media-img max-w-[240px] max-h-[280px] rounded-xl object-cover cursor-pointer hover:opacity-90 transition"
                                      onClick={() => window.open(message.media, "_blank")}
                                      loading="lazy" crossOrigin="anonymous"
                                      onError={e => {
                                        e.target.onerror = null; e.target.className = "hidden";
                                        e.target.parentElement.innerHTML = '<div class="flex items-center gap-2 p-3 rounded-xl bg-black/20 text-xs opacity-70">⚠️ Image failed to load</div>';
                                      }}
                                    />
                                  </div>
                                )}

                                {/* Video */}
                                {message.messageType === "video" && message.media && (
                                  <div className="mb-2">
                                    <video src={message.media} controls preload="metadata" crossOrigin="anonymous"
                                      className="chat-media-video max-w-[240px] max-h-[280px] rounded-xl"
                                      onError={e => { e.target.style.display = "none"; e.target.parentElement.innerHTML = '<div class="text-xs opacity-70 p-2">⚠️ Video failed to load</div>'; }} />
                                  </div>
                                )}

                                {/* Document */}
                                {message.messageType === "document" && message.media && (() => {
                                  const isPdf = message.mimeType === "application/pdf" || message.fileName?.toLowerCase().endsWith(".pdf");
                                  const ext = message.fileName?.split(".").pop()?.toUpperCase() || "FILE";
                                  return (
                                    <div className="mb-2">
                                      <div
                                        onClick={() => handleDocumentDownload(message.media, message.fileName, isPdf)}
                                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all hover:opacity-80 ${isDarkMode ? "bg-white/10" : "bg-indigo-50/80"
                                          }`}
                                      >
                                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${isPdf ? "bg-red-500/20" : "bg-indigo-500/20"}`}>
                                          <DocIcon className={`w-5 h-5 ${isPdf ? "text-red-400" : "text-indigo-400"}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-bold truncate">{message.fileName || "Document"}</p>
                                          <p className="text-xs opacity-60">
                                            {message.fileSize ? `${(message.fileSize / (1024 * 1024)).toFixed(2)} MB · ` : ""}
                                            {ext} · Click to open
                                          </p>
                                        </div>
                                        <ExtLinkIcon className="w-4 h-4 opacity-40 flex-shrink-0" />
                                      </div>
                                    </div>
                                  );
                                })()}

                                {/* Voice Note — custom player with play/pause button */}
                                {message.messageType === "voice" && message.media && (
                                  <div className="mb-2">
                                    <div className={`chat-voice-player flex items-center gap-2 p-2.5 rounded-xl ${isOwn ? "bg-white/10" : isDarkMode ? "bg-slate-700/40" : "bg-indigo-50/60"}`}>
                                      {/* Play / Pause button */}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const audio = document.getElementById(`voice-${message._id}`);
                                          if (!audio) return;
                                          if (playingVoiceId === message._id) {
                                            audio.pause();
                                            setPlayingVoiceId(null);
                                          } else {
                                            if (playingVoiceId) {
                                              const prev = document.getElementById(`voice-${playingVoiceId}`);
                                              if (prev) prev.pause();
                                            }
                                            audio.play();
                                            setPlayingVoiceId(message._id);
                                          }
                                        }}
                                        className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                                          isOwn
                                            ? "bg-white/25 hover:bg-white/40 text-white"
                                            : isDarkMode
                                              ? "bg-indigo-500/30 hover:bg-indigo-500/50 text-indigo-300"
                                              : "bg-indigo-100 hover:bg-indigo-200 text-indigo-600"
                                        }`}
                                      >
                                        {playingVoiceId === message._id ? (
                                          /* Pause icon */
                                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                            <rect x="6" y="4" width="4" height="16" rx="1" />
                                            <rect x="14" y="4" width="4" height="16" rx="1" />
                                          </svg>
                                        ) : (
                                          /* Play icon */
                                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M8 5v14l11-7z" />
                                          </svg>
                                        )}
                                      </button>

                                      {/* Waveform bars (decorative) + hidden audio */}
                                      <div className="flex-1 min-w-0 flex items-center gap-1.5">
                                        {[3,5,7,4,6,8,5,4,7,6,5,3].map((h, i) => (
                                          <div
                                            key={i}
                                            className={`rounded-full flex-1 transition-all ${
                                              playingVoiceId === message._id ? "animate-pulse" : ""
                                            } ${isOwn ? "bg-white/50" : isDarkMode ? "bg-indigo-400/50" : "bg-indigo-300"}`}
                                            style={{ height: `${h * 2}px`, minWidth: "2px" }}
                                          />
                                        ))}
                                      </div>

                                      {/* Duration */}
                                      {message.duration > 0 && (
                                        <span className={`text-xs font-mono flex-shrink-0 ${
                                          isOwn ? "text-indigo-100" : textSub
                                        }`}>
                                          {String(Math.floor(message.duration / 60)).padStart(2, "0")}:{String(message.duration % 60).padStart(2, "0")}
                                        </span>
                                      )}

                                      {/* Hidden native audio element (controlled via JS) */}
                                      <audio
                                        id={`voice-${message._id}`}
                                        src={message.media}
                                        preload="metadata"
                                        onEnded={() => setPlayingVoiceId(null)}
                                        onPause={() => { if (playingVoiceId === message._id) setPlayingVoiceId(null); }}
                                        className="hidden"
                                      />
                                    </div>
                                  </div>
                                )}

                                {/* Text */}
                                {message.messageType === "text" && message.text && (
                                  <p className="chat-msg-text text-sm leading-relaxed">{message.text}</p>
                                )}

                                {/* Timestamp + status */}
                                <div className={`flex items-center gap-1 mt-1.5 ${isOwn ? "justify-end" : "justify-start"}`}>
                                  <span className={`text-[10px] ${isOwn ? "text-indigo-200" : textSub}`}>
                                    {formatTime(message.createdAt)}
                                  </span>
                                  {message.isTemporary && (
                                    <div className="w-3 h-3 border border-current rounded-full animate-spin opacity-60" />
                                  )}
                                  {isOwn && !message.isTemporary && (
                                    <CheckIcon className="w-3.5 h-3.5 text-indigo-200" />
                                  )}
                                </div>
                              </div>

                              {/* ── Delete button (appears on hover) ── */}
                              {/* isOwn: flex-row-reverse parent → order-last = visual LEFT (correct) */}
                              {/* !isOwn: flex-row parent → order-last = visual RIGHT (correct)     */}
                              {!message.isTemporary && (
                                <div className={`flex-shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 order-last ${isOwn ? "ml-1" : "ml-1"
                                  }`}>
                                  <button
                                    onClick={() => setDeleteModal({ messageId: message._id })}
                                    title="Delete for me"
                                    className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all ${isDarkMode
                                      ? "text-slate-500 hover:text-red-400 hover:bg-red-500/10"
                                      : "text-gray-300 hover:text-red-500 hover:bg-red-50"
                                      }`}
                                  >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input Area */}
              <div className={`px-3 sm:px-5 py-3 sm:py-4 border-t ${hdrBorder}`}
                style={{ background: isDarkMode ? "rgba(15,23,42,0.3)" : "rgba(238,242,255,0.3)" }}>

                {/* File preview */}
                {selectedFile && (
                  <div className={`mb-3 p-3 rounded-2xl border ${isDarkMode ? "bg-slate-800/60 border-slate-700/40" : "bg-indigo-50/60 border-indigo-100"}`}>
                    <div className="flex items-center gap-3">
                      {filePreview ? (
                        selectedFile.type.startsWith("image/") ? (
                          <img src={filePreview} alt="Preview" className="w-16 h-16 object-cover rounded-xl border border-indigo-100/30" />
                        ) : selectedFile.type.startsWith("video/") ? (
                          <video src={filePreview} className="w-16 h-16 object-cover rounded-xl" controls />
                        ) : null
                      ) : (
                        <div className={`w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 ${isDarkMode ? "bg-slate-700/60" : "bg-indigo-50"}`}>
                          <DocIcon className={`w-7 h-7 ${isDarkMode ? "text-slate-400" : "text-indigo-400"}`} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`font-bold text-sm truncate ${textMain}`}>{selectedFile.name}</p>
                        <p className={`text-xs ${textSub}`}>{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                      <button type="button" onClick={clearSelectedFile}
                        className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? "text-slate-400 hover:text-red-400 hover:bg-slate-700/60" : "text-gray-400 hover:text-red-500 hover:bg-red-50"}`}>
                        <XIcon className="w-4 h-4" />
                      </button>
                    </div>
                    <button type="button" onClick={handleSendWithFile} disabled={uploading}
                      className="mt-2.5 w-full py-2 text-white text-sm font-bold rounded-xl transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
                      style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 3px 12px rgba(99,102,241,0.3)" }}>
                      {uploading ? (
                        <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Uploading…</>
                      ) : (
                        <><SendIcon className="w-4 h-4" /> Send File</>
                      )}
                    </button>
                  </div>
                )}

                <form onSubmit={sendMessage}>
                  <div className="flex items-end gap-2.5">
                    {/* Attach button */}
                    <button type="button" onClick={() => fileInputRef.current?.click()}
                      className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl border transition-all hover:scale-105 active:scale-95 ${isDarkMode ? "bg-slate-800/60 border-slate-600/40 text-slate-400 hover:text-indigo-300 hover:border-indigo-500/40" : "bg-indigo-50/60 border-indigo-100 text-gray-400 hover:text-indigo-600 hover:border-indigo-200"
                        }`}>
                      <PlusIcon className="w-5 h-5" />
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileSelect}
                      accept="image/*,video/*,.pdf,.doc,.docx" className="hidden" />

                    {/* Text input */}
                    <div className="flex-1 relative">
                      <textarea
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(e); } }}
                        placeholder="Type your message…"
                        rows={1}
                        className={`w-full px-4 py-3 border rounded-2xl text-sm outline-none resize-none transition-all custom-scrollbar ${inputCls}`}
                        style={{ minHeight: "44px", maxHeight: "120px", fieldSizing: "content", overflowX: "hidden", overflowY: "auto" }}
                        onInput={e => { e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"; }}
                        disabled={sending || !isConnected || !!error}
                      />
                    </div>

                    {/* Voice recorder (when input empty) */}
                    {!newMessage.trim() && !selectedFile && (
                      <VoiceRecorder onSend={sendVoiceNote} disabled={!isConnected || !!error || sending} isDarkMode={isDarkMode} />
                    )}

                    {/* Send button */}
                    <button type="submit"
                      disabled={!newMessage.trim() || sending || !isConnected || !!error || !!selectedFile}
                      className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 3px 12px rgba(99,102,241,0.3)" }}>
                      {sending
                        ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        : <SendIcon className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Status row */}
                  <div className="flex items-center justify-between mt-2 px-1">
                    <div className="flex items-center gap-2 text-xs">
                      {!isConnected && (
                        <span className="flex items-center gap-1 text-red-400 font-semibold">
                          <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />Reconnecting…
                        </span>
                      )}
                      {sending && (
                        <span className={`flex items-center gap-1 font-semibold ${isDarkMode ? "text-indigo-400" : "text-indigo-600"}`}>
                          <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />Sending…
                        </span>
                      )}
                    </div>
                    <span className={`text-[10px] font-semibold hidden sm:block ${textSub}`}>Enter to send · Shift+Enter for newline</span>
                  </div>
                </form>
              </div>
            </>
          ) : (
            /* Empty state */
            <div className="flex-1 flex items-center justify-center text-center px-8">
              <div>
                <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 ${isDarkMode ? "bg-indigo-500/10 border border-indigo-500/20" : "bg-indigo-50 border border-indigo-100"}`}
                  style={{ boxShadow: "0 8px 32px rgba(99,102,241,0.1)" }}>
                  <ChatIcon className={`w-12 h-12 ${isDarkMode ? "text-indigo-400" : "text-indigo-500"}`} />
                </div>
                <h3 className={`text-2xl font-black mb-3 ${textMain}`}>
                  {error ? "Select another conversation" : "Select a conversation"}
                </h3>
                <p className={`text-base ${textSub} max-w-sm mx-auto leading-relaxed`}>
                  {error
                    ? "Choose from your available conversations to continue chatting"
                    : "Choose a conversation from the sidebar to start exchanging knowledge"}
                </p>
                {!error && conversations.length === 0 && (
                  <button onClick={() => navigate("/matches")}
                    className="mt-6 px-8 py-3 text-white font-bold rounded-2xl transition-all hover:opacity-90 active:scale-95"
                    style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 4px 20px rgba(99,102,241,0.35)" }}>
                    Find Learning Partners
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Delete Message Confirmation Modal ── */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className={`relative w-full max-w-sm rounded-2xl border shadow-2xl p-6 ${isDarkMode ? "bg-slate-900 border-slate-700/50" : "bg-white border-indigo-100"
            }`}>
            <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl bg-gradient-to-r from-transparent via-red-500/60 to-transparent" />
            <div className="text-center">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${isDarkMode ? "bg-red-500/10" : "bg-red-50"
                }`}>
                <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className={`text-lg font-black mb-1.5 ${textMain}`}>Delete Message?</h3>
              <p className={`text-sm mb-6 ${textSub}`}>This message will be removed only for you. The other person will still see it.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteModal(null)}
                  className={`flex-1 py-2.5 rounded-xl border font-semibold text-sm transition-all ${isDarkMode ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteMessage(deleteModal.messageId)}
                  className="flex-1 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-red-500/25 transition-all hover:scale-[1.02]"
                >
                  Delete for Me
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Clear Chat Confirmation Modal ── */}
      {clearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className={`relative w-full max-w-sm rounded-2xl border shadow-2xl p-6 ${isDarkMode ? "bg-slate-900 border-slate-700/50" : "bg-white border-indigo-100"
            }`}>
            <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl bg-gradient-to-r from-transparent via-orange-500/60 to-transparent" />
            <div className="text-center">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${isDarkMode ? "bg-orange-500/10" : "bg-orange-50"
                }`}>
                <svg className="w-7 h-7 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              </div>
              <h3 className={`text-lg font-black mb-1.5 ${textMain}`}>Clear Entire Chat?</h3>
              <p className={`text-sm mb-6 ${textSub}`}>
                All messages will be cleared <strong>only for you</strong>. The other person's chat will remain unaffected.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setClearModal(false)}
                  className={`flex-1 py-2.5 rounded-xl border font-semibold text-sm transition-all ${isDarkMode ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearChat}
                  className="flex-1 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold text-sm rounded-xl shadow-lg shadow-orange-500/25 transition-all hover:scale-[1.02]"
                >
                  Clear for Me
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scrollbar + textarea styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #6366f1, #8b5cf6);
          border-radius: 999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #4f46e5, #7c3aed);
        }
        textarea { field-sizing: content; }

        /* Textarea: always wrap text, never scroll horizontally */
        textarea {
          overflow-x: hidden !important;
          overflow-y: auto;
          word-break: break-word;
          white-space: pre-wrap;
        }

        /* Global: break long words in bubbles on ALL screen sizes */
        .chat-msg-text {
          word-break: break-word;
          overflow-wrap: anywhere;
        }

        /* Prevent bubble row from generating a horizontal scrollbar */
        .chat-bubble-row { overflow: hidden; }

        /* ── Mobile-only chat fixes (≤ 639px) ── */
        @media (max-width: 639px) {
          /* Wider bubble container on small screens */
          .chat-bubble-row { max-width: 85% !important; }

          /* Long text: word-break already applied globally above */

          /* Images fill the bubble width */
          .chat-media-img {
            width: 100% !important;
            max-width: 100% !important;
          }

          /* Videos fill the bubble width */
          .chat-media-video {
            width: 100% !important;
            max-width: 100% !important;
          }

          /* Voice player: no fixed min-width, full width */
          .chat-voice-player {
            min-width: 0 !important;
            width: 100% !important;
          }

          /* Prevent iOS Safari from zooming on input focus */
          .chat-textarea { font-size: 16px !important; }

          /* File preview thumbnail smaller on mobile */
          .chat-file-thumb { width: 48px !important; height: 48px !important; }
        }
      `}</style>
    </div>
  );
}

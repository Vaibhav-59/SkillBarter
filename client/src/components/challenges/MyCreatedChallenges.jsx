import { useState, useEffect } from "react";
import { Loader2, Plus, Users, CheckCircle, XCircle, X, ExternalLink, FileText, Bot, Star } from "lucide-react";
import { getMyCreatedChallenges, getChallengeSubmissions, reviewSubmission, createChallenge } from "../../services/challengeApi";
import { toast } from "react-toastify";

// XP locked to difficulty
const DIFFICULTY_XP = { Easy: 50, Medium: 100, Hard: 150 };

// Score circle component
function ScoreRing({ score, size = 80 }) {
  const radius = size / 2 - 8;
  const circumference = 2 * Math.PI * radius;
  const filled = (score / 100) * circumference;
  const color =
    score >= 75 ? "#22c55e" :
    score >= 50 ? "#f59e0b" :
    score >= 25 ? "#f97316" : "#ef4444";

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={6}
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={6}
          strokeDasharray={`${filled} ${circumference}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.8s cubic-bezier(0.4,0,0.2,1)" }}
        />
      </svg>
      <span className="absolute text-sm font-extrabold" style={{ color }}>
        {score}
      </span>
    </div>
  );
}

// Full Solution Modal
function SolutionModal({ submission, isDarkMode, onClose }) {
  if (!submission) return null;

  const hasAiEval = submission.aiFeedback || submission.score !== undefined;
  const score = submission.score ?? 0;
  const verdict = submission.status; // Accepted / Rejected / Pending

  const verdictConfig = {
    Accepted: { color: "text-green-400", bg: "bg-green-500/10 border-green-500/30", icon: "✅", label: "Accepted" },
    Rejected: { color: "text-red-400", bg: "bg-red-500/10 border-red-500/30", icon: "❌", label: "Rejected" },
    Pending:  { color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30", icon: "⏳", label: "Pending Review" },
  };
  const vc = verdictConfig[verdict] || verdictConfig.Pending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className={`relative z-10 w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden ${
          isDarkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          isDarkMode ? "border-gray-800" : "border-gray-200"
        }`}>
          <div className="flex items-center gap-3">
            <img
              src={submission.userId?.profileImage || "https://api.dicebear.com/7.x/avataaars/svg"}
              alt="avatar"
              className="w-9 h-9 rounded-full"
            />
            <div>
              <p className={`font-bold text-sm ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                {submission.userId?.name || "Unknown User"}
              </p>
              <p className={`text-xs ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
                Submitted on {new Date(submission.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${vc.bg} ${vc.color}`}>
              {vc.icon} {vc.label}
            </span>
            <button onClick={onClose} className={`p-1.5 rounded-lg transition-colors ${
              isDarkMode ? "hover:bg-gray-800 text-slate-400" : "hover:bg-gray-100 text-gray-500"
            }`}>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">

          {/* ── AI Evaluation Block ────────────────────────────────────── */}
          {hasAiEval && (
            <div className={`rounded-2xl border overflow-hidden ${
              isDarkMode ? "bg-fuchsia-900/10 border-fuchsia-500/20" : "bg-fuchsia-50 border-fuchsia-200"
            }`}>
              {/* AI Header */}
              <div className={`flex items-center gap-2 px-4 py-2.5 border-b text-xs font-bold uppercase tracking-widest ${
                isDarkMode ? "border-fuchsia-500/20 text-fuchsia-400 bg-fuchsia-500/5" : "border-fuchsia-200 text-fuchsia-600 bg-fuchsia-100/40"
              }`}>
                <Bot className="w-3.5 h-3.5" />
                AI Evaluation Result
              </div>

              {/* AI Body */}
              <div className="p-4 flex items-start gap-5">
                {/* Score Ring */}
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <ScoreRing score={score} size={72} />
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${
                    isDarkMode ? "text-slate-400" : "text-gray-500"
                  }`}>/ 100</span>
                </div>

                {/* Verdict + Feedback */}
                <div className="flex-1 min-w-0">
                  {/* Verdict pill */}
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border mb-2 ${vc.bg} ${vc.color}`}>
                    <span>{vc.icon}</span>
                    <span>AI Verdict: {vc.label}</span>
                  </div>

                  {/* Score bar */}
                  <div className="mb-3">
                    <div className={`w-full h-2 rounded-full overflow-hidden ${isDarkMode ? "bg-gray-700" : "bg-gray-200"}`}>
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          score >= 75 ? "bg-green-500" :
                          score >= 50 ? "bg-amber-500" :
                          score >= 25 ? "bg-orange-500" : "bg-red-500"
                        }`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                    <div className={`flex justify-between text-[10px] mt-0.5 ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}>
                      <span>0</span>
                      <span>50</span>
                      <span>100</span>
                    </div>
                  </div>

                  {/* Feedback */}
                  {submission.aiFeedback ? (
                    <p className={`text-sm leading-relaxed ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>
                      {submission.aiFeedback}
                    </p>
                  ) : (
                    <p className={`text-xs italic ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}>
                      No detailed AI feedback available.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Submission Link */}
          {submission.submissionLink && (
            <div>
              <p className={`text-xs font-semibold uppercase tracking-wider mb-1.5 ${
                isDarkMode ? "text-slate-400" : "text-gray-500"
              }`}>Submission Link</p>
              <a
                href={submission.submissionLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-fuchsia-500 hover:text-fuchsia-400 text-sm font-medium hover:underline break-all"
              >
                <ExternalLink className="w-4 h-4 flex-shrink-0" />
                {submission.submissionLink}
              </a>
            </div>
          )}

          {/* File URL */}
          {submission.fileUrl && (
            <div>
              <p className={`text-xs font-semibold uppercase tracking-wider mb-1.5 ${
                isDarkMode ? "text-slate-400" : "text-gray-500"
              }`}>File URL</p>
              <a
                href={submission.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm font-medium hover:underline break-all"
              >
                <ExternalLink className="w-4 h-4 flex-shrink-0" />
                {submission.fileUrl}
              </a>
            </div>
          )}

          {/* Text Answer */}
          {submission.textAnswer && (
            <div>
              <p className={`text-xs font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1.5 ${
                isDarkMode ? "text-slate-400" : "text-gray-500"
              }`}>
                <FileText className="w-3.5 h-3.5" /> Written Answer
              </p>
              <div className={`rounded-xl p-4 text-sm leading-relaxed whitespace-pre-wrap ${
                isDarkMode ? "bg-gray-800 text-slate-200 border border-gray-700" : "bg-gray-50 text-gray-800 border border-gray-200"
              }`}>
                {submission.textAnswer}
              </div>
            </div>
          )}

          {/* Creator manual feedback */}
          {submission.feedback && (
            <div>
              <p className={`text-xs font-semibold uppercase tracking-wider mb-1.5 ${
                isDarkMode ? "text-slate-400" : "text-gray-500"
              }`}>Creator Feedback</p>
              <div className={`rounded-xl p-3 text-sm italic ${
                isDarkMode ? "bg-gray-800/60 text-slate-300 border border-gray-700" : "bg-gray-50 text-gray-600 border border-gray-200"
              }`}>
                {submission.feedback}
              </div>
            </div>
          )}

          {!submission.submissionLink && !submission.textAnswer && !submission.fileUrl && (
            <p className={`text-sm text-center py-4 ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}>
              No solution content available.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Component to handle the review of a single submission
function SubmissionReviewRow({ submission, onReview, onViewSolution, isDarkMode }) {
  const [reviewing, setReviewing] = useState(false);
  const [feedback, setFeedback] = useState("");

  const handleAction = async (status) => {
    setReviewing(true);
    try {
      await onReview(submission._id, status, feedback);
      toast.success(`Submission ${status.toLowerCase()}!`);
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${status} submission`);
    } finally {
      setReviewing(false);
    }
  };

  const isPending = submission.status === "Pending";
  const score = submission.score ?? 0;
  const hasAI = submission.aiFeedback || submission.score !== undefined;

  // Score color
  const scoreColor =
    score >= 75 ? "text-green-400 bg-green-500/10 border-green-500/30" :
    score >= 50 ? "text-amber-400 bg-amber-500/10 border-amber-500/30" :
    score >= 25 ? "text-orange-400 bg-orange-500/10 border-orange-500/30" :
    "text-red-400 bg-red-500/10 border-red-500/30";

  return (
    <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-gray-800/40 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* User Info */}
        <div className="flex items-center gap-3">
          <img src={submission.userId?.profileImage || "https://api.dicebear.com/7.x/avataaars/svg"} alt="Avatar" className="w-10 h-10 rounded-full border border-gray-500" />
          <div>
            <p className={`font-semibold text-sm ${isDarkMode ? "text-white" : "text-gray-900"}`}>{submission.userId?.name}</p>
            <p className={`text-xs ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>{new Date(submission.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Content preview + AI Score + View Solution */}
        <div className="flex-1 min-w-0">
          {/* AI Score Badge */}
          {hasAI && (
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${scoreColor}`}>
                <Bot className="w-3 h-3" />
                AI Score: {score}/100
              </div>
              {submission.aiFeedback && (
                <p className={`text-xs italic truncate max-w-xs ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
                  "{submission.aiFeedback.slice(0, 55)}{submission.aiFeedback.length > 55 ? '…' : ''}"
                </p>
              )}
            </div>
          )}

          {/* Solution content preview */}
          <div className="flex items-center gap-2">
            {submission.submissionLink && (
              <p className={`truncate max-w-xs text-xs ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
                🔗 {submission.submissionLink}
              </p>
            )}
            {submission.textAnswer && !submission.submissionLink && (
              <p className={`italic line-clamp-1 text-xs ${isDarkMode ? "text-slate-300" : "text-gray-600"}`}>
                "{submission.textAnswer.slice(0, 60)}{submission.textAnswer.length > 60 ? '...' : ''}"
              </p>
            )}
            <button
              onClick={() => onViewSolution(submission)}
              className="text-xs text-fuchsia-500 hover:text-fuchsia-400 font-medium hover:underline flex items-center gap-1 transition-colors whitespace-nowrap"
            >
              <ExternalLink className="w-3 h-3" /> View Full Solution
            </button>
          </div>
        </div>

        {/* Status / Actions */}
        <div className="flex items-center gap-2">
          {!isPending ? (
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              submission.status === "Accepted"
                ? "bg-green-500/10 text-green-400 border border-green-500/30"
                : "bg-red-500/10 text-red-400 border border-red-500/30"
            }`}>
              {submission.status}
            </span>
          ) : (
            <div className="flex flex-col gap-2 min-w-[200px]">
              <input
                type="text"
                placeholder="Optional feedback..."
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                className={`w-full px-2 py-1 text-xs rounded border ${
                  isDarkMode ? "bg-gray-900 border-gray-700 text-white" : "bg-white border-gray-200 text-gray-800"
                }`}
              />
              <div className="flex gap-2">
                <button
                  disabled={reviewing}
                  onClick={() => handleAction("Accepted")}
                  className="flex-1 py-1 rounded bg-green-600 hover:bg-green-700 text-white text-xs font-medium disabled:opacity-50 transition-colors"
                >
                  Accept
                </button>
                <button
                  disabled={reviewing}
                  onClick={() => handleAction("Rejected")}
                  className="flex-1 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-xs font-medium disabled:opacity-50 transition-colors"
                >
                  Reject
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


export default function MyCreatedChallenges({ isDarkMode }) {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Create Challenge Modal State
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    skillCategory: "Web Development",
    difficulty: "Medium",
    description: "",
    requirements: "", // comma separated
    rewardXP: DIFFICULTY_XP["Medium"], // auto-set
  });

  // Selected Challenge for viewing submissions
  const [selectedChallengeId, setSelectedChallengeId] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubs, setLoadingSubs] = useState(false);

  // Solution modal
  const [viewingSolution, setViewingSolution] = useState(null);

  useEffect(() => {
    fetchMyChallenges();
  }, []);

  const fetchMyChallenges = async () => {
    try {
      const res = await getMyCreatedChallenges();
      setChallenges(res.data);
    } catch {
      toast.error("Failed to load your challenges.");
    } finally {
      setLoading(false);
    }
  };

  const loadSubmissions = async (id) => {
    if (selectedChallengeId === id) {
      setSelectedChallengeId(null);
      return;
    }
    
    setSelectedChallengeId(id);
    setLoadingSubs(true);
    try {
      const res = await getChallengeSubmissions(id);
      setSubmissions(res.data);
    } catch {
      toast.error("Failed to load submissions.");
    } finally {
      setLoadingSubs(false);
    }
  };

  const handleReview = async (submissionId, status, feedback) => {
    await reviewSubmission(submissionId, { status, feedback });
    
    // Update local state without refetching everything
    setSubmissions(prev => 
      prev.map(sub => sub._id === submissionId ? { ...sub, status, feedback } : sub)
    );
    
    // Update the parent challenge's pending count
    setChallenges(prev => 
      prev.map(ch => ch._id === selectedChallengeId && status !== "Pending"
        ? { ...ch, pendingCount: Math.max(0, ch.pendingCount - 1) }
        : ch
      )
    );
  };

  const handleDifficultyChange = (difficulty) => {
    setFormData(prev => ({ ...prev, difficulty, rewardXP: DIFFICULTY_XP[difficulty] }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const reqsArray = formData.requirements.split(',').map(r => r.trim()).filter(Boolean);
      // Always send XP derived from difficulty (read-only on frontend, enforced on backend too)
      const xp = DIFFICULTY_XP[formData.difficulty] || 50;
      await createChallenge({ ...formData, requirements: reqsArray, rewardXP: xp });
      toast.success("Challenge created successfully!");
      setIsCreating(false);
      setFormData({ title: "", skillCategory: "Web Development", difficulty: "Medium", description: "", requirements: "", rewardXP: DIFFICULTY_XP["Medium"] });
      fetchMyChallenges();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create challenge.");
    }
  };

  if (loading) {
    return <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 text-fuchsia-500 animate-spin" /></div>;
  }

  const xpBadgeColor = {
    Easy: "bg-green-500/10 text-green-400 border-green-500/20",
    Medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    Hard: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  const inputCls = `w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500 ${
    isDarkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200 text-gray-900"
  }`;

  return (
    <div className="space-y-6">
      {/* Solution Modal */}
      {viewingSolution && (
        <SolutionModal
          submission={viewingSolution}
          isDarkMode={isDarkMode}
          onClose={() => setViewingSolution(null)}
        />
      )}
      <div className="flex justify-between items-center">
        <div>
          <h2 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>My Created Challenges</h2>
          <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>Manage challenges you created and review submissions.</p>
        </div>
        <button
          onClick={() => setIsCreating(p => !p)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-700 text-white text-sm font-semibold shadow-md active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" /> Create New
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreate} className={`p-5 rounded-2xl border ${isDarkMode ? "bg-gray-900/60 border-gray-800" : "bg-white border-gray-200"}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className={`block text-xs font-semibold mb-1 ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>Title</label>
              <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className={inputCls} placeholder="E.g. Build a React component" />
            </div>
            <div>
              <label className={`block text-xs font-semibold mb-1 ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>Category</label>
              <select value={formData.skillCategory} onChange={e => setFormData({...formData, skillCategory: e.target.value})} className={inputCls}>
                <option>Web Development</option><option>Data Science</option><option>UI/UX Design</option><option>AI & Machine Learning</option>
              </select>
            </div>
            <div>
              <label className={`block text-xs font-semibold mb-1 ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>Difficulty</label>
              <select
                value={formData.difficulty}
                onChange={e => handleDifficultyChange(e.target.value)}
                className={inputCls}
              >
                <option>Easy</option><option>Medium</option><option>Hard</option>
              </select>
            </div>
            <div>
              <label className={`block text-xs font-semibold mb-1 ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>
                Reward XP
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold border ${
                  xpBadgeColor[formData.difficulty]
                }`}>
                  Auto-set
                </span>
              </label>
              <div className={`w-full rounded-xl border px-3 py-2 text-sm flex items-center justify-between ${
                isDarkMode
                  ? "bg-gray-800/50 border-gray-700 text-slate-400 cursor-not-allowed"
                  : "bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed"
              }`}>
                <span className="font-bold text-fuchsia-400">{formData.rewardXP} XP</span>
                <span className="text-xs opacity-60">Locked to difficulty</span>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className={`block text-xs font-semibold mb-1 ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>Requirements (comma separated)</label>
              <input type="text" value={formData.requirements} onChange={e => setFormData({...formData, requirements: e.target.value})} className={inputCls} placeholder="React, Responsive, Dark Mode..." />
            </div>
            <div className="md:col-span-2">
              <label className={`block text-xs font-semibold mb-1 ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>Description</label>
              <textarea required rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className={inputCls} placeholder="Explain the challenge..." />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setIsCreating(false)} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${isDarkMode ? "text-slate-300 hover:bg-gray-800" : "text-gray-600 hover:bg-gray-100"}`}>Cancel</button>
            <button type="submit" className="px-5 py-2 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-700 text-white text-sm font-semibold transition-colors">Create Challenge</button>
          </div>
        </form>
      )}

      {challenges.length === 0 ? (
        <div className={`p-10 text-center rounded-2xl border ${isDarkMode ? "bg-gray-900/60 border-gray-800 text-slate-400" : "bg-white border-gray-200 text-gray-500"}`}>
          You haven't created any challenges yet.
        </div>
      ) : (
        <div className="space-y-4">
          {challenges.map(ch => (
            <div key={ch._id} className={`rounded-2xl border overflow-hidden ${isDarkMode ? "bg-gray-900/60 border-gray-800" : "bg-white border-gray-200"}`}>
              {/* Header */}
              <div className="p-5 flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-gray-500/10">
                <div>
                  <h3 className={`font-bold text-lg ${isDarkMode ? "text-white" : "text-gray-900"}`}>{ch.title}</h3>
                  <div className={`flex flex-wrap gap-2 mt-1 text-xs ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
                    <span className="bg-gray-500/10 px-2 py-0.5 rounded">{ch.skillCategory}</span>
                    <span className={`px-2 py-0.5 rounded ${ch.difficulty === 'Easy' ? 'bg-green-500/10 text-green-500' : ch.difficulty === 'Hard' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'}`}>{ch.difficulty}</span>
                    <span className="bg-fuchsia-500/10 text-fuchsia-500 px-2 py-0.5 rounded px-2">XP: {ch.rewardXP}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{ch.submissionCount}</div>
                    <div className={`text-[10px] uppercase font-bold tracking-wider ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}>Total Submissions</div>
                  </div>
                  <div className="text-center px-4 border-l border-gray-500/20">
                    <div className={`text-xl font-bold ${ch.pendingCount > 0 ? "text-yellow-500" : isDarkMode ? "text-white" : "text-gray-900"}`}>{ch.pendingCount}</div>
                    <div className={`text-[10px] uppercase font-bold tracking-wider ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}>Pending Review</div>
                  </div>
                  
                  <button
                    onClick={() => loadSubmissions(ch._id)}
                    className={`ml-2 px-4 py-2 flex items-center gap-2 rounded-xl text-sm font-semibold border transition-all ${
                      selectedChallengeId === ch._id
                        ? "bg-fuchsia-600 text-white border-fuchsia-600"
                        : isDarkMode
                          ? "border-gray-700 text-slate-300 hover:bg-gray-800"
                          : "border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    {selectedChallengeId === ch._id ? "Hide Submissions" : "View Submissions"}
                  </button>
                </div>
              </div>

              {/* Submissions List */}
              {selectedChallengeId === ch._id && (
                <div className={`p-5 ${isDarkMode ? "bg-gray-900/40" : "bg-gray-50/50"}`}>
                  {loadingSubs ? (
                    <div className="flex justify-center p-4"><Loader2 className="w-6 h-6 text-fuchsia-500 animate-spin" /></div>
                  ) : submissions.length === 0 ? (
                    <p className={`text-center text-sm py-4 ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}>No submissions yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {submissions.map(sub => (
                        <SubmissionReviewRow
                          key={sub._id}
                          submission={sub}
                          onReview={handleReview}
                          onViewSolution={setViewingSolution}
                          isDarkMode={isDarkMode}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

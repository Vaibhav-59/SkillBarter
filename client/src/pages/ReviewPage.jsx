import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../utils/api";
import { showError, showSuccess } from "../utils/toast";
import { ThemeContext } from "../contexts/ThemeContext";

const RATING_LABELS = { 1: "Poor", 2: "Fair", 3: "Good", 4: "Great", 5: "Excellent" };

export default function ReviewPage() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((s) => s.auth);
  const { theme } = useContext(ThemeContext) || { theme: "dark" };
  const d = theme === "dark";
  const type = new URLSearchParams(location.search).get("type") || "match";

  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [review, setReview] = useState({
    rating: 5, comment: "", skillDelivered: true, wouldRecommend: true,
    skillOfferedRating: 5, skillRequestedRating: 5, communication: 5, reliability: 5,
  });

  useEffect(() => { fetchMatch(); }, [matchId]);

  const fetchMatch = async () => {
    try {
      const endpoint = type === "contract" ? `/contracts/${matchId}` : `/matches/${matchId}`;
      const { data } = await api.get(endpoint);
      const md = data.data;
      if (md.status !== "completed") { showError(`Can only review completed ${type}s`); navigate(-1); return; }
      setMatch(md);
    } catch { showError("Failed to load details"); navigate(-1); }
    finally { setLoading(false); }
  };

  const setR = (k, v) => setReview((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!review.comment.trim()) { showError("Please write a comment"); return; }
    if (review.comment.length < 10) { showError("Comment must be at least 10 characters"); return; }
    setSubmitting(true);
    try {
      const ep = type === "contract" ? `/contracts/${matchId}/review` : `/matches/${matchId}/review`;
      await api.post(ep, {
        rating: review.rating, comment: review.comment,
        skillDelivered: review.skillDelivered, wouldRecommend: review.wouldRecommend,
        teachingQuality: review.skillOfferedRating, communication: review.communication,
        reliability: review.reliability, reviewee: otherUser._id,
        skillOffered: taughtSkillInfo.name, skillRequested: learnedSkillInfo.name,
      });
      showSuccess("Review submitted successfully!");
      navigate(type === "contract" ? "/contracts" : "/matches");
    } catch (err) { showError(err.response?.data?.message || "Failed to submit review"); }
    finally { setSubmitting(false); }
  };

  /* ── shared helpers ── */
  const card = `rounded-2xl border p-6 ${d ? "bg-[#0d1525]/80 border-indigo-500/15" : "bg-white border-indigo-100 shadow-sm"}`;
  const secTitle = `text-lg font-bold text-center mb-1 ${d ? "text-white" : "text-slate-800"}`;
  const secSub = `text-center mb-5 ${d ? "text-slate-400" : "text-slate-500"}`;

  if (loading) return (
    <div className={`min-h-screen flex items-center justify-center ${d ? "bg-[#080c17]" : "bg-gradient-to-br from-slate-50 to-indigo-50/40"}`}>
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-14 h-14 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <div className="absolute inset-0 border-4 border-violet-500/20 border-b-violet-500 rounded-full animate-spin" style={{ animationDuration: "1.5s", animationDirection: "reverse" }} />
        </div>
        <p className={d ? "text-slate-400" : "text-slate-500"}>Loading review form…</p>
      </div>
    </div>
  );

  if (!match) return null;

  const isA = type === "contract" ? match.userA?._id === user._id : false;
  const otherUser = type === "contract"
    ? (isA ? match.userB : match.userA)
    : (match.requester?._id === user._id ? match.receiver : match.requester);
  const skillIOffered = type === "contract" ? (isA ? match.skillTeach : match.skillLearn) : match.skillOffered;
  const skillIRequested = type === "contract" ? (isA ? match.skillLearn : match.skillTeach) : match.skillRequested;
  const taughtSkillInfo = { name: skillIOffered };
  const learnedSkillInfo = { name: skillIRequested };

  /* sub-components */
  const StarBtn = ({ star, field, large = false }) => {
    const active = star <= review[field];
    const size = large ? "w-12 h-12 text-xl" : "w-10 h-10 text-sm font-bold";
    return (
      <button type="button" onClick={() => setR(field, star)}
        className={`${size} rounded-xl flex items-center justify-center transition-all duration-200 ${
          active
            ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/30 scale-110"
            : d
              ? "bg-slate-800 text-slate-500 hover:bg-slate-700 hover:scale-105"
              : "bg-indigo-50 text-slate-400 hover:bg-indigo-100 hover:scale-105"
        }`}>
        {large ? "★" : star}
      </button>
    );
  };

  const Toggle = ({ label, field, value, positive }) => (
    <button type="button" onClick={() => setR(field, value)}
      className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-200 ${
        review[field] === value
          ? positive
            ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/25"
            : "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/25"
          : d
            ? "bg-slate-800/80 text-slate-400 hover:bg-slate-700"
            : "bg-slate-100 text-slate-500 hover:bg-indigo-50"
      }`}>
      {label}
    </button>
  );

  const RatingRow = ({ label, field, badge, badgeColor }) => (
    <div className={`rounded-xl p-4 border ${d ? "bg-slate-800/40 border-indigo-500/10" : "bg-indigo-50/60 border-indigo-100"}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`font-semibold ${d ? "text-white" : "text-slate-800"}`}>{label}</span>
          {badge && <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeColor}`}>{badge}</span>}
        </div>
        <span className={`font-bold text-sm px-2.5 py-0.5 rounded-full ${d ? "bg-amber-500/15 text-amber-400" : "bg-amber-50 text-amber-600 border border-amber-200"}`}>
          {review[field]}/5 — {RATING_LABELS[review[field]]}
        </span>
      </div>
      <div className="flex justify-center gap-2">
        {[1,2,3,4,5].map(v => <StarBtn key={v} star={v} field={field} />)}
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen relative overflow-hidden ${d ? "bg-[#080c17]" : "bg-gradient-to-br from-slate-50 to-indigo-50/40"}`}>
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full blur-3xl animate-pulse ${d ? "bg-indigo-500/8" : "bg-indigo-200/30"}`} />
        <div className={`absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full blur-3xl animate-pulse delay-1000 ${d ? "bg-violet-500/6" : "bg-violet-200/25"}`} />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-8 pb-24">
        {/* Back */}
        <button onClick={() => navigate(-1)}
          className={`flex items-center gap-2 mb-6 font-medium transition-colors ${d ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"}`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
          Back
        </button>

        {/* Hero Card */}
        <div className={`rounded-2xl border mb-6 overflow-hidden ${d ? "bg-[#0d1525]/90 border-indigo-500/15" : "bg-white border-indigo-100 shadow-sm"}`}>
          <div className={`relative px-8 py-8 text-center overflow-hidden ${d ? "bg-gradient-to-br from-indigo-500/8 to-violet-500/5" : "bg-gradient-to-br from-indigo-50 to-violet-50/60"}`}>
            <div className={`absolute -top-10 left-1/2 -translate-x-1/2 w-60 h-20 rounded-full blur-3xl pointer-events-none ${d ? "bg-indigo-500/15" : "bg-indigo-200/40"}`} />
            {/* Avatar */}
            <div className="relative inline-block mb-5">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mx-auto shadow-xl shadow-indigo-500/30 overflow-hidden">
                {otherUser.profileImage
                  ? <img src={otherUser.profileImage} alt={otherUser.name} className="w-full h-full object-cover" />
                  : <span className="text-4xl font-black text-white">{otherUser.name?.charAt(0)?.toUpperCase()}</span>}
              </div>
              <div className="absolute -bottom-2 -right-2 w-9 h-9 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>
              </div>
            </div>
            <h1 className={`text-3xl font-black mb-1 ${d ? "text-white" : "text-slate-900"}`}>Rate Your Experience</h1>
            <p className={`text-lg mb-1 ${d ? "text-slate-300" : "text-slate-600"}`}>
              with <span className={`font-black ${d ? "text-indigo-300" : "text-indigo-600"}`}>{otherUser.name}</span>
            </p>
            <p className={`${d ? "text-slate-500" : "text-slate-400"}`}>Your feedback helps the community grow</p>
          </div>
        </div>

        {/* Skill Exchange Summary */}
        <div className={`${card} mb-6`}>
          <h2 className={`font-bold text-center mb-5 ${d ? "text-slate-300" : "text-slate-700"}`}>Skill Exchange Summary</h2>
          <div className="grid grid-cols-3 items-center gap-4">
            <div className={`rounded-2xl p-4 text-center border ${d ? "bg-indigo-500/8 border-indigo-500/15" : "bg-indigo-50 border-indigo-100"}`}>
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
              </div>
              <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${d ? "text-indigo-400" : "text-indigo-600"}`}>They Teach</p>
              <p className={`font-black leading-tight ${d ? "text-white" : "text-slate-800"}`}>{skillIOffered}</p>
            </div>
            <div className="flex justify-center">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
              </div>
            </div>
            <div className={`rounded-2xl p-4 text-center border ${d ? "bg-violet-500/8 border-violet-500/15" : "bg-violet-50 border-violet-100"}`}>
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
              </div>
              <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${d ? "text-violet-400" : "text-violet-600"}`}>They Learn</p>
              <p className={`font-black leading-tight ${d ? "text-white" : "text-slate-800"}`}>{skillIRequested}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Overall Rating */}
          <div className={card}>
            <h3 className={secTitle}>Overall Experience</h3>
            <p className={secSub}>How was your overall skill exchange?</p>
            <div className="flex justify-center gap-2.5 mb-4">
              {[1,2,3,4,5].map(star => <StarBtn key={star} star={star} field="rating" large />)}
            </div>
            <div className="text-center">
              <span className={`inline-flex items-center gap-2 px-5 py-2 rounded-full font-bold border ${d ? "bg-amber-500/10 text-amber-400 border-amber-500/25" : "bg-amber-50 text-amber-600 border-amber-200"}`}>
                <span className="text-amber-400">★</span>
                {review.rating}/5 — {RATING_LABELS[review.rating]}
              </span>
            </div>
          </div>

          {/* Detailed Ratings */}
          <div className={card}>
            <h3 className={secTitle}>Rate Each Aspect</h3>
            <p className={secSub}>Help others understand your experience</p>
            <div className="space-y-3">
              <RatingRow label={taughtSkillInfo.name} field="skillOfferedRating"
                badge="Teaches" badgeColor={d ? "bg-teal-500/15 text-teal-400" : "bg-teal-50 text-teal-600 border border-teal-200"} />
              <RatingRow label={learnedSkillInfo.name} field="skillRequestedRating"
                badge="Learns" badgeColor={d ? "bg-indigo-500/15 text-indigo-400" : "bg-indigo-50 text-indigo-600 border border-indigo-200"} />
              <RatingRow label="Communication" field="communication" />
              <RatingRow label="Reliability" field="reliability" />
            </div>
          </div>

          {/* Quick Feedback */}
          <div className={card}>
            <h3 className={secTitle}>Quick Feedback</h3>
            <p className={secSub}>Two quick yes/no questions</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className={`font-semibold text-center ${d ? "text-slate-300" : "text-slate-700"}`}>Was skill delivered?</p>
                <div className="flex gap-2">
                  <Toggle label="Yes ✓" field="skillDelivered" value={true} positive={true} />
                  <Toggle label="No ✗" field="skillDelivered" value={false} positive={false} />
                </div>
              </div>
              <div className="space-y-2">
                <p className={`font-semibold text-center ${d ? "text-slate-300" : "text-slate-700"}`}>Would recommend?</p>
                <div className="flex gap-2">
                  <Toggle label="Yes ✓" field="wouldRecommend" value={true} positive={true} />
                  <Toggle label="No ✗" field="wouldRecommend" value={false} positive={false} />
                </div>
              </div>
            </div>
          </div>

          {/* Comment */}
          <div className={card}>
            <h3 className={secTitle}>Your Review</h3>
            <p className={secSub}>Share your experience with others</p>
            <textarea
              value={review.comment}
              onChange={(e) => setR("comment", e.target.value)}
              placeholder="What was your experience like? What did you learn? Would you exchange skills again?"
              rows={5}
              className={`w-full px-4 py-3 rounded-xl border outline-none transition-all duration-200 resize-none ${
                d
                  ? "bg-[#080c17] border-indigo-500/20 text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  : "bg-slate-50 border-indigo-200 text-slate-800 placeholder-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              }`}
              required
            />
            <div className="flex justify-between items-center mt-3">
              <span className={d ? "text-slate-500" : "text-slate-400"}>Minimum 10 characters</span>
              <span className={`font-bold px-4 py-1.5 rounded-full border ${
                review.comment.length >= 10
                  ? d ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" : "bg-emerald-50 text-emerald-600 border-emerald-200"
                  : d ? "bg-slate-800 text-slate-500 border-slate-700" : "bg-slate-100 text-slate-400 border-slate-200"
              }`}>{review.comment.length}/10</span>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4 pt-2">
            <button type="button" onClick={() => navigate(-1)} disabled={submitting}
              className={`flex-1 py-4 rounded-2xl font-bold border transition-all ${
                d ? "bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700" : "bg-white border-indigo-200 text-slate-700 hover:bg-indigo-50"
              } disabled:opacity-50`}>
              Cancel
            </button>
            <button type="submit" disabled={submitting || review.comment.length < 10}
              className="flex-[2] py-4 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600 hover:from-indigo-400 hover:via-violet-400 hover:to-purple-500 text-white font-bold rounded-2xl shadow-xl shadow-indigo-500/30 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2">
              {submitting ? (
                <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Submitting…</>
              ) : (
                <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg> Submit Review</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

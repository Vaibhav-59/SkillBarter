import { useState, useContext } from "react";
import { useDispatch } from "react-redux";
import { createReviewAsync } from "../../redux/slices/reviewSlice";
import { fetchSmartMatches } from "../../redux/slices/smartMatchSlice";
import { showError, showSuccess } from "../../utils/toast";
import { ThemeContext } from "../../contexts/ThemeContext";

const RATING_LABELS = { 1: "Poor", 2: "Fair", 3: "Good", 4: "Great", 5: "Excellent" };

export default function ReviewForm({
  revieweeId,
  revieweeName,
  matchId = null,
  skillOffered,
  skillRequested,
  onSuccess,
  onCancel,
}) {
  const dispatch = useDispatch();
  const { theme } = useContext(ThemeContext) || { theme: "dark" };
  const d = theme === "dark";

  const [formData, setFormData] = useState({
    comment: "",
    rating: 5,
    skillOfferedRating: 5,
    skillRequestedRating: 5,
    communication: 5,
    reliability: 5,
    skillDelivered: true,
    wouldRecommend: true,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.comment.trim()) newErrors.comment = "Comment is required";
    else if (formData.comment.trim().length < 10) newErrors.comment = "Comment must be at least 10 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const reviewData = {
        reviewee: revieweeId,
        comment: formData.comment.trim(),
        rating: parseInt(formData.rating),
        teachingQuality: parseInt(formData.skillOfferedRating),
        communication: parseInt(formData.communication),
        reliability: parseInt(formData.reliability),
        skillDelivered: formData.skillDelivered,
        wouldRecommend: formData.wouldRecommend,
        skillOffered: skillOffered || null,
        skillRequested: skillRequested || null,
        ...(matchId && { matchId }),
      };
      const result = await dispatch(createReviewAsync(reviewData)).unwrap();
      showSuccess("Review submitted successfully!");
      dispatch(fetchSmartMatches({ refresh: true }));
      setFormData({
        comment: "", rating: 5, skillOfferedRating: 5, skillRequestedRating: 5,
        communication: 5, reliability: 5, skillDelivered: true, wouldRecommend: true,
      });
      onSuccess?.(result);
    } catch (error) {
      showError(error?.message || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  /* ── shared style helpers ── */
  const card = `rounded-2xl border p-5 ${d
    ? "bg-[#0d1525]/80 border-indigo-500/15"
    : "bg-white border-indigo-100 shadow-sm"}`;
  const secTitle = `font-bold text-center mb-1 ${d ? "text-white" : "text-slate-800"}`;
  const secSub = `text-center mb-4 ${d ? "text-slate-400" : "text-slate-500"}`;

  const StarBtn = ({ star, field }) => {
    const active = star <= formData[field];
    return (
      <button type="button" onClick={() => handleInputChange(field, star)}
        className={`w-10 h-10 rounded-xl flex items-center justify-center text-base font-bold transition-all duration-200 ${
          active
            ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/30 scale-110"
            : d
              ? "bg-slate-800 text-slate-500 hover:bg-slate-700 hover:scale-105"
              : "bg-indigo-50 text-slate-400 hover:bg-indigo-100 hover:scale-105"
        }`}>
        {star}
      </button>
    );
  };

  const BigStarBtn = ({ star }) => {
    const active = star <= formData.rating;
    return (
      <button type="button" onClick={() => handleInputChange("rating", star)}
        className={`w-13 h-13 w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all duration-200 ${
          active
            ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/40 scale-110"
            : d
              ? "bg-slate-800 text-slate-600 hover:bg-slate-700 hover:scale-105"
              : "bg-indigo-50 text-slate-400 hover:bg-indigo-100 hover:scale-105"
        }`}>
        ★
      </button>
    );
  };

  const Toggle = ({ label, field, value, positive }) => {
    const active = formData[field] === value;
    return (
      <button type="button" onClick={() => handleInputChange(field, value)}
        className={`flex-1 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
          active
            ? positive
              ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/25"
              : "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/25"
            : d
              ? "bg-slate-800 text-slate-400 hover:bg-slate-700"
              : "bg-slate-100 text-slate-500 hover:bg-indigo-50"
        }`}>
        {label}
      </button>
    );
  };

  const RatingRow = ({ label, field, badge, badgeColor }) => (
    <div className={`rounded-xl p-3.5 border ${d ? "bg-slate-800/50 border-indigo-500/10" : "bg-indigo-50/60 border-indigo-100"}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`font-semibold ${d ? "text-white" : "text-slate-800"}`}>{label}</span>
          {badge && <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeColor}`}>{badge}</span>}
        </div>
        <span className={`font-bold text-sm px-2.5 py-0.5 rounded-full ${d ? "bg-amber-500/15 text-amber-400" : "bg-amber-50 text-amber-600 border border-amber-200"}`}>
          {formData[field]}/5 — {RATING_LABELS[formData[field]]}
        </span>
      </div>
      <div className="flex justify-center gap-1.5">
        {[1,2,3,4,5].map(v => <StarBtn key={v} star={v} field={field} />)}
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* Overall Rating */}
      <div className={card}>
        <h3 className={secTitle}>Overall Experience</h3>
        <p className={`${secSub}`}>How was your overall skill exchange?</p>
        <div className="flex justify-center gap-2 mb-3">
          {[1,2,3,4,5].map(star => <BigStarBtn key={star} star={star} />)}
        </div>
        <div className="text-center">
          <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full font-bold border ${
            d ? "bg-amber-500/10 text-amber-400 border-amber-500/25" : "bg-amber-50 text-amber-600 border-amber-200"
          }`}>
            <span>★</span> {formData.rating}/5 — {RATING_LABELS[formData.rating]}
          </span>
        </div>
      </div>

      {/* Detailed Ratings */}
      <div className={card}>
        <h3 className={secTitle}>Rate Each Aspect</h3>
        <p className={secSub}>Help others understand your experience</p>
        <div className="space-y-2.5">
          {(skillOffered && skillOffered.trim()) ? (
            <RatingRow label={skillOffered} field="skillOfferedRating"
              badge="Teaches"
              badgeColor={d ? "bg-teal-500/15 text-teal-400" : "bg-teal-50 text-teal-600 border border-teal-200"} />
          ) : (
            <RatingRow label="Teaching Quality" field="skillOfferedRating" />
          )}
          {(skillRequested && skillRequested.trim()) && (
            <RatingRow label={skillRequested} field="skillRequestedRating"
              badge="Learns"
              badgeColor={d ? "bg-indigo-500/15 text-indigo-400" : "bg-indigo-50 text-indigo-600 border border-indigo-200"} />
          )}
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
          rows={4}
          placeholder="What was your experience like? What did you learn? Would you exchange skills again?"
          value={formData.comment}
          onChange={(e) => handleInputChange("comment", e.target.value)}
          disabled={loading}
          className={`w-full px-4 py-3 rounded-xl border outline-none transition-all duration-200 resize-none ${
            errors.comment
              ? "border-red-400"
              : d
                ? "bg-[#0b1020] border-indigo-500/20 text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                : "bg-slate-50 border-indigo-200 text-slate-800 placeholder-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          }`}
        />
        <div className="flex justify-between items-center mt-2">
          <span className={d ? "text-slate-500" : "text-slate-400"}>Minimum 10 characters</span>
          <span className={`font-bold px-3 py-1 rounded-full border ${
            formData.comment.length >= 10
              ? d
                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25"
                : "bg-emerald-50 text-emerald-600 border-emerald-200"
              : d
                ? "bg-slate-800 text-slate-500 border-slate-700"
                : "bg-slate-100 text-slate-400 border-slate-200"
          }`}>
            {formData.comment.length}/10
          </span>
        </div>
        {errors.comment && <p className="text-red-400 mt-1">{errors.comment}</p>}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        {onCancel && (
          <button type="button" onClick={onCancel} disabled={loading}
            className={`flex-1 py-3.5 rounded-2xl font-bold border transition-all ${
              d ? "bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            } disabled:opacity-50`}>
            Cancel
          </button>
        )}
        <button type="submit"
          disabled={loading || !formData.comment.trim() || formData.comment.length < 10}
          className="flex-[2] py-3.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600 hover:from-indigo-400 hover:via-violet-400 hover:to-purple-500 text-white font-bold rounded-2xl shadow-xl shadow-indigo-500/30 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2">
          {loading ? (
            <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Submitting…</>
          ) : (
            <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg> Submit Review</>
          )}
        </button>
      </div>
    </form>
  );
}

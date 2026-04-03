import { useState, useEffect, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchGivenReviewsAsync,
  fetchReviewStatsAsync,
} from "../redux/slices/reviewSlice";
import ReviewList from "../components/reviews/ReviewList";
import ReviewForm from "../components/reviews/ReviewForm";
import Modal from "../components/common/Modal";
import api from "../utils/api";
import { showError } from "../utils/toast";
import { ThemeContext } from "../contexts/ThemeContext";

const TABS = { RECEIVED: "received", GIVEN: "given" };

export default function ReviewsPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { givenReviews, reviewStats, loading } = useSelector((s) => s.review);
  const { theme } = useContext(ThemeContext) || { theme: "dark" };
  const d = theme === "dark";

  const [activeTab, setActiveTab] = useState(TABS.RECEIVED);
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [matches, setMatches] = useState([]);
  const [matchesLoading, setMatchesLoading] = useState(false);

  useEffect(() => { if (user?._id) dispatch(fetchReviewStatsAsync()); }, [dispatch, user]);

  useEffect(() => {
    if (activeTab === TABS.GIVEN && user?._id)
      dispatch(fetchGivenReviewsAsync({ page: 1, limit: 100 }));
  }, [dispatch, activeTab, user]);

  useEffect(() => {
    if (showWriteModal && user?._id) fetchMatchesForReview();
  }, [showWriteModal, user, givenReviews]);

  const fetchMatchesForReview = async () => {
    setMatchesLoading(true);
    try {
      const { data } = await api.get("/matches", { params: { status: "completed", limit: 100 } });
      const completed = data.data || [];
      const reviewedIds = new Set(givenReviews.filter(r => r.matchId).map(r => r.matchId?._id || r.matchId));
      setMatches(completed.filter(m => !reviewedIds.has(m._id)));
    } catch { showError("Failed to load matches"); }
    finally { setMatchesLoading(false); }
  };

  const handleWriteReview = () => setShowWriteModal(true);
  const handleCloseWriteModal = () => { setShowWriteModal(false); setSelectedUser(null); };
  const handleReviewSuccess = () => {
    handleCloseWriteModal();
    dispatch(fetchReviewStatsAsync());
    dispatch(fetchGivenReviewsAsync({ page: 1, limit: 10 }));
  };

  const handleUserSelect = (match) => {
    const other = match.requester?._id === user._id ? match.receiver : match.requester;
    setSelectedUser({
      _id: other._id, name: other.name, matchId: match._id,
      skillOffered: match.skillOffered || match.skillsInvolved?.[0] || match.requesterSkills?.[0] || "",
      skillRequested: match.skillRequested || match.skillsInvolved?.[1] || match.receiverSkills?.[0] || "",
    });
  };

  /* ── style tokens ── */
  const pageBg   = d ? "bg-[#080c17]" : "bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-50";
  const cardBase = `rounded-2xl border ${d ? "bg-[#0d1525]/80 border-indigo-500/15" : "bg-white border-indigo-100 shadow-sm"}`;
  const tabActive = "bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30";
  const tabIdle   = d
    ? "bg-slate-800/60 border border-slate-700/50 text-slate-300 hover:border-indigo-500/30 hover:text-indigo-400"
    : "bg-white border border-indigo-100 text-slate-600 hover:border-indigo-300 hover:text-indigo-600";

  /* stat card helper */
  const StatCard = ({ title, value, subtitle, icon, accent, iconBg }) => (
    <div className={`group relative ${cardBase} p-6 hover:shadow-xl transition-all duration-300 overflow-hidden`}>
      {/* hover glow */}
      <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${
        d ? `bg-gradient-to-br ${accent}/5` : `bg-gradient-to-br ${accent}/3`
      }`} />
      <div className="relative">
        <div className="flex items-center justify-between mb-5">
          <h3 className={`font-bold ${d ? "text-slate-300" : "text-slate-600"}`}>{title}</h3>
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${iconBg}`}>
            {icon}
          </div>
        </div>
        <div className={`text-4xl font-black mb-1 ${accent.includes("indigo") ? "bg-gradient-to-r from-indigo-400 to-violet-500" : accent.includes("violet") ? "bg-gradient-to-r from-violet-400 to-purple-500" : "bg-gradient-to-r from-emerald-400 to-teal-500"} bg-clip-text text-transparent`}>
          {value}
        </div>
        <p className={d ? "text-slate-400" : "text-slate-500"}>{subtitle}</p>
      </div>
    </div>
  );

  /* recent review card */
  const RecentCard = ({ review, idx }) => (
    <div className={`group relative flex items-start gap-4 p-4 rounded-xl border transition-all duration-300 ${
      d ? "bg-slate-800/30 border-indigo-500/10 hover:border-indigo-500/30" : "bg-indigo-50/40 border-indigo-100 hover:border-indigo-300"
    }`} style={{ animationDelay: `${idx * 80}ms` }}>
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-md">
        {review.reviewer?.profileImage || review.reviewer?.avatar
          ? <img src={review.reviewer.profileImage || review.reviewer.avatar} alt={review.reviewer.name} className="w-10 h-10 object-cover rounded-xl" />
          : <span className="text-white font-bold">{review.reviewer?.name?.charAt(0)?.toUpperCase() || "?"}</span>}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className={`font-semibold ${d ? "text-white" : "text-slate-800"}`}>{review.reviewer?.name || "Anonymous"}</span>
          <div className="flex">
            {Array.from({ length: 5 }, (_, i) => (
              <span key={i} className={i < review.rating ? "text-amber-400" : d ? "text-slate-700" : "text-slate-200"}>★</span>
            ))}
          </div>
        </div>
        <p className={`leading-relaxed truncate ${d ? "text-slate-400" : "text-slate-500"}`}>{review.comment}</p>
      </div>
      <span className={`text-xs flex-shrink-0 ${d ? "text-slate-500" : "text-slate-400"}`}>
        {new Date(review.createdAt).toLocaleDateString()}
      </span>
    </div>
  );

  return (
    <div className={`min-h-screen relative overflow-hidden ${pageBg}`}>
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full blur-3xl animate-pulse ${d ? "bg-indigo-500/8" : "bg-indigo-200/25"}`} />
        <div className={`absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full blur-3xl animate-pulse delay-1000 ${d ? "bg-violet-500/6" : "bg-violet-200/20"}`} />
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl animate-pulse delay-500 ${d ? "bg-purple-500/4" : "bg-purple-100/30"}`} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>
              </div>
              <h1 className={`text-3xl font-black ${d ? "text-white" : "text-slate-900"}`}>Reviews & Feedback</h1>
            </div>
            <p className={d ? "text-slate-400" : "text-slate-500"}>Manage your reviews and see feedback from the community</p>
          </div>
          <button onClick={handleWriteReview}
            className="group relative flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600 hover:from-indigo-400 hover:via-violet-400 hover:to-purple-500 text-white font-bold rounded-2xl shadow-xl shadow-indigo-500/30 transition-all duration-300 hover:scale-105 overflow-hidden flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <svg className="w-4 h-4 relative" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/></svg>
            <span className="relative">Write Review</span>
          </button>
        </div>

        {/* ── Stats Cards ── */}
        {reviewStats && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <StatCard
              title="Reviews Received"
              value={reviewStats.received?.averageRating || "—"}
              subtitle={`${reviewStats.received?.totalReviews || 0} total reviews`}
              iconBg={d ? "bg-indigo-500/15" : "bg-indigo-50"}
              accent="from-indigo-400 to-violet-500"
              icon={<svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1l-4 4z"/></svg>}
            />
            <StatCard
              title="Reviews Given"
              value={reviewStats.given?.totalReviews || 0}
              subtitle="Reviews you've written"
              iconBg={d ? "bg-violet-500/15" : "bg-violet-50"}
              accent="from-violet-400 to-purple-500"
              icon={<svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>}
            />
            <StatCard
              title="Recent Activity"
              value={reviewStats.recentReviews?.length || 0}
              subtitle="Recent reviews received"
              iconBg={d ? "bg-emerald-500/15" : "bg-emerald-50"}
              accent="from-emerald-400 to-teal-500"
              icon={<svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>}
            />
          </div>
        )}

        {/* ── Recent Reviews ── */}
        {reviewStats?.recentReviews?.length > 0 && (
          <div className={`${cardBase} p-6`}>
            <div className="flex items-center gap-2 mb-5">
              <h2 className={`text-lg font-bold ${d ? "text-white" : "text-slate-800"}`}>Recent Feedback</h2>
              <span className={`px-2 py-0.5 rounded-full font-bold ${d ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/25" : "bg-indigo-50 text-indigo-600 border border-indigo-200"}`}>
                {reviewStats.recentReviews.length}
              </span>
            </div>
            <div className="space-y-3">
              {reviewStats.recentReviews.slice(0, 3).map((r, i) => <RecentCard key={r._id} review={r} idx={i} />)}
            </div>
          </div>
        )}

        {/* ── Tabs ── */}
        <div className="flex items-center gap-3">
          {[
            { key: TABS.RECEIVED, label: "Received", count: reviewStats?.received?.totalReviews },
            { key: TABS.GIVEN,    label: "Given",    count: reviewStats?.given?.totalReviews },
          ].map(({ key, label, count }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`group relative px-5 py-2.5 rounded-2xl font-semibold transition-all duration-300 hover:scale-105 overflow-hidden ${activeTab === key ? tabActive : tabIdle}`}>
              {activeTab === key && (
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              )}
              <span className="relative flex items-center gap-2">
                {label}
                {count != null && (
                  <span className={`px-2 py-0.5 rounded-full ${activeTab === key ? "bg-white/20 text-white" : d ? "bg-indigo-500/15 text-indigo-400" : "bg-indigo-50 text-indigo-600"}`}>
                    {count}
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>

        {/* ── Tab Content ── */}
        <div className={`${cardBase} p-6 sm:p-8`}>
          {activeTab === TABS.RECEIVED ? (
            <ReviewList userId={user?._id} showActions={false} showTitle={false} />
          ) : (
            <div className="space-y-5">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                    <div className="absolute inset-0 border-4 border-violet-500/20 border-b-violet-500 rounded-full animate-spin" style={{ animationDuration: "1.5s", animationDirection: "reverse" }} />
                  </div>
                </div>
              ) : !givenReviews?.length ? (
                <div className="text-center py-16">
                  <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5 ${d ? "bg-indigo-500/10" : "bg-indigo-50"}`}>
                    <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                  </div>
                  <h4 className={`text-xl font-bold mb-2 ${d ? "text-white" : "text-slate-800"}`}>No reviews given yet</h4>
                  <p className={`mb-6 max-w-md mx-auto ${d ? "text-slate-400" : "text-slate-500"}`}>
                    Start reviewing your skill exchange partners to build trust and help the community
                  </p>
                  <button onClick={handleWriteReview}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/25 transition-all hover:scale-105">
                    Write Your First Review
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {givenReviews.map((rev, idx) => (
                    <div key={rev._id}
                      className={`group rounded-2xl border p-5 transition-all duration-300 ${d ? "bg-slate-800/30 border-indigo-500/10 hover:border-indigo-500/30" : "bg-indigo-50/30 border-indigo-100 hover:border-indigo-300"}`}
                      style={{ animationDelay: `${idx * 80}ms` }}>
                      <div className="flex items-start gap-4">
                        <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md overflow-hidden">
                          {rev.reviewee?.profileImage || rev.reviewee?.avatar
                            ? <img src={rev.reviewee.profileImage || rev.reviewee.avatar} alt={rev.reviewee.name} className="w-11 h-11 rounded-2xl object-cover" />
                            : <span className="text-white font-bold">{rev.reviewee?.name?.charAt(0)?.toUpperCase() || "?"}</span>}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1.5">
                            <h4 className={`font-bold ${d ? "text-white" : "text-slate-800"}`}>Review for {rev.reviewee?.name || "Anonymous"}</h4>
                            <span className={`text-xs ${d ? "text-slate-500" : "text-slate-400"}`}>{new Date(rev.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex">
                              {Array.from({ length: 5 }, (_, i) => (
                                <span key={i} className={i < rev.rating ? "text-amber-400" : d ? "text-slate-700" : "text-slate-200"}>★</span>
                              ))}
                            </div>
                            <span className={`font-semibold ${d ? "text-amber-400" : "text-amber-500"}`}>{rev.rating}/5</span>
                          </div>
                          <p className={`leading-relaxed ${d ? "text-slate-400" : "text-slate-500"}`}>{rev.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Write Review Modal ── */}
        <Modal isOpen={showWriteModal} onClose={handleCloseWriteModal}
          title={selectedUser ? `Review ${selectedUser.name}` : "Write a Review"} size="xl">
          <div className="space-y-5">
            {!selectedUser ? (
              <>
                <p className={d ? "text-slate-400" : "text-slate-500"}>
                  Select a user from your completed skill exchanges to review
                </p>
                {matchesLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : matches.length === 0 ? (
                  <div className="text-center py-8">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${d ? "bg-slate-800" : "bg-slate-100"}`}>
                      <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                    </div>
                    <p className={d ? "text-slate-400" : "text-slate-500"}>No completed matches available for review</p>
                    <p className={`text-sm mt-1 ${d ? "text-slate-500" : "text-slate-400"}`}>Complete a skill exchange first</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {matches.map((match) => {
                      const other = match.requester?._id === user._id ? match.receiver : match.requester;
                      return (
                        <button key={match._id} onClick={() => handleUserSelect(match)}
                          className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left ${
                            d ? "bg-slate-800/60 border-slate-700 hover:border-indigo-500/40 hover:bg-slate-800" : "bg-slate-50 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50"
                          }`}>
                          <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden shadow-md">
                            {other?.profileImage || other?.avatar
                              ? <img src={other.profileImage || other.avatar} alt={other.name} className="w-11 h-11 object-cover rounded-xl" />
                              : <span className="text-white font-bold">{other?.name?.charAt(0)?.toUpperCase() || "?"}</span>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className={`font-semibold ${d ? "text-white" : "text-slate-800"}`}>{other?.name || "Unknown"}</h4>
                            <p className={`truncate ${d ? "text-slate-400" : "text-slate-500"}`}>
                              {match.skillOffered} → {match.skillRequested}
                            </p>
                          </div>
                          <svg className={`w-4 h-4 flex-shrink-0 ${d ? "text-slate-500" : "text-slate-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
                        </button>
                      );
                    })}
                  </div>
                )}
                <div className="flex justify-end">
                  <button onClick={handleCloseWriteModal}
                    className={`px-5 py-2.5 rounded-xl border font-semibold transition-all ${d ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"}`}>
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className={`flex items-center gap-4 p-4 rounded-xl border ${d ? "bg-slate-800/60 border-indigo-500/20" : "bg-indigo-50 border-indigo-200"}`}>
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden shadow-md">
                    {selectedUser.profileImage
                      ? <img src={selectedUser.profileImage} alt={selectedUser.name} className="w-12 h-12 object-cover rounded-xl" />
                      : <span className="text-white font-bold text-lg">{selectedUser.name?.charAt(0)?.toUpperCase() || "?"}</span>}
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-bold ${d ? "text-white" : "text-slate-800"}`}>{selectedUser.name}</h4>
                    <p className={`${d ? "text-slate-400" : "text-slate-500"}`}>
                      {selectedUser.skillOffered} → {selectedUser.skillRequested}
                    </p>
                  </div>
                  <button onClick={() => setSelectedUser(null)}
                    className={`px-3 py-1.5 rounded-xl border font-medium transition-all ${d ? "bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                    Change
                  </button>
                </div>
                <ReviewForm
                  revieweeId={selectedUser._id}
                  revieweeName={selectedUser.name}
                  matchId={selectedUser.matchId}
                  skillOffered={selectedUser.skillOffered}
                  skillRequested={selectedUser.skillRequested}
                  onSuccess={handleReviewSuccess}
                  onCancel={handleCloseWriteModal}
                />
              </>
            )}
          </div>
        </Modal>
      </div>
    </div>
  );
}
import { useEffect, useState, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUserReviewsAsync,
  deleteReviewAsync,
} from "../../redux/slices/reviewSlice";
import { showError, showSuccess } from "../../utils/toast";
import Modal from "../common/Modal";
import { ThemeContext } from "../../contexts/ThemeContext";

const RATING_LABELS = { 1: "Poor", 2: "Fair", 3: "Good", 4: "Great", 5: "Excellent" };

const RATING_COLORS = {
  5: { text: "text-emerald-500", bg: "bg-emerald-500/15", border: "border-emerald-500/30" },
  4: { text: "text-green-500",   bg: "bg-green-500/15",   border: "border-green-500/30"   },
  3: { text: "text-amber-500",   bg: "bg-amber-500/15",   border: "border-amber-500/30"   },
  2: { text: "text-orange-500",  bg: "bg-orange-500/15",  border: "border-orange-500/30"  },
  1: { text: "text-red-500",     bg: "bg-red-500/15",     border: "border-red-500/30"     },
};

export default function ReviewList({ userId, showActions = false, limit = 10, showTitle = true }) {
  const dispatch = useDispatch();
  const { theme } = useContext(ThemeContext) || { theme: "dark" };
  const d = theme === "dark";

  const { reviews, loading, pagination, statistics, error } = useSelector((s) => s.review);
  const { user: currentUser } = useSelector((s) => s.auth);

  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState({ show: false, reviewId: null });
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (userId) dispatch(fetchUserReviewsAsync({ userId, page: currentPage, limit }));
  }, [dispatch, userId, currentPage, limit]);

  const handleDeleteClick = (id) => setDeleteModal({ show: true, reviewId: id });
  const handleDeleteCancel = () => setDeleteModal({ show: false, reviewId: null });

  const handleDeleteConfirm = async () => {
    if (!deleteModal.reviewId) return;
    setDeletingId(deleteModal.reviewId);
    try {
      await dispatch(deleteReviewAsync(deleteModal.reviewId)).unwrap();
      showSuccess("Review deleted successfully");
      dispatch(fetchUserReviewsAsync({ userId, page: currentPage, limit }));
    } catch (err) {
      showError(err?.message || "Failed to delete review");
    } finally {
      setDeletingId(null);
      setDeleteModal({ show: false, reviewId: null });
    }
  };

  const canDelete = (review) =>
    showActions && (currentUser?._id === review.reviewer._id || currentUser?.role === "admin");

  const renderStars = (rating, size = "text-base") =>
    Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`${size} transition-all ${i < rating ? "text-amber-400" : d ? "text-slate-700" : "text-slate-200"}`}>★</span>
    ));

  /* ─── Stats Banner ─── */
  const StatsBanner = () => {
    if (!statistics?.totalReviews) return null;
    const avg = Number(statistics.averageRating);
    const rc = RATING_COLORS[Math.round(avg)] || RATING_COLORS[5];

    return (
      <div className={`rounded-2xl border p-6 mb-6 ${d ? "bg-[#0d1525]/80 border-indigo-500/15" : "bg-white border-indigo-100 shadow-sm"}`}>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Score circle */}
          <div className="flex-shrink-0 text-center">
            <div className={`text-5xl font-black ${rc.text} mb-1`}>{avg.toFixed(1)}</div>
            <div className="flex justify-center gap-0.5 mb-1">{renderStars(Math.round(avg), "text-lg")}</div>
            <div className={`font-semibold ${rc.text}`}>{RATING_LABELS[Math.round(avg)]}</div>
            <div className={`mt-1 ${d ? "text-slate-400" : "text-slate-500"}`}>
              {statistics.totalReviews} review{statistics.totalReviews !== 1 ? "s" : ""}
            </div>
          </div>

          {/* Distribution bars */}
          <div className="flex-1 w-full space-y-2">
            {(statistics.ratingDistribution || []).map((item) => {
              const pct = statistics.totalReviews > 0 ? (item.count / statistics.totalReviews) * 100 : 0;
              const c = RATING_COLORS[item.rating] || RATING_COLORS[3];
              return (
                <div key={item.rating} className="flex items-center gap-3">
                  <span className={`w-4 font-bold ${c.text}`}>{item.rating}</span>
                  <span className="text-amber-400">★</span>
                  <div className={`flex-1 h-2 rounded-full ${d ? "bg-slate-800" : "bg-slate-100"}`}>
                    <div className={`h-2 rounded-full transition-all duration-700 ${c.bg.replace("/15", "")} bg-gradient-to-r from-indigo-500 to-violet-500`}
                      style={{ width: `${pct}%` }} />
                  </div>
                  <span className={`w-6 text-right ${d ? "text-slate-400" : "text-slate-500"}`}>{item.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  /* ─── Pagination ─── */
  const Pagination = () => {
    if (!pagination?.totalPages || pagination.totalPages <= 1) return null;
    const current = pagination.currentPage, total = pagination.totalPages;
    const pages = [];
    if (current > 3) { pages.push(1); if (current > 4) pages.push("..."); }
    for (let i = Math.max(1, current - 2); i <= Math.min(total, current + 2); i++) pages.push(i);
    if (current < total - 2) { if (current < total - 3) pages.push("..."); pages.push(total); }

    const btnBase = `px-4 py-2 rounded-xl font-medium transition-all duration-200`;
    const inactive = `${btnBase} ${d ? "bg-slate-800/60 border border-slate-700/50 text-slate-300 hover:bg-slate-700 hover:border-indigo-500/30 hover:text-indigo-400" : "bg-white border border-indigo-100 text-slate-600 hover:border-indigo-300 hover:text-indigo-600"}`;
    const active = `${btnBase} bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30`;

    return (
      <div className="flex items-center justify-center gap-2 mt-8">
        <button onClick={() => setCurrentPage(current - 1)} disabled={!pagination.hasPrevPage}
          className={`${inactive} disabled:opacity-40 disabled:cursor-not-allowed`}>‹ Prev</button>
        {pages.map((p, i) => (
          <button key={i} onClick={() => typeof p === "number" && setCurrentPage(p)}
            disabled={typeof p !== "number"}
            className={p === current ? active : typeof p === "number" ? inactive : `text-slate-500 cursor-default px-2`}>
            {p}
          </button>
        ))}
        <button onClick={() => setCurrentPage(current + 1)} disabled={!pagination.hasNextPage}
          className={`${inactive} disabled:opacity-40 disabled:cursor-not-allowed`}>Next ›</button>
      </div>
    );
  };

  /* ─── Loading ─── */
  if (loading && currentPage === 1) return (
    <div className="space-y-4">
      {showTitle && <h3 className={`text-xl font-bold ${d ? "text-white" : "text-slate-800"}`}>Reviews</h3>}
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            <div className="absolute inset-0 w-12 h-12 border-4 border-violet-500/20 border-b-violet-500 rounded-full animate-spin" style={{ animationDuration: "1.5s", animationDirection: "reverse" }} />
          </div>
          <p className={d ? "text-slate-400" : "text-slate-500"}>Loading reviews…</p>
        </div>
      </div>
    </div>
  );

  /* ─── Error ─── */
  if (error) return (
    <div className="space-y-4">
      {showTitle && <h3 className={`text-xl font-bold ${d ? "text-white" : "text-slate-800"}`}>Reviews</h3>}
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-red-500/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 15.5c-.77.833.192 2.5 1.732 2.5z"/></svg>
        </div>
        <p className="text-red-400 font-semibold mb-4">Failed to load reviews</p>
        <button onClick={() => dispatch(fetchUserReviewsAsync({ userId, page: currentPage, limit }))}
          className={`px-6 py-2.5 rounded-xl border font-semibold transition-all ${d ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"}`}>
          Try Again
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      {showTitle && (
        <div className="flex items-center gap-3">
          <h3 className={`text-xl font-bold ${d ? "text-white" : "text-slate-800"}`}>Reviews</h3>
          {statistics?.totalReviews > 0 && (
            <span className={`px-2.5 py-0.5 rounded-full font-bold ${d ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/25" : "bg-indigo-50 text-indigo-600 border border-indigo-200"}`}>
              {statistics.totalReviews}
            </span>
          )}
        </div>
      )}

      <StatsBanner />

      {!reviews?.length ? (
        <div className="text-center py-16">
          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5 ${d ? "bg-indigo-500/10" : "bg-indigo-50"}`}>
            <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
          </div>
          <p className={`text-lg font-semibold mb-2 ${d ? "text-slate-300" : "text-slate-700"}`}>No reviews yet</p>
          <p className={d ? "text-slate-500" : "text-slate-400"}>Reviews will appear here once users share their experiences</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review, index) => {
            const rc = RATING_COLORS[review.rating] || RATING_COLORS[3];
            return (
              <div key={review._id}
                className={`group relative rounded-2xl border p-5 transition-all duration-300 hover:shadow-lg ${
                  d
                    ? "bg-[#0d1525]/70 border-indigo-500/10 hover:border-indigo-500/30 hover:bg-[#0d1525]/90"
                    : "bg-white border-indigo-100 hover:border-indigo-300 hover:shadow-indigo-100/60"
                }`}
                style={{ animationDelay: `${index * 80}ms` }}>

                {/* hover shimmer */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/0 via-violet-500/5 to-indigo-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                <div className="relative flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-105 transition-transform duration-300 overflow-hidden">
                    {review.reviewer?.avatar ? (
                      <img src={review.reviewer.avatar} alt={review.reviewer.name} className="w-11 h-11 rounded-2xl object-cover" />
                    ) : (
                      <span className="text-white font-bold">{review.reviewer?.name?.charAt(0)?.toUpperCase() || "?"}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h4 className={`font-bold group-hover:text-indigo-400 transition-colors ${d ? "text-white" : "text-slate-800"}`}>
                          {review.reviewer?.name || "Anonymous"}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="flex">{renderStars(review.rating)}</div>
                          <span className={`font-bold px-2 py-0.5 rounded-full border ${rc.text} ${d ? rc.bg : ""} ${rc.border}`}>
                            {review.rating}/5
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className={`text-xs ${d ? "text-slate-500" : "text-slate-400"}`}>
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                        {review.isEdited && <div className={`text-xs ${d ? "text-slate-600" : "text-slate-400"}`}>Edited</div>}
                      </div>
                    </div>

                    {/* Comment */}
                    <p className={`leading-relaxed mb-3 ${d ? "text-slate-300 group-hover:text-slate-200" : "text-slate-600 group-hover:text-slate-700"} transition-colors`}>
                      {review.comment}
                    </p>

                    {/* Sub-ratings */}
                    {(review.teachingQuality || review.communication || review.reliability) && (
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        {review.teachingQuality && (
                          <div className={`rounded-xl p-2 text-center border ${d ? "bg-slate-800/50 border-indigo-500/10" : "bg-indigo-50 border-indigo-100"}`}>
                            <p className={`text-xs mb-1 ${d ? "text-slate-400" : "text-slate-500"}`}>Teaching</p>
                            <div className="flex items-center justify-center gap-0.5">
                              <span className="text-amber-400 font-bold">{review.teachingQuality}</span>
                              <span className="text-amber-400 text-xs">★</span>
                            </div>
                          </div>
                        )}
                        {review.communication && (
                          <div className={`rounded-xl p-2 text-center border ${d ? "bg-slate-800/50 border-indigo-500/10" : "bg-indigo-50 border-indigo-100"}`}>
                            <p className={`text-xs mb-1 ${d ? "text-slate-400" : "text-slate-500"}`}>Comm.</p>
                            <div className="flex items-center justify-center gap-0.5">
                              <span className="text-amber-400 font-bold">{review.communication}</span>
                              <span className="text-amber-400 text-xs">★</span>
                            </div>
                          </div>
                        )}
                        {review.reliability && (
                          <div className={`rounded-xl p-2 text-center border ${d ? "bg-slate-800/50 border-indigo-500/10" : "bg-indigo-50 border-indigo-100"}`}>
                            <p className={`text-xs mb-1 ${d ? "text-slate-400" : "text-slate-500"}`}>Reliability</p>
                            <div className="flex items-center justify-center gap-0.5">
                              <span className="text-amber-400 font-bold">{review.reliability}</span>
                              <span className="text-amber-400 text-xs">★</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Skill tags */}
                    {(review.skillOffered || review.skillRequested) && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {review.skillOffered && (
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-semibold border ${d ? "bg-teal-500/10 text-teal-400 border-teal-500/25" : "bg-teal-50 text-teal-600 border-teal-200"}`}>
                            Teaches: {review.skillOffered}
                          </span>
                        )}
                        {review.skillRequested && (
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-semibold border ${d ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/25" : "bg-indigo-50 text-indigo-600 border-indigo-200"}`}>
                            Learns: {review.skillRequested}
                          </span>
                        )}
                        {review.matchId && (
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-semibold border ${d ? "bg-violet-500/10 text-violet-400 border-violet-500/25" : "bg-violet-50 text-violet-600 border-violet-200"}`}>
                            ✓ Verified Match
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Delete */}
                  {canDelete(review) && (
                    <button onClick={() => handleDeleteClick(review._id)} disabled={deletingId === review._id}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
                        d ? "bg-slate-800 border border-slate-700 text-slate-400 hover:bg-red-500/15 hover:border-red-500/40 hover:text-red-400" : "bg-slate-100 border border-slate-200 text-slate-400 hover:bg-red-50 hover:border-red-200 hover:text-red-500"
                      }`} title="Delete">
                      {deletingId === review._id
                        ? <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                        : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Pagination />

      {/* Delete Modal */}
      <Modal isOpen={deleteModal.show} onClose={handleDeleteCancel} title="Delete Review">
        <div className="space-y-5">
          <p className={d ? "text-slate-400" : "text-slate-600"}>
            Are you sure you want to delete this review? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <button onClick={handleDeleteCancel} disabled={!!deletingId}
              className={`px-5 py-2.5 rounded-xl border font-semibold transition-all ${d ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"} disabled:opacity-50`}>
              Cancel
            </button>
            <button onClick={handleDeleteConfirm} disabled={!!deletingId}
              className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-semibold rounded-xl shadow-lg shadow-red-500/25 transition-all hover:scale-105 disabled:opacity-50">
              {deletingId ? "Deleting…" : "Delete Review"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
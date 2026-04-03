import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAdminReviewsAsync,
  deleteAdminReviewAsync,
  clearError,
} from "../../redux/slices/adminSlice";
import { showError, showSuccess } from "../../utils/toast";
import { useTheme } from "../../hooks/useTheme";
import Modal from "../common/Modal";

// ── Icons ────────────────────────────────────────────────────────
const StarIcon = ({ cls }) => <svg className={cls} fill="currentColor" viewBox="0 0 24 24"><path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>;
const FilterIcon = ({ cls }) => <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>;
const TrashIcon = ({ cls }) => <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const EyeIcon = ({ cls }) => <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;

// ── Shared Subcomponents ──────────────────────────────────────────
function Avatar({ src, name }) {
  const colors = ["from-amber-500 to-orange-500", "from-emerald-500 to-teal-500", "from-blue-500 to-indigo-500", "from-purple-500 to-violet-500", "from-rose-500 to-red-500"];
  const idx = name ? name.charCodeAt(0) % colors.length : 0;
  if (src && !src.includes("dicebear.com")) return <img src={src} alt={name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />;
  return <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${colors[idx]} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>{name?.slice(0, 2).toUpperCase() || "??"}</div>;
}

function Card({ children, className = "", d }) {
  return (
    <div className={`rounded-2xl border overflow-hidden shadow-lg transition-colors duration-300 ${d ? "bg-[#0d1120]/90 border-white/5 shadow-black/40" : "bg-white border-slate-200/80 shadow-slate-200/50"} ${className}`}>
      {children}
    </div>
  );
}

// ── ReviewRow ─────────────────────────────────────────────────────
const ReviewRow = ({ review, onDelete, isDeleting, onViewDetails, d }) => {
  const getRatingColor = (rating) => {
    if (rating >= 4) return d ? "text-emerald-400 bg-emerald-500/15 border-emerald-500/30" : "text-emerald-700 bg-emerald-50 border-emerald-200";
    if (rating === 3) return d ? "text-blue-400 bg-blue-500/15 border-blue-500/30" : "text-blue-700 bg-blue-50 border-blue-200";
    return d ? "text-red-400 bg-red-500/15 border-red-500/30" : "text-red-700 bg-red-50 border-red-200";
  };

  const renderStars = (rating) => (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <StarIcon key={i} cls={`w-3.5 h-3.5 ${i < rating ? "text-amber-400" : d ? "text-slate-700" : "text-slate-200"}`} />
      ))}
    </div>
  );

  return (
    <tr className={`transition-colors duration-150 border-b last:border-0 ${d ? "hover:bg-amber-500/[0.04] border-white/5" : "hover:bg-amber-50/50 border-slate-100"}`}>
      <td className="px-5 py-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <Avatar src={review.reviewer?.avatar} name={review.reviewer?.name} />
          <div>
            <div className={`text-sm font-semibold truncate max-w-[120px] ${d ? "text-slate-100" : "text-slate-800"}`}>
              {review.reviewer?.name || "Anonymous"}
            </div>
            <div className={`text-xs truncate max-w-[120px] ${d ? "text-slate-500" : "text-slate-400"}`}>
              {review.reviewer?.email || "No email"}
            </div>
          </div>
        </div>
      </td>

      <td className="px-5 py-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <Avatar src={review.reviewee?.avatar} name={review.reviewee?.name} />
          <div>
            <div className={`text-sm font-semibold truncate max-w-[120px] ${d ? "text-slate-100" : "text-slate-800"}`}>
              {review.reviewee?.name || "Anonymous"}
            </div>
            <div className={`text-xs truncate max-w-[120px] ${d ? "text-slate-500" : "text-slate-400"}`}>
              {review.reviewee?.email || "No email"}
            </div>
          </div>
        </div>
      </td>

      <td className="px-5 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          {renderStars(review.rating)}
          <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded-full border ${getRatingColor(review.rating)}`}>
            {review.rating}/5
          </span>
        </div>
      </td>

      <td className="px-5 py-4">
        <div className="max-w-[200px]">
          <p className={`text-sm line-clamp-2 ${d ? "text-slate-300" : "text-slate-600"}`}>{review.comment}</p>
          {review.isEdited && (
            <span className={`inline-flex mt-1 px-2 py-0.5 text-[10px] font-bold rounded-full border ${d ? "bg-teal-500/15 text-teal-400 border-teal-500/30" : "bg-teal-50 text-teal-700 border-teal-200"}`}>
              Edited
            </span>
          )}
        </div>
      </td>

      <td className="px-5 py-4 whitespace-nowrap">
        <div className={`text-xs font-medium ${d ? "text-slate-300" : "text-slate-600"}`}>
          {new Date(review.createdAt).toLocaleDateString()}
        </div>
        <div className={`text-[10px] ${d ? "text-slate-500" : "text-slate-400"}`}>
          {new Date(review.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </td>

      <td className="px-5 py-4 whitespace-nowrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          {review.isReported && (
            <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded-full border ${d ? "bg-red-500/15 text-red-400 border-red-500/30" : "bg-red-50 text-red-700 border-red-200"}`}>
              Reported ({review.reportCount})
            </span>
          )}
          {review.matchId && (
            <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded-full border ${d ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}>
              Verified
            </span>
          )}
          {!review.isReported && !review.matchId && (
            <span className={`text-[10px] font-medium ${d ? "text-slate-500" : "text-slate-400"}`}>Standard</span>
          )}
        </div>
      </td>

      <td className="px-5 py-4 whitespace-nowrap text-right">
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={() => onViewDetails(review)}
            className={`p-1.5 rounded-lg transition-colors ${d ? "hover:bg-white/10 text-slate-400 hover:text-white" : "hover:bg-slate-100 text-slate-500 hover:text-slate-900"}`}
            title="View Details"
          >
            <EyeIcon cls="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(review)}
            disabled={isDeleting === review._id}
            className={`p-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${d ? "hover:bg-red-500/20 text-red-400" : "hover:bg-red-100 text-red-600"}`}
            title="Delete Review"
          >
            {isDeleting === review._id ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <TrashIcon cls="w-4 h-4" />
            )}
          </button>
        </div>
      </td>
    </tr>
  );
};

// ── ReviewDetailsModal ────────────────────────────────────────────
const ReviewDetailsModal = ({ review, isOpen, onClose, d }) => {
  if (!review) return null;

  const renderStars = (rating) => (
    <div className="flex gap-1">
      {[...Array(5)].map((_, i) => (
        <StarIcon key={i} cls={`w-6 h-6 ${i < rating ? "text-amber-400" : d ? "text-slate-700" : "text-slate-200"}`} />
      ))}
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Review Details" size="lg">
      <div className={`space-y-6 p-6 rounded-b-xl ${d ? "bg-[#0f1423]" : "bg-slate-50"}`}>
        
        {/* Reviewer and Reviewee Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className={`text-xs font-bold uppercase tracking-wider ${d ? "text-slate-500" : "text-slate-400"}`}>Reviewer</h4>
            <div className={`flex items-center gap-3 p-4 rounded-xl border ${d ? "bg-white/[0.02] border-white/5" : "bg-white border-slate-100 shadow-sm"}`}>
              <Avatar src={review.reviewer?.avatar} name={review.reviewer?.name} />
              <div>
                <div className={`text-sm font-semibold ${d ? "text-white" : "text-slate-800"}`}>
                  {review.reviewer?.name || "Anonymous"}
                </div>
                <div className={`text-xs ${d ? "text-slate-500" : "text-slate-400"}`}>
                  {review.reviewer?.email || "No email"}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className={`text-xs font-bold uppercase tracking-wider ${d ? "text-slate-500" : "text-slate-400"}`}>Reviewee</h4>
            <div className={`flex items-center gap-3 p-4 rounded-xl border ${d ? "bg-white/[0.02] border-white/5" : "bg-white border-slate-100 shadow-sm"}`}>
              <Avatar src={review.reviewee?.avatar} name={review.reviewee?.name} />
              <div>
                <div className={`text-sm font-semibold ${d ? "text-white" : "text-slate-800"}`}>
                  {review.reviewee?.name || "Anonymous"}
                </div>
                <div className={`text-xs ${d ? "text-slate-500" : "text-slate-400"}`}>
                  {review.reviewee?.email || "No email"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rating */}
        <div className="space-y-2">
          <h4 className={`text-xs font-bold uppercase tracking-wider ${d ? "text-slate-500" : "text-slate-400"}`}>Rating</h4>
          <div className={`flex items-center gap-4 p-4 rounded-xl border ${d ? "bg-white/[0.02] border-white/5" : "bg-white border-slate-100 shadow-sm"}`}>
            {renderStars(review.rating)}
            <span className={`text-2xl font-black ${d ? "text-amber-400" : "text-amber-500"}`}>
              {review.rating}/5
            </span>
          </div>
        </div>

        {/* Comment */}
        <div className="space-y-2">
          <h4 className={`text-xs font-bold uppercase tracking-wider ${d ? "text-slate-500" : "text-slate-400"}`}>Comment</h4>
          <div className={`p-4 rounded-xl border ${d ? "bg-white/[0.02] border-white/5" : "bg-white border-slate-100 shadow-sm"}`}>
            <p className={`text-sm leading-relaxed ${d ? "text-slate-300" : "text-slate-700"}`}>{review.comment}</p>
          </div>
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className={`text-xs font-bold uppercase tracking-wider ${d ? "text-slate-500" : "text-slate-400"}`}>Information</h4>
            <div className={`space-y-3 p-4 rounded-xl border text-sm ${d ? "bg-white/[0.02] border-white/5" : "bg-white border-slate-100 shadow-sm"}`}>
              <div className="flex justify-between items-center">
                <span className={`text-xs font-semibold ${d ? "text-slate-500" : "text-slate-400"}`}>Created</span>
                <span className={`text-xs font-medium ${d ? "text-white" : "text-slate-800"}`}>{new Date(review.createdAt).toLocaleString()}</span>
              </div>
              {review.isEdited && (
                <div className="flex justify-between items-center">
                  <span className={`text-xs font-semibold ${d ? "text-slate-500" : "text-slate-400"}`}>Last Edited</span>
                  <span className={`text-xs font-medium ${d ? "text-white" : "text-slate-800"}`}>{new Date(review.editedAt).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className={`text-xs font-semibold ${d ? "text-slate-500" : "text-slate-400"}`}>Verified Match</span>
                <span className={`text-xs font-medium ${d ? "text-white" : "text-slate-800"}`}>{review.matchId ? "Yes" : "No"}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className={`text-xs font-bold uppercase tracking-wider ${d ? "text-slate-500" : "text-slate-400"}`}>Status Tags</h4>
            <div className={`flex flex-wrap gap-2 p-4 rounded-xl border ${d ? "bg-white/[0.02] border-white/5" : "bg-white border-slate-100 shadow-sm"}`}>
              {review.isReported && (
                <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full border ${d ? "bg-red-500/15 text-red-400 border-red-500/30" : "bg-red-50 text-red-700 border-red-200"}`}>
                  Reported ({review.reportCount}x)
                </span>
              )}
              {review.isEdited && (
                <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full border ${d ? "bg-teal-500/15 text-teal-400 border-teal-500/30" : "bg-teal-50 text-teal-700 border-teal-200"}`}>
                  Edited Review
                </span>
              )}
              {review.matchId && (
                <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full border ${d ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}>
                  Verified Match
                </span>
              )}
              {!review.isReported && !review.isEdited && !review.matchId && (
                <span className={`text-sm ${d ? "text-slate-500" : "text-slate-400"}`}>No special flags</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end pt-2">
          <button
            onClick={onClose}
            className={`px-6 py-2 rounded-xl text-sm font-bold border transition-colors ${d ? "border-white/10 text-slate-300 hover:bg-white/5" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

// ── Main Component ────────────────────────────────────────────────
export default function ReviewManagement() {
  const dispatch = useDispatch();
  const { adminReviews, reviewsPagination, loading, error } = useSelector((state) => state.admin);
  const { isDarkMode: d } = useTheme();

  const [filters, setFilters] = useState({ rating: "", reported: "", page: 1 });
  const [deleteModal, setDeleteModal] = useState({ show: false, review: null });
  const [detailsModal, setDetailsModal] = useState({ show: false, review: null });
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    dispatch(fetchAdminReviewsAsync(filters));
  }, [dispatch, filters]);

  useEffect(() => {
    if (error) {
      showError(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleFilterChange = (key, value) => setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  const handlePageChange = (page) => setFilters(prev => ({ ...prev, page }));
  const handleDeleteReview = (review) => setDeleteModal({ show: true, review });
  const handleViewDetails = (review) => setDetailsModal({ show: true, review });

  const confirmDelete = async () => {
    if (!deleteModal.review) return;
    setDeletingId(deleteModal.review._id);
    try {
      await dispatch(deleteAdminReviewAsync(deleteModal.review._id)).unwrap();
      showSuccess("Review deleted successfully");
      setDeleteModal({ show: false, review: null });
      dispatch(fetchAdminReviewsAsync(filters));
    } catch (error) {
      showError(error?.message || "Failed to delete review");
    } finally {
      setDeletingId(null);
    }
  };

  const renderPagination = () => {
    if (!reviewsPagination?.totalPages || reviewsPagination.totalPages <= 1) return null;
    const { currentPage, totalPages, hasPrevPage, hasNextPage } = reviewsPagination;

    return (
      <div className={`px-5 py-4 border-t flex items-center justify-between ${d ? "border-white/5 bg-white/[0.01]" : "border-slate-100 bg-slate-50/40"}`}>
        <p className={`text-xs font-semibold ${d ? "text-slate-500" : "text-slate-400"}`}>
          Total: <span className={d ? "text-slate-300" : "text-slate-600"}>{reviewsPagination.totalReviews || 0}</span> reviews
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!hasPrevPage}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${d ? "border-white/10 text-slate-300 hover:bg-white/5" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
          >
            Prev
          </button>
          <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${d ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!hasNextPage}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${d ? "border-white/10 text-slate-300 hover:bg-white/5" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${d ? "bg-[#060912]" : "bg-slate-50"}`}>
      <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <StarIcon cls="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className={`text-2xl font-black tracking-tight ${d ? "text-white" : "text-slate-900"}`}>Review Management</h1>
            <p className={`text-sm font-medium mt-0.5 ${d ? "text-slate-400" : "text-slate-500"}`}>Monitor and manage user feedback & ratings</p>
          </div>
        </div>

        {/* Filters Panel */}
        <div className={`p-4 rounded-2xl border shadow-sm transition-colors duration-300 ${d ? "bg-[#0d1120]/80 border-white/5" : "bg-white border-slate-200/80"}`}>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className={`flex items-center gap-2 shrink-0 ${d ? "text-slate-400" : "text-slate-500"}`}>
              <FilterIcon cls="w-5 h-5" />
              <span className="text-sm font-bold uppercase tracking-wider">Filters</span>
            </div>
            
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
              <select
                value={filters.rating}
                onChange={(e) => handleFilterChange("rating", e.target.value)}
                className={`w-full rounded-xl border px-4 py-2 text-sm font-medium outline-none border-transparent focus:ring-2 focus:ring-amber-500 transition-colors cursor-pointer ${
                  d ? "bg-[#151b2b] text-white hover:bg-white/5" : "bg-slate-50 text-slate-800 hover:bg-slate-100 border-slate-200"
                }`}
              >
                <option value="">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>

              <select
                value={filters.reported}
                onChange={(e) => handleFilterChange("reported", e.target.value)}
                className={`w-full rounded-xl border px-4 py-2 text-sm font-medium outline-none border-transparent focus:ring-2 focus:ring-amber-500 transition-colors cursor-pointer ${
                  d ? "bg-[#151b2b] text-white hover:bg-white/5" : "bg-slate-50 text-slate-800 hover:bg-slate-100 border-slate-200"
                }`}
              >
                <option value="">All Statuses</option>
                <option value="true">Reported Only</option>
                <option value="false">Non-Reported</option>
              </select>

              <div className="lg:col-span-2 flex justify-end">
                <button
                  onClick={() => setFilters({ rating: "", reported: "", page: 1 })}
                  className={`px-4 py-2 rounded-xl text-sm font-bold border transition-colors ${
                    d ? "border-white/10 text-slate-300 hover:bg-white/5" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Table */}
        <Card d={d}>
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className={`h-16 rounded-xl animate-pulse ${d ? "bg-white/5" : "bg-slate-100"}`} />)}
            </div>
          ) : !adminReviews?.length ? (
            <div className="py-24 flex flex-col items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 border-dashed ${d ? "border-slate-700 bg-white/[0.02]" : "border-slate-200 bg-slate-50"}`}>
                <StarIcon cls={`w-8 h-8 ${d ? "text-slate-600" : "text-slate-300"}`} />
              </div>
              <div className="text-center">
                <p className={`text-sm font-bold ${d ? "text-slate-300" : "text-slate-700"}`}>No reviews found</p>
                <p className={`text-xs mt-1 ${d ? "text-slate-500" : "text-slate-400"}`}>
                  {filters.rating || filters.reported ? "Try adjusting your filters" : "No reviews have been created yet"}
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className={`border-b text-xs font-semibold uppercase tracking-widest whitespace-nowrap ${d ? "border-white/5 text-slate-500 bg-white/[0.01]" : "border-slate-100 text-slate-500 bg-slate-50/40"}`}>
                    <th className="text-left px-5 py-3">Reviewer</th>
                    <th className="text-left px-5 py-3">Reviewee</th>
                    <th className="text-left px-5 py-3">Rating</th>
                    <th className="text-left px-5 py-3">Comment</th>
                    <th className="text-left px-5 py-3">Date</th>
                    <th className="text-left px-5 py-3">Status</th>
                    <th className="text-right px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${d ? "divide-white/[0.04]" : "divide-slate-50"}`}>
                  {adminReviews.map((review) => (
                    <ReviewRow
                      key={review._id}
                      review={review}
                      onDelete={handleDeleteReview}
                      onViewDetails={handleViewDetails}
                      isDeleting={deletingId}
                      d={d}
                    />
                  ))}
                </tbody>
              </table>
              {renderPagination()}
            </div>
          )}
        </Card>

        {/* View Modal */}
        <ReviewDetailsModal
          review={detailsModal.review}
          isOpen={detailsModal.show}
          onClose={() => setDetailsModal({ show: false, review: null })}
          d={d}
        />

        {/* Delete Modal */}
        <Modal
          isOpen={deleteModal.show}
          onClose={() => setDeleteModal({ show: false, review: null })}
          title="Delete Review"
        >
          <div className={`p-6 space-y-6 rounded-b-xl ${d ? "bg-[#0f1423]" : "bg-slate-50"}`}>
            <div className={`p-4 rounded-xl border flex items-start gap-3 ${d ? "bg-red-500/10 border-red-500/20" : "bg-red-50 border-red-100"}`}>
              <div className={`p-2 rounded-full shrink-0 ${d ? "bg-red-500/20 text-red-400" : "bg-red-100 text-red-600"}`}>
                <TrashIcon cls="w-5 h-5" />
              </div>
              <div>
                <h4 className={`text-sm font-bold ${d ? "text-red-400" : "text-red-700"}`}>Delete Confirmation</h4>
                <p className={`text-xs mt-1 leading-relaxed ${d ? "text-red-300/80" : "text-red-600/80"}`}>
                  Are you sure you want to delete this review? This action cannot be undone.
                </p>
              </div>
            </div>

            {deleteModal.review && (
              <div className={`p-4 rounded-xl border ${d ? "bg-white/[0.02] border-white/5" : "bg-white border-slate-200"}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-sm font-semibold ${d ? "text-white" : "text-slate-800"}`}>
                    {deleteModal.review.reviewer?.name} → {deleteModal.review.reviewee?.name}
                  </span>
                  <div className="flex gap-0.5 ml-auto">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon key={i} cls={`w-3.5 h-3.5 ${i < deleteModal.review.rating ? "text-amber-400" : d ? "text-slate-700" : "text-slate-200"}`} />
                    ))}
                  </div>
                </div>
                <p className={`text-xs italic line-clamp-2 ${d ? "text-slate-400" : "text-slate-500"}`}>
                  "{deleteModal.review.comment}"
                </p>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteModal({ show: false, review: null })}
                disabled={deletingId}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold border transition-colors ${d ? "border-white/10 text-slate-300 hover:bg-white/5" : "border-slate-200 text-slate-600 hover:bg-slate-100"}`}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deletingId}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white text-sm font-bold shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deletingId ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
                {deletingId ? "Deleting..." : "Delete Review"}
              </button>
            </div>
          </div>
        </Modal>

      </div>
    </div>
  );
}
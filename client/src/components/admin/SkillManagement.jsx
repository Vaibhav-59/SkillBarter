import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAdminSkillsAsync,
  deleteAdminSkillAsync,
  clearError,
} from "../../redux/slices/adminSlice";
import { showError, showSuccess } from "../../utils/toast";
import { useTheme } from "../../hooks/useTheme";
import Modal from "../common/Modal";

// ── Icons ────────────────────────────────────────────────────────
const SkillBadgeIcon = ({ cls }) => <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>;
const FilterIcon = ({ cls }) => <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>;
const TrashIcon = ({ cls }) => <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const EyeIcon = ({ cls }) => <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;

// ── Shared Subcomponents ──────────────────────────────────────────
function Avatar({ src, name }) {
  const colors = ["from-emerald-500 to-teal-500", "from-blue-500 to-indigo-500", "from-purple-500 to-violet-500", "from-amber-500 to-orange-500", "from-rose-500 to-red-500"];
  const idx = name ? name.charCodeAt(0) % colors.length : 0;
  if (src && !src.includes("dicebear.com")) return <img src={src} alt={name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />;
  return <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[idx]} flex items-center justify-center text-white text-lg font-bold flex-shrink-0`}>{name?.slice(0, 2).toUpperCase() || "??"}</div>;
}

function Card({ children, className = "", d }) {
  return (
    <div className={`rounded-2xl border overflow-hidden shadow-lg transition-colors duration-300 ${d ? "bg-[#0d1120]/90 border-white/5 shadow-black/40" : "bg-white border-slate-200/80 shadow-slate-200/50"} ${className}`}>
      {children}
    </div>
  );
}

const truncateText = (text, maxLength = 50) => {
  if (!text) return "";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

// ── SkillRow ─────────────────────────────────────────────────────
const SkillRow = ({ skill, onDelete, onViewDetails, isDeleting, d }) => {
  const getSkillTypeColor = (type) => {
    const map = {
      teach: { dark: "bg-blue-500/15 text-blue-400 border-blue-500/30", light: "bg-blue-50 text-blue-700 border-blue-200" },
      learn: { dark: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", light: "bg-emerald-50 text-emerald-700 border-emerald-200" },
      both:  { dark: "bg-purple-500/15 text-purple-400 border-purple-500/30", light: "bg-purple-50 text-purple-700 border-purple-200" },
    };
    const c = map[type] || { dark: "bg-slate-500/15 text-slate-400 border-slate-500/30", light: "bg-slate-50 text-slate-700 border-slate-200" };
    return d ? c.dark : c.light;
  };

  return (
    <tr className={`transition-colors duration-150 border-b last:border-0 ${d ? "hover:bg-emerald-500/[0.04] border-white/5" : "hover:bg-emerald-50/50 border-slate-100"}`}>
      <td className="px-5 py-4 lg:px-8 lg:py-6 whitespace-nowrap">
        <div className="flex items-center gap-4">
          <Avatar src={skill.user?.avatar} name={skill.user?.name} />
          <div>
            <div className={`text-sm font-semibold truncate max-w-[150px] ${d ? "text-slate-100" : "text-slate-800"}`}>
              {skill.user?.name || "Anonymous"}
            </div>
            <div className={`text-xs truncate max-w-[150px] ${d ? "text-slate-500" : "text-slate-500"}`}>
              {skill.user?.email || "No email"}
            </div>
          </div>
        </div>
      </td>

      <td className="px-5 py-4 lg:px-8 lg:py-6 whitespace-nowrap">
        <div className="flex flex-col gap-1.5 align-start">
          <span className={`text-sm font-bold ${d ? "text-emerald-400" : "text-emerald-700"}`}>
            {skill.name}
          </span>
          {skill.category && (
            <span className={`inline-flex self-start px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md border ${d ? "bg-white/5 text-slate-400 border-white/10" : "bg-slate-100 text-slate-600 border-slate-200"}`}>
              {skill.category}
            </span>
          )}
        </div>
      </td>

      <td className="px-5 py-4 lg:px-8 lg:py-6">
        <div className="max-w-[200px]">
          <p className={`text-sm line-clamp-2 ${d ? "text-slate-300" : "text-slate-600"}`}>
            {skill.description || "No description provided."}
          </p>
        </div>
      </td>

      <td className="px-5 py-4 lg:px-8 lg:py-6 whitespace-nowrap">
        <span className={`inline-flex px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${getSkillTypeColor(skill.type)}`}>
          {skill.type || "N/A"}
        </span>
      </td>

      <td className="px-5 py-4 lg:px-8 lg:py-6 whitespace-nowrap">
        <div className="flex items-center gap-2 flex-wrap max-w-[120px]">
          {skill.level && (
            <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded-full border ${d ? "bg-amber-500/15 text-amber-400 border-amber-500/30" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
              Level {skill.level}
            </span>
          )}
          {skill.isVerified && (
            <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded-full border ${d ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}>
              Verified
            </span>
          )}
          {!skill.level && !skill.isVerified && (
            <span className={`text-xs ${d ? "text-slate-600" : "text-slate-400"}`}>Standard</span>
          )}
        </div>
      </td>

      <td className="px-5 py-4 lg:px-8 lg:py-6 whitespace-nowrap">
        <div className={`text-sm font-medium ${d ? "text-slate-300" : "text-slate-700"}`}>
          {new Date(skill.createdAt).toLocaleDateString()}
        </div>
        <div className={`text-xs ${d ? "text-slate-500" : "text-slate-400"}`}>
          {new Date(skill.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </td>

      <td className="px-5 py-4 lg:px-8 lg:py-6 whitespace-nowrap text-right">
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={() => onViewDetails(skill)}
            className={`p-2 rounded-xl transition-colors ${d ? "bg-white/5 hover:bg-white/10 text-slate-300" : "bg-slate-100 hover:bg-slate-200 text-slate-600"}`}
            title="View Details"
          >
            <EyeIcon cls="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(skill)}
            disabled={isDeleting === skill._id}
            className={`p-2 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${d ? "bg-red-500/10 hover:bg-red-500/20 text-red-400" : "bg-red-50 hover:bg-red-100 text-red-600"}`}
            title="Delete Skill"
          >
            {isDeleting === skill._id ? (
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

// ── SkillDetailsModal ─────────────────────────────────────────────
const SkillDetailsModal = ({ skill, isOpen, onClose, d }) => {
  if (!skill) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Skill Details" size="lg">
      <div className={`p-6 space-y-6 rounded-b-xl ${d ? "bg-[#0f1423]" : "bg-slate-50"}`}>
        
        {/* User Info */}
        <div className="space-y-2">
          <h4 className={`text-xs font-bold uppercase tracking-wider ${d ? "text-slate-500" : "text-slate-400"}`}>Owner</h4>
          <div className={`flex items-center gap-4 p-4 rounded-xl border shadow-sm ${d ? "bg-white/[0.02] border-white/5" : "bg-white border-slate-100"}`}>
            <Avatar src={skill.user?.avatar} name={skill.user?.name} />
            <div>
              <div className={`font-semibold text-sm ${d ? "text-white" : "text-slate-800"}`}>
                {skill.user?.name || "Anonymous"}
              </div>
              <div className={`text-xs ${d ? "text-slate-500" : "text-slate-500"}`}>
                {skill.user?.email || "No email"}
              </div>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className={`text-xs font-bold uppercase tracking-wider ${d ? "text-slate-500" : "text-slate-400"}`}>Information</h4>
            <div className={`space-y-3 p-4 rounded-xl border text-sm shadow-sm ${d ? "bg-white/[0.02] border-white/5" : "bg-white border-slate-100"}`}>
              <div className="flex justify-between items-center">
                <span className={`text-xs font-semibold ${d ? "text-slate-500" : "text-slate-400"}`}>Name</span>
                <span className={`text-xs font-bold ${d ? "text-emerald-400" : "text-emerald-600"}`}>{skill.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-xs font-semibold ${d ? "text-slate-500" : "text-slate-400"}`}>Category</span>
                <span className={`text-xs font-medium ${d ? "text-white" : "text-slate-800"}`}>{skill.category || "N/A"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-xs font-semibold ${d ? "text-slate-500" : "text-slate-400"}`}>Type</span>
                <span className={`text-xs font-medium capitalize ${d ? "text-white" : "text-slate-800"}`}>{skill.type || "N/A"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-xs font-semibold ${d ? "text-slate-500" : "text-slate-400"}`}>Level</span>
                <span className={`text-xs font-medium ${d ? "text-white" : "text-slate-800"}`}>{skill.level || "N/A"}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className={`text-xs font-bold uppercase tracking-wider ${d ? "text-slate-500" : "text-slate-400"}`}>Status</h4>
            <div className={`space-y-3 p-4 rounded-xl border shadow-sm ${d ? "bg-white/[0.02] border-white/5" : "bg-white border-slate-100"}`}>
              <div className="flex gap-2">
                {skill.isVerified ? (
                  <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full border ${d ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}>
                    Verified Skill
                  </span>
                ) : (
                  <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full border ${d ? "bg-slate-500/15 text-slate-400 border-slate-500/30" : "bg-slate-50 text-slate-700 border-slate-200"}`}>
                    Unverified
                  </span>
                )}
              </div>
              <div className="pt-2">
                <span className={`text-xs font-semibold block mb-0.5 ${d ? "text-slate-500" : "text-slate-400"}`}>Created on</span>
                <span className={`text-sm font-medium ${d ? "text-white" : "text-slate-800"}`}>
                  {new Date(skill.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <h4 className={`text-xs font-bold uppercase tracking-wider ${d ? "text-slate-500" : "text-slate-400"}`}>Description</h4>
          <div className={`p-4 rounded-xl border shadow-sm ${d ? "bg-white/[0.02] border-white/5" : "bg-white border-slate-100"}`}>
            <p className={`text-sm leading-relaxed ${d ? "text-slate-300" : "text-slate-700"}`}>
              {skill.description || "No description provided."}
            </p>
          </div>
        </div>

        {/* Tags */}
        {skill.tags && skill.tags.length > 0 && (
          <div className="space-y-2">
            <h4 className={`text-xs font-bold uppercase tracking-wider ${d ? "text-slate-500" : "text-slate-400"}`}>Tags</h4>
            <div className={`flex flex-wrap gap-2 p-4 rounded-xl border shadow-sm ${d ? "bg-white/[0.02] border-white/5" : "bg-white border-slate-100"}`}>
              {skill.tags.map((tag, i) => (
                <span key={i} className={`inline-flex px-2.5 py-1 text-xs font-bold rounded-md border ${d ? "bg-blue-500/15 text-blue-400 border-blue-500/30" : "bg-blue-50 text-blue-700 border-blue-200"}`}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

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
export default function SkillManagement() {
  const dispatch = useDispatch();
  const { adminSkills, skillsPagination, loading: skillsLoading, error } = useSelector((state) => state.admin);
  const { isDarkMode: d } = useTheme();

  const [filters, setFilters] = useState({ search: "", type: "", page: 1 });
  const [deleteModal, setDeleteModal] = useState({ show: false, skill: null });
  const [detailsModal, setDetailsModal] = useState({ show: false, skill: null });
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    dispatch(fetchAdminSkillsAsync(filters));
  }, [dispatch, filters]);

  useEffect(() => {
    if (error) {
      showError(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleFilterChange = (key, value) => setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  const handlePageChange = (page) => setFilters(prev => ({ ...prev, page }));
  const handleDeleteSkill = (skill) => setDeleteModal({ show: true, skill });
  const handleViewDetails = (skill) => setDetailsModal({ show: true, skill });

  const confirmDelete = async () => {
    if (!deleteModal.skill) return;
    setDeletingId(deleteModal.skill._id);
    try {
      await dispatch(deleteAdminSkillAsync(deleteModal.skill._id)).unwrap();
      showSuccess("Skill deleted successfully");
      setDeleteModal({ show: false, skill: null });
      dispatch(fetchAdminSkillsAsync(filters));
    } catch (error) {
      showError(error?.message || "Failed to delete skill");
    } finally {
      setDeletingId(null);
    }
  };

  const renderPagination = () => {
    if (!skillsPagination?.totalPages || skillsPagination.totalPages <= 1) return null;
    const { currentPage, totalPages, hasPrevPage, hasNextPage } = skillsPagination;

    return (
      <div className={`px-5 lg:px-8 py-4 border-t flex items-center justify-between ${d ? "border-white/5 bg-white/[0.01]" : "border-slate-100 bg-slate-50/40"}`}>
        <p className={`text-xs font-semibold ${d ? "text-slate-500" : "text-slate-400"}`}>
          Total: <span className={d ? "text-slate-300" : "text-slate-600"}>{skillsPagination.totalSkills || 0}</span> skills
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!hasPrevPage}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${d ? "border-white/10 text-slate-300 hover:bg-white/5" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
          >
            Prev
          </button>
          <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${d ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}>
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
      <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <SkillBadgeIcon cls="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className={`text-2xl font-black tracking-tight ${d ? "text-white" : "text-slate-900"}`}>Skill Management</h1>
            <p className={`text-sm font-medium mt-0.5 ${d ? "text-slate-400" : "text-slate-500"}`}>Monitor and moderate active skills in the platform</p>
          </div>
        </div>

        {/* Filters Panel */}
        <div className={`p-5 rounded-2xl border shadow-sm transition-colors duration-300 flex flex-col sm:flex-row gap-5 items-center justify-between ${d ? "bg-[#0d1120]/80 border-white/5" : "bg-white border-slate-200/80"}`}>
          <div className="flex-1 w-full flex flex-col sm:flex-row gap-4 items-center">
            
            <div className={`flex items-center justify-center w-10 h-10 rounded-xl shrink-0 ${d ? "bg-white/5 text-slate-400" : "bg-slate-50 text-slate-500"}`}>
              <FilterIcon cls="w-5 h-5" />
            </div>

            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              placeholder="Search by skill name..."
              className={`flex-1 min-w-[200px] w-full rounded-xl border px-4 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${d ? "bg-[#151b2b] border-transparent text-white placeholder-slate-500" : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"}`}
            />
            
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange("type", e.target.value)}
              className={`w-full sm:w-48 rounded-xl border px-4 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500 transition-colors cursor-pointer ${d ? "bg-[#151b2b] border-transparent text-white" : "bg-slate-50 border-slate-200 text-slate-800"}`}
            >
              <option value="">All Types</option>
              <option value="teach">Teaching</option>
              <option value="learn">Learning</option>
            </select>
          </div>

          <button
            onClick={() => setFilters({ search: "", type: "", page: 1 })}
            className={`shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold border transition-colors w-full sm:w-auto ${d ? "border-white/10 text-slate-300 hover:bg-white/5" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
          >
            Reset Filters
          </button>
        </div>

        {/* Skills Table */}
        <Card d={d}>
          {skillsLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className={`h-20 rounded-xl animate-pulse ${d ? "bg-white/5" : "bg-slate-100"}`} />)}
            </div>
          ) : !adminSkills?.length ? (
            <div className="py-24 flex flex-col items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 border-dashed ${d ? "border-slate-700 bg-white/[0.02]" : "border-slate-200 bg-slate-50"}`}>
                <SkillBadgeIcon cls={`w-8 h-8 ${d ? "text-slate-600" : "text-slate-300"}`} />
              </div>
              <div className="text-center">
                <p className={`text-sm font-bold ${d ? "text-slate-300" : "text-slate-700"}`}>No skills found</p>
                <p className={`text-xs mt-1 ${d ? "text-slate-500" : "text-slate-400"}`}>
                  {filters.search || filters.type ? "Try clearing your filters" : "No skills operate in the platform yet."}
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className={`border-b text-xs font-semibold uppercase tracking-widest whitespace-nowrap ${d ? "border-white/5 text-slate-500 bg-white/[0.01]" : "border-slate-100 text-slate-500 bg-slate-50/40"}`}>
                    <th className="px-5 py-3 lg:px-8 lg:py-4 text-left">User</th>
                    <th className="px-5 py-3 lg:px-8 lg:py-4 text-left">Skill Name</th>
                    <th className="px-5 py-3 lg:px-8 lg:py-4 text-left">Description</th>
                    <th className="px-5 py-3 lg:px-8 lg:py-4 text-left">Type</th>
                    <th className="px-5 py-3 lg:px-8 lg:py-4 text-left">Status</th>
                    <th className="px-5 py-3 lg:px-8 lg:py-4 text-left">Date</th>
                    <th className="px-5 py-3 lg:px-8 lg:py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${d ? "divide-white/[0.04]" : "divide-slate-50"}`}>
                  {adminSkills.map((skill) => (
                    <SkillRow
                      key={skill._id}
                      skill={skill}
                      onDelete={handleDeleteSkill}
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

        {/* Delete Modal */}
        <Modal
          isOpen={deleteModal.show}
          onClose={() => setDeleteModal({ show: false, skill: null })}
          title="Delete Skill"
        >
          <div className={`p-6 space-y-6 rounded-b-xl ${d ? "bg-[#0f1423]" : "bg-slate-50"}`}>
            <div className={`p-4 rounded-xl border flex items-start gap-3 ${d ? "bg-red-500/10 border-red-500/20" : "bg-red-50 border-red-100"}`}>
              <div className={`p-2 rounded-full shrink-0 ${d ? "bg-red-500/20 text-red-400" : "bg-red-100 text-red-600"}`}>
                <TrashIcon cls="w-5 h-5" />
              </div>
              <div>
                <h4 className={`text-sm font-bold ${d ? "text-red-400" : "text-red-700"}`}>Confirm Deletion</h4>
                <p className={`text-xs mt-1 leading-relaxed ${d ? "text-red-300/80" : "text-red-600/80"}`}>
                  Are you sure you want to delete this skill? This action will permanently remove it from the user's profile and matching pool.
                </p>
              </div>
            </div>

            {deleteModal.skill && (
              <div className={`p-4 rounded-xl border ${d ? "bg-white/[0.02] border-white/5" : "bg-white border-slate-200"}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-sm font-semibold ${d ? "text-white" : "text-slate-800"}`}>
                    {deleteModal.skill.name}
                  </span>
                  <span className={`text-xs ${d ? "text-slate-500" : "text-slate-500"}`}>
                    by {deleteModal.skill.user?.name || "Unknown"}
                  </span>
                </div>
                <p className={`text-xs italic line-clamp-2 ${d ? "text-slate-400" : "text-slate-500"}`}>
                  "{deleteModal.skill.description}"
                </p>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteModal({ show: false, skill: null })}
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
                {deletingId ? "Deleting..." : "Delete Skill"}
              </button>
            </div>
          </div>
        </Modal>

      </div>
    </div>
  );
}
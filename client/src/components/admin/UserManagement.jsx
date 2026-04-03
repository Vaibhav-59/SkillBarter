import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUsersAsync,
  deleteUserAsync,
  clearError,
} from "../../redux/slices/adminSlice";
import { showError, showSuccess } from "../../utils/toast";
import { useTheme } from "../../hooks/useTheme";
import Modal from "../common/Modal";

// ── Icons ────────────────────────────────────────────────────────
const UsersIcon = ({ cls }) => <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /></svg>;
const FilterIcon = ({ cls }) => <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>;
const TrashIcon = ({ cls }) => <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;

// ── Shared Subcomponents ──────────────────────────────────────────
function Avatar({ src, name }) {
  const colors = ["from-emerald-500 to-teal-500", "from-blue-500 to-indigo-500", "from-purple-500 to-violet-500", "from-amber-500 to-orange-500", "from-rose-500 to-red-500"];
  const idx = name ? name.charCodeAt(0) % colors.length : 0;
  if (src && !src.includes("dicebear.com")) return <img src={src} alt={name} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />;
  return <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors[idx]} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>{name?.slice(0, 2).toUpperCase() || "??"}</div>;
}

function Card({ children, className = "", d }) {
  return (
    <div className={`rounded-2xl border overflow-hidden shadow-lg transition-colors duration-300 ${d ? "bg-[#0d1120]/90 border-white/5 shadow-black/40" : "bg-white border-slate-200/80 shadow-slate-200/50"} ${className}`}>
      {children}
    </div>
  );
}

// ── UserRow ─────────────────────────────────────────────────────
const UserRow = ({ user, onDelete, isDeleting, d }) => {
  const getStatusColor = (isActive) => {
    return isActive
      ? (d ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-emerald-50 text-emerald-700 border-emerald-200")
      : (d ? "bg-slate-500/15 text-slate-400 border-slate-500/30" : "bg-slate-50 text-slate-700 border-slate-200");
  };

  const getRoleColor = (role) => {
    return role === "admin"
      ? (d ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-emerald-50 text-emerald-700 border-emerald-200")
      : (d ? "bg-teal-500/15 text-teal-400 border-teal-500/30" : "bg-teal-50 text-teal-700 border-teal-200");
  };

  return (
    <tr className={`transition-colors duration-150 border-b last:border-0 ${d ? "hover:bg-emerald-500/[0.04] border-white/5" : "hover:bg-emerald-50/50 border-slate-100"}`}>
      <td className="px-5 py-4 lg:px-8 lg:py-6 whitespace-nowrap">
        <div className="flex items-center gap-4">
          <Avatar src={user.avatar} name={user.name} />
          <div>
            <div className={`text-sm font-semibold truncate max-w-[150px] ${d ? "text-slate-100" : "text-slate-800"}`}>
              {user.name || "Unknown"}
            </div>
            <div className={`text-xs truncate max-w-[150px] ${d ? "text-slate-500" : "text-slate-500"}`}>
              {user.email || "No email"}
            </div>
          </div>
        </div>
      </td>

      <td className="px-5 py-4 lg:px-8 lg:py-6 whitespace-nowrap">
        <span className={`inline-flex px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${getRoleColor(user.role)}`}>
          {user.role}
        </span>
      </td>

      <td className="px-5 py-4 lg:px-8 lg:py-6 whitespace-nowrap">
        <span className={`inline-flex px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${getStatusColor(user.isActive)}`}>
          {user.isActive ? "Active" : "Inactive"}
        </span>
      </td>

      <td className="px-5 py-4 lg:px-8 lg:py-6 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <div className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${d ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}>
            {(user.teachSkills?.length || 0) + (user.learnSkills?.length || 0)}
          </div>
          <span className={`text-xs ${d ? "text-slate-400" : "text-slate-600"}`}>skills</span>
        </div>
      </td>

      <td className="px-5 py-4 lg:px-8 lg:py-6 whitespace-nowrap">
        <div className={`text-sm font-medium ${d ? "text-slate-300" : "text-slate-700"}`}>
          {new Date(user.createdAt).toLocaleDateString()}
        </div>
      </td>

      <td className="px-5 py-4 lg:px-8 lg:py-6 whitespace-nowrap text-right">
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={() => onDelete(user)}
            disabled={isDeleting === user._id}
            className={`p-2 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${d ? "bg-red-500/10 hover:bg-red-500/20 text-red-400" : "bg-red-50 hover:bg-red-100 text-red-600"}`}
            title="Delete User"
          >
            {isDeleting === user._id ? (
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

// ── Main Component ────────────────────────────────────────────────
export default function UserManagement() {
  const dispatch = useDispatch();
  const { users, usersPagination, usersLoading, loading, error } = useSelector((state) => state.admin || {});
  const { isDarkMode: d } = useTheme();

  const [filters, setFilters] = useState({ search: "", role: "", page: 1 });
  const [deleteModal, setDeleteModal] = useState({ show: false, user: null });
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    dispatch(fetchUsersAsync(filters));
  }, [dispatch, filters]);

  useEffect(() => {
    if (error) {
      showError(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleSearch = (value) => setFilters(prev => ({ ...prev, search: value, page: 1 }));
  const handleFilterChange = (key, value) => setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  const handlePageChange = (page) => setFilters(prev => ({ ...prev, page }));
  const handleDeleteUser = (user) => setDeleteModal({ show: true, user });

  const confirmDelete = async () => {
    if (!deleteModal.user) return;
    setDeletingId(deleteModal.user._id);
    try {
      await dispatch(deleteUserAsync(deleteModal.user._id)).unwrap();
      showSuccess("User deleted successfully");
      setDeleteModal({ show: false, user: null });
      dispatch(fetchUsersAsync(filters));
    } catch (error) {
      showError(error?.message || "Failed to delete user");
    } finally {
      setDeletingId(null);
    }
  };

  const renderPagination = () => {
    if (!usersPagination?.totalPages || usersPagination.totalPages <= 1) return null;
    const { currentPage, totalPages, hasPrevPage, hasNextPage } = usersPagination;

    return (
      <div className={`px-5 lg:px-8 py-4 border-t flex items-center justify-between ${d ? "border-white/5 bg-white/[0.01]" : "border-slate-100 bg-slate-50/40"}`}>
        <p className={`text-xs font-semibold ${d ? "text-slate-500" : "text-slate-400"}`}>
          Total: <span className={d ? "text-slate-300" : "text-slate-600"}>{usersPagination.totalUsers || 0}</span> users
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
            <UsersIcon cls="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className={`text-2xl font-black tracking-tight ${d ? "text-white" : "text-slate-900"}`}>User Management</h1>
            <p className={`text-sm font-medium mt-0.5 ${d ? "text-slate-400" : "text-slate-500"}`}>Manage platform users, permissions, and access controls</p>
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
              placeholder="Search by name or email..."
              value={filters.search}
              onChange={(e) => handleSearch(e.target.value)}
              disabled={usersLoading}
              className={`flex-1 min-w-[200px] w-full rounded-xl border px-4 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${d ? "bg-[#151b2b] border-transparent text-white placeholder-slate-500" : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"}`}
            />
            
            <select
              value={filters.role}
              onChange={(e) => handleFilterChange("role", e.target.value)}
              className={`w-full sm:w-48 rounded-xl border px-4 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500 transition-colors cursor-pointer ${d ? "bg-[#151b2b] border-transparent text-white" : "bg-slate-50 border-slate-200 text-slate-800"}`}
            >
              <option value="">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            onClick={() => setFilters({ search: "", role: "", status: "", page: 1 })}
            className={`shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold border transition-colors w-full sm:w-auto ${d ? "border-white/10 text-slate-300 hover:bg-white/5" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
          >
            Reset Filters
          </button>
        </div>

        {/* Users Table */}
        <Card d={d}>
          {usersLoading || loading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className={`h-20 rounded-xl animate-pulse ${d ? "bg-white/5" : "bg-slate-100"}`} />)}
            </div>
          ) : !users?.length ? (
            <div className="py-24 flex flex-col items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 border-dashed ${d ? "border-slate-700 bg-white/[0.02]" : "border-slate-200 bg-slate-50"}`}>
                <UsersIcon cls={`w-8 h-8 ${d ? "text-slate-600" : "text-slate-300"}`} />
              </div>
              <div className="text-center">
                <p className={`text-sm font-bold ${d ? "text-slate-300" : "text-slate-700"}`}>No users found</p>
                <p className={`text-xs mt-1 ${d ? "text-slate-500" : "text-slate-400"}`}>
                  {filters.search || filters.role ? "Try clearing your filters" : "No users exist in the platform yet."}
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className={`border-b text-xs font-semibold uppercase tracking-widest whitespace-nowrap ${d ? "border-white/5 text-slate-500 bg-white/[0.01]" : "border-slate-100 text-slate-500 bg-slate-50/40"}`}>
                    <th className="px-5 py-3 lg:px-8 lg:py-4 text-left">User</th>
                    <th className="px-5 py-3 lg:px-8 lg:py-4 text-left">Role</th>
                    <th className="px-5 py-3 lg:px-8 lg:py-4 text-left">Status</th>
                    <th className="px-5 py-3 lg:px-8 lg:py-4 text-left">Skills</th>
                    <th className="px-5 py-3 lg:px-8 lg:py-4 text-left">Joined</th>
                    <th className="px-5 py-3 lg:px-8 lg:py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${d ? "divide-white/[0.04]" : "divide-slate-50"}`}>
                  {users.map((user) => (
                    <UserRow
                      key={user._id}
                      user={user}
                      onDelete={handleDeleteUser}
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

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={deleteModal.show}
          onClose={() => setDeleteModal({ show: false, user: null })}
          title="Delete User"
        >
          <div className={`p-6 space-y-6 rounded-b-xl ${d ? "bg-[#0f1423]" : "bg-slate-50"}`}>
            <div className={`p-4 rounded-xl border flex items-start gap-3 ${d ? "bg-red-500/10 border-red-500/20" : "bg-red-50 border-red-100"}`}>
              <div className={`p-2 rounded-full shrink-0 ${d ? "bg-red-500/20 text-red-400" : "bg-red-100 text-red-600"}`}>
                <TrashIcon cls="w-5 h-5" />
              </div>
              <div>
                <h4 className={`text-sm font-bold ${d ? "text-red-400" : "text-red-700"}`}>Confirm Deletion</h4>
                <p className={`text-xs mt-1 leading-relaxed ${d ? "text-red-300/80" : "text-red-600/80"}`}>
                  Are you sure you want to delete <strong className="px-1">{deleteModal.user?.name}</strong>? 
                  This will also permanently wipe all their skills, matches, and reviews.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteModal({ show: false, user: null })}
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
                {deletingId ? "Deleting..." : "Delete User"}
              </button>
            </div>
          </div>
        </Modal>

      </div>
    </div>
  );
}
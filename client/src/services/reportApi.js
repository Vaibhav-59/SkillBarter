// services/reportApi.js
import API from "../utils/api";

const BASE = "/reports";

// ── Reports ───────────────────────────────────────────────────────────────────
export const submitReport = (data) =>
  API.post(`${BASE}`, data).then((r) => r.data);

export const getMyReports = () =>
  API.get(`${BASE}/my`).then((r) => r.data);

export const getSafetyStatus = () =>
  API.get(`${BASE}/safety-status`).then((r) => r.data);

// ── Admin ─────────────────────────────────────────────────────────────────────
export const getAllReports = (params = {}) =>
  API.get(`${BASE}/admin`, { params }).then((r) => r.data);

export const takeReportAction = (id, data) =>
  API.put(`${BASE}/action/${id}`, data).then((r) => r.data);

export const getUsersAnalysis = () =>
  API.get(`${BASE}/admin/users-analysis`).then((r) => r.data);

// ── Block / Unblock ───────────────────────────────────────────────────────────
export const blockUser = (blockedUserId) =>
  API.post(`${BASE}/block`, { blockedUserId }).then((r) => r.data);

export const unblockUser = (userId) =>
  API.delete(`${BASE}/block/${userId}`).then((r) => r.data);

export const getBlockedUsers = () =>
  API.get(`${BASE}/block`).then((r) => r.data);

// routes/reportRoutes.js
const express = require("express");
const { protect } = require("../middleware/auth");
const {
  submitReport,
  getMyReports,
  getAllReports,
  takeAction,
  blockUser,
  unblockUser,
  getBlockedUsers,
  getSafetyStatus,
  getUsersAnalysis,
} = require("../controllers/reportController");

const router = express.Router();

router.use(protect);

// ── Report CRUD ───────────────────────────────────────────────────────────────
router.post("/", submitReport);
router.get("/my", getMyReports);
router.get("/safety-status", getSafetyStatus);

// ── Admin Routes (protect only - matches existing admin infrastructure) ───────
router.get("/admin", getAllReports);
router.put("/action/:id", takeAction);
router.get("/admin/users-analysis", getUsersAnalysis);

// ── Block / Unblock ───────────────────────────────────────────────────────────
router.post("/block", blockUser);
router.delete("/block/:id", unblockUser);
router.get("/block", getBlockedUsers);

module.exports = router;

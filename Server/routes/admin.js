const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  getAdminStats, getSystemHealth, getUserAnalytics,
  getAllUsers, updateUser, deleteUser,
  getAllReviews, deleteReview,
  getAllSkills, deleteSkill,
  getInactiveUsers, cleanupInactiveUsers, deleteInactiveUser,
  getActiveMeetings, getAllSessions, getAllContracts,
  getCommunityStats, getChallengesStats, getGamificationStats,
  getResourcesStats, getPlatformStats, getMegaStats,
} = require("../controllers/adminController");

router.use(protect);

// ── Main Dashboard ───────────────────────────────────────────────────────────
router.get("/stats",          getAdminStats);
router.get("/system-health",  getSystemHealth);
router.get("/user-analytics", getUserAnalytics);
router.get("/mega-stats",     getMegaStats);

// ── User Management ──────────────────────────────────────────────────────────
router.get("/users",              getAllUsers);
router.put("/users/:id",          updateUser);
router.delete("/users/:id",       deleteUser);
router.get("/inactive-users",     getInactiveUsers);
router.post("/cleanup-inactive-users", cleanupInactiveUsers);
router.delete("/inactive-users/:id",   deleteInactiveUser);

// ── Reviews / Skills ─────────────────────────────────────────────────────────
router.get("/reviews",        getAllReviews);
router.delete("/reviews/:id", deleteReview);
router.get("/skills",         getAllSkills);
router.delete("/skills/:id",  deleteSkill);

// ── Meetings / Sessions / Contracts ─────────────────────────────────────────
router.get("/meetings",  getActiveMeetings);
router.get("/sessions",  getAllSessions);
router.get("/contracts", getAllContracts);

// ── New Analytics Endpoints ──────────────────────────────────────────────────
router.get("/community-stats",    getCommunityStats);
router.get("/challenges-stats",   getChallengesStats);
router.get("/gamification-stats", getGamificationStats);
router.get("/resources-stats",    getResourcesStats);
router.get("/platform-stats",     getPlatformStats);

module.exports = router;

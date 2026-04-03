const User = require("../models/User");
const Skill = require("../models/Skill");
const Match = require("../models/Match");
const Review = require("../models/Review");
const Meeting = require("../models/Meeting");
const ErrorResponse = require("../utils/errorResponse");

const INACTIVE_REMINDER_DAY = 10;
const INACTIVE_DELETE_DAY = 15;

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getAdminStats = async (req, res, next) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Basic counts
    const totalUsers = await User.countDocuments();
    const totalMatches = await Match.countDocuments();
    const totalReviews = await Review.countDocuments();
    const recentUsers = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    const weeklyUsers = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
    const activeUsers = await User.countDocuments({ lastLogin: { $gte: thirtyDaysAgo } });

    // Total skills count
    const users = await User.find().select("teachSkills learnSkills");
    let totalSkills = 0;
    users.forEach(u => {
      totalSkills += (u.teachSkills?.length || 0) + (u.learnSkills?.length || 0);
    });

    // Top skills
    const skillMap = {};
    users.forEach(u => {
      [...(u.teachSkills || []), ...(u.learnSkills || [])].forEach(s => {
        const name = s.name || "Unknown";
        skillMap[name] = (skillMap[name] || 0) + 1;
      });
    });
    const topSkills = Object.entries(skillMap)
      .map(([name, count]) => ({ _id: name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Match stats
    const matchStats = await Match.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    const matchStatistics = { pending: 0, accepted: 0, rejected: 0, completed: 0 };
    matchStats.forEach(s => {
      if (matchStatistics.hasOwnProperty(s._id)) matchStatistics[s._id] = s.count;
    });

    // Review stats
    const reviewStats = await Review.aggregate([
      { $group: { _id: null, avgRating: { $avg: "$rating" } } }
    ]);
    const averageRating = reviewStats[0]?.avgRating?.toFixed(1) || "0";

    // User growth (last 12 months)
    const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: oneYearAgo } } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Recent activities
    const recentActivities = [];
    
    // Recent users
    const newUsers = await User.find().select("name createdAt").sort({ createdAt: -1 }).limit(5);
    newUsers.forEach(u => {
      recentActivities.push({
        type: "user_registered",
        message: `New user "${u.name}" registered`,
        timestamp: u.createdAt,
        severity: "info"
      });
    });

    // Recent matches
    const newMatches = await Match.find().populate("requester", "name").populate("receiver", "name")
      .sort({ createdAt: -1 }).limit(3);
    newMatches.forEach(m => {
      recentActivities.push({
        type: "match_created",
        message: `Match between ${m.requester?.name || 'User'} and ${m.receiver?.name || 'User'}`,
        timestamp: m.createdAt,
        severity: "success"
      });
    });

    // Meeting History from DB
    const newMeetings = await Meeting.find({})
      .sort({ startedAt: -1 })
      .limit(3);
      
    newMeetings.forEach(m => {
      recentActivities.push({
        type: m.status === "active" ? "meeting_active" : "meeting_ended",
        message: `Video Meeting ${m.meetingId} (${m.participants.length} connected)`,
        timestamp: m.startedAt,
        severity: m.status === "active" ? "info" : "warning"
      });
    });

    // Sort and limit activities
    recentActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Platform health
    const platformHealth = {
      activeUsers,
      completedMatches: matchStatistics.completed || 0,
      systemUptime: Math.floor(process.uptime())
    };

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalSkills,
          totalMatches,
          totalReviews,
          recentUsers,
          weeklyUsers,
          activeUsers,
          averageRating,
          userGrowthRate: "0"
        },
        topSkills,
        matchStatistics,
        userGrowth,
        recentActivities: recentActivities.slice(0, 10),
        platformHealth,
        lastUpdated: new Date()
      }
    });
  } catch (error) {
    console.error("getAdminStats error:", error);
    res.status(500).json({ success: false, message: "Server error fetching stats" });
  }
};

// @desc    Get system health
// @route   GET /api/admin/system-health
// @access  Private/Admin
exports.getSystemHealth = async (req, res, next) => {
  try {
    const health = {
      database: { status: "healthy", responseTime: Date.now() },
      server: {
        uptime: Math.floor(process.uptime()),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage()
      }
    };
    res.status(200).json({ success: true, data: health });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get user analytics
// @route   GET /api/admin/user-analytics
// @access  Private/Admin
exports.getUserAnalytics = async (req, res, next) => {
  try {
    const userStats = await User.aggregate([
      {
        $facet: {
          byRole: [{ $group: { _id: "$role", count: { $sum: 1 } } }],
          byStatus: [{ $group: { _id: "$isActive", count: { $sum: 1 } } }]
        }
      }
    ]);
    res.status(200).json({ success: true, data: userStats[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";
    const role = req.query.role || "";
    const status = req.query.status || "";

    let filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }
    if (role) filter.role = role;
    if (status) filter.isActive = status === "active";

    const [users, totalUsers] = await Promise.all([
      User.find(filter).select("-password").sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalUsers / limit);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: { currentPage: page, totalPages, totalUsers, hasNextPage: page < totalPages, hasPrevPage: page > 1 }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res, next) => {
  try {
    const { role, isActive } = req.body;
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    await user.save();
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    
    await Promise.all([
      Skill.deleteMany({ user: user._id }),
      Match.deleteMany({ $or: [{ requester: user._id }, { receiver: user._id }] }),
      Review.deleteMany({ $or: [{ reviewer: user._id }, { reviewee: user._id }] })
    ]);
    
    await user.deleteOne();
    res.status(200).json({ success: true, message: "User deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get all reviews
// @route   GET /api/admin/reviews
// @access  Private/Admin
exports.getAllReviews = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [reviews, totalReviews] = await Promise.all([
      Review.find().populate("reviewer", "name email").populate("reviewee", "name email")
        .sort({ createdAt: -1 }).skip(skip).limit(limit),
      Review.countDocuments()
    ]);

    res.status(200).json({
      success: true,
      data: {
        reviews,
        pagination: { currentPage: page, totalPages: Math.ceil(totalReviews / limit), totalReviews, hasNextPage: page * limit < totalReviews, hasPrevPage: page > 1 }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Delete review
// @route   DELETE /api/admin/reviews/:id
// @access  Private/Admin
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: "Review not found" });
    await review.deleteOne();
    res.status(200).json({ success: true, message: "Review deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get all skills
// @route   GET /api/admin/skills
// @access  Private/Admin
exports.getAllSkills = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";

    const users = await User.find().select("name email teachSkills learnSkills");
    const allSkills = [];
    
    users.forEach(user => {
      const teachSet = new Set((user.teachSkills || []).map(s => s._id?.toString()));
      [...(user.teachSkills || []), ...(user.learnSkills || [])].forEach(skill => {
        if (!search || (skill.name && skill.name.toLowerCase().includes(search.toLowerCase()))) {
          const skillCreatedAt = skill.createdAt instanceof Date && !isNaN(skill.createdAt)
            ? skill.createdAt
            : (user.createdAt || new Date());
          allSkills.push({
            _id: skill._id,
            name: skill.name,
            type: teachSet.has(skill._id?.toString()) ? "teach" : "learn",
            level: skill.level || "Beginner",
            user: { _id: user._id, name: user.name, email: user.email },
            createdAt: skillCreatedAt
          });
        }
      });
    });

    const totalSkills = allSkills.length;
    const paginatedSkills = allSkills.slice(skip, skip + limit);

    res.status(200).json({
      success: true,
      data: {
        skills: paginatedSkills,
        statistics: [{ _id: "total", count: totalSkills }],
        pagination: { currentPage: page, totalPages: Math.ceil(totalSkills / limit), totalSkills, hasNextPage: page * limit < totalSkills, hasPrevPage: page > 1 }
      }
    });
  } catch (error) {
    console.error("getAllSkills error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Delete skill
// @route   DELETE /api/admin/skills/:id
// @access  Private/Admin
exports.deleteSkill = async (req, res, next) => {
  try {
    const skillId = req.params.id;
    const userWithSkill = await User.findOne({
      $or: [{ "teachSkills._id": skillId }, { "learnSkills._id": skillId }]
    });
    
    if (!userWithSkill) return res.status(404).json({ success: false, message: "Skill not found" });
    
    userWithSkill.teachSkills = userWithSkill.teachSkills.filter(s => s._id.toString() !== skillId);
    userWithSkill.learnSkills = userWithSkill.learnSkills.filter(s => s._id.toString() !== skillId);
    await userWithSkill.save();
    
    res.status(200).json({ success: true, message: "Skill deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get inactive users
// @route   GET /api/admin/inactive-users
// @access  Private/Admin
exports.getInactiveUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: "user" }).select("name email lastLogin createdAt");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const inactiveUsers = users.map(user => {
      const lastActivity = user.lastLogin || user.createdAt;
      const daysSinceActivity = Math.floor((today - new Date(lastActivity)) / (1000 * 60 * 60 * 24));
      
      let status = "active";
      if (daysSinceActivity >= INACTIVE_DELETE_DAY) status = "to_be_deleted";
      else if (daysSinceActivity >= INACTIVE_REMINDER_DAY) status = "reminder_sent";
      else if (daysSinceActivity > 0) status = "inactive";

      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        lastActivity,
        daysInactive: daysSinceActivity,
        daysUntilDeletion: Math.max(0, INACTIVE_DELETE_DAY - daysSinceActivity),
        status
      };
    }).filter(u => u.daysInactive > 0).sort((a, b) => b.daysInactive - a.daysInactive);

    res.status(200).json({
      success: true,
      data: {
        users: inactiveUsers,
        summary: {
          totalInactive: inactiveUsers.length,
          atRisk: inactiveUsers.filter(u => u.daysUntilDeletion <= 5).length,
          toBeDeleted: inactiveUsers.filter(u => u.status === "to_be_deleted").length,
          reminderDay: INACTIVE_REMINDER_DAY,
          deleteDay: INACTIVE_DELETE_DAY
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Cleanup inactive users
// @route   POST /api/admin/cleanup-inactive-users
// @access  Private/Admin
exports.cleanupInactiveUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: "user" });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const toDelete = [];

    for (const user of users) {
      const lastActivity = user.lastLogin || user.createdAt;
      const daysSinceActivity = Math.floor((today - new Date(lastActivity)) / (1000 * 60 * 60 * 24));
      if (daysSinceActivity >= INACTIVE_DELETE_DAY) toDelete.push(user._id);
    }

    await User.deleteMany({ _id: { $in: toDelete } });
    res.status(200).json({ success: true, message: `${toDelete.length} users deleted` });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Delete inactive user
// @route   DELETE /api/admin/inactive-users/:id
// @access  Private/Admin
exports.deleteInactiveUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    
    await Promise.all([
      Skill.deleteMany({ user: user._id }),
      Match.deleteMany({ $or: [{ requester: user._id }, { receiver: user._id }] }),
      Review.deleteMany({ $or: [{ reviewer: user._id }, { reviewee: user._id }] })
    ]);
    
    await user.deleteOne();
    res.status(200).json({ success: true, message: "User deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get all meetings (Live & Historical)
// @route   GET /api/admin/meetings
// @access  Private/Admin
exports.getActiveMeetings = async (req, res, next) => {
  try {
    const meetings = await Meeting.find({})
      .populate("host", "name email avatar")
      .populate("participants", "name email avatar")
      .sort({ startedAt: -1 });
      
    // Fetch live details from socket if needed, but DB is strictly enough
    // for a complete overview.

    res.status(200).json({
      success: true,
      data: meetings
    });
  } catch (error) {
    console.error("getMeetings error:", error);
    res.status(500).json({ success: false, message: "Server error fetching meetings" });
  }
};

// @desc    Get all sessions
// @route   GET /api/admin/sessions
// @access  Private/Admin
exports.getAllSessions = async (req, res, next) => {
  try {
    const Session = require("../models/Session");
    const sessions = await Session.find({})
      .populate("hostUser", "name email avatar")
      .populate("participantUser", "name email avatar")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: sessions
    });
  } catch (error) {
    console.error("getAllSessions error:", error);
    res.status(500).json({ success: false, message: "Server error fetching sessions" });
  }
};

// @desc    Get all contracts
// @route   GET /api/admin/contracts
// @access  Private/Admin
exports.getAllContracts = async (req, res, next) => {
  try {
    const SkillContract = require("../models/SkillContract");
    const contracts = await SkillContract.find({})
      .populate("userA", "name email avatar")
      .populate("userB", "name email avatar")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: contracts
    });
  } catch (error) {
    console.error("getAllContracts error:", error);
    res.status(500).json({ success: false, message: "Server error fetching contracts" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// COMMUNITY ANALYTICS
// GET /api/admin/community-stats
// ─────────────────────────────────────────────────────────────────────────────
exports.getCommunityStats = async (req, res) => {
  try {
    const Post = require("../models/Post");

    // Post uses: user (ref User), postType (enum post/question/discussion), likes[], comments[], views, tags, title, content
    const totalPosts = await Post.countDocuments();

    // Posts by postType (correct field name)
    const postsByType = await Post.aggregate([
      { $group: { _id: "$postType", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Most liked posts — sort by likes array size
    const allPosts = await Post.find()
      .populate("user", "name profileImage")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // Sort by likes count in JS since likes is an array
    const topPosts = allPosts
      .sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0))
      .slice(0, 10);

    // Post growth (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const postGrowth = await Post.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Total interactions
    const interactions = await Post.aggregate([
      {
        $group: {
          _id: null,
          totalLikes:    { $sum: { $size: { $ifNull: ["$likes",    []] } } },
          totalComments: { $sum: { $size: { $ifNull: ["$comments", []] } } }
        }
      }
    ]);
    const totalLikes    = interactions[0]?.totalLikes    || 0;
    const totalComments = interactions[0]?.totalComments || 0;

    // Recent posts with correct populate field
    const recentPosts = await Post.find()
      .populate("user", "name profileImage")
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    res.json({
      success: true,
      data: { totalPosts, publishedPosts: totalPosts, pendingPosts: 0, postsByType, topPosts, postGrowth, totalLikes, totalComments, recentPosts }
    });
  } catch (err) {
    console.error("getCommunityStats:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// CHALLENGES ANALYTICS
// GET /api/admin/challenges-stats
// ─────────────────────────────────────────────────────────────────────────────
exports.getChallengesStats = async (req, res) => {
  try {
    const Challenge  = require("../models/Challenge");
    const Submission = require("../models/Submission");

    const totalChallenges  = await Challenge.countDocuments();
    const activeChallenges = await Challenge.countDocuments({ isActive: true });
    const dailyChallenges  = await Challenge.countDocuments({ isDaily: true });
    const totalSubmissions = await Submission.countDocuments();

    // Challenges by difficulty
    const byDifficulty = await Challenge.aggregate([
      { $group: { _id: "$difficulty", count: { $sum: 1 } } }
    ]);

    // Challenges by category
    const byCategory = await Challenge.aggregate([
      { $group: { _id: "$skillCategory", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Submissions by status
    const submissionsByStatus = await Submission.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    // Average AI score
    const scoreStats = await Submission.aggregate([
      { $match: { score: { $gt: 0 } } },
      { $group: { _id: null, avgScore: { $avg: "$score" }, maxScore: { $max: "$score" }, minScore: { $min: "$score" } } }
    ]);

    // Top challenges by participation
    const topChallenges = await Challenge.find()
      .populate("createdBy", "name profileImage")
      .sort({ participantsCount: -1 })
      .limit(10)
      .lean();

    // Recent submissions
    const recentSubmissions = await Submission.find()
      .populate("userId", "name profileImage")
      .populate("challengeId", "title difficulty")
      .sort({ submittedAt: -1 })
      .limit(20)
      .lean();

    // XP given through challenges
    const totalXPAwarded = await Challenge.aggregate([
      { $group: { _id: null, total: { $sum: { $multiply: ["$rewardXP", "$participantsCount"] } } } }
    ]);

    res.json({
      success: true,
      data: { totalChallenges, activeChallenges, dailyChallenges, totalSubmissions, byDifficulty, byCategory, submissionsByStatus, scoreStats: scoreStats[0] || {}, topChallenges, recentSubmissions, totalXPAwarded: totalXPAwarded[0]?.total || 0 }
    });
  } catch (err) {
    console.error("getChallengesStats:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GAMIFICATION ANALYTICS
// GET /api/admin/gamification-stats
// ─────────────────────────────────────────────────────────────────────────────
exports.getGamificationStats = async (req, res) => {
  try {
    const Gamification = require("../models/Gamification");

    const totalProfiles = await Gamification.countDocuments();

    // Total XP on platform
    const xpStats = await Gamification.aggregate([
      { $group: { _id: null, totalXP: { $sum: "$xp" }, avgXP: { $avg: "$xp" }, maxXP: { $max: "$xp" }, avgLevel: { $avg: "$level" }, maxLevel: { $max: "$level" } } }
    ]);

    // Level distribution
    const levelDist = await Gamification.aggregate([
      { $group: { _id: "$level", count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Badge category distribution (unwind badges array)
    const badgeDist = await Gamification.aggregate([
      { $unwind: "$badges" },
      { $group: { _id: "$badges.category", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Total badges awarded (use $ifNull to safely handle empty arrays)
    const totalBadges = await Gamification.aggregate([
      { $group: { _id: null, total: { $sum: { $size: { $ifNull: ["$badges", []] } } } } }
    ]);

    // Total rewards redeemed (use $ifNull to safely handle empty arrays)
    const totalRewards = await Gamification.aggregate([
      { $group: { _id: null, total: { $sum: { $size: { $ifNull: ["$redeemedRewards", []] } } } } }
    ]);

    // Leaderboard (top 20 players)
    const leaderboard = await Gamification.find()
      .populate("userId", "name profileImage email")
      .sort({ xp: -1 })
      .limit(20)
      .select("userId xp level badges sessionsCompleted challengesCompleted")
      .lean();

    // XP earned over time (last 30 days from xpHistory)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const xpOverTime = await Gamification.aggregate([
      { $unwind: "$xpHistory" },
      { $match: { "xpHistory.date": { $gte: thirtyDaysAgo } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$xpHistory.date" } }, totalXP: { $sum: "$xpHistory.amount" } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: { totalProfiles, xpStats: xpStats[0] || {}, levelDist, badgeDist, totalBadges: totalBadges[0]?.total || 0, totalRewards: totalRewards[0]?.total || 0, leaderboard, xpOverTime }
    });
  } catch (err) {
    console.error("getGamificationStats:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// RESOURCES ANALYTICS
// GET /api/admin/resources-stats
// ─────────────────────────────────────────────────────────────────────────────
exports.getResourcesStats = async (req, res) => {
  try {
    const Resource = require("../models/Resource");
    const ResourceReview = require("../models/ResourceReview");
    const LearningPath = require("../models/LearningPath");

    // Resource uses: author (not createdBy), resourceType (not type), averageRating (not rating), views, likes[], bookmarks[]
    // LearningPath uses: isActive (not status), userId (not user), goal, progress
    const totalResources = await Resource.countDocuments();
    const totalReviews   = await ResourceReview.countDocuments();
    const totalPaths     = await LearningPath.countDocuments();
    const activePaths    = await LearningPath.countDocuments({ isActive: true }); // correct field

    // Resources by resourceType (correct field)
    const byType = await Resource.aggregate([
      { $group: { _id: "$resourceType", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Resources by category
    const byCategory = await Resource.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Top rated resources — populate author (correct field), sort by averageRating
    const topResources = await Resource.find()
      .populate("author", "name profileImage")
      .sort({ averageRating: -1, views: -1 })
      .limit(10)
      .lean();

    // Rating distribution from ResourceReview
    const ratingDist = await ResourceReview.aggregate([
      { $group: { _id: "$rating", count: { $sum: 1 } } },
      { $sort: { _id: -1 } }
    ]);

    // Aggregate stats — use averageRating (correct field), views instead of downloads
    const dlStats = await Resource.aggregate([
      {
        $group: {
          _id: null,
          totalDownloads: { $sum: "$views" },         // views = proxy for downloads
          avgRating:      { $avg: "$averageRating" }   // correct field
        }
      }
    ]);

    // Total likes across all resources
    const likesAgg = await Resource.aggregate([
      { $group: { _id: null, totalLikes: { $sum: { $size: { $ifNull: ["$likes", []] } } } } }
    ]);

    // Recent resources
    const recentResources = await Resource.find()
      .populate("author", "name profileImage")
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    // Learning path goals breakdown
    const pathGoals = await LearningPath.aggregate([
      { $group: { _id: "$goal", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 15 }
    ]);

    // Difficulty distribution
    const byDifficulty = await Resource.aggregate([
      { $group: { _id: "$difficultyLevel", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        totalResources, totalReviews, totalPaths, activePaths,
        byType, byCategory, byDifficulty,
        topResources, ratingDist,
        dlStats: { ...(dlStats[0] || {}), totalLikes: likesAgg[0]?.totalLikes || 0 },
        recentResources, pathGoals
      }
    });
  } catch (err) {
    console.error("getResourcesStats:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PLATFORM ANALYTICS (Wallets, Notifications, Group Sessions)
// GET /api/admin/platform-stats
// ─────────────────────────────────────────────────────────────────────────────
exports.getPlatformStats = async (req, res) => {
  try {
    const Wallet       = require("../models/Wallet");
    const Transaction  = require("../models/Transaction");
    const Notification = require("../models/Notification");
    const GroupSession = require("../models/GroupSession");
    const Message      = require("../models/Message");
    const Conversation = require("../models/Conversation");

    // Wallet stats
    const walletStats = await Wallet.aggregate([
      { $group: { _id: null, totalWallets: { $sum: 1 }, totalBalance: { $sum: "$balance" }, avgBalance: { $avg: "$balance" } } }
    ]).catch(() => [{}]);

    // Transaction stats
    const txStats = await Transaction.aggregate([
      { $group: { _id: "$type", count: { $sum: 1 }, totalAmount: { $sum: "$amount" } } }
    ]).catch(() => []);

    const totalTransactions = await Transaction.countDocuments().catch(() => 0);

    // Notification stats
    const totalNotifications = await Notification.countDocuments().catch(() => 0);
    const unreadNotifications = await Notification.countDocuments({ isRead: false }).catch(() => 0);
    const notifByType = await Notification.aggregate([
      { $group: { _id: "$type", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).catch(() => []);

    // Group session stats
    const totalGroupSessions = await GroupSession.countDocuments().catch(() => 0);
    const activeGroupSessions = await GroupSession.countDocuments({ status: "active" }).catch(() => 0);
    const groupSessionsByStatus = await GroupSession.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]).catch(() => []);

    // Chat stats
    const totalMessages      = await Message.countDocuments().catch(() => 0);
    const totalConversations = await Conversation.countDocuments().catch(() => 0);

    // Messages per day last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const msgPerDay = await Message.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]).catch(() => []);

    // Report stats
    const Report = require("../models/Report");
    const reportsByStatus = await Report.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]).catch(() => []);
    const totalReports = await Report.countDocuments().catch(() => 0);

    res.json({
      success: true,
      data: {
        walletStats: walletStats[0] || {},
        txStats,
        totalTransactions,
        totalNotifications,
        unreadNotifications,
        notifByType,
        totalGroupSessions,
        activeGroupSessions,
        groupSessionsByStatus,
        totalMessages,
        totalConversations,
        msgPerDay,
        reportsByStatus,
        totalReports
      }
    });
  } catch (err) {
    console.error("getPlatformStats:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// MEGA PLATFORM OVERVIEW (for main admin dashboard hero)
// GET /api/admin/mega-stats
// ─────────────────────────────────────────────────────────────────────────────
exports.getMegaStats = async (req, res) => {
  try {
    const Challenge    = require("../models/Challenge");
    const Submission   = require("../models/Submission");
    const Post         = require("../models/Post");
    const Resource     = require("../models/Resource");
    const Gamification = require("../models/Gamification");
    const GroupSession = require("../models/GroupSession");
    const LearningPath = require("../models/LearningPath");
    const Notification = require("../models/Notification");
    const Message      = require("../models/Message");
    const Report       = require("../models/Report");
    const Session      = require("../models/Session");
    const SkillContract = require("../models/SkillContract");

    const [
      totalUsers, totalMatches, totalReviews,
      totalChallenges, totalSubmissions, totalPosts,
      totalResources, totalLearningPaths, totalGroupSessions,
      totalMessages, totalNotifications, totalReports,
      totalSessions, totalContracts, totalMeetings,
      activeUsers30d, newUsersToday,
      pendingReports, totalXPData
    ] = await Promise.all([
      User.countDocuments(),
      Match.countDocuments(),
      Review.countDocuments(),
      Challenge.countDocuments().catch(() => 0),
      Submission.countDocuments().catch(() => 0),
      Post.countDocuments().catch(() => 0),
      Resource.countDocuments().catch(() => 0),
      LearningPath.countDocuments().catch(() => 0),
      GroupSession.countDocuments().catch(() => 0),
      Message.countDocuments().catch(() => 0),
      Notification.countDocuments().catch(() => 0),
      Report.countDocuments().catch(() => 0),
      Session.countDocuments().catch(() => 0),
      SkillContract.countDocuments().catch(() => 0),
      Meeting.countDocuments().catch(() => 0),
      User.countDocuments({ lastLogin: { $gte: new Date(Date.now() - 30*24*60*60*1000) } }),
      User.countDocuments({ createdAt: { $gte: new Date(new Date().setHours(0,0,0,0)) } }),
      Report.countDocuments({ status: "pending" }).catch(() => 0),
      Gamification.aggregate([{ $group: { _id: null, total: { $sum: "$xp" } } }]).catch(() => [])
    ]);

    const totalXP = totalXPData[0]?.total || 0;

    // User growth last 6 months
    const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Platform health score (0-100)
    const activeRatio  = totalUsers > 0 ? (activeUsers30d / totalUsers) * 100 : 100;
    const pendingRatio = totalReports > 0 ? ((totalReports - pendingReports) / totalReports) * 100 : 100;
    const healthScore  = Math.round((activeRatio * 0.5) + (pendingRatio * 0.3) + 20);

    res.json({
      success: true,
      data: {
        totalUsers, totalMatches, totalReviews, totalChallenges, totalSubmissions,
        totalPosts, totalResources, totalLearningPaths, totalGroupSessions,
        totalMessages, totalNotifications, totalReports, totalSessions,
        totalContracts, totalMeetings, activeUsers30d, newUsersToday,
        pendingReports, totalXP, userGrowth,
        healthScore: Math.min(100, healthScore),
        serverUptime: Math.floor(process.uptime()),
        lastUpdated: new Date()
      }
    });
  } catch (err) {
    console.error("getMegaStats:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

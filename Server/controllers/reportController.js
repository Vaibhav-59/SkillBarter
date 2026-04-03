// controllers/reportController.js
const Report = require("../models/Report");
const Block = require("../models/Block");
const User = require("../models/User");
const mongoose = require("mongoose");

// ── Thresholds ────────────────────────────────────────────────────────────────
const TRUST_DEDUCTION_PER_REPORT = 5;   // Deduct 5 trust points per new report
const FLAG_THRESHOLD = 5;               // Flag user if reports >= 5
const SUSPEND_THRESHOLD = 15;           // Auto-suspend if reports >= 15

// ── POST /api/reports ─────────────────────────────────────────────────────────
exports.submitReport = async (req, res) => {
  try {
    const { targetId, targetType, reason, description, proofUrl } = req.body;
    const reporterId = req.user._id;

    if (!targetId || !targetType || !reason) {
      return res.status(400).json({ success: false, message: "targetId, targetType and reason are required" });
    }

    // Prevent self-reporting
    if (targetType === "user" && targetId.toString() === reporterId.toString()) {
      return res.status(400).json({ success: false, message: "You cannot report yourself" });
    }

    // Prevent duplicate reports for same target by same reporter
    const existing = await Report.findOne({ reporterId, targetId, targetType });
    if (existing) {
      return res.status(400).json({ success: false, message: "You have already reported this content" });
    }

    // Generate a short Report ID
    const reportId = "RPT" + Math.random().toString(36).toUpperCase().slice(2, 8);

    const report = await Report.create({
      reporterId,
      targetId,
      targetType,
      reason,
      description: description || "",
      proofUrl: proofUrl || "",
      status: "pending",
      _id: new mongoose.Types.ObjectId(),
    });

    // ── Update target user's safety stats (if reporting a user) ──────────────
    if (targetType === "user") {
      const targetUser = await User.findById(targetId);
      if (targetUser) {
        targetUser.reportsCount = (targetUser.reportsCount || 0) + 1;

        // Deduct trust score
        const newTrust = Math.max(0, (targetUser.trustScore || 100) - TRUST_DEDUCTION_PER_REPORT);
        targetUser.trustScore = newTrust;

        // Auto-flag if threshold reached
        if (targetUser.reportsCount >= FLAG_THRESHOLD) {
          targetUser.isFlagged = true;
        }

        // Auto-suspend if threshold reached
        if (targetUser.reportsCount >= SUSPEND_THRESHOLD) {
          targetUser.isSuspended = true;
        }

        await targetUser.save();
      }
    }

    res.status(201).json({
      success: true,
      message: `Report submitted successfully. ID: ${report._id.toString().slice(-6).toUpperCase()}`,
      reportId: report._id,
      data: report,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: "You have already reported this content" });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/reports/my ───────────────────────────────────────────────────────
exports.getMyReports = async (req, res) => {
  try {
    const reports = await Report.find({ reporterId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // For user-type reports, populate target user basic info
    const enriched = await Promise.all(
      reports.map(async (r) => {
        if (r.targetType === "user") {
          const u = await User.findById(r.targetId).select("name profileImage email").lean();
          return { ...r, targetUser: u };
        }
        return r;
      })
    );

    res.json({ success: true, data: enriched });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/reports/admin ────────────────────────────────────────────────────
exports.getAllReports = async (req, res) => {
  try {
    const { status, targetType, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (targetType) filter.targetType = targetType;

    const total = await Report.countDocuments(filter);
    const reports = await Report.find(filter)
      .populate("reporterId", "name profileImage email trustScore")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    // Enrich with target user info
    const enriched = await Promise.all(
      reports.map(async (r) => {
        if (r.targetType === "user") {
          const u = await User.findById(r.targetId)
            .select("name profileImage email trustScore isFlagged isSuspended reportsCount warningCount")
            .lean();
          return { ...r, targetUser: u };
        }
        return r;
      })
    );

    res.json({ success: true, data: enriched, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/reports/action/:id ───────────────────────────────────────────────
exports.takeAction = async (req, res) => {
  try {
    const { status, adminNote, userAction } = req.body;
    // userAction: "warn" | "suspend" | "ban" | "clear"

    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: "Report not found" });

    report.status = status || report.status;
    report.adminNote = adminNote || report.adminNote;
    report.actionTakenBy = req.user._id;
    report.actionTakenAt = new Date();
    await report.save();

    // Apply action to the target user if needed
    if (report.targetType === "user" && userAction) {
      const targetUser = await User.findById(report.targetId);
      if (targetUser) {
        if (userAction === "warn") {
          targetUser.warningCount = (targetUser.warningCount || 0) + 1;
          // Each warning reduces trust by 10
          targetUser.trustScore = Math.max(0, (targetUser.trustScore || 100) - 10);
        } else if (userAction === "suspend") {
          targetUser.isSuspended = true;
          targetUser.trustScore = Math.max(0, (targetUser.trustScore || 100) - 20);
        } else if (userAction === "ban") {
          targetUser.isSuspended = true;
          targetUser.trustScore = 0;
          targetUser.isFlagged = true;
        } else if (userAction === "clear") {
          targetUser.isSuspended = false;
          targetUser.isFlagged = false;
          targetUser.trustScore = Math.min(100, (targetUser.trustScore || 0) + 15);
        }
        await targetUser.save();
      }
    }

    res.json({ success: true, message: "Action taken successfully", data: report });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/reports/safety-status ───────────────────────────────────────────
exports.getSafetyStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("trustScore reportsCount warningCount isSuspended isFlagged isVerified name profileImage")
      .lean();

    // Count reports received (where this user is the target)
    const reportsReceived = await Report.countDocuments({ targetId: req.user._id, targetType: "user" });

    res.json({
      success: true,
      data: {
        trustScore: user.trustScore ?? 100,
        reportsCount: reportsReceived,
        warningCount: user.warningCount ?? 0,
        isSuspended: user.isSuspended ?? false,
        isFlagged: user.isFlagged ?? false,
        isVerified: user.isVerified ?? false,
        name: user.name,
        profileImage: user.profileImage,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/block ───────────────────────────────────────────────────────────
exports.blockUser = async (req, res) => {
  try {
    const { blockedUserId } = req.body;
    if (!blockedUserId) return res.status(400).json({ success: false, message: "blockedUserId is required" });
    if (blockedUserId.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "You cannot block yourself" });
    }

    await Block.create({ userId: req.user._id, blockedUserId });
    res.status(201).json({ success: true, message: "User blocked successfully" });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ success: false, message: "User already blocked" });
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── DELETE /api/block/:id ─────────────────────────────────────────────────────
exports.unblockUser = async (req, res) => {
  try {
    const result = await Block.findOneAndDelete({ userId: req.user._id, blockedUserId: req.params.id });
    if (!result) return res.status(404).json({ success: false, message: "Block record not found" });
    res.json({ success: true, message: "User unblocked successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/block ────────────────────────────────────────────────────────────
exports.getBlockedUsers = async (req, res) => {
  try {
    const blocks = await Block.find({ userId: req.user._id })
      .populate("blockedUserId", "name profileImage email trustScore")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: blocks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/reports/admin/users-analysis ─────────────────────────────────────
exports.getUsersAnalysis = async (req, res) => {
  try {
    // Get all users with safety data
    const users = await User.find({})
      .select("name email profileImage trustScore reportsCount warningCount isSuspended isFlagged isVerified role createdAt")
      .sort({ reportsCount: -1 })
      .limit(100)
      .lean();

    const totalReports = await Report.countDocuments();
    const pendingReports = await Report.countDocuments({ status: "pending" });
    const flaggedUsers = await User.countDocuments({ isFlagged: true });
    const suspendedUsers = await User.countDocuments({ isSuspended: true });

    // Enrich each user with their actual report count from Report collection
    const enriched = await Promise.all(
      users.map(async (u) => {
        const reportsReceived = await Report.countDocuments({ targetId: u._id, targetType: "user" });
        return { ...u, reportsReceivedActual: reportsReceived };
      })
    );

    res.json({
      success: true,
      data: enriched,
      stats: { totalReports, pendingReports, flaggedUsers, suspendedUsers },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

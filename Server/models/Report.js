// models/Report.js
const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    targetType: {
      type: String,
      enum: ["user", "post", "message", "session", "resource"],
      required: true,
    },
    reason: {
      type: String,
      enum: ["spam", "fraud", "fake_profile", "harassment", "inappropriate_content", "misleading_information", "other"],
      required: true,
    },
    description: { type: String, default: "", maxlength: 1000 },
    proofUrl: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "under_review", "action_taken", "rejected"],
      default: "pending",
    },
    adminNote: { type: String, default: "" },
    actionTakenBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    actionTakenAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Index for fast queries
reportSchema.index({ reporterId: 1, createdAt: -1 });
reportSchema.index({ targetId: 1, targetType: 1 });
reportSchema.index({ status: 1 });

module.exports = mongoose.model("Report", reportSchema);

// /models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['match_request', 'message', 'reminder', 'system', 'referral', 'gamification', 'session', 'session_accepted', 'resource', 'review'],
      required: true,
    },
    title: {
      type: String,
    },
    content: {
      type: String,
      required: true,
    },
    message: {
      type: String,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'relatedModel',
    },
    relatedModel: {
      type: String,
      enum: ['Match', 'Message', 'Review', 'Session', 'Resource'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);

const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const Match = require("../models/Match");
const ErrorResponse = require("../utils/errorResponse");
const { cloudinaryUpload } = require("../middleware/upload");

// Get or create conversation
exports.getOrCreateConversation = async (req, res, next) => {
  try {
    const { matchId } = req.params;
    const userId = req.user._id;

    // Check if match exists and user is part of it
    const match = await Match.findById(matchId);
    if (!match) {
      return next(new ErrorResponse("Match not found", 404));
    }

    if (!match.requester.equals(userId) && !match.receiver.equals(userId)) {
      return next(
        new ErrorResponse("Not authorized for this conversation", 403)
      );
    }

    // Check if match is at least pending before allowing conversation access
    if (!["accepted", "pending"].includes(match.status)) {
      return next(
        new ErrorResponse(
          "Please wait for match approval before messaging!",
          403
        )
      );
    }

    // Find existing conversation
    let conversation = await Conversation.findOne({ matchId })
      .populate("participants", "name")
      .populate("lastMessage");

    // Create conversation if it doesn't exist
    if (!conversation) {
      conversation = await Conversation.create({
        matchId,
        participants: [match.requester, match.receiver],
      });

      conversation = await Conversation.findById(conversation._id)
        .populate("participants", "name")
        .populate("lastMessage");
    }

    res.json(conversation);
  } catch (err) {
    next(err);
  }
};

// Get all conversations for a user
exports.getUserConversations = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      participants: userId,
      isActive: true,
    })
      .populate("participants", "name")
      .populate("lastMessage")
      .populate("matchId", "status")
      .sort({ lastMessageAt: -1 });

    res.json(conversations);
  } catch (err) {
    next(err);
  }
};

// Send message
exports.sendMessage = async (req, res, next) => {
  try {
    const { conversationId, text, messageType = "text", media, fileName, fileSize, mimeType, duration } = req.body;
    const senderId = req.user._id;

    // Check if conversation exists and user is participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return next(new ErrorResponse("Conversation not found", 404));
    }

    if (!conversation.participants.includes(senderId)) {
      return next(
        new ErrorResponse("Not authorized for this conversation", 403)
      );
    }

    // Check if match exists and is at least pending/accepted
    if (conversation.matchId) {
      const match = await Match.findById(conversation.matchId);
      if (match && !["accepted", "pending"].includes(match.status)) {
        return next(
          new ErrorResponse(
            "Please wait for match approval before messaging!",
            403
          )
        );
      }
    }

    // Create message with all fields
    const message = await Message.create({
      conversationId,
      matchId: conversation.matchId || null,
      sender: senderId,
      text: text?.trim() || "",
      messageType,
      media: media || null,
      fileName: fileName || null,
      fileSize: fileSize ? Number(fileSize) : null,
      mimeType: mimeType || null,
      duration: duration ? Number(duration) : undefined,
    });

    // Populate sender info
    await message.populate("sender", "name");

    // Update conversation with last message
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
      lastMessageAt: new Date(),
    });

    // Build the complete message payload to send to all parties
    const messagePayload = {
      _id: message._id.toString(),
      conversationId: message.conversationId.toString(),
      sender: {
        _id: message.sender._id.toString(),
        name: message.sender.name,
      },
      text: message.text,
      messageType: message.messageType,
      media: message.media,
      fileName: message.fileName,
      fileSize: message.fileSize,
      mimeType: message.mimeType,
      duration: message.duration,
      seen: message.seen,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    };

    // Emit socket event to ALL users in the conversation (including sender)
    const io = req.app.get("io");
    if (io) {
      io.to(conversationId).emit("messageReceived", messagePayload);
      console.log(`💬 Message broadcasted via socket for conversation: ${conversationId}`);
    }

    // Return the same complete payload from the API
    res.status(201).json(messagePayload);
  } catch (err) {
    next(err);
  }
};


// Get messages for a conversation
exports.getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.user._id;

    // Check if user is participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return next(new ErrorResponse("Conversation not found", 404));
    }

    if (!conversation.participants.includes(userId)) {
      return next(
        new ErrorResponse("Not authorized for this conversation", 403)
      );
    }

    // Determine per-user clear timestamp
    const clearedAt = conversation.clearedFor?.get(userId.toString()) || null;

    // Build query: exclude messages deleted for this user OR before their clear timestamp
    const query = {
      conversationId,
      deletedFor: { $nin: [userId] },
    };
    if (clearedAt) {
      query.createdAt = { $gt: clearedAt };
    }

    // Get messages with pagination
    const messages = await Message.find(query)
      .populate("sender", "name")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Mark messages as seen (except sender's own messages)
    await Message.updateMany(
      {
        conversationId,
        sender: { $ne: userId },
        seen: false,
      },
      {
        seen: true,
        seenAt: new Date(),
      }
    );

    res.json({
      messages: messages.reverse(), // Return in chronological order
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: await Message.countDocuments(query),
      },
    });
  } catch (err) {
    next(err);
  }
};

// Delete a single message for the requesting user only
exports.deleteMessage = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return next(new ErrorResponse("Message not found", 404));
    }

    // Verify user is in the conversation
    const conversation = await Conversation.findById(message.conversationId);
    if (!conversation || !conversation.participants.some(p => p.equals(userId))) {
      return next(new ErrorResponse("Not authorized", 403));
    }

    // Soft-delete: add userId to deletedFor array
    await Message.findByIdAndUpdate(messageId, {
      $addToSet: { deletedFor: userId },
    });

    // Emit socket event so the client can remove it from state immediately
    const io = req.app.get("io");
    if (io) {
      io.to(message.conversationId.toString()).emit("messageDeleted", {
        messageId: messageId.toString(),
        deletedBy: userId.toString(),
        conversationId: message.conversationId.toString(),
      });
    }

    res.json({ success: true, messageId: messageId.toString() });
  } catch (err) {
    next(err);
  }
};

// Clear the entire chat for the requesting user only
exports.clearChat = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return next(new ErrorResponse("Conversation not found", 404));
    }

    if (!conversation.participants.some(p => p.equals(userId))) {
      return next(new ErrorResponse("Not authorized", 403));
    }

    // Record the timestamp: messages BEFORE this moment will be hidden for this user
    const clearTime = new Date();
    await Conversation.findByIdAndUpdate(conversationId, {
      $set: { [`clearedFor.${userId.toString()}`]: clearTime },
    });

    res.json({ success: true, clearedAt: clearTime });
  } catch (err) {
    next(err);
  }
};

// Mark message as seen
exports.markMessageAsSeen = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return next(new ErrorResponse("Message not found", 404));
    }

    // Can't mark own message as seen
    if (message.sender.equals(userId)) {
      return next(new ErrorResponse("Cannot mark own message as seen", 400));
    }

    await message.markAsSeen();
    res.json({ message: "Message marked as seen" });
  } catch (err) {
    next(err);
  }
};

// Get unread message count
exports.getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const unreadCount = await Message.countDocuments({
      sender: { $ne: userId },
      seen: false,
      conversationId: {
        $in: await Conversation.find({ participants: userId }).distinct("_id"),
      },
    });

    res.json({ unreadCount });
  } catch (err) {
    next(err);
  }
};


// Upload file → Cloudinary → return URL + metadata
exports.uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new ErrorResponse("No file uploaded", 400));
    }

    const file = req.file;

    // Determine messageType + the correct Cloudinary resource_type
    let messageType = "document";
    let resourceType = "raw"; // safe default for all documents

    if (file.mimetype.startsWith("image/")) {
      messageType = "image";
      resourceType = "image";
    } else if (file.mimetype.startsWith("video/")) {
      messageType = "video";
      resourceType = "video";
    } else if (file.mimetype.startsWith("audio/")) {
      messageType = "voice";
      resourceType = "raw"; // audio stored as raw on Cloudinary
    }

    const result = await cloudinaryUpload(file.buffer, {
      folder: "SkillBarter/messages",
      resource_type: resourceType,
    });

    console.log(`✅ Uploaded ${messageType} to Cloudinary: ${result.secure_url}`);

    res.status(200).json({
      success: true,
      fileUrl: result.secure_url,
      publicId: result.public_id,
      messageType,
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      duration: req.body.duration ? Number(req.body.duration) : undefined,
    });
  } catch (err) {
    console.error("Upload error:", err);
    next(err);
  }
};

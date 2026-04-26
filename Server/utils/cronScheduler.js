const cron = require("node-cron");
const Session = require("../models/Session");
const { sendSessionReminder } = require("../services/reminderService");
const { sendContractReminders } = require("../services/contractReminderService");
const { rotateDailyChallenge } = require("../controllers/challengeController");
const { checkInactiveUsers } = require("./inactiveUserHandler");
const https = require("https");

const startCronJobs = (app) => {
  // Run every minute
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();

      const sessions = await Session.find({ status: "accepted" })
        .populate("hostUser")
        .populate("participantUser");

      const io = app.get("io");

      for (const session of sessions) {
        if (!session.date || !session.startTime) continue;

        // Parse session start time
        const sessionDateTime = new Date(session.date);
        const [startHour, startMinute] = session.startTime.split(":");
        sessionDateTime.setHours(parseInt(startHour, 10), parseInt(startMinute, 10), 0, 0);

        const diffMs = sessionDateTime.getTime() - now.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        // 1 Hour Reminder
        if (diffMins <= 60 && diffMins > 10 && !session.reminderSent) {
          if (session.hostUser) await sendSessionReminder(session.hostUser, session, "Starts in 1 Hour");
          if (session.participantUser) await sendSessionReminder(session.participantUser, session, "Starts in 1 Hour");

          if (io) {
            io.to(session.hostUser._id.toString()).emit("session-reminder", { session, type: "1 Hour" });
            io.to(session.participantUser._id.toString()).emit("session-reminder", { session, type: "1 Hour" });
          }

          session.reminderSent = true;
          await session.save();
        }

        // 10 Min Reminder
        if (diffMins <= 10 && diffMins >= 0 && !session.reminder10MinSent) {
          if (session.hostUser) await sendSessionReminder(session.hostUser, session, "Starts in 10 Minutes");
          if (session.participantUser) await sendSessionReminder(session.participantUser, session, "Starts in 10 Minutes");

          if (io) {
            io.to(session.hostUser._id.toString()).emit("session-reminder", { session, type: "10 Minutes" });
            io.to(session.participantUser._id.toString()).emit("session-reminder", { session, type: "10 Minutes" });
          }

          session.reminder10MinSent = true;
          await session.save();
        }
      }
    } catch (error) {
      console.error("Cron Job Error:", error);
    }

    // Contract session reminders
    try {
      const io = app.get("io");
      await sendContractReminders(io);
    } catch (err) {
      console.error("Contract Reminder Cron Error:", err);
    }
  });

  // ── Daily Challenge Rotation: runs every day at midnight UTC ──
  cron.schedule("0 0 * * *", async () => {
    console.log("🔄 [Cron] Rotating daily challenge...");
    await rotateDailyChallenge();
  });

  // ── Inactive User Check: runs every day at 01:00 UTC ──
  // Sends reminder email at day 175 of inactivity, deletes account at day 180.
  cron.schedule("0 1 * * *", async () => {
    console.log("🔍 [Cron] Checking for inactive users...");
    await checkInactiveUsers();
  });

  // Also rotate on startup so the daily challenge is always valid
  setTimeout(() => {
    console.log("🔄 [Startup] Ensuring daily challenge is set...");
    rotateDailyChallenge();
  }, 3000);

  // ── Render Keep-Alive: Ping server every 14 minutes ──
  cron.schedule("*/14 * * * *", () => {
    console.log("⏳ [Cron] Pinging server to keep Render instance awake...");
    const url = process.env.BACKEND_URL || "https://skill-barter-plateform.onrender.com/";
    https.get(url, (res) => {
      console.log(`✅ [Keep-Alive] Ping successful, status code: ${res.statusCode}`);
    }).on("error", (err) => {
      console.error("❌ [Keep-Alive] Ping failed:", err.message);
    });
  });
};

module.exports = startCronJobs;

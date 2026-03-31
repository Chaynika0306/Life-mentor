const webpush = require("web-push");
const Subscription = require("../models/Subscription");
const User = require("../models/User");

// Configure VAPID
webpush.setVapidDetails(
  "mailto:lifementor0306@gmail.com",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Send notification to a specific user by userId
const sendNotificationToUser = async (userId, title, body) => {
  try {
    const subDoc = await Subscription.findOne({ userId });
    if (!subDoc) {
      console.log("No subscription found for user:", userId);
      return;
    }

    const payload = JSON.stringify({ title, body });
    await webpush.sendNotification(subDoc.subscription, payload);
    console.log(`✅ Notification sent to user: ${userId}`);
  } catch (err) {
    console.error("Push notification error:", err.message);
  }
};

// Send notification to counsellor (first counsellor in DB)
const sendNotificationToCounsellor = async (title, body) => {
  try {
    const counsellor = await User.findOne({ role: "counsellor" });
    if (!counsellor) return;
    await sendNotificationToUser(counsellor._id, title, body);
  } catch (err) {
    console.error("Counsellor notification error:", err.message);
  }
};

module.exports = { sendNotificationToUser, sendNotificationToCounsellor };

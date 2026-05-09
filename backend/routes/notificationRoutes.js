const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const Subscription = require("../models/Subscription");
const Notification = require("../models/Notification");

// ─── WEB PUSH ROUTES (existing) ────────────────────────────────────────────

// Save push subscription
router.post("/subscribe", protect, async (req, res) => {
  try {
    const { subscription } = req.body;
    const userId = req.user.id;

    await Subscription.findOneAndUpdate(
      { userId },
      { userId, subscription },
      { upsert: true, new: true }
    );

    res.status(201).json({ message: "Subscription saved" });
  } catch (err) {
    console.error("Subscribe error:", err);
    res.status(500).json({ message: "Failed to save subscription" });
  }
});

// Unsubscribe
router.delete("/unsubscribe", protect, async (req, res) => {
  try {
    await Subscription.findOneAndDelete({ userId: req.user.id });
    res.json({ message: "Unsubscribed" });
  } catch (err) {
    res.status(500).json({ message: "Failed to unsubscribe" });
  }
});

// ─── IN-APP NOTIFICATION ROUTES (new) ──────────────────────────────────────

// GET: Fetch all notifications for logged-in user
router.get("/", protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(notifications);
  } catch (err) {
    console.error("Fetch notifications error:", err);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
});

// GET: Unread count
router.get("/unread-count", protect, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      userId: req.user.id,
      isRead: false,
    });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: "Failed to get unread count" });
  }
});

// PUT: Mark a single notification as read
router.put("/:id/read", protect, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ message: "Marked as read" });
  } catch (err) {
    res.status(500).json({ message: "Failed to mark as read" });
  }
});

// PUT: Mark ALL notifications as read
router.put("/mark-all-read", protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, isRead: false },
      { isRead: true }
    );
    res.json({ message: "All marked as read" });
  } catch (err) {
    res.status(500).json({ message: "Failed to mark all as read" });
  }
});

// DELETE: Clear all notifications
router.delete("/clear-all", protect, async (req, res) => {
  try {
    await Notification.deleteMany({ userId: req.user.id });
    res.json({ message: "All notifications cleared" });
  } catch (err) {
    res.status(500).json({ message: "Failed to clear notifications" });
  }
});

module.exports = router;
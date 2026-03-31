const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const Subscription = require("../models/Subscription");

// Save push subscription
router.post("/subscribe", protect, async (req, res) => {
  try {
    const { subscription } = req.body;
    const userId = req.user.id;

    // Update or create subscription for this user
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

module.exports = router;

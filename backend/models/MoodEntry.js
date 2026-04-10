const mongoose = require("mongoose");

const moodEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  mood: {
    type: String,
    enum: ["happy", "sad", "stressed", "anxious", "neutral", "overwhelmed", "lonely"],
    default: "neutral",
  },
  aiResponse: {
    support: String,
    habit: String,
    affirmation: String,
    task: String,
  },
  date: {
    type: String, // YYYY-MM-DD
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model("MoodEntry", moodEntrySchema);

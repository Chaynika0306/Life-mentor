const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const MoodEntry = require("../models/MoodEntry");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// POST /api/ai/checkin — Daily check-in
router.post("/checkin", protect, async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;
    const today = new Date().toISOString().split("T")[0];

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    // Build prompt for Gemini
    const prompt = `
You are a compassionate life mentor and emotional support assistant for a mental health counselling platform called "Life Mentor".

A user has shared how they are feeling today:
"${message}"

Your job is to:
1. Detect their mood (choose one: happy, sad, stressed, anxious, neutral, overwhelmed, lonely)
2. Provide warm emotional support (2-3 sentences, empathetic and kind)
3. Suggest 1 simple daily habit
4. Give 1 powerful affirmation
5. Suggest 1 small achievable task for today

IMPORTANT: Always remind the user that professional counselling is available if they need deeper support.
Never give medical advice.

Respond ONLY in this exact JSON format:
{
  "mood": "stressed",
  "support": "It's completely okay to feel stressed sometimes. You are doing your best and that is enough. Take a deep breath — you've got this.",
  "habit": "Spend 5 minutes in deep breathing or meditation today.",
  "affirmation": "I am calm, capable, and in control of my emotions.",
  "task": "Write down 3 things you are grateful for right now."
}
`;

    // Call Gemini API
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Parse JSON from Gemini response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid AI response format");
    }

    const aiData = JSON.parse(jsonMatch[0]);

    // Save to MongoDB
    const entry = await MoodEntry.create({
      userId,
      message,
      mood: aiData.mood,
      aiResponse: {
        support: aiData.support,
        habit: aiData.habit,
        affirmation: aiData.affirmation,
        task: aiData.task,
      },
      date: today,
    });

    res.status(201).json({
      mood: aiData.mood,
      support: aiData.support,
      habit: aiData.habit,
      affirmation: aiData.affirmation,
      task: aiData.task,
      date: today,
    });

  } catch (err) {
    console.error("AI checkin error:", err.message);
    res.status(500).json({ message: "AI service error. Please try again." });
  }
});

// GET /api/ai/history — Get mood history for logged in user
router.get("/history", protect, async (req, res) => {
  try {
    const entries = await MoodEntry.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(7); // Last 7 entries
    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch history" });
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const MoodEntry = require("../models/MoodEntry");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// POST /api/ai/checkin
router.post("/checkin", protect, async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;
    const today = new Date().toISOString().split("T")[0];

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    const prompt = `
You are a compassionate life mentor and emotional support assistant for a mental health counselling platform called "Life Mentor".

A user has shared how they are feeling today:
"${message}"

Your job is to:
1. Detect their mood (choose exactly one: happy, sad, stressed, anxious, neutral, overwhelmed, lonely)
2. Provide warm emotional support (2-3 sentences, empathetic and kind)
3. Suggest 1 simple daily habit (practical, achievable)
4. Give 1 powerful affirmation (positive, present tense)
5. Suggest 1 small achievable task for today

Rules:
- Never give medical advice
- Always be warm, empathetic and non-judgmental
- Keep responses concise and actionable
- Respond ONLY with valid JSON, no extra text, no markdown backticks

Respond in this EXACT JSON format:
{"mood":"stressed","support":"It is completely okay to feel stressed sometimes. You are doing your best and that is enough. Take a deep breath — you have got this.","habit":"Spend 5 minutes in deep breathing or meditation today.","affirmation":"I am calm, capable, and in control of my emotions.","task":"Write down 3 things you are grateful for right now."}
`;

    // Try gemini-1.5-flash first, fallback to gemini-pro
    let text = "";
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      text = result.response.text();
    } catch (modelErr) {
      console.log("Trying fallback model...");
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(prompt);
      text = result.response.text();
    }

    // Clean response — remove any markdown backticks if present
    const cleaned = text.replace(/```json|```/g, "").trim();

    // Extract JSON
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("Raw AI response:", text);
      throw new Error("Could not parse AI response");
    }

    const aiData = JSON.parse(jsonMatch[0]);

    // Validate required fields
    const required = ["mood", "support", "habit", "affirmation", "task"];
    for (const field of required) {
      if (!aiData[field]) throw new Error(`Missing field: ${field}`);
    }

    // Validate mood value
    const validMoods = ["happy", "sad", "stressed", "anxious", "neutral", "overwhelmed", "lonely"];
    if (!validMoods.includes(aiData.mood)) {
      aiData.mood = "neutral";
    }

    // Save to MongoDB
    await MoodEntry.create({
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
    res.status(500).json({
      message: "AI service error. Please try again in a moment.",
      error: err.message,
    });
  }
});

// GET /api/ai/history
router.get("/history", protect, async (req, res) => {
  try {
    const entries = await MoodEntry.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(7);
    res.json(entries);
  } catch (err) {
    console.error("History error:", err);
    res.status(500).json({ message: "Failed to fetch history" });
  }
});

module.exports = router;

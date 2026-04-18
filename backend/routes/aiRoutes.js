const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const MoodEntry = require("../models/MoodEntry");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/checkin", protect, async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;
    const today = new Date().toISOString().split("T")[0];

    if (!message) return res.status(400).json({ message: "Message is required" });

    const prompt = `You are a compassionate life mentor on a mental health platform called Life Mentor.

A user says: "${message}"

Respond ONLY with this exact JSON (no markdown, no backticks, no extra text):
{"mood":"stressed","support":"Your warm 2-3 sentence empathetic response here.","habit":"One simple daily habit suggestion.","affirmation":"One powerful positive affirmation.","task":"One small achievable task for today."}

Rules:
- mood must be exactly one of: happy, sad, stressed, anxious, neutral, overwhelmed, lonely
- Never give medical advice
- Be warm and non-judgmental
- Output ONLY the JSON object, nothing else`;

    // Try multiple models in order
    const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];
    let text = null;

    for (const modelName of models) {
      try {
        console.log(`Trying model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        text = result.response.text().trim();
        console.log(`Success with model: ${modelName}`);
        console.log(`Raw response: ${text.substring(0, 200)}`);
        break;
      } catch (modelErr) {
        console.log(`Model ${modelName} failed:`, modelErr.message);
      }
    }

    if (!text) {
      return res.status(500).json({ message: "All AI models failed. Please check your GEMINI_API_KEY." });
    }

    // Clean response thoroughly
    let cleaned = text
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .replace(/^\s*[\r\n]/gm, "")
      .trim();

    // Extract JSON object
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start === -1 || end === -1) {
      console.error("No JSON found in response:", cleaned);
      return res.status(500).json({ message: "Could not parse AI response. Please try again." });
    }

    const jsonStr = cleaned.substring(start, end + 1);
    const aiData = JSON.parse(jsonStr);

    // Validate fields
    const validMoods = ["happy", "sad", "stressed", "anxious", "neutral", "overwhelmed", "lonely"];
    if (!validMoods.includes(aiData.mood)) aiData.mood = "neutral";

    const required = ["mood", "support", "habit", "affirmation", "task"];
    for (const f of required) {
      if (!aiData[f]) aiData[f] = "Not available";
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
    res.status(500).json({ message: "AI error: " + err.message });
  }
});

router.get("/history", protect, async (req, res) => {
  try {
    const entries = await MoodEntry.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(7);
    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch history" });
  }
});

module.exports = router;

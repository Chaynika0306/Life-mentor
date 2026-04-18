const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const MoodEntry = require("../models/MoodEntry");

router.post("/checkin", protect, async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;
    const today = new Date().toISOString().split("T")[0];

    if (!message) return res.status(400).json({ message: "Message is required" });

    // Dynamically import to avoid startup crash if key missing
    const { GoogleGenerativeAI } = require("@google/generative-ai");
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY is not set in environment variables!");
      return res.status(500).json({ message: "AI service is not configured. Please contact support." });
    }

    console.log("GEMINI_API_KEY present:", apiKey.substring(0, 8) + "...");

    const genAI = new GoogleGenerativeAI(apiKey);

    const prompt = `You are a compassionate life mentor on a mental health platform called Life Mentor.

A user says: "${message}"

Respond ONLY with this exact JSON (no markdown, no backticks, no extra text):
{"mood":"stressed","support":"Your warm 2-3 sentence empathetic response here.","habit":"One simple daily habit suggestion.","affirmation":"One powerful positive affirmation.","task":"One small achievable task for today."}

Rules:
- mood must be exactly one of: happy, sad, stressed, anxious, neutral, overwhelmed, lonely
- Never give medical advice
- Be warm and non-judgmental
- Output ONLY valid JSON, nothing else`;

    const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];
    let text = null;
    let lastError = null;

    for (const modelName of models) {
      try {
        console.log(`Trying model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        text = result.response.text().trim();
        console.log(`✅ Success with: ${modelName}`);
        console.log(`Response preview: ${text.substring(0, 100)}`);
        break;
      } catch (err) {
        console.log(`❌ Model ${modelName} failed: ${err.message}`);
        lastError = err.message;
      }
    }

    if (!text) {
      return res.status(500).json({
        message: `AI unavailable: ${lastError}. Please try again later.`
      });
    }

    // Clean response
    let cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");

    if (start === -1 || end === -1) {
      console.error("No JSON in response:", cleaned);
      return res.status(500).json({ message: "Could not understand AI response. Please try again." });
    }

    const aiData = JSON.parse(cleaned.substring(start, end + 1));

    const validMoods = ["happy", "sad", "stressed", "anxious", "neutral", "overwhelmed", "lonely"];
    if (!validMoods.includes(aiData.mood)) aiData.mood = "neutral";

    await MoodEntry.create({
      userId,
      message,
      mood: aiData.mood,
      aiResponse: {
        support: aiData.support || "",
        habit: aiData.habit || "",
        affirmation: aiData.affirmation || "",
        task: aiData.task || "",
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

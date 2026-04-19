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

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: "AI service not configured." });
    }

    console.log("✅ GEMINI_API_KEY found, calling API...");

    const prompt = `You are a compassionate life mentor on a mental health platform called Life Mentor.

A user says: "${message}"

Respond ONLY with this exact JSON (no markdown, no backticks, no extra text):
{"mood":"neutral","support":"Your warm 2-3 sentence empathetic response here.","habit":"One simple daily habit suggestion.","affirmation":"One powerful positive affirmation.","task":"One small achievable task for today."}

Rules:
- mood must be exactly one of: happy, sad, stressed, anxious, neutral, overwhelmed, lonely
- Never give medical advice
- Be warm and non-judgmental
- Output ONLY valid JSON, nothing else`;

    // Try models in order — gemini-2.5-flash first (has separate quota)
    const models = [
      "gemini-2.5-flash",
      "gemini-2.5-flash-lite-preview-06-17",
      "gemini-2.0-flash",
      "gemini-2.0-flash-lite",
    ];

    let text = null;
    let quotaExceeded = false;

    for (const modelName of models) {
      try {
        console.log(`Trying: ${modelName}`);

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 400,
              },
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          const errMsg = data?.error?.message || "";
          console.log(`❌ ${modelName}: ${errMsg.substring(0, 80)}`);

          if (errMsg.includes("quota") || errMsg.includes("exceeded")) {
            quotaExceeded = true;
            continue; // try next model
          }
          continue;
        }

        const candidate = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidate && candidate.trim()) {
          text = candidate.trim();
          console.log(`✅ Success: ${modelName}`);
          quotaExceeded = false;
          break;
        }
      } catch (err) {
        console.log(`❌ ${modelName} error: ${err.message}`);
      }
    }

    if (!text) {
      if (quotaExceeded) {
        return res.status(429).json({
          message: "AI daily limit reached. Please try again tomorrow or contact support. 🙏"
        });
      }
      return res.status(500).json({
        message: "AI is unavailable right now. Please try again in a few minutes."
      });
    }

    // Clean and parse
    let cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");

    if (start === -1 || end === -1) {
      return res.status(500).json({ message: "Unexpected AI response. Please try again." });
    }

    const aiData = JSON.parse(cleaned.substring(start, end + 1));
    const validMoods = ["happy", "sad", "stressed", "anxious", "neutral", "overwhelmed", "lonely"];
    if (!validMoods.includes(aiData.mood)) aiData.mood = "neutral";

    await MoodEntry.create({
      userId, message, mood: aiData.mood,
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
    res.status(500).json({ message: "Server error: " + err.message });
  }
});

router.get("/history", protect, async (req, res) => {
  try {
    const entries = await MoodEntry.find({ userId: req.user.id })
      .sort({ createdAt: -1 }).limit(7);
    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch history" });
  }
});

module.exports = router;

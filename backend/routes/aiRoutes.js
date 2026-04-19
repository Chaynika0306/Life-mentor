const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const MoodEntry = require("../models/MoodEntry");

// ── MOOD DETECTION ──────────────────────────────────────
const moodKeywords = {
  happy: ["happy", "great", "amazing", "wonderful", "excited", "joy", "good", "fantastic", "blessed", "grateful", "love", "cheerful", "positive", "energetic", "proud", "content"],
  sad: ["sad", "cry", "crying", "tears", "depressed", "unhappy", "miserable", "heartbroken", "grief", "loss", "lonely", "alone", "hopeless", "empty", "broken"],
  stressed: ["stress", "stressed", "pressure", "deadline", "overload", "burden", "tension", "tight", "overwhelm", "hectic", "busy", "rush", "panic", "frantic"],
  anxious: ["anxious", "anxiety", "worry", "worried", "nervous", "fear", "scared", "afraid", "uneasy", "restless", "overthinking", "panic", "dread", "uncertain"],
  overwhelmed: ["overwhelmed", "too much", "cant handle", "can't handle", "falling apart", "breaking down", "exhausted", "drained", "done", "give up", "no energy", "tired of everything"],
  lonely: ["lonely", "alone", "isolated", "nobody", "no one", "no friends", "left out", "abandoned", "ignored", "invisible", "disconnected", "unwanted"],
  angry: ["angry", "anger", "mad", "furious", "frustrated", "irritated", "annoyed", "rage", "upset", "hate", "fed up"],
};

const detectMood = (message) => {
  const lower = message.toLowerCase();
  for (const [mood, keywords] of Object.entries(moodKeywords)) {
    if (keywords.some(kw => lower.includes(kw))) return mood;
  }
  return "neutral";
};

// ── RESPONSE LIBRARY ────────────────────────────────────
const responses = {
  happy: {
    support: "That's wonderful to hear! 😊 Your happiness is contagious and it's beautiful that you're in such a positive space today. Hold onto this feeling and let it fuel your day.",
    habits: [
      "Write down 3 things that made you smile today.",
      "Share your positive energy with someone who might need it.",
      "Take a 10-minute walk and soak in the good mood.",
      "Do one creative thing you enjoy today.",
    ],
    affirmations: [
      "I radiate joy and positivity wherever I go.",
      "I am grateful for this happiness and I deserve it.",
      "Good things are flowing into my life naturally.",
      "I am at peace with myself and the world around me.",
    ],
    tasks: [
      "Send a kind message to someone you care about.",
      "Plan something fun for your week ahead.",
      "Write a gratitude list of 5 things you appreciate.",
      "Do something today that your future self will thank you for.",
    ],
  },
  sad: {
    support: "I hear you, and I want you to know that it's completely okay to feel sad. 💙 Your feelings are valid and you don't have to rush through them. Be gentle with yourself today — healing takes time.",
    habits: [
      "Allow yourself to feel without judgment — sadness is not weakness.",
      "Drink a warm cup of tea or water and sit quietly for 5 minutes.",
      "Step outside for even 5 minutes of fresh air and sunlight.",
      "Write in a journal — let your feelings flow onto the page.",
    ],
    affirmations: [
      "This feeling is temporary. I will feel better again.",
      "I am worthy of love and kindness, especially from myself.",
      "My emotions are valid and I allow myself to heal.",
      "I am stronger than I know, even on the hardest days.",
    ],
    tasks: [
      "Watch or read something that brings you comfort.",
      "Reach out to one person you trust today.",
      "Do one small act of self-care — a warm bath, your favourite food.",
      "Write a letter to yourself with kindness and compassion.",
    ],
  },
  stressed: {
    support: "Stress can feel so heavy, but you're not alone in this. 🌿 The fact that you're here, acknowledging how you feel, is already a brave step. Let's take this one breath at a time.",
    habits: [
      "Try box breathing: inhale 4 counts, hold 4, exhale 4, hold 4.",
      "Write down everything on your mind to get it out of your head.",
      "Take a 5-minute break from screens and just breathe.",
      "Prioritise your tasks — do only the most important one first.",
    ],
    affirmations: [
      "I can only do one thing at a time, and that is enough.",
      "I am capable of handling whatever comes my way.",
      "This stress is temporary. I will get through this.",
      "I choose to release tension and welcome calm.",
    ],
    tasks: [
      "Make a to-do list and cross off just one item today.",
      "Set a timer for 25 minutes, focus on one task, then take a break.",
      "Say no to one non-essential thing today.",
      "Take 10 slow, deep breaths right now before anything else.",
    ],
  },
  anxious: {
    support: "Anxiety can make everything feel uncertain and scary, but right here, right now, you are safe. 💚 Your mind is trying to protect you. Let's ground you back to the present moment.",
    habits: [
      "Try the 5-4-3-2-1 technique: name 5 things you see, 4 you touch, 3 you hear.",
      "Place your feet flat on the floor and feel the ground beneath you.",
      "Limit caffeine today — it can amplify anxious feelings.",
      "Spend 10 minutes in nature or by a window with natural light.",
    ],
    affirmations: [
      "I am safe in this moment. Right now, I am okay.",
      "I release what I cannot control and trust the process.",
      "My anxiety does not define me. I am bigger than my fears.",
      "I breathe in calm and breathe out worry.",
    ],
    tasks: [
      "Write down your worry, then write what you CAN control about it.",
      "Do a 5-minute guided breathing exercise.",
      "Talk to someone you trust about how you're feeling.",
      "Do one gentle physical activity — a short walk or gentle stretching.",
    ],
  },
  overwhelmed: {
    support: "When everything feels like too much, it's okay to pause. 🌊 You don't have to solve everything today. Right now, all you have to do is breathe and take one small step forward.",
    habits: [
      "Give yourself permission to rest — rest is productive too.",
      "Do only ONE thing today. Just one. That's enough.",
      "Put your phone down for 30 minutes and be still.",
      "Eat something nourishing and drink water — basic care matters.",
    ],
    affirmations: [
      "I do not have to do everything. I just have to do one thing.",
      "It is okay to slow down. I give myself permission to rest.",
      "I am not falling behind — I am taking care of myself.",
      "I am enough, even when I feel like I'm not doing enough.",
    ],
    tasks: [
      "Write down everything overwhelming you, then pick just ONE to address.",
      "Ask for help with something — you don't have to carry it alone.",
      "Cancel or reschedule one non-urgent commitment today.",
      "Lie down for 10 minutes with your eyes closed and just breathe.",
    ],
  },
  lonely: {
    support: "Loneliness can feel so isolating, but the fact that you're sharing this means you're reaching out — and that takes courage. 💙 You matter more than you know, and connection is possible.",
    habits: [
      "Reach out to one person today — even a short message counts.",
      "Join an online community around something you love.",
      "Be kind to yourself today as you would be to a good friend.",
      "Spend time doing something that makes you feel alive and present.",
    ],
    affirmations: [
      "I am worthy of deep and meaningful connection.",
      "I am never truly alone — I carry love within me.",
      "My presence matters and I bring value to the world.",
      "I am open to new connections and friendships.",
    ],
    tasks: [
      "Send one message to someone you haven't spoken to in a while.",
      "Do one activity you enjoy in a social setting.",
      "Write a letter to yourself about your best qualities.",
      "Explore a community group or class around your interests.",
    ],
  },
  angry: {
    support: "It's completely valid to feel angry — anger often signals that something important to you has been crossed. 🔥 Let's channel this energy constructively so it doesn't burn you from inside.",
    habits: [
      "Take 10 slow deep breaths before responding to anything.",
      "Go for a brisk walk or do some physical movement to release tension.",
      "Write out exactly what you're feeling without holding back.",
      "Step away from the situation for at least 20 minutes before reacting.",
    ],
    affirmations: [
      "I choose to respond, not react. I am in control of my actions.",
      "My anger is valid but I will not let it control me.",
      "I release this anger and choose peace for myself.",
      "I am bigger than this situation.",
    ],
    tasks: [
      "Write an angry letter — then don't send it. Just let it out.",
      "Do 10 jumping jacks or push-ups to release physical tension.",
      "Talk to someone neutral about what happened.",
      "Wait 24 hours before making any big decisions.",
    ],
  },
  neutral: {
    support: "Thank you for checking in today. 🌿 Sometimes life is just... steady — and that's perfectly okay. Not every day needs to be extraordinary. Today, let's focus on small meaningful moments.",
    habits: [
      "Set one small intention for today and follow through with it.",
      "Take a mindful 10-minute walk without your phone.",
      "Drink enough water and eat something nourishing today.",
      "Do one thing that brings you quiet joy.",
    ],
    affirmations: [
      "I am present, grounded, and at peace with today.",
      "Small steps forward still count as progress.",
      "I choose to find meaning in the ordinary moments.",
      "I am exactly where I need to be right now.",
    ],
    tasks: [
      "Do one productive thing you've been putting off.",
      "Connect with someone you care about today.",
      "Spend 5 minutes in gratitude — what's going right?",
      "Learn or try one small new thing today.",
    ],
  },
};

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ── POST /api/ai/checkin ────────────────────────────────
router.post("/checkin", protect, async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;
    const today = new Date().toISOString().split("T")[0];

    if (!message) return res.status(400).json({ message: "Message is required" });

    const mood = detectMood(message);
    const r = responses[mood] || responses.neutral;

    const support = r.support;
    const habit = getRandom(r.habits);
    const affirmation = getRandom(r.affirmations);
    const task = getRandom(r.tasks);

    await MoodEntry.create({
      userId, message, mood,
      aiResponse: { support, habit, affirmation, task },
      date: today,
    });

    console.log(`✅ AI Coach response — mood: ${mood}`);

    res.status(201).json({ mood, support, habit, affirmation, task, date: today });

  } catch (err) {
    console.error("AI checkin error:", err.message);
    res.status(500).json({ message: "Server error: " + err.message });
  }
});

// ── GET /api/ai/history ─────────────────────────────────
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

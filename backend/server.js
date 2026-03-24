require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Routes
const authRoutes = require("./routes/authRoutes");
const counsellorRoutes = require("./routes/counsellorRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const counsellorProfileRoutes = require("./routes/counsellorProfileRoutes");
const ratingRoutes = require("./routes/ratingRoutes");

const app = express();

/* ================= MIDDLEWARES ================= */

// CORS
app.use(
  cors({
    origin: "https://life-mentor-beryl.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Body parser
app.use(express.json());

/* ================= DATABASE ================= */

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.log("❌ Mongo Error:", err.message));

/* ================= ROUTES ================= */

// Test route
app.get("/api/lifementor", (req, res) => {
  res.json({
    name: "Life Mentor",
    message: "Counselling Backend Connected Successfully 🚀",
    services: ["Career", "Marriage", "Life Coaching"],
  });
});

// Auth routes (signup / login)
app.use("/api/auth", authRoutes);

// Counsellor routes
app.use("/api/counsellors", counsellorRoutes);

// Appointment routes
app.use("/api/appointments", appointmentRoutes);

// Admin routes
app.use("/api/admin", adminRoutes);

// Counsellor Profile routes
app.use("/api/profile", counsellorProfileRoutes);

app.use("/uploads", express.static("uploads"));

app.use("/api/ratings", ratingRoutes);
/* ================= SERVER ================= */

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

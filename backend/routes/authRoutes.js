const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const sendEmail = require("../utils/email");

const { signup, login } = require("../controllers/authController");

router.post("/signup", signup);
router.post("/login", login);

// ── STEP 1: Send OTP to email ───────────────────────────
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists — security best practice
      return res.json({ message: "If this email exists, an OTP has been sent." });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to user
    user.resetOTP = otp;
    user.resetOTPExpiry = expiry;
    await user.save();

    // Send OTP email
    await sendEmail(
      email,
      "🔐 Your Life Mentor Password Reset OTP",
      "",
      `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2c6e5a;">Password Reset Request 🔐</h2>
        <p>Hello <strong>${user.name}</strong>,</p>
        <p>We received a request to reset your Life Mentor password. Use the OTP below:</p>
        <div style="background: #f5faf8; border-radius: 12px; padding: 30px; margin: 20px 0; text-align: center;">
          <p style="font-size: 14px; color: #6aab99; margin-bottom: 8px;">Your One-Time Password</p>
          <h1 style="font-size: 48px; color: #2c6e5a; letter-spacing: 12px; margin: 0;">${otp}</h1>
          <p style="font-size: 13px; color: #999; margin-top: 12px;">Valid for 10 minutes only</p>
        </div>
        <p style="color: #e05555; font-size: 13px;">⚠️ If you did not request this, please ignore this email. Your password will remain unchanged.</p>
        <p style="color: #6aab99; font-style: italic;">— Life Mentor Platform 💚</p>
      </div>
      `
    );

    console.log(`✅ OTP sent to ${email}`);
    res.json({ message: "If this email exists, an OTP has been sent." });

  } catch (err) {
    console.error("Forgot password error:", err.message);
    res.status(500).json({ message: "Server error. Please try again." });
  }
});

// ── STEP 2: Verify OTP ──────────────────────────────────
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required" });

    const user = await User.findOne({ email });
    if (!user || !user.resetOTP) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Check expiry
    if (new Date() > user.resetOTPExpiry) {
      user.resetOTP = null;
      user.resetOTPExpiry = null;
      await user.save();
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    // Check OTP
    if (user.resetOTP !== otp) {
      return res.status(400).json({ message: "Incorrect OTP. Please try again." });
    }

    res.json({ message: "OTP verified successfully", verified: true });

  } catch (err) {
    console.error("Verify OTP error:", err.message);
    res.status(500).json({ message: "Server error. Please try again." });
  }
});

// ── STEP 3: Reset Password ──────────────────────────────
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ email });
    if (!user || !user.resetOTP) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    if (new Date() > user.resetOTPExpiry) {
      user.resetOTP = null;
      user.resetOTPExpiry = null;
      await user.save();
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    if (user.resetOTP !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Hash new password and save
    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    user.resetOTP = null;
    user.resetOTPExpiry = null;
    await user.save();

    console.log(`✅ Password reset for ${email}`);
    res.json({ message: "Password reset successfully! You can now login." });

  } catch (err) {
    console.error("Reset password error:", err.message);
    res.status(500).json({ message: "Server error. Please try again." });
  }
});

module.exports = router;

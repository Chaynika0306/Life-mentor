import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setAuth } from "../utils/auth";
import "../App.css";

const BACKEND = "https://life-mentor-backend.onrender.com";

function Login() {
  const navigate = useNavigate();

  // Screens: "login" | "forgot" | "otp" | "reset" | "success"
  const [screen, setScreen] = useState("login");

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [fpEmail, setFpEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" }); // type: success | error

  const showMsg = (text, type = "error") => setMessage({ text, type });
  const clearMsg = () => setMessage({ text: "", type: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ── LOGIN ──────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearMsg();
    try {
      const res = await fetch(`${BACKEND}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setAuth(data.token, data.user);
        navigate("/dashboard-home");
      } else {
        showMsg(data.message || "Login failed");
      }
    } catch {
      showMsg("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── SEND OTP ───────────────────────────────────────────
  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!fpEmail) return showMsg("Please enter your email");
    setLoading(true);
    clearMsg();
    try {
      const res = await fetch(`${BACKEND}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: fpEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        showMsg("OTP sent to your email! Check your inbox.", "success");
        setTimeout(() => { clearMsg(); setScreen("otp"); }, 1500);
      } else {
        showMsg(data.message || "Failed to send OTP");
      }
    } catch {
      showMsg("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── VERIFY OTP ─────────────────────────────────────────
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp) return showMsg("Please enter the OTP");
    setLoading(true);
    clearMsg();
    try {
      const res = await fetch(`${BACKEND}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: fpEmail, otp }),
      });
      const data = await res.json();
      if (res.ok) {
        showMsg("OTP verified! Set your new password.", "success");
        setTimeout(() => { clearMsg(); setScreen("reset"); }, 1500);
      } else {
        showMsg(data.message || "Invalid OTP");
      }
    } catch {
      showMsg("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── RESET PASSWORD ─────────────────────────────────────
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) return showMsg("Please fill all fields");
    if (newPassword !== confirmPassword) return showMsg("Passwords do not match");
    if (newPassword.length < 6) return showMsg("Password must be at least 6 characters");
    setLoading(true);
    clearMsg();
    try {
      const res = await fetch(`${BACKEND}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: fpEmail, otp, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setScreen("success");
      } else {
        showMsg(data.message || "Failed to reset password");
      }
    } catch {
      showMsg("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">

        {/* ── LOGIN SCREEN ── */}
        {screen === "login" && (
          <>
            <h1>Life Mentor</h1>
            <h2>Login</h2>
            <form className="auth-form" onSubmit={handleLogin}>
              <input
                type="email" name="email" placeholder="Email"
                onChange={handleChange} required
              />
              <input
                type="password" name="password" placeholder="Password"
                onChange={handleChange} required
              />
              <button type="submit" className="primary-btn" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            {/* Forgot Password link */}
            <p
              className="forgot-password-link"
              onClick={() => { clearMsg(); setScreen("forgot"); }}
            >
              Forgot Password?
            </p>

            <p className="auth-switch">
              Don't have an account?
              <span className="auth-link" onClick={() => navigate("/signup")}> Signup</span>
            </p>
          </>
        )}

        {/* ── FORGOT PASSWORD SCREEN ── */}
        {screen === "forgot" && (
          <>
            <div className="fp-icon">🔐</div>
            <h1>Forgot Password?</h1>
            <p className="fp-subtitle">Enter your registered email and we'll send you an OTP.</p>
            <form className="auth-form" onSubmit={handleSendOTP}>
              <input
                type="email" placeholder="Enter your email"
                value={fpEmail}
                onChange={(e) => setFpEmail(e.target.value)}
                required
              />
              <button type="submit" className="primary-btn" disabled={loading}>
                {loading ? "Sending OTP..." : "Send OTP 📧"}
              </button>
            </form>
            <p className="auth-switch">
              Remember it?
              <span className="auth-link" onClick={() => { clearMsg(); setScreen("login"); }}> Back to Login</span>
            </p>
          </>
        )}

        {/* ── OTP VERIFICATION SCREEN ── */}
        {screen === "otp" && (
          <>
            <div className="fp-icon">📬</div>
            <h1>Check Your Email</h1>
            <p className="fp-subtitle">We sent a 6-digit OTP to <strong>{fpEmail}</strong>. Enter it below.</p>
            <form className="auth-form" onSubmit={handleVerifyOTP}>
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                style={{ letterSpacing: "8px", textAlign: "center", fontSize: "20px" }}
                required
              />
              <button type="submit" className="primary-btn" disabled={loading}>
                {loading ? "Verifying..." : "Verify OTP ✅"}
              </button>
            </form>
            <p className="auth-switch">
              Didn't receive it?
              <span className="auth-link" onClick={() => { clearMsg(); setScreen("forgot"); }}> Resend OTP</span>
            </p>
          </>
        )}

        {/* ── RESET PASSWORD SCREEN ── */}
        {screen === "reset" && (
          <>
            <div className="fp-icon">🔑</div>
            <h1>Set New Password</h1>
            <p className="fp-subtitle">Choose a strong new password for your account.</p>
            <form className="auth-form" onSubmit={handleResetPassword}>
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button type="submit" className="primary-btn" disabled={loading}>
                {loading ? "Resetting..." : "Reset Password 🔐"}
              </button>
            </form>
          </>
        )}

        {/* ── SUCCESS SCREEN ── */}
        {screen === "success" && (
          <div className="fp-success">
            <div className="fp-icon">🎉</div>
            <h1>Password Reset!</h1>
            <p className="fp-subtitle">Your password has been successfully changed. You can now login with your new password.</p>
            <button
              className="primary-btn"
              style={{ width: "100%", marginTop: "16px" }}
              onClick={() => { setScreen("login"); clearMsg(); setOtp(""); setNewPassword(""); setConfirmPassword(""); }}
            >
              Back to Login →
            </button>
          </div>
        )}

        {/* Message box */}
        {message.text && (
          <div className={message.type === "success" ? "success-popup" : "error-popup"}>
            {message.text}
          </div>
        )}

      </div>
    </div>
  );
}

export default Login;

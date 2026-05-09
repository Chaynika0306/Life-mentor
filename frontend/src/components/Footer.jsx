import { useNavigate } from "react-router-dom";
import { getToken, logout } from "../utils/auth";

function Footer() {
  const navigate = useNavigate();
  const token = getToken();

  const handleLogout = () => {
    logout();
    navigate("/");
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);
  };

  return (
    <footer id="contact" className="footer">

      {/* ── AI DISCLAIMER BANNER ─────────────────────────────────────────── */}
      <div style={{
        background: "rgba(255,255,255,0.05)",
        borderTop: "1px solid rgba(255,255,255,0.1)",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        padding: "20px 40px",
        textAlign: "center",
        maxWidth: "860px",
        margin: "0 auto 10px auto",
      }}>
        <p style={{
          fontSize: "13px",
          color: "rgba(255,255,255,0.6)",
          lineHeight: "1.8",
          margin: 0,
        }}>
          <span style={{
            display: "inline-block",
            background: "rgba(106,171,153,0.2)",
            border: "1px solid rgba(106,171,153,0.4)",
            borderRadius: "20px",
            padding: "2px 12px",
            fontSize: "11px",
            fontWeight: "700",
            color: "#6aab99",
            letterSpacing: "0.08em",
            marginBottom: "10px",
          }}>
            🤖 AI DISCLAIMER
          </span>
          <br />
          Our <strong style={{ color: "rgba(255,255,255,0.8)" }}>AI Life Coach</strong> is designed to provide <strong style={{ color: "rgba(255,255,255,0.8)" }}>general guidance and mood-based support</strong> — it is not a substitute for professional mental health care.
          The AI offers generic responses to help you reflect and feel heard in the moment.{" "}
          <span style={{ color: "#6aab99" }}>
            For real, personalized advice and proper counselling, we strongly encourage you to{" "}
            <span
              onClick={() => navigate("/book")}
              style={{
                textDecoration: "underline",
                cursor: "pointer",
                fontWeight: "600",
                color: "#a8d5c8",
              }}
            >
              book a session with our counsellor
            </span>
            {" "}who will truly listen and guide you.
          </span>
        </p>
      </div>

      <div className="footer-inner">

        {/* COL 1 - Brand */}
        <div className="footer-col">
          <div className="footer-brand">
            <img src="/images/logo.png" alt="Life Mentor Logo" className="footer-logo-img" />
            <span className="footer-brand-name">LIFE MENTOR</span>
          </div>
          <p className="footer-tagline">
            Your mind deserves peace. <br />
            We're here to help you find it.
          </p>
        </div>

        {/* COL 2 - Contact */}
        <div className="footer-col">
          <h3>Contact Us</h3>
          <a href="mailto:lifementor0306@gmail.com" className="footer-link">
            📧 lifementor0306@gmail.com
          </a>
        </div>

        {/* COL 3 - Follow Us */}
        <div className="footer-col">
          <h3>Follow Us</h3>
          <a
            href="https://www.instagram.com/YOUR_INSTAGRAM_HERE"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link footer-social"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <circle cx="12" cy="12" r="4"/>
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
            </svg>
            Instagram
          </a>
          <a
            href="https://www.youtube.com/@YOUR_YOUTUBE_HERE"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link footer-social"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23 7s-.3-2-1.2-2.8c-1.1-1.2-2.4-1.2-3-1.3C16.4 2.8 12 2.8 12 2.8s-4.4 0-6.8.1c-.6.1-1.9.1-3 1.3C1.3 5 1 7 1 7S.7 9.1.7 11.3v2c0 2.1.3 4.2.3 4.2s.3 2 1.2 2.8c1.1 1.2 2.6 1.1 3.3 1.2C7.4 21.7 12 21.7 12 21.7s4.4 0 6.8-.2c.6-.1 1.9-.1 3-1.3.9-.8 1.2-2.8 1.2-2.8s.3-2.1.3-4.2v-2C23.3 9.1 23 7 23 7zM9.7 15.5V8.4l8.1 3.6-8.1 3.5z"/>
            </svg>
            YouTube
          </a>
        </div>

        {/* COL 4 - Quick Links */}
        <div className="footer-col">
          <h3>Quick Links</h3>
          <a href="/" className="footer-link">🏠 Home</a>
          <a href="/login" className="footer-link">🔐 Login / Signup</a>
          {token ? (
            <a
              onClick={handleLogout}
              className="footer-link"
              style={{ cursor: "pointer", color: "#e05555" }}
            >
              🚪 Logout
            </a>
          ) : null}
        </div>

      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <p>© 2025 Life Mentor. All rights reserved.</p>
        <p>Made with ❤️ for mental wellness</p>
      </div>
    </footer>
  );
}

export default Footer;
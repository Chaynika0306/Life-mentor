import { useNavigate } from "react-router-dom";
import { getToken, getUser, logout } from "../utils/auth";
import PageWrapper from "../components/PageWrapper";
import usePushNotification from "../utils/usePushNotification";
import "../App.css";

function DashboardHome() {
  const navigate = useNavigate();
  const token = getToken();
  const user = getUser();
  usePushNotification();

  if (!token) { navigate("/login"); return null; }

  return (
    <PageWrapper>
      <div className="dashboard-page">
        <div className="dashboard-box">

          {/* Header */}
          <h1>Life Mentor</h1>
          <p className="dashboard-welcome">
            Welcome back, <strong>{user?.name}</strong> 👋
          </p>

          {/* BUTTONS */}
          <div className="dashboard-actions">

            {/* CLIENT OPTIONS */}
            {user?.role === "client" && (
              <>
                <button className="primary-btn" onClick={() => navigate("/book-session")}>
                  📅 Book a Session
                </button>
                <button className="primary-btn" onClick={() => navigate("/my-appointments")}>
                  🗂️ My Appointments
                </button>
                <button className="primary-btn" onClick={() => navigate("/rate-session")}>
                  ⭐ Rate Your Experience
                </button>

                {/* AI Coach teaser */}
                <div className="dashboard-feature-card" onClick={() => navigate("/ai-coach")}>
                  <div className="dashboard-feature-icon">🧠</div>
                  <div className="dashboard-feature-text">
                    <p className="dashboard-feature-title">AI Life Coach</p>
                    <p className="dashboard-feature-desc">Check in with your emotions daily. Get personalized support, habits & affirmations.</p>
                  </div>
                  <span className="dashboard-feature-arrow">→</span>
                </div>

                {/* Resources teaser */}
                <div className="dashboard-feature-card" onClick={() => navigate("/resources")}>
                  <div className="dashboard-feature-icon">📚</div>
                  <div className="dashboard-feature-text">
                    <p className="dashboard-feature-title">Resource Library</p>
                    <p className="dashboard-feature-desc">Free exercises, guides & affirmations for anxiety, relationships, mindfulness & more.</p>
                  </div>
                  <span className="dashboard-feature-arrow">→</span>
                </div>
              </>
            )}

            {/* COUNSELLOR OPTIONS */}
            {user?.role === "counsellor" && (
              <>
                <button className="primary-btn" onClick={() => navigate("/dashboard")}>
                  📋 View Appointments
                </button>
                <button className="primary-btn" onClick={() => navigate("/ratings")}>
                  ⭐ View Ratings
                </button>
              </>
            )}

            {/* LOGOUT */}
            <button className="logout-btn" onClick={() => { logout(); navigate("/login"); }}>
              Logout
            </button>

            {/* Back to landing page */}
            <button
              className="back-to-home-btn"
              onClick={() => { navigate("/"); setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100); }}
            >
              🌐 Back to Website
            </button>

          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

export default DashboardHome;

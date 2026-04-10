import { useNavigate } from "react-router-dom";
import { getToken, getUser, logout } from "../utils/auth";
import PageWrapper from "../components/PageWrapper";
import usePushNotification from "../utils/usePushNotification";
import "../App.css";

function DashboardHome() {
  const navigate = useNavigate();
  const token = getToken();
  const user = getUser();
  usePushNotification(); // ← registers push notifications

  if (!token) {
    navigate("/login");
    return null;
  }

  return (
    <PageWrapper>
      <div className="dashboard-page">
        <div className="dashboard-box">

          {/* HEADER */}
          <h1>Life Mentor</h1>
          <p className="dashboard-welcome">
            Welcome, <strong>{user?.name}</strong>
          </p>

          {/* BUTTONS */}
          <div className="dashboard-actions">

            {/* CLIENT OPTIONS */}
            {user?.role === "client" && (
              <>
                <button className="primary-btn" onClick={() => navigate("/ai-coach")}>
                  🧠 AI Life Coach
                </button>
                <button className="primary-btn" onClick={() => navigate("/book-session")}>
                  📅 Book a Session
                </button>
                <button className="primary-btn" onClick={() => navigate("/my-appointments")}>
                  🗂️ My Appointments
                </button>
                <button className="primary-btn" onClick={() => navigate("/rate-session")}>
                  ⭐ Rate Your Experience
                </button>
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

            {/* VISIBLE TO ALL */}
            <button className="primary-btn" onClick={() => navigate("/profile")}>
              👤 About Counsellor
            </button>

            {/* LOGOUT */}
            <button
              className="logout-btn"
              onClick={() => { logout(); navigate("/login"); }}
            >
              Logout
            </button>

          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

export default DashboardHome;

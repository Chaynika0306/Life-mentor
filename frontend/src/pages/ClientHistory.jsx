import { useEffect, useState } from "react";
import { getToken } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import "../App.css";

function ClientHistory() {
  const navigate = useNavigate();
  const token = getToken();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    const res = await fetch("https://life-mentor-backend.onrender.com/api/appointments/my", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setAppointments(data);
    setLoading(false);
  };

  if (loading)
    return (
      <div className="appt-page">
        <h1>My Appointments</h1>
        <p className="appt-empty">Loading...</p>
      </div>
    );

  return (
    <div className="appt-page">
      <h1>My Appointments</h1>

      {appointments.length === 0 ? (
        <div className="appt-empty-box">
          <p>📭 No bookings yet.</p>
          <button className="primary-btn" onClick={() => navigate("/book-session")}>
            Book a Session
          </button>
        </div>
      ) : (
        <div className="appt-grid">
          {appointments.map((appt) => (
            <div key={appt._id} className="appt-card">
              <div className="appt-status-badge"
                style={{ background: appt.status === "Confirmed" ? "#e8f5e9" : "#fff8e1",
                         color: appt.status === "Confirmed" ? "#4caf50" : "#ffa500" }}>
                {appt.status === "Confirmed" ? "✅ Confirmed" : "⏳ Pending"}
              </div>
              <p><span>📅</span> <strong>Date:</strong> {appt.date}</p>
              <p><span>🕐</span> <strong>Time:</strong> {appt.time}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ClientHistory;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getToken, getUser } from "../utils/auth";
import PageWrapper from "../components/PageWrapper";
import "../App.css";

function BookSession() {
  const navigate = useNavigate();
  const token = getToken();
  const user = getUser();

  if (!token) { navigate("/login"); return null; }

  const today = new Date().toISOString().split("T")[0];
  const slots = ["10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00"];

  const [formData, setFormData] = useState({
    clientName: user?.name || "",
    clientEmail: user?.email || "",
    date: "",
    time: "",
  });

  const [bookedSlots, setBookedSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  useEffect(() => {
    if (!formData.date) return;
    fetch(`https://life-mentor-backend.onrender.com/api/appointments/booked-slots?date=${formData.date}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setBookedSlots(Array.isArray(data) ? data : []))
      .catch(() => setBookedSlots([]));
  }, [formData.date, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("https://life-mentor-backend.onrender.com/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setFormData({ ...formData, date: "", time: "" });
        setTimeout(() => { setSuccess(false); navigate("/"); }, 3000);
      } else {
        setMessage(data.message || "Something went wrong");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch {
      setMessage("Server error. Please try again.");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <div className="auth-page">
        <div className="auth-box book-session-box">

          <h1>Life Mentor</h1>
          <p className="dashboard-welcome">
            Welcome, <strong>{user?.name}</strong>
          </p>
          <h2>Book a Session</h2>

          <form className="auth-form" onSubmit={handleSubmit}>

            <div className="form-group">
              <label>Your Name</label>
              <input type="text" name="clientName" value={formData.clientName} disabled />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input type="email" name="clientEmail" value={formData.clientEmail} disabled />
            </div>

            <div className="form-group">
              <label>Select Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                min={today}
                required
              />
            </div>

            <div className="form-group">
              <label>Select Time</label>
              <select name="time" value={formData.time} onChange={handleChange} required>
                <option value="">Select Time</option>
                {slots.map((slot) => {
                  const isPast = formData.date === today && new Date(`${formData.date}T${slot}:00`) < new Date();
                  const isBooked = bookedSlots.includes(slot);
                  let label = `🟢 ${slot}`;
                  if (isBooked) label = `🔴 ${slot} — Booked`;
                  else if (isPast) label = `⚫ ${slot} — Passed`;
                  return <option key={slot} value={slot} disabled={isBooked || isPast}>{label}</option>;
                })}
              </select>
            </div>

            <button type="submit" className="primary-btn" disabled={loading || !formData.time}>
              {loading ? "Booking..." : "📅 Book Session"}
            </button>

          </form>

          {message && <div className="error-popup">{message}</div>}
          {success && <div className="success-popup">✅ Session booked successfully!</div>}

        </div>
      </div>
    </PageWrapper>
  );
}

export default BookSession;

import { useEffect, useState } from "react";
import { getToken, getUser, logout } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import "../App.css";

const BACKEND = "https://life-mentor-backend.onrender.com";

function NoteModal({ appt, onClose, onSaved }) {
  const token = getToken();
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetch(`${BACKEND}/api/session-notes/${appt._id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        if (data?.notes) setNote(data.notes);
        setFetching(false);
      })
      .catch(() => setFetching(false));
  }, []);

  const handleSave = async () => {
    if (!note.trim()) return;
    setLoading(true);
    try {
      await fetch(`${BACKEND}/api/session-notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          appointmentId: appt._id,
          clientName: appt.clientName,
          clientEmail: appt.clientEmail,
          sessionDate: appt.date,
          notes: note,
        }),
      });
      onSaved();
      onClose();
    } catch (err) {
      alert("Failed to save note");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="blog-modal-overlay" onClick={onClose}>
      <div className="blog-modal" onClick={e => e.stopPropagation()}>
        <button className="blog-modal-close" onClick={onClose}>✕</button>
        <div className="blog-modal-emoji">📝</div>
        <h2>Session Notes</h2>
        <p style={{ textAlign: "center", color: "#6aab99", fontSize: "14px", marginBottom: "16px" }}>
          {appt.clientName} · {appt.date} at {appt.time}
        </p>
        {fetching ? (
          <p style={{ textAlign: "center" }}>Loading...</p>
        ) : (
          <>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Add private session notes here... Only you can see these."
              rows={6}
              style={{
                width: "100%", padding: "14px", borderRadius: "12px",
                border: "1.5px solid #d0e8e0", fontSize: "14px",
                fontFamily: "'DM Sans', sans-serif", resize: "vertical",
                outline: "none", color: "#2c3e35", background: "#f5faf8",
              }}
            />
            <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
              <button className="primary-btn" style={{ flex: 1 }} onClick={handleSave} disabled={loading}>
                {loading ? "Saving..." : "💾 Save Notes"}
              </button>
              <button className="cancel-btn" onClick={onClose}>Cancel</button>
            </div>
            <p style={{ fontSize: "12px", color: "#a0b8b0", textAlign: "center", marginTop: "10px" }}>
              🔒 These notes are private and only visible to you
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const token = getToken();
  const user = getUser();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noteAppt, setNoteAppt] = useState(null);

  const fetchAppointments = async () => {
    try {
      const res = await fetch(`${BACKEND}/api/appointments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401 || res.status === 403) { logout(); navigate("/login"); return; }
      const data = await res.json();
      setAppointments(data);
      setLoading(false);
    } catch (error) {
      console.error("GET APPOINTMENTS ERROR:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token || user?.role !== "counsellor") { navigate("/login"); return; }
    fetchAppointments();
  }, [token, user, navigate]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this appointment?")) return;
    try {
      const res = await fetch(`${BACKEND}/api/appointments/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchAppointments();
      else alert("Delete failed");
    } catch (error) { console.error("Delete error", error); }
  };

  const handleConfirm = async (id) => {
    try {
      const res = await fetch(`${BACKEND}/api/appointments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: "Confirmed" }),
      });
      if (res.ok) fetchAppointments();
      else alert("Update failed");
    } catch (error) { console.error("Update error", error); }
  };

  if (loading)
    return (
      <div className="appt-page">
        <h1>Appointments Dashboard</h1>
        <p className="appt-empty">Loading...</p>
      </div>
    );

  return (
    <div className="appt-page">
      <h1>Appointments Dashboard</h1>

      {appointments.length === 0 ? (
        <p className="appt-empty">No appointments yet.</p>
      ) : (
        <div className="appt-grid">
          {appointments.map((appt) => (
            <div key={appt._id} className="appt-card">
              <h3>{appt.clientName}</h3>
              <p>📧 {appt.clientEmail}</p>
              <p>📅 {appt.date}</p>
              <p>🕐 {appt.time}</p>
              <p>
                Status:{" "}
                <strong style={{ color: appt.status === "Confirmed" ? "#4caf50" : "#ffa500" }}>
                  {appt.status}
                </strong>
              </p>

              <div className="appt-actions">
                {appt.status === "Pending" && (
                  <button className="confirm-btn" onClick={() => handleConfirm(appt._id)}>
                    ✅ Confirm
                  </button>
                )}
                <button className="delete-btn" onClick={() => handleDelete(appt._id)}>
                  🗑️ Delete
                </button>
              </div>

              {/* Session Notes button */}
              <button
                className="notes-btn"
                onClick={() => setNoteAppt(appt)}
              >
                📝 Session Notes
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Notes Modal */}
      {noteAppt && (
        <NoteModal
          appt={noteAppt}
          onClose={() => setNoteAppt(null)}
          onSaved={fetchAppointments}
        />
      )}
    </div>
  );
}

export default Dashboard;

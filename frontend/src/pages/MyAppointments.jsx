import { useEffect, useState } from "react";
import { getToken } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import "../App.css";

function MyAppointments() {
  const navigate = useNavigate();
  const token = getToken();

  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await fetch(
        "https://life-mentor-backend.onrender.com/api/appointments/my",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      setAppointments(data);
    } catch (error) {
      console.error("Error fetching appointments");
    }
  };

  return (
    <div className="container">
      <h1>My Appointments</h1>

      {appointments.length === 0 ? (
        <p>No bookings yet.</p>
      ) : (
        <div className="dashboard-list">
          {appointments.map((appt) => (
            <div key={appt._id} className="dashboard-card">
              <p><strong>Date:</strong> {appt.date}</p>
              <p><strong>Time:</strong> {appt.time}</p>
              <p>
                <strong>Status:</strong>{" "}
                <span
                  style={{
                    color:
                      appt.status === "Confirmed"
                        ? "#4caf50"
                        : "#ffa500",
                    fontWeight: "600",
                  }}
                >
                  {appt.status}
                </span>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyAppointments;
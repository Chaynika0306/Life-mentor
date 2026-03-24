import { useEffect, useState } from "react";
import { getToken, getUser } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import "../App.css";

function Admin() {
  const navigate = useNavigate();
  const token = getToken();
  const user = getUser();

  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    if (!token || user?.role !== "admin") {
      navigate("/login");
      return;
    }

    fetchData();
  }, []);

  const fetchData = async () => {
    const usersRes = await fetch("https://life-mentor-backend.onrender.com/api/admin/users", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const apptRes = await fetch("https://life-mentor-backend.onrender.com/api/admin/appointments", {
      headers: { Authorization: `Bearer ${token}` },
    });

    setUsers(await usersRes.json());
    setAppointments(await apptRes.json());
  };

  return (
    <div className="container">
      <h1>Admin Panel 👑</h1>

      <h2>Users</h2>
      {users.map((u) => (
        <div key={u._id} className="dashboard-card">
          <p>{u.name} ({u.role})</p>
        </div>
      ))}

      <h2>Appointments</h2>
      {appointments.map((a) => (
        <div key={a._id} className="dashboard-card">
          <p>{a.clientName} - {a.date} - {a.time}</p>
        </div>
      ))}
    </div>
  );
}

export default Admin;
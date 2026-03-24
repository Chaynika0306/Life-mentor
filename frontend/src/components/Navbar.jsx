import { Link, useNavigate } from "react-router-dom";
import { getToken, logout } from "../utils/auth";

function Navbar() {
  const navigate = useNavigate();
  const token = getToken();

  const handleHome = () => {
    navigate("/");
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };

  return (
    <nav className="navbar">

      {/* LOGO */}
      <div
        onClick={handleHome}
        style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}
      >
        <img
          src="/images/logo.png"
          alt="logo"
          style={{ width: "42px", height: "42px", borderRadius: "8px", objectFit: "contain" }}
        />
        <span style={{ fontWeight: 700, fontSize: "16px", letterSpacing: "0.15em", color: "#2c6e5a", fontFamily: "'Lora', serif", textTransform: "uppercase" }}>
          LIFE MENTOR
        </span>
      </div>

      {/* LINKS */}
      <ul className="nav-links">

        {/* Always visible */}
        <li>
          <a onClick={handleHome} style={{ cursor: "pointer" }}>Home</a>
        </li>
        <li>
          <Link to="/profile">About Counsellor</Link>
        </li>

        {/* Only when logged in */}
        {token && (
          <>
            <li><Link to="/rate-session">⭐ Rate Session</Link></li>
            <li><Link to="/my-appointments">📅 My Appointments</Link></li>
            <li>
              <a
                onClick={handleLogout}
                style={{ cursor: "pointer", color: "#e05555", fontWeight: 600 }}
              >
                Logout
              </a>
            </li>
          </>
        )}

      </ul>
    </nav>
  );
}

export default Navbar;

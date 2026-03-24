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
    navigate("/login");
  };

  return (
    <nav className="navbar">

      {/* LOGO */}
      <div
        onClick={handleHome}
        style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}
      >
        <img
          src="/images/Therapy.png"
          alt="logo"
          style={{ width: "36px", height: "36px", borderRadius: "6px", objectFit: "cover" }}
        />
        <span style={{ fontWeight: 700, fontSize: "14px", letterSpacing: "0.1em", color: "#2c3e35" }}>
          LIFE MENTOR
        </span>
      </div>

      {/* LINKS */}
      <ul className="nav-links">

        {/* Home → scroll to top */}
        <li>
          <a onClick={handleHome} style={{ cursor: "pointer" }}>Home</a>
        </li>

        {/* About Counsellor → counsellor profile */}
        <li><Link to="/profile">About Counsellor</Link></li>

        {/* Rate Your Session → rate session page (only if logged in) */}
        {token && (
          <li><Link to="/rate-session">Rate Your Session</Link></li>
        )}

        {/* Logout / Login */}
        {token ? (
          <li>
            <a
              onClick={handleLogout}
              style={{ cursor: "pointer", color: "#e05555", fontWeight: 600 }}
            >
              Logout
            </a>
          </li>
        ) : (
          <li><Link to="/login">Login</Link></li>
        )}

      </ul>
    </nav>
  );
}

export default Navbar;

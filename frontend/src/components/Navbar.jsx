import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken, logout } from "../utils/auth";
import DarkModeToggle from "./DarkModeToggle";

function Navbar() {
  const navigate = useNavigate();
  const token = getToken();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleHome = () => {
    setMenuOpen(false);
    if (token) {
      navigate("/dashboard-home");       // logged in → dashboard
    } else {
      navigate("/login");                // new user → login/signup
    }
  };

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/");
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">

      {/* LOGO — always goes to landing page */}
      <div
        onClick={() => { navigate("/"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
        style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}
      >
        <img
          src="/images/logo.png"
          alt="logo"
          style={{ width: "42px", height: "42px", borderRadius: "8px", objectFit: "contain" }}
        />
        <span style={{
          fontWeight: 700, fontSize: "16px", letterSpacing: "0.15em",
          color: "#2c6e5a", fontFamily: "'Lora', serif", textTransform: "uppercase"
        }}>
          LIFE MENTOR
        </span>
      </div>

      {/* HAMBURGER */}
      <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
        <span className={`ham-line ${menuOpen ? "open" : ""}`} />
        <span className={`ham-line ${menuOpen ? "open" : ""}`} />
        <span className={`ham-line ${menuOpen ? "open" : ""}`} />
      </button>

      {/* NAV LINKS */}
      <ul className={`nav-links ${menuOpen ? "nav-open" : ""}`}>

        <li>
          <a onClick={handleHome} style={{ cursor: "pointer" }}>Home</a>
        </li>

        <li>
          <a onClick={() => { navigate("/profile"); closeMenu(); }} style={{ cursor: "pointer" }}>
            About Counsellor
          </a>
        </li>

        {token && (
          <li>
            <a onClick={handleLogout} style={{ cursor: "pointer", color: "#e05555", fontWeight: 600 }}>
              Logout
            </a>
          </li>
        )}

        <li><DarkModeToggle /></li>

      </ul>
    </nav>
  );
}

export default Navbar;

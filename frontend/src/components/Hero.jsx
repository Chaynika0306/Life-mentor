import { useNavigate } from "react-router-dom";
import "../App.css";

function Hero() {
  const navigate = useNavigate();

  return (
    <section className="hero">

      {/* LEFT SIDE */}
      <div className="hero-text">
        <div className="hero-tag">🌿 Mental Health & Counselling</div>

        <h1>
          Your Mind <br />
          <span className="hero-highlight">Deserves Peace.</span>
        </h1>

        <p className="quote">
          "Sometimes the bravest thing you can do is just to show up. You matter."
        </p>

        <p className="hero-desc">
          Life gets heavy. Anxiety, loneliness, broken relationships — you don't have to carry it alone.
          Life Mentor connects you with a compassionate counsellor who truly listens.
        </p>

        <div className="hero-btns">
          <button className="primary-btn" onClick={() => navigate("/login")}>
            Start Your Journey
          </button>
          <button className="secondary-btn" onClick={() => navigate("/services")}>
            Explore Services
          </button>
        </div>

        <div className="hero-stats">
          <div className="stat">
            <span className="stat-num">500+</span>
            <span className="stat-label">Lives Touched</span>
          </div>
          <div className="stat-divider" />
          <div className="stat">
            <span className="stat-num">98%</span>
            <span className="stat-label">Client Satisfaction</span>
          </div>
          <div className="stat-divider" />
          <div className="stat">
            <span className="stat-num">2+</span>
            <span className="stat-label">Years Experience</span>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE — SVG Illustration */}
      <div className="hero-image">
        <div className="hero-illustration">
          <img
            src="/images/Therapy.png"
            alt="Therapy session illustration"
          />
        </div>
        <p className="hero-caption">Guided path to inner peace 🌿</p>
      </div>

    </section>
  );
}

export default Hero;

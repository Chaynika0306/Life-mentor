import { useNavigate } from "react-router-dom";
import { getToken } from "../utils/auth";
import "../App.css";

const features = [
  {
    icon: "🧠",
    title: "AI Life Coach",
    desc: "Talk to our AI every day. Share how you feel and get personalized emotional support, daily habits, and powerful affirmations — available 24/7.",
    color: "#c4bdd6",
    action: "Try AI Coach",
    route: "/ai-coach",
    loginRequired: true,
  },
  {
    icon: "📚",
    title: "Resource Library",
    desc: "Free breathing exercises, mindfulness guides, journaling prompts, and affirmations — curated by mental health experts, free for everyone.",
    color: "#b8d8cc",
    action: "Explore Resources",
    route: "/resources",
    loginRequired: false,
  },
  {
    icon: "📅",
    title: "Book a Session",
    desc: "Connect with our compassionate counsellor. Choose your date and time slot. It takes less than 2 minutes to book your first session.",
    color: "#e8d9b0",
    action: "Book Now",
    route: "/book-session",
    loginRequired: true,
  },
];

function FeaturesTeaser() {
  const navigate = useNavigate();
  const token = getToken();

  const handleClick = (feature) => {
    if (feature.loginRequired && !token) {
      navigate("/login");
    } else {
      navigate(feature.route);
    }
  };

  return (
    <section className="features-teaser-section">
      <h2>Everything You Need to Feel Better</h2>
      <p className="features-teaser-subtitle">
        Life Mentor is more than just counselling — it's a complete mental wellness platform 🌿
      </p>

      <div className="features-teaser-grid">
        {features.map((f, i) => (
          <div key={i} className="features-teaser-card" style={{ borderTop: `4px solid ${f.color}` }}>
            <div className="features-teaser-icon" style={{ background: f.color }}>
              {f.icon}
            </div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
            <button
              className="features-teaser-btn"
              onClick={() => handleClick(f)}
              style={{ background: f.color }}
            >
              {f.action} →
            </button>
            {f.loginRequired && !token && (
              <p className="features-login-note">🔐 Login required</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default FeaturesTeaser;

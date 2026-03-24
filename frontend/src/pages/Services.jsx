import { useNavigate } from "react-router-dom";
import { getToken } from "../utils/auth";
import PageWrapper from "../components/PageWrapper";
import "../App.css";

function Services() {
  const navigate = useNavigate();
  const token = getToken();

  const handleBooking = () => {
    if (token) {
      navigate("/book-session"); // already logged in
    } else {
      navigate("/signup"); // new user
    }
  };

  const services = [
    { icon: "🧠", title: "Anxiety & Stress Management", desc: "Learn effective techniques to manage anxiety, reduce stress, and build emotional resilience in daily life." },
    { icon: "❤️", title: "Relationship Guidance", desc: "Navigate relationship challenges with expert counselling for couples, families, and individuals." },
    { icon: "💼", title: "Career Counselling", desc: "Get clarity on your career path, overcome workplace stress, and achieve your professional goals." },
    { icon: "🌱", title: "Personal Growth Coaching", desc: "Build self-confidence, improve habits, and unlock your full potential through guided coaching sessions." },
    { icon: "😔", title: "Depression Support", desc: "Compassionate support and evidence-based therapy to help you through difficult emotional periods." },
    { icon: "🧘", title: "Mindfulness & Wellbeing", desc: "Develop mindfulness practices that bring calm, focus, and balance to your everyday life." },
  ];

  return (
    <PageWrapper>
      <div className="services-page">

        {/* HEADER */}
        <div className="services-header">
          <h1>Our Services</h1>
          <p>We offer a range of mental health and counselling services tailored to your needs.</p>
        </div>

        {/* CARDS GRID — no individual buttons */}
        <div className="services-grid">
          {services.map((s, i) => (
            <div className="service-card" key={i}>
              <div className="service-icon">{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>

        {/* SINGLE COMMON BOOK BUTTON */}
        <div className="services-cta">
          <p className="services-cta-text">
            Ready to take the first step towards a healthier mind?
          </p>
          <button className="primary-btn services-book-btn" onClick={handleBooking}>
            📅 Book a Session
          </button>
        </div>

      </div>
    </PageWrapper>
  );
}

export default Services;

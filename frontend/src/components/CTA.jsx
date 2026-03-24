import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

const slides = [
  {
    emoji: "😔",
    text: "Feeling overwhelmed and don't know who to talk to?",
    sub: "You don't have to carry this alone. A counsellor can help.",
  },
  {
    emoji: "💔",
    text: "Struggling with a relationship that's draining you emotionally?",
    sub: "It's okay to seek guidance. Healthy relationships start with honest conversations.",
  },
  {
    emoji: "😰",
    text: "Anxiety keeping you up at night, making every day feel heavy?",
    sub: "You deserve peace. Let's work through it together.",
  },
  {
    emoji: "🪞",
    text: "Feeling lost, like you've forgotten who you really are?",
    sub: "Self-discovery is a journey — and you don't have to walk it alone.",
  },
  {
    emoji: "😶‍🌫️",
    text: "Going through the motions but feeling empty inside?",
    sub: "What you're feeling is valid. Talking to someone can change everything.",
  },
];

function CTA() {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  const prev = () => setCurrent((c) => (c === 0 ? slides.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === slides.length - 1 ? 0 : c + 1));

  return (
    <section className="cta">
      <h2>Are you someone?</h2>

      <div className="cta-carousel">
        <button className="cta-arrow" onClick={prev}>&#8249;</button>

        <div className="cta-card">
          <div className="cta-emoji">{slides[current].emoji}</div>
          <p className="cta-main">{slides[current].text}</p>
          <p className="cta-sub">{slides[current].sub}</p>
        </div>

        <button className="cta-arrow" onClick={next}>&#8250;</button>
      </div>

      {/* Dot indicators */}
      <div className="cta-dots">
        {slides.map((_, i) => (
          <span
            key={i}
            className={`cta-dot ${i === current ? "active" : ""}`}
            onClick={() => setCurrent(i)}
          />
        ))}
      </div>

    </section>
  );
}

export default CTA;

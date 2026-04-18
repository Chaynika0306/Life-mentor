import { useState } from "react";
import "../App.css";

const testimonials = [
  {
    name: "Priya S.",
    role: "Student, 22",
    avatar: "P",
    color: "#c9b8c4",
    rating: 5,
    text: "I was struggling with anxiety before my exams and didn't know who to talk to. Life Mentor changed everything. Just one session helped me breathe again. Highly recommend!",
  },
  {
    name: "Rahul M.",
    role: "Software Engineer, 28",
    avatar: "R",
    color: "#b8d8cc",
    rating: 5,
    text: "I had relationship issues I couldn't discuss with anyone. The counsellor was so non-judgmental and warm. I felt heard for the first time in years. Thank you Life Mentor.",
  },
  {
    name: "Ananya K.",
    role: "Working Professional, 31",
    avatar: "A",
    color: "#e8d9b0",
    rating: 5,
    text: "The AI Coach feature is amazing — I use it every morning to check in with myself. And the booking process is so smooth. This platform is truly a safe space.",
  },
  {
    name: "Vikram T.",
    role: "Entrepreneur, 35",
    avatar: "V",
    color: "#c4bdd6",
    rating: 5,
    text: "Work stress was killing me. After 3 sessions I have a completely different perspective on life. The counsellor really understands how to deal with modern-day pressure.",
  },
];

function Testimonials() {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => (c === 0 ? testimonials.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === testimonials.length - 1 ? 0 : c + 1));

  const t = testimonials[current];

  return (
    <section className="testimonials-section">
      <h2>What Our Clients Say</h2>
      <p className="testimonials-subtitle">Real stories from real people who found their peace 💚</p>

      <div className="testimonials-carousel">
        <button className="cta-arrow" onClick={prev}>&#8249;</button>

        <div className="testimonial-card">
          <div className="testimonial-stars">
            {"★".repeat(t.rating)}{"☆".repeat(5 - t.rating)}
          </div>
          <p className="testimonial-text">"{t.text}"</p>
          <div className="testimonial-author">
            <div
              className="testimonial-avatar"
              style={{ background: t.color }}
            >
              {t.avatar}
            </div>
            <div>
              <p className="testimonial-name">{t.name}</p>
              <p className="testimonial-role">{t.role}</p>
            </div>
          </div>
        </div>

        <button className="cta-arrow" onClick={next}>&#8250;</button>
      </div>

      {/* Dots */}
      <div className="cta-dots">
        {testimonials.map((_, i) => (
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

export default Testimonials;

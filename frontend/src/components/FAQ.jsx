import { useState } from "react";
import "../App.css";

const faqs = [
  {
    q: "How does a counselling session work?",
    a: "After booking a session, our counsellor will connect with you at the scheduled time. Sessions are conducted in a safe, confidential, and judgment-free environment where you can talk about anything on your mind.",
  },
  {
    q: "Is everything I share kept confidential?",
    a: "Absolutely. Everything shared in your session is strictly confidential. Your privacy is our highest priority. We follow professional ethical guidelines to protect your information at all times.",
  },
  {
    q: "What is the session fee?",
    a: "Our session fee is ₹499 per session. We believe mental health support should be accessible and affordable for everyone.",
  },
  {
    q: "How do I book a session?",
    a: "Simply create an account, log in, and click 'Book a Session'. Choose your preferred date and available time slot — it takes less than 2 minutes!",
  },
  {
    q: "What if I need to cancel my appointment?",
    a: "You can cancel your appointment anytime from your 'My Appointments' page. We understand that plans change and there is no cancellation fee.",
  },
  {
    q: "What is the AI Life Coach feature?",
    a: "Our AI Life Coach is an intelligent daily check-in tool. You share how you're feeling and it detects your mood, provides emotional support, suggests a habit, an affirmation, and a small task for the day. It's available 24/7 and completely free for registered users.",
  },
  {
    q: "Is this a substitute for professional therapy?",
    a: "Our platform provides supportive counselling and emotional guidance. While our counsellor is a trained professional, for clinical mental health conditions we always recommend consulting a licensed psychiatrist or therapist.",
  },
];

function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section className="faq-section" id="faq">
      <h2>Frequently Asked Questions</h2>
      <p className="faq-subtitle">Everything you need to know before taking the first step 🌿</p>

      <div className="faq-list">
        {faqs.map((faq, i) => (
          <div
            key={i}
            className={`faq-item ${openIndex === i ? "open" : ""}`}
            onClick={() => toggle(i)}
          >
            <div className="faq-question">
              <span>{faq.q}</span>
              <span className="faq-icon">{openIndex === i ? "−" : "+"}</span>
            </div>
            {openIndex === i && (
              <div className="faq-answer">
                <p>{faq.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default FAQ;

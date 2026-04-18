import { useState } from "react";
import "../App.css";

const helplines = [
  { name: "iCall", number: "9152987821", desc: "Psychological counselling — Mon to Sat, 8am–10pm", icon: "📞" },
  { name: "Vandrevala Foundation", number: "1860-2662-345", desc: "24/7 mental health helpline, free & confidential", icon: "💚" },
  { name: "NIMHANS", number: "080-46110007", desc: "National Institute of Mental Health helpline", icon: "🏥" },
  { name: "Snehi", number: "044-24640050", desc: "Emotional support for people in distress", icon: "🤝" },
  { name: "Emergency", number: "112", desc: "National emergency number — if in immediate danger", icon: "🚨" },
];

function CrisisHelp() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating Crisis Button */}
      <button className="crisis-float-btn" onClick={() => setOpen(true)}>
        🆘 Need Help Now?
      </button>

      {/* Modal */}
      {open && (
        <div className="crisis-overlay" onClick={() => setOpen(false)}>
          <div className="crisis-modal" onClick={(e) => e.stopPropagation()}>
            <button className="blog-modal-close" onClick={() => setOpen(false)}>✕</button>

            <div className="crisis-header">
              <span className="crisis-header-icon">💙</span>
              <h2>You Are Not Alone</h2>
              <p>If you're in emotional distress or crisis, please reach out to these free helplines right now.</p>
            </div>

            <div className="crisis-list">
              {helplines.map((h, i) => (
                <div key={i} className="crisis-item">
                  <span className="crisis-icon">{h.icon}</span>
                  <div className="crisis-info">
                    <p className="crisis-name">{h.name}</p>
                    <p className="crisis-desc">{h.desc}</p>
                  </div>
                  <a href={`tel:${h.number}`} className="crisis-call-btn">
                    📲 {h.number}
                  </a>
                </div>
              ))}
            </div>

            <div className="crisis-footer">
              <p>These are free, confidential services. Please don't hesitate to call. 💚</p>
              <p>You can also <strong onClick={() => { setOpen(false); window.location.href = "/book-session"; }} style={{ cursor: "pointer", color: "#6aab99" }}>book a session</strong> with our counsellor.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default CrisisHelp;

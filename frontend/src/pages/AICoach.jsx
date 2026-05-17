import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getToken, getUser } from "../utils/auth";
import MoodGraph from "./MoodGraph";
import "../App.css";

const BACKEND = "https://life-mentor-backend.onrender.com";

const moodEmoji = {
  happy: "😊", sad: "😢", stressed: "😰",
  anxious: "😟", neutral: "😐", overwhelmed: "😫", lonely: "🥺", angry: "😠",
};

const moodColor = {
  happy: "#b8ddd4", sad: "#c4bdd6", stressed: "#f4c2c2",
  anxious: "#e8d9b0", neutral: "#d8ede8", overwhelmed: "#f4c2c2",
  lonely: "#c4bdd6", angry: "#f4c2c2",
};

// Quick mood buttons shown above input
const moodButtons = [
  { mood: "happy",      emoji: "😊", label: "Happy" },
  { mood: "sad",        emoji: "😢", label: "Sad" },
  { mood: "anxious",    emoji: "😟", label: "Anxious" },
  { mood: "stressed",   emoji: "😰", label: "Stressed" },
  { mood: "overwhelmed",emoji: "😫", label: "Overwhelmed" },
  { mood: "lonely",     emoji: "🥺", label: "Lonely" },
  { mood: "angry",      emoji: "😠", label: "Angry" },
  { mood: "neutral",    emoji: "😐", label: "Neutral" },
];

function AICoach() {
  const navigate = useNavigate();
  const token = getToken();
  const user = getUser();
  const [tab, setTab] = useState("chat");
  const [messages, setMessages] = useState([
    {
      from: "ai",
      type: "conversational",
      text: `Hello ${user?.name?.split(" ")[0] || "there"} 👋 I'm your Life Mentor AI Coach. How are you feeling today? You can type how you feel or pick a mood below. I'm here to listen. 💚`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [activeMood, setActiveMood] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetchHistory();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${BACKEND}/api/ai/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error("History fetch error:", err);
    }
  };

  const sendMessage = async (messageText) => {
    if (!messageText.trim() || loading) return;
    const userMsg = messageText.trim();
    setInput("");
    setActiveMood(null);
    setMessages((prev) => [...prev, { from: "user", text: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch(`${BACKEND}/api/ai/checkin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await res.json();

      if (res.ok) {
        if (data.type === "mood") {
          // Full mood card response
          setMessages((prev) => [...prev, {
            from: "ai",
            type: "mood",
            mood: data.mood,
            support: data.support,
            habit: data.habit,
            affirmation: data.affirmation,
            task: data.task,
          }]);
          fetchHistory();
        } else {
          // Conversational or out_of_scope — plain text reply
          setMessages((prev) => [...prev, {
            from: "ai",
            type: data.type || "conversational",
            text: data.text,
          }]);
        }
      } else {
        setMessages((prev) => [...prev, {
          from: "ai",
          type: "conversational",
          text: data.message || "Something went wrong. Please try again.",
        }]);
      }
    } catch {
      setMessages((prev) => [...prev, {
        from: "ai",
        type: "conversational",
        text: "I'm having trouble connecting right now. Please try again in a moment. 🙏",
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => sendMessage(input);

  // When user clicks a mood button
  const handleMoodButton = (mood, label) => {
    setActiveMood(mood);
    sendMessage(`I am feeling ${label.toLowerCase()} today`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="ai-page">

      {/* HEADER */}
      <div className="ai-header">
        <div className="ai-header-left">
          <div className="ai-avatar">🧠</div>
          <div>
            <h1>Life Mentor AI Coach</h1>
            <p>Your personal daily emotional support companion</p>
          </div>
        </div>
        <div className="ai-header-right">
          <button className={`ai-tab-btn ${tab === "chat" ? "active" : ""}`} onClick={() => setTab("chat")}>💬 Chat</button>
          <button className={`ai-tab-btn ${tab === "history" ? "active" : ""}`} onClick={() => setTab("history")}>📋 History</button>
          <button className={`ai-tab-btn ${tab === "graph" ? "active" : ""}`} onClick={() => setTab("graph")}>📊 Mood Graph</button>
          <button className="secondary-btn" onClick={() => navigate("/dashboard-home")}>← Back</button>
        </div>
      </div>

      {/* ── CHAT TAB ── */}
      {tab === "chat" && (
        <div className="ai-chat-container">
          <div className="ai-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`ai-message-row ${msg.from}`}>
                {msg.from === "ai" && <div className="ai-bubble-avatar">🧠</div>}
                <div className={`ai-bubble ${msg.from}`}>

                  {/* Plain text message (conversational / out_of_scope / greeting) */}
                  {msg.text && <p>{msg.text}</p>}

                  {/* Out of scope — show book session link */}
                  {msg.type === "out_of_scope" && (
                    <p style={{ marginTop: "10px" }}>
                      <span
                        className="ai-book-link"
                        onClick={() => navigate("/book-session")}
                        style={{ color: "#6aab99", fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}
                      >
                        📅 Book a session with our counsellor →
                      </span>
                    </p>
                  )}

                  {/* Full mood card */}
                  {msg.type === "mood" && msg.support && (
                    <div className="ai-response-card" style={{ background: moodColor[msg.mood] || "#d8ede8" }}>
                      <div className="ai-mood-badge">
                        {moodEmoji[msg.mood]} Detected Mood: <strong>{msg.mood}</strong>
                      </div>
                      <p className="ai-support">{msg.support}</p>
                      <div className="ai-suggestions">
                        <div className="ai-suggestion-item">
                          <span className="ai-suggestion-icon">🌿</span>
                          <div>
                            <p className="ai-suggestion-label">Today's Habit</p>
                            <p>{msg.habit}</p>
                          </div>
                        </div>
                        <div className="ai-suggestion-item">
                          <span className="ai-suggestion-icon">✨</span>
                          <div>
                            <p className="ai-suggestion-label">Affirmation</p>
                            <p>"{msg.affirmation}"</p>
                          </div>
                        </div>
                        <div className="ai-suggestion-item">
                          <span className="ai-suggestion-icon">✅</span>
                          <div>
                            <p className="ai-suggestion-label">Small Task</p>
                            <p>{msg.task}</p>
                          </div>
                        </div>
                      </div>
                      <p className="ai-counsellor-note">
                        💚 Need deeper support?{" "}
                        <span className="ai-book-link" onClick={() => navigate("/book-session")}>
                          Book a session →
                        </span>
                      </p>
                    </div>
                  )}

                </div>
                {msg.from === "user" && (
                  <div className="ai-bubble-avatar user-avatar">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="ai-message-row ai">
                <div className="ai-bubble-avatar">🧠</div>
                <div className="ai-bubble ai">
                  <div className="ai-typing"><span /><span /><span /></div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* ── MOOD QUICK BUTTONS ── */}
          <div className="ai-mood-buttons">
            <p className="ai-mood-buttons-label">How are you feeling?</p>
            <div className="ai-mood-buttons-row">
              {moodButtons.map(({ mood, emoji, label }) => (
                <button
                  key={mood}
                  className={`ai-mood-btn ${activeMood === mood ? "active" : ""}`}
                  onClick={() => handleMoodButton(mood, label)}
                  disabled={loading}
                >
                  <span>{emoji}</span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── INPUT ROW ── */}
          <div className="ai-input-row">
            <textarea
              className="ai-input"
              placeholder="Or type how you're feeling... share anything 💚"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={2}
              disabled={loading}
            />
            <button className="ai-send-btn" onClick={handleSend} disabled={loading || !input.trim()}>
              {loading ? "..." : "Send 💚"}
            </button>
          </div>
          <p className="ai-hint">Press Enter to send · Shift+Enter for new line</p>
        </div>
      )}

      {/* ── HISTORY TAB ── */}
      {tab === "history" && (
        <div className="ai-history-container">
          <h2>Your Mood History</h2>
          <p className="ai-history-subtitle">Last 7 check-ins</p>
          {history.length === 0 ? (
            <p className="appt-empty">No check-ins yet. Start your first one! 💚</p>
          ) : (
            <div className="ai-history-grid">
              {history.map((entry, i) => (
                <div key={i} className="ai-history-card" style={{ borderLeft: `4px solid ${moodColor[entry.mood] || "#6aab99"}` }}>
                  <div className="ai-history-top">
                    <span className="ai-history-mood">{moodEmoji[entry.mood]} {entry.mood}</span>
                    <span className="ai-history-date">{entry.date}</span>
                  </div>
                  <p className="ai-history-message">"{entry.message}"</p>
                  <p className="ai-history-support">{entry.aiResponse?.support}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── MOOD GRAPH TAB ── */}
      {tab === "graph" && (
        <div className="ai-history-container">
          <h2>Mood Analytics</h2>
          <p className="ai-history-subtitle">Visualize your emotional journey over time 📈</p>
          <MoodGraph />
        </div>
      )}

    </div>
  );
}

export default AICoach;
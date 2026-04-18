import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

const categories = ["All", "Anxiety", "Relationships", "Self-Care", "Mindfulness", "Career"];

const resources = [
  {
    category: "Anxiety",
    icon: "🧠",
    title: "Box Breathing Technique",
    type: "Exercise",
    color: "#f4c2c2",
    description: "A powerful 4-step breathing exercise used by therapists to calm the nervous system instantly.",
    content: [
      "Breathe IN slowly for 4 counts",
      "HOLD your breath for 4 counts",
      "Breathe OUT slowly for 4 counts",
      "HOLD empty for 4 counts",
      "Repeat 4 times. Practice daily for best results.",
    ],
  },
  {
    category: "Mindfulness",
    icon: "🧘",
    title: "5-4-3-2-1 Grounding Exercise",
    type: "Exercise",
    color: "#b8d8cc",
    description: "Use your 5 senses to anchor yourself to the present moment when feeling overwhelmed.",
    content: [
      "👁️ Name 5 things you can SEE",
      "✋ Name 4 things you can TOUCH",
      "👂 Name 3 things you can HEAR",
      "👃 Name 2 things you can SMELL",
      "👅 Name 1 thing you can TASTE",
    ],
  },
  {
    category: "Self-Care",
    icon: "🌿",
    title: "Daily Self-Care Checklist",
    type: "Checklist",
    color: "#e8d9b0",
    description: "Simple daily habits that protect your mental health and build emotional resilience.",
    content: [
      "☀️ Get morning sunlight for 10 minutes",
      "💧 Drink 8 glasses of water",
      "📵 Take 1 screen-free hour",
      "🚶 Walk for at least 20 minutes",
      "📔 Write 3 things you're grateful for",
      "😴 Sleep 7-8 hours",
    ],
  },
  {
    category: "Relationships",
    icon: "💑",
    title: "Healthy Communication Tips",
    type: "Guide",
    color: "#c4bdd6",
    description: "Evidence-based communication strategies to improve your relationships and resolve conflicts.",
    content: [
      "Use 'I feel' instead of 'You always'",
      "Listen to understand, not to respond",
      "Take a 20-minute break when arguments escalate",
      "Express appreciation daily — even small things",
      "Set boundaries with kindness, not anger",
    ],
  },
  {
    category: "Anxiety",
    icon: "😰",
    title: "Managing Anxiety Journal Prompts",
    type: "Journaling",
    color: "#f4c2c2",
    description: "Writing prompts to help you process anxious thoughts and find clarity.",
    content: [
      "What is making me feel anxious right now?",
      "What is the worst that could actually happen?",
      "What evidence do I have that this fear is true?",
      "What would I tell a friend in my situation?",
      "What one small thing can I control today?",
    ],
  },
  {
    category: "Career",
    icon: "💼",
    title: "Dealing with Work Burnout",
    type: "Guide",
    color: "#b8ddd4",
    description: "Recognize the signs of burnout early and take steps to recover your energy and purpose.",
    content: [
      "Signs: exhaustion, cynicism, feeling ineffective",
      "Set strict work-hour boundaries",
      "Take your full lunch break — step outside",
      "Say no to non-essential tasks",
      "Talk to your manager about workload",
      "Schedule at least 1 fun activity per week",
    ],
  },
  {
    category: "Mindfulness",
    icon: "✨",
    title: "Morning Mindfulness Routine",
    type: "Routine",
    color: "#d4ece4",
    description: "A gentle 10-minute morning routine to start your day with intention and calm.",
    content: [
      "🌅 Wake up without checking your phone for 10 min",
      "💧 Drink a full glass of water",
      "🧘 Sit quietly and take 10 deep breaths",
      "📔 Write 1 intention for the day",
      "🙏 Name 3 things you're grateful for",
    ],
  },
  {
    category: "Self-Care",
    icon: "💚",
    title: "Positive Affirmations Bank",
    type: "Affirmations",
    color: "#c9b8c4",
    description: "Powerful affirmations to rewire your mindset. Read them daily, morning and night.",
    content: [
      "I am worthy of love and peace",
      "I choose to release what I cannot control",
      "I am getting stronger every single day",
      "My feelings are valid and I honour them",
      "I am enough, exactly as I am right now",
      "I trust myself to handle whatever comes",
    ],
  },
];

function ResourceModal({ resource, onClose }) {
  if (!resource) return null;
  return (
    <div className="blog-modal-overlay" onClick={onClose}>
      <div className="blog-modal resource-modal" onClick={(e) => e.stopPropagation()}>
        <button className="blog-modal-close" onClick={onClose}>✕</button>
        <div className="blog-modal-emoji">{resource.icon}</div>
        <div className="resource-modal-type">{resource.type}</div>
        <h2>{resource.title}</h2>
        <p className="resource-modal-desc">{resource.description}</p>
        <div className="resource-modal-content">
          {resource.content.map((line, i) => (
            <div key={i} className="resource-line">{line}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Resources() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedResource, setSelectedResource] = useState(null);

  const filtered = activeCategory === "All"
    ? resources
    : resources.filter(r => r.category === activeCategory);

  return (
    <div className="resources-page">

      {/* Header */}
      <div className="resources-header">
        <button className="secondary-btn" onClick={() => navigate(-1)}>← Back</button>
        <div>
          <h1>Resource Library</h1>
          <p>Free tools, exercises, and guides for your mental wellness journey 🌿</p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="resources-filter">
        {categories.map(cat => (
          <button
            key={cat}
            className={`resource-filter-btn ${activeCategory === cat ? "active" : ""}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Cards Grid */}
      <div className="resources-grid">
        {filtered.map((r, i) => (
          <div
            key={i}
            className="resource-card"
            style={{ borderTop: `4px solid ${r.color}` }}
            onClick={() => setSelectedResource(r)}
          >
            <div className="resource-card-icon" style={{ background: r.color }}>{r.icon}</div>
            <div className="resource-card-type">{r.type}</div>
            <h3>{r.title}</h3>
            <p>{r.description}</p>
            <span className="resource-read-more">Open resource →</span>
          </div>
        ))}
      </div>

      {/* Modal */}
      <ResourceModal resource={selectedResource} onClose={() => setSelectedResource(null)} />

    </div>
  );
}

export default Resources;

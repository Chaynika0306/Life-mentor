import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

const blogs = [
  {
    id: 1,
    title: "Understanding Anxiety",
    color: "#c9b8c4",
    textColor: "#2c1a24",
    emoji: "🧠",
    excerpt: "Anxiety is more than just worry...",
    content: `Anxiety is more than just worry — it's a constant mental battle that affects your sleep, focus, and daily life. At Life Mentor, we help you understand what triggers your anxiety and build practical coping tools. Our counsellors use evidence-based techniques like CBT to help you rewire anxious thought patterns. You are not broken — you just need the right support to heal.`,
    showCounsellorBtn: false,
  },
  {
    id: 2,
    title: "The Power of Mindfulness",
    color: "#c4bdd6",
    textColor: "#1a1428",
    emoji: "🧘",
    excerpt: "Living in the present moment changes everything...",
    content: `Mindfulness is the art of being fully present — not lost in yesterday's regrets or tomorrow's worries. Our counsellors guide clients through simple daily mindfulness practices that reduce stress, improve focus, and bring inner calm. Even 10 minutes of mindful breathing a day can rewire your brain over time. Start small, stay consistent, and watch your mental clarity transform.`,
    showCounsellorBtn: false,
  },
  {
    id: 3,
    title: "Navigating Relationships",
    color: "#e8d9b0",
    textColor: "#2c2410",
    emoji: "💑",
    excerpt: "Healthy relationships need honest conversations...",
    content: `Every relationship — romantic, family, or friendship — requires effort, empathy, and communication. At Life Mentor, our counsellors create a safe space to work through conflicts, rebuild trust, and set healthy boundaries. We help you understand your own patterns and how they affect those around you. Better relationships start with a better understanding of yourself.`,
    showCounsellorBtn: false,
  },
  {
    id: 4,
    title: "Self-Care Practices",
    color: "#b8d8cc",
    textColor: "#0e2820",
    emoji: "🌿",
    excerpt: "Taking care of yourself is not selfish...",
    content: `Self-care is not a luxury — it's a necessity. Our counsellors encourage clients to build daily routines that nourish their mind, body, and soul. From journaling and sleep hygiene to gentle exercise and digital detox, small habits compound into big changes. When you invest in yourself, you show up better for everyone else around you too.`,
    showCounsellorBtn: false,
  },
  {
    id: 5,
    title: "Meet Our Counsellor",
    color: "#f5c6b8",
    textColor: "#2c1810",
    emoji: "👨‍⚕️",
    excerpt: "Expert care with a human touch...",
    content: `Our counsellor specialises in anxiety, relationship issues, stress management, and personal growth coaching. With 8+ years of experience, they create a judgment-free space where every client feels heard and respected. Their approach blends evidence-based therapy with genuine compassion — treating each person as a whole human being, not just a problem to solve. Your story matters here.`,
    showCounsellorBtn: true,
  },
  {
    id: 6,
    title: "When to Seek Help",
    color: "#b8cce8",
    textColor: "#0e1828",
    emoji: "🤝",
    excerpt: "Asking for help is a sign of strength...",
    content: `Many people wait until they're at their breaking point before seeking counselling — but you don't have to. If you feel persistently sad, anxious, disconnected, or overwhelmed, that's your mind asking for support. At Life Mentor, there's no judgment — only understanding. Reaching out early leads to faster healing. You deserve support before the storm gets worse.`,
    showCounsellorBtn: false,
  },
];

function BlogModal({ blog, onClose }) {
  const navigate = useNavigate();
  if (!blog) return null;

  return (
    <div className="blog-modal-overlay" onClick={onClose}>
      <div className="blog-modal" onClick={(e) => e.stopPropagation()}>
        <button className="blog-modal-close" onClick={onClose}>✕</button>
        <div className="blog-modal-emoji">{blog.emoji}</div>
        <h2>{blog.title}</h2>
        <p>{blog.content}</p>

        {/* About Counsellor button — only on Meet Our Counsellor card */}
        {blog.showCounsellorBtn && (
          <button
            className="primary-btn"
            style={{ width: "100%", marginTop: "20px" }}
            onClick={() => { onClose(); navigate("/profile"); }}
          >
            👤 Visit Counsellor Profile
          </button>
        )}
      </div>
    </div>
  );
}

function Blog() {
  const [selectedBlog, setSelectedBlog] = useState(null);

  return (
    <section className="blog" id="blog">
      <h2>Life Mentor Insights</h2>

      <div className="blog-grid">
        {blogs.map((blog) => (
          <div
            key={blog.id}
            className="blog-card"
            style={{ background: blog.color }}
            onClick={() => setSelectedBlog(blog)}
          >
            <div className="blog-card-emoji">{blog.emoji}</div>
            <p className="blog-card-title" style={{ color: blog.textColor }}>{blog.title}</p>
            <p className="blog-card-excerpt" style={{ color: blog.textColor, opacity: 0.75 }}>{blog.excerpt}</p>
            <span className="blog-read-more" style={{ color: blog.textColor }}>Read more →</span>
          </div>
        ))}
      </div>

      <BlogModal blog={selectedBlog} onClose={() => setSelectedBlog(null)} />
    </section>
  );
}

export default Blog;

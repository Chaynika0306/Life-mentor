import { useState } from "react";
import "../App.css";

const blogs = [
  {
    id: 1,
    title: "Understanding Anxiety",
    color: "#c9b8c4",
    emoji: "🧠",
    excerpt: "Anxiety is more than just worry...",
    content: `Anxiety is more than just worry — it's a constant mental battle that affects your sleep, focus, and daily life. At Life Mentor, we help you understand what triggers your anxiety and build practical coping tools. Our counsellors use evidence-based techniques like CBT to help you rewire anxious thought patterns. You are not broken — you just need the right support to heal.`,
  },
  {
    id: 2,
    title: "The Power of Mindfulness",
    color: "#c4bdd6",
    emoji: "🧘",
    excerpt: "Living in the present moment changes everything...",
    content: `Mindfulness is the art of being fully present — not lost in yesterday's regrets or tomorrow's worries. Our counsellors guide clients through simple daily mindfulness practices that reduce stress, improve focus, and bring inner calm. Even 10 minutes of mindful breathing a day can rewire your brain over time. Start small, stay consistent, and watch your mental clarity transform.`,
  },
  {
    id: 3,
    title: "Navigating Relationships",
    color: "#e8d9b0",
    emoji: "💑",
    excerpt: "Healthy relationships need honest conversations...",
    content: `Every relationship — romantic, family, or friendship — requires effort, empathy, and communication. At Life Mentor, our counsellors create a safe space to work through conflicts, rebuild trust, and set healthy boundaries. We help you understand your own patterns and how they affect those around you. Better relationships start with a better understanding of yourself.`,
  },
  {
    id: 4,
    title: "Self-Care Practices",
    color: "#b8d8cc",
    emoji: "🌿",
    excerpt: "Taking care of yourself is not selfish...",
    content: `Self-care is not a luxury — it's a necessity. Our counsellors encourage clients to build daily routines that nourish their mind, body, and soul. From journaling and sleep hygiene to gentle exercise and digital detox, small habits compound into big changes. When you invest in yourself, you show up better for everyone else around you too.`,
  },
  {
    id: 5,
    title: "Meet Our Counsellor",
    color: "#f5c6b8",
    emoji: "👨‍⚕️",
    excerpt: "Expert care with a human touch...",
    content: `Our counsellor specialises in anxiety, relationship issues, stress management, and personal growth coaching. With 2+ years of experience, they create a judgment-free space where every client feels heard and respected. Their approach blends evidence-based therapy with genuine compassion — treating each person as a whole human being, not just a problem to solve. Your story matters here.`,
  },
  {
    id: 6,
    title: "When to Seek Help",
    color: "#b8cce8",
    emoji: "🤝",
    excerpt: "Asking for help is a sign of strength...",
    content: `Many people wait until they're at their breaking point before seeking counselling — but you don't have to. If you feel persistently sad, anxious, disconnected, or overwhelmed, that's your mind asking for support. At Life Mentor, there's no judgment — only understanding. Reaching out early leads to faster healing. You deserve support before the storm gets worse.`,
  },
];

function BlogCard({ blog, onClick }) {
  return (
    <div className="blog-card" style={{ background: blog.color }} onClick={() => onClick(blog)}>
      <div className="blog-card-emoji">{blog.emoji}</div>
      <p className="blog-card-title">{blog.title}</p>
      <p className="blog-card-excerpt">{blog.excerpt}</p>
      <span className="blog-read-more">Read more →</span>
    </div>
  );
}

function BlogModal({ blog, onClose }) {
  if (!blog) return null;
  return (
    <div className="blog-modal-overlay" onClick={onClose}>
      <div className="blog-modal" onClick={(e) => e.stopPropagation()}>
        <button className="blog-modal-close" onClick={onClose}>✕</button>
        <div className="blog-modal-emoji">{blog.emoji}</div>
        <h2>{blog.title}</h2>
        <p>{blog.content}</p>
      </div>
    </div>
  );
}

function Blog() {
  const [selectedBlog, setSelectedBlog] = useState(null);

  return (
    <section className="blog" id="blog">
      <h2> Life Mentor Insights </h2>

      <div className="blog-grid">
        {blogs.map((blog) => (
          <BlogCard key={blog.id} blog={blog} onClick={setSelectedBlog} />
        ))}
      </div>

      <BlogModal blog={selectedBlog} onClose={() => setSelectedBlog(null)} />
    </section>
  );
}

export default Blog;

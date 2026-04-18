import { useEffect, useState } from "react";
import { getToken } from "../utils/auth";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Area, AreaChart
} from "recharts";
import "../App.css";

const BACKEND = "https://life-mentor-backend.onrender.com";

const moodScore = {
  happy: 5,
  neutral: 3,
  anxious: 2,
  stressed: 2,
  overwhelmed: 1,
  lonely: 1,
  sad: 1,
};

const moodEmoji = {
  happy: "😊", neutral: "😐", anxious: "😟",
  stressed: "😰", overwhelmed: "😫", lonely: "🥺", sad: "😢",
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="mood-tooltip">
        <p className="mood-tooltip-date">{d.date}</p>
        <p className="mood-tooltip-mood">
          {moodEmoji[d.mood]} {d.mood}
        </p>
        <p className="mood-tooltip-msg">"{d.message}"</p>
      </div>
    );
  }
  return null;
};

function MoodGraph() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = getToken();

  useEffect(() => {
    fetch(`${BACKEND}/api/ai/history`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((entries) => {
        const sorted = [...entries].reverse(); // oldest first
        const graphData = sorted.map((e) => ({
          date: e.date,
          score: moodScore[e.mood] || 3,
          mood: e.mood,
          message: e.message,
        }));
        setData(graphData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p className="appt-empty">Loading mood data...</p>;

  if (data.length === 0)
    return (
      <div className="mood-graph-empty">
        <p>📊 No mood data yet.</p>
        <p>Start your first AI check-in to see your mood graph here!</p>
      </div>
    );

  // Summary stats
  const avg = (data.reduce((s, d) => s + d.score, 0) / data.length).toFixed(1);
  const best = data.reduce((a, b) => (a.score > b.score ? a : b));
  const latest = data[data.length - 1];

  return (
    <div className="mood-graph-wrapper">

      {/* Stats row */}
      <div className="mood-stats-row">
        <div className="mood-stat-box">
          <span className="mood-stat-num">{avg}/5</span>
          <span className="mood-stat-label">Average Mood</span>
        </div>
        <div className="mood-stat-box">
          <span className="mood-stat-num">{moodEmoji[latest?.mood]}</span>
          <span className="mood-stat-label">Latest Mood</span>
        </div>
        <div className="mood-stat-box">
          <span className="mood-stat-num">{data.length}</span>
          <span className="mood-stat-label">Check-ins Done</span>
        </div>
        <div className="mood-stat-box">
          <span className="mood-stat-num">{moodEmoji[best?.mood]}</span>
          <span className="mood-stat-label">Best Day</span>
        </div>
      </div>

      {/* Chart */}
      <div className="mood-chart-box">
        <h3>Your Mood Journey</h3>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6aab99" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6aab99" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0f0eb" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#6a8a80" }}
              tickFormatter={(v) => v.slice(5)} // show MM-DD
            />
            <YAxis
              domain={[0, 5]}
              ticks={[1, 2, 3, 4, 5]}
              tick={{ fontSize: 11, fill: "#6a8a80" }}
              tickFormatter={(v) => ["", "😢", "😰", "😐", "🙂", "😊"][v] || v}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="score"
              stroke="#6aab99"
              strokeWidth={2.5}
              fill="url(#moodGradient)"
              dot={{ fill: "#6aab99", r: 5, strokeWidth: 2, stroke: "#fff" }}
              activeDot={{ r: 7, fill: "#2c6e5a" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Mood scale legend */}
      <div className="mood-legend">
        <span>😢 Low</span>
        <span>😰 Stressed</span>
        <span>😐 Neutral</span>
        <span>🙂 Good</span>
        <span>😊 Great</span>
      </div>
    </div>
  );
}

export default MoodGraph;

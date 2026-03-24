import { useEffect, useState } from "react";
import { getToken } from "../utils/auth";
import PageWrapper from "../components/PageWrapper";
import "../App.css";

function Ratings() {
  const token = getToken();
  const [ratings, setRatings] = useState([]);

  useEffect(() => {
    fetch("https://life-mentor-backend.onrender.com/api/ratings", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setRatings(data));
  }, []);

  const avgRating =
    ratings.length > 0
      ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
      : 0;

  return (
    <PageWrapper>
      <div className="ratings-page">
        <div className="ratings-header">
          <h1>Client Ratings</h1>
          <div className="ratings-avg">
            <span className="avg-score">⭐ {avgRating}</span>
            <span className="avg-label">Average Rating</span>
          </div>
        </div>

        {ratings.length === 0 ? (
          <p className="appt-empty">No ratings yet.</p>
        ) : (
          <div className="ratings-grid">
            {ratings.map((r) => (
              <div key={r._id} className="rating-card">
                <h3>{r.user?.name}</h3>
                <div className="rating-stars">
                  {[1,2,3,4,5].map((star) => (
                    <span key={star} style={{ color: star <= r.rating ? "#f5a623" : "#ddd", fontSize: "20px" }}>
                      ★
                    </span>
                  ))}
                  <span className="rating-num">{r.rating}/5</span>
                </div>
                <p className="rating-review">"{r.review}"</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

export default Ratings;

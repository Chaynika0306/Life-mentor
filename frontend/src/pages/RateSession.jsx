import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken } from "../utils/auth";
import PageWrapper from "../components/PageWrapper";
import "../App.css";

function RateSession() {
  const token = getToken();
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { setMessage("Please select a star rating first!"); return; }
    try {
      const res = await fetch("https://life-mentor-backend.onrender.com/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rating: Number(rating), review }),
      });
      if (res.ok) {
        setSuccess(true);
        setReview("");
        setRating(0);
        setTimeout(() => { setSuccess(false); navigate("/"); }, 3000);
      }
    } catch {
      setMessage("Something went wrong.");
    }
  };

  return (
    <PageWrapper>
      <div className="auth-page">
        <div className="auth-box rate-session-box">

          <h1>Rate Your Experience</h1>
          <p className="rate-subtitle">How was your session with us?</p>

          <form onSubmit={handleSubmit}>

            {/* STAR RATING */}
            <div className="star-row">
              {[1,2,3,4,5].map((star) => (
                <span
                  key={star}
                  className={`star ${star <= (hover || rating) ? "active" : ""}`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                >
                  ★
                </span>
              ))}
            </div>
            {rating > 0 && (
              <p className="star-label">
                {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
              </p>
            )}

            {/* REVIEW */}
            <div className="form-group" style={{ marginTop: "20px" }}>
              <label>Your Feedback</label>
              <textarea
                placeholder="Write your feedback..."
                value={review}
                onChange={(e) => setReview(e.target.value)}
                rows={4}
                required
              />
            </div>

            <button type="submit" className="primary-btn" style={{ width: "100%", marginTop: "8px" }}>
              ⭐ Submit Rating
            </button>

          </form>

          {message && <div className="error-popup">{message}</div>}
          {success && <div className="success-popup">❤️ Thank you for your feedback!</div>}

        </div>
      </div>
    </PageWrapper>
  );
}

export default RateSession;

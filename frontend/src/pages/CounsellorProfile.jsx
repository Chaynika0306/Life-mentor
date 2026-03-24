import { useEffect, useState } from "react";
import { getToken, getUser } from "../utils/auth";
import PageWrapper from "../components/PageWrapper";
import "../App.css";

function CounsellorProfile() {
  const token = getToken();
  const user = getUser();

  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [certificateTitle, setCertificateTitle] = useState("");
  const [certificateImage, setCertificateImage] = useState(null);

  useEffect(() => {
    fetch("https://life-mentor-backend.onrender.com/api/profile")
      .then((res) => res.json())
      .then((data) => setProfile(data));
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    const formData = new FormData();
    formData.append("name", profile.name);
    formData.append("email", profile.email);
    formData.append("specialization", profile.specialization);
    formData.append("experience", profile.experience);
    formData.append("fees", profile.fees);
    formData.append("bio", profile.bio);
    if (certificateTitle) formData.append("certificateTitle", certificateTitle);
    if (certificateImage) formData.append("certificateImage", certificateImage);

    await fetch("https://life-mentor-backend.onrender.com/api/profile", {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    setEditMode(false);
    window.location.reload();
  };

  if (!profile) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-box"><h2>Loading...</h2></div>
      </div>
    );
  }

  return (
    <PageWrapper>
      <div className="profile-page">

        {/* HEADER CARD */}
        <div className="profile-header-card">
          <div className="profile-avatar">
            {profile.name?.charAt(0).toUpperCase()}
          </div>
          <div className="profile-header-info">
            <h1>{profile.name}</h1>
            <p className="profile-specialization">🎓 {profile.specialization}</p>
            <div className="profile-badges">
              <span className="badge">⏱ {profile.experience}</span>
              <span className="badge">💰 ₹{profile.fees} / session</span>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="profile-body">

          {editMode ? (
            <div className="profile-edit-card">
              <h2>Edit Profile</h2>

              <div className="profile-form-grid">
                <div className="form-group">
                  <label>Name</label>
                  <input name="name" value={profile.name} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input name="email" value={profile.email} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Specialization</label>
                  <input name="specialization" value={profile.specialization} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Experience</label>
                  <input name="experience" value={profile.experience} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Fees (₹)</label>
                  <input name="fees" value={profile.fees} onChange={handleChange} />
                </div>
              </div>

              <div className="form-group full-width">
                <label>Bio</label>
                <textarea name="bio" value={profile.bio} onChange={handleChange} rows={4} />
              </div>

              <div className="profile-cert-section">
                <h3>Add Certificate</h3>
                <div className="cert-inputs">
                  <input
                    type="text"
                    placeholder="Certificate Title"
                    value={certificateTitle}
                    onChange={(e) => setCertificateTitle(e.target.value)}
                  />
                  <input
                    type="file"
                    onChange={(e) => setCertificateImage(e.target.files[0])}
                  />
                </div>
              </div>

              <div className="profile-edit-actions">
                <button className="primary-btn" onClick={handleSave}>💾 Save Changes</button>
                <button className="cancel-btn" onClick={() => setEditMode(false)}>Cancel</button>
              </div>
            </div>

          ) : (
            <div className="profile-view-card">

              {/* BIO */}
              <div className="profile-section">
                <h2>About</h2>
                <p className="profile-bio">{profile.bio}</p>
              </div>

              {/* DETAILS */}
              <div className="profile-section">
                <h2>Details</h2>
                <div className="profile-details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Specialization</span>
                    <span className="detail-value">{profile.specialization}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Experience</span>
                    <span className="detail-value">{profile.experience}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Session Fee</span>
                    <span className="detail-value">₹{profile.fees}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Email</span>
                    <span className="detail-value">{profile.email}</span>
                  </div>
                </div>
              </div>

              {/* CERTIFICATES */}
              {profile.certificates?.length > 0 && (
                <div className="profile-section">
                  <h2>Certificates</h2>
                  <div className="cert-grid">
                    {profile.certificates.map((cert, index) => (
                      <div key={index} className="cert-card">
                        <p className="cert-title">{cert.title}</p>
                        <img
                          src={`https://life-mentor-backend.onrender.com/uploads/${cert.image}`}
                          alt="certificate"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* EDIT BUTTON */}
              {(user?.role === "admin" || user?.role === "counsellor") && (
                <button className="primary-btn" onClick={() => setEditMode(true)}>
                  ✏️ Edit Profile
                </button>
              )}

            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}

export default CounsellorProfile;

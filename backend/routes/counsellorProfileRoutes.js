const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const CounsellorProfile = require("../models/CounsellorProfile");

const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// ✅ Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Multer storage using Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "life-mentor-certificates",
    allowed_formats: ["jpg", "jpeg", "png", "pdf"],
  },
});

const upload = multer({ storage });

/* ── GET PROFILE (Public) ── */
router.get("/", async (req, res) => {
  try {
    const profile = await CounsellorProfile.findOne();
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: "Error fetching profile" });
  }
});

/* ── UPDATE PROFILE (Counsellor/Admin) ── */
router.put("/", protect, upload.single("certificateImage"), async (req, res) => {
  try {
    let profile = await CounsellorProfile.findOne();

    if (!profile) {
      profile = new CounsellorProfile();
    }

    profile.name           = req.body.name;
    profile.email          = req.body.email;
    profile.specialization = req.body.specialization;
    profile.experience     = req.body.experience;
    profile.fees           = req.body.fees;
    profile.bio            = req.body.bio;

    // ✅ Cloudinary returns a secure_url instead of a local filename
    if (req.file) {
      profile.certificates.push({
        title: req.body.certificateTitle,
        image: req.file.path, // Cloudinary secure URL
      });
    }

    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ message: "Error updating profile" });
  }
});

module.exports = router;

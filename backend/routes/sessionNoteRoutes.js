const express = require("express");
const router = express.Router();
const { protect, counsellorOnly } = require("../middleware/authMiddleware");
const SessionNote = require("../models/SessionNote");

// POST — Add note for an appointment
router.post("/", protect, counsellorOnly, async (req, res) => {
  try {
    const { appointmentId, clientName, clientEmail, sessionDate, notes } = req.body;

    if (!notes || !appointmentId) {
      return res.status(400).json({ message: "Notes and appointmentId are required" });
    }

    // Check if note already exists for this appointment
    const existing = await SessionNote.findOne({ appointmentId });
    if (existing) {
      // Update existing note
      existing.notes = notes;
      await existing.save();
      return res.json(existing);
    }

    const note = await SessionNote.create({
      appointmentId,
      clientName,
      clientEmail,
      sessionDate,
      notes,
      counsellorId: req.user.id,
    });

    res.status(201).json(note);
  } catch (err) {
    console.error("Session note error:", err);
    res.status(500).json({ message: "Failed to save note" });
  }
});

// GET — All notes (counsellor only)
router.get("/", protect, counsellorOnly, async (req, res) => {
  try {
    const notes = await SessionNote.find({ counsellorId: req.user.id })
      .sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch notes" });
  }
});

// GET — Note for specific appointment
router.get("/:appointmentId", protect, counsellorOnly, async (req, res) => {
  try {
    const note = await SessionNote.findOne({ appointmentId: req.params.appointmentId });
    res.json(note || null);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch note" });
  }
});

// DELETE — Delete a note
router.delete("/:id", protect, counsellorOnly, async (req, res) => {
  try {
    await SessionNote.findByIdAndDelete(req.params.id);
    res.json({ message: "Note deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete note" });
  }
});

module.exports = router;

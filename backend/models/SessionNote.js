const mongoose = require("mongoose");

const sessionNoteSchema = new mongoose.Schema({
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment",
    required: true,
  },
  clientName: {
    type: String,
    required: true,
  },
  clientEmail: {
    type: String,
    required: true,
  },
  sessionDate: {
    type: String,
    required: true,
  },
  notes: {
    type: String,
    required: true,
  },
  counsellorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model("SessionNote", sessionNoteSchema);

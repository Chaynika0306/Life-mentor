const express = require("express");
const router = express.Router();

const {
  createAppointment,
  getAppointments,
  getMyAppointments,
  deleteAppointment,
  updateAppointmentStatus,
  getBookedSlots,
  cancelAppointment,
} = require("../controllers/appointmentController");

const { protect, counsellorOnly } = require("../middleware/authMiddleware");

// Client: Book appointment
router.post("/", protect, createAppointment);

// Client: Get MY appointments
router.get("/my", protect, getMyAppointments);

// Client: Cancel own appointment
router.delete("/cancel/:id", protect, cancelAppointment);

// Counsellor: Get ALL appointments
router.get("/", protect, counsellorOnly, getAppointments);

// Counsellor: Delete appointment
router.delete("/:id", protect, counsellorOnly, deleteAppointment);

// Counsellor: Update Status
router.put("/:id", protect, counsellorOnly, updateAppointmentStatus);

// Get booked slots by date
router.get("/booked-slots", protect, getBookedSlots);

module.exports = router;

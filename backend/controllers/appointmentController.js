const Appointment = require("../models/Appointment");
const sendEmail = require("../utils/email");
const { sendNotificationToUser, sendNotificationToCounsellor } = require("../utils/pushNotification");
const User = require("../models/User");

// ── CREATE APPOINTMENT ──────────────────────────────────
exports.createAppointment = async (req, res) => {
  try {
    const { clientName, clientEmail, date, time } = req.body;

    if (!clientName || !clientEmail || !date || !time) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const requestedStart = new Date(`${date}T${time}:00`);
    const requestedEnd = new Date(requestedStart.getTime() + 60 * 60 * 1000);
    const existingAppointments = await Appointment.find({ date });

    for (const appt of existingAppointments) {
      const existingStart = new Date(`${appt.date}T${appt.time}:00`);
      const existingEnd = new Date(existingStart.getTime() + 60 * 60 * 1000);
      if (requestedStart < existingEnd && requestedEnd > existingStart) {
        return res.status(400).json({ message: "This time slot overlaps with another booked session." });
      }
    }

    const appointment = await Appointment.create({
      clientName, clientEmail, date, time,
      status: "Pending",
      user: req.user.id,
    });

    // ✅ Send response immediately
    res.status(201).json(appointment);

    // 📧 Email to COUNSELLOR (background)
    sendEmail(
      "hrishabhadhikari@gmail.com",
      "📅 New Session Booked — Life Mentor",
      "",
      `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2c6e5a;">New Session Booking 📅</h2>
        <p>A new counselling session has been booked on <strong>Life Mentor</strong>.</p>
        <div style="background: #f5faf8; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #6aab99;">
          <p><strong>👤 Client Name:</strong> ${clientName}</p>
          <p><strong>📧 Client Email:</strong> ${clientEmail}</p>
          <p><strong>📅 Date:</strong> ${date}</p>
          <p><strong>🕐 Time:</strong> ${time}</p>
          <p><strong>Status:</strong> <span style="color: #ffa500;">⏳ Pending</span></p>
        </div>
        <p>Please login to your dashboard to confirm or manage this appointment.</p>
        <p style="color: #6aab99; font-style: italic;">— Life Mentor Platform 💚</p>
      </div>
      `
    ).catch(err => console.error("Counsellor email error:", err));

    // 🔔 Push notification to counsellor
    sendNotificationToCounsellor(
      "📅 New Session Booked!",
      `${clientName} booked a session on ${date} at ${time}.`
    );

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "This time slot is already booked." });
    }
    console.error("CREATE APPOINTMENT ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ── GET ALL APPOINTMENTS (Counsellor) ───────────────────
exports.getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ createdAt: -1 });
    res.json(appointments);
  } catch (error) {
    console.error("GET APPOINTMENTS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ── DELETE APPOINTMENT ──────────────────────────────────
exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    res.json({ message: "Appointment deleted successfully" });
  } catch (error) {
    console.error("DELETE APPOINTMENT ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ── UPDATE STATUS (Confirm) ─────────────────────────────
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    appointment.status = req.body.status;
    await appointment.save();

    // ✅ Send response immediately
    res.json({ message: "Status updated successfully" });

    // 📧 Email to CLIENT when confirmed (background)
    if (appointment.status === "Confirmed") {
      sendEmail(
        appointment.clientEmail,
        "✅ Your Session is Confirmed — Life Mentor",
        "",
        `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2c6e5a;">Your Session is Confirmed! ✅</h2>
          <p>Hello <strong>${appointment.clientName}</strong>,</p>
          <p>Great news! Your counselling session on <strong>Life Mentor</strong> has been confirmed.</p>
          <div style="background: #f5faf8; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #4caf50;">
            <p><strong>📅 Date:</strong> ${appointment.date}</p>
            <p><strong>🕐 Time:</strong> ${appointment.time}</p>
            <p><strong>Status:</strong> <span style="color: #4caf50;">✅ Confirmed</span></p>
          </div>
          <p>Please be ready a few minutes before your scheduled time. We look forward to supporting you on your journey. 💚</p>
          <p style="color: #6aab99; font-style: italic;">— Life Mentor Platform 💚</p>
          <p style="font-size: 12px; color: #aaa;">Questions? Contact us at lifementor0306@gmail.com</p>
        </div>
        `
      ).catch(err => console.error("Client email error:", err));

      // 🔔 Push notification to client
      sendNotificationToUser(
        appointment.user,
        "✅ Session Confirmed!",
        `Your session on ${appointment.date} at ${appointment.time} is confirmed. See you soon! 💚`
      );
    }

  } catch (error) {
    console.error("UPDATE STATUS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ── GET USER'S APPOINTMENTS ─────────────────────────────
exports.getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(appointments);
  } catch (error) {
    console.error("GET MY APPOINTMENTS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ── GET BOOKED SLOTS BY DATE ────────────────────────────
exports.getBookedSlots = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: "Date is required" });
    const appointments = await Appointment.find({ date });
    const bookedSlots = appointments.map(a => a.time).sort((a, b) => a.localeCompare(b));
    res.json(bookedSlots);
  } catch (error) {
    console.error("GET BOOKED SLOTS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ── CLIENT CANCEL OWN APPOINTMENT ──────────────────────
exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    if (appointment.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Not authorized to cancel this appointment" });
    }

    if (appointment.status === "Confirmed") {
      return res.status(400).json({ message: "Confirmed appointments cannot be cancelled. Please contact your counsellor." });
    }

    await Appointment.findByIdAndDelete(req.params.id);

    sendNotificationToCounsellor(
      "❌ Appointment Cancelled",
      `${appointment.clientName} cancelled their session on ${appointment.date} at ${appointment.time}.`
    );

    res.json({ message: "Appointment cancelled successfully" });
  } catch (error) {
    console.error("CANCEL APPOINTMENT ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

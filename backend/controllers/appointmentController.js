const Appointment = require("../models/Appointment");
const Notification = require("../models/Notification");
const sendEmail = require("../utils/email");
const { sendNotificationToUser, sendNotificationToCounsellor } = require("../utils/pushNotification");
const { emitToUser } = require("../socket");
const User = require("../models/User");

const COUNSELLOR_ID = process.env.COUNSELLOR_USER_ID;
const COUNSELLOR_EMAIL = process.env.COUNSELLOR_EMAIL || "hrishabhadhikari@gmail.com";

// ── Helper: Save notification to DB + emit via socket ───────────────────────
const createAndEmitNotification = async (userId, title, message, type) => {
  try {
    const notification = await Notification.create({ userId, title, message, type });
    emitToUser(userId?.toString(), "new_notification", notification);
  } catch (err) {
    console.error("Notification error:", err.message);
  }
};

// ── CREATE APPOINTMENT ───────────────────────────────────────────────────────
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

    res.status(201).json(appointment);

    // 🔔 In-app notification → COUNSELLOR
    if (COUNSELLOR_ID) {
      createAndEmitNotification(
        COUNSELLOR_ID,
        "📅 New Session Booked!",
        `${clientName} has booked a session on ${date} at ${time}.`,
        "booking"
      );
    }

    // 📧 Email → COUNSELLOR
    sendEmail(
      COUNSELLOR_EMAIL,
      "📅 New Session Booked — Life Mentor",
      "",
      `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
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
      </div>`
    ).catch(err => console.error("Counsellor email error:", err));

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

// ── GET ALL APPOINTMENTS (Counsellor) ────────────────────────────────────────
exports.getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ createdAt: -1 });
    res.json(appointments);
  } catch (error) {
    console.error("GET APPOINTMENTS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ── DELETE APPOINTMENT (Counsellor deletes) ───────────────────────────────────
// This is when counsellor hard-deletes from dashboard
exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ message: "Appointment deleted successfully" });

    // 🔔 In-app notification → CLIENT
    if (appointment.user) {
      createAndEmitNotification(
        appointment.user,
        "❌ Session Removed",
        `Your session on ${appointment.date} at ${appointment.time} has been removed by the counsellor. Please contact us for more info.`,
        "cancellation"
      );
    }

    // 📧 Email → CLIENT
    sendEmail(
      appointment.clientEmail,
      "❌ Your Session Has Been Removed — Life Mentor",
      "",
      `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #c0392b;">Session Removed ❌</h2>
        <p>Hello <strong>${appointment.clientName}</strong>,</p>
        <p>We're writing to let you know that your counselling session has been removed from our system.</p>
        <div style="background: #fff5f5; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #e05555;">
          <p><strong>📅 Date:</strong> ${appointment.date}</p>
          <p><strong>🕐 Time:</strong> ${appointment.time}</p>
        </div>
        <p>If you have any questions or would like to rebook, please reach out to us at <a href="mailto:lifementor0306@gmail.com">lifementor0306@gmail.com</a>.</p>
        <p style="color: #6aab99; font-style: italic;">— Life Mentor Platform 💚</p>
      </div>`
    ).catch(err => console.error("Client delete email error:", err));

  } catch (error) {
    console.error("DELETE APPOINTMENT ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ── UPDATE STATUS (Counsellor confirms OR cancels) ────────────────────────────
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    appointment.status = req.body.status;
    await appointment.save();

    res.json({ message: "Status updated successfully" });

    // ── CONFIRMED ────────────────────────────────────────────────────────────
    if (appointment.status === "Confirmed" && appointment.user) {

      // 🔔 In-app notification → CLIENT
      createAndEmitNotification(
        appointment.user,
        "✅ Session Confirmed!",
        `Your session on ${appointment.date} at ${appointment.time} has been confirmed. See you soon! 💚`,
        "confirmation"
      );

      // 📧 Email → CLIENT
      sendEmail(
        appointment.clientEmail,
        "✅ Your Session is Confirmed — Life Mentor",
        "",
        `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2c6e5a;">Your Session is Confirmed! ✅</h2>
          <p>Hello <strong>${appointment.clientName}</strong>,</p>
          <p>Great news! Your counselling session has been confirmed.</p>
          <div style="background: #f5faf8; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #4caf50;">
            <p><strong>📅 Date:</strong> ${appointment.date}</p>
            <p><strong>🕐 Time:</strong> ${appointment.time}</p>
            <p><strong>Status:</strong> <span style="color: #4caf50;">✅ Confirmed</span></p>
          </div>
          <p>Please be ready a few minutes before your scheduled time. We look forward to supporting you. 💚</p>
          <p style="color: #6aab99; font-style: italic;">— Life Mentor Platform 💚</p>
          <p style="font-size: 12px; color: #aaa;">Questions? Contact us at lifementor0306@gmail.com</p>
        </div>`
      ).catch(err => console.error("Client confirm email error:", err));

      sendNotificationToUser(
        appointment.user,
        "✅ Session Confirmed!",
        `Your session on ${appointment.date} at ${appointment.time} is confirmed. See you soon! 💚`
      );
    }

    // ── CANCELLED by COUNSELLOR ──────────────────────────────────────────────
    if (appointment.status === "Cancelled" && appointment.user) {

      // 🔔 In-app notification → CLIENT
      createAndEmitNotification(
        appointment.user,
        "❌ Session Cancelled by Counsellor",
        `Unfortunately, your session on ${appointment.date} at ${appointment.time} has been cancelled. Please rebook or contact us.`,
        "cancellation"
      );

      // 📧 Email → CLIENT
      sendEmail(
        appointment.clientEmail,
        "❌ Your Session Has Been Cancelled — Life Mentor",
        "",
        `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #c0392b;">Session Cancelled ❌</h2>
          <p>Hello <strong>${appointment.clientName}</strong>,</p>
          <p>We regret to inform you that your counselling session has been <strong>cancelled</strong> by the counsellor.</p>
          <div style="background: #fff5f5; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #e05555;">
            <p><strong>📅 Date:</strong> ${appointment.date}</p>
            <p><strong>🕐 Time:</strong> ${appointment.time}</p>
            <p><strong>Status:</strong> <span style="color: #e05555;">❌ Cancelled</span></p>
          </div>
          <p>We apologise for the inconvenience. You can rebook another session anytime or reach us at <a href="mailto:lifementor0306@gmail.com">lifementor0306@gmail.com</a>.</p>
          <p style="color: #6aab99; font-style: italic;">— Life Mentor Platform 💚</p>
        </div>`
      ).catch(err => console.error("Client cancel email error:", err));
    }

  } catch (error) {
    console.error("UPDATE STATUS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ── GET USER'S APPOINTMENTS ───────────────────────────────────────────────────
exports.getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(appointments);
  } catch (error) {
    console.error("GET MY APPOINTMENTS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ── GET BOOKED SLOTS BY DATE ──────────────────────────────────────────────────
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

// ── CLIENT CANCEL OWN APPOINTMENT ────────────────────────────────────────────
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
    res.json({ message: "Appointment cancelled successfully" });

    // 🔔 In-app notification → COUNSELLOR
    if (COUNSELLOR_ID) {
      createAndEmitNotification(
        COUNSELLOR_ID,
        "❌ Session Cancelled by Client",
        `${appointment.clientName} cancelled their session on ${appointment.date} at ${appointment.time}.`,
        "cancellation"
      );
    }

    // 📧 Email → COUNSELLOR
    sendEmail(
      COUNSELLOR_EMAIL,
      "❌ Session Cancelled by Client — Life Mentor",
      "",
      `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #c0392b;">Session Cancelled by Client ❌</h2>
        <p>A client has cancelled their session on <strong>Life Mentor</strong>.</p>
        <div style="background: #fff5f5; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #e05555;">
          <p><strong>👤 Client Name:</strong> ${appointment.clientName}</p>
          <p><strong>📧 Client Email:</strong> ${appointment.clientEmail}</p>
          <p><strong>📅 Date:</strong> ${appointment.date}</p>
          <p><strong>🕐 Time:</strong> ${appointment.time}</p>
        </div>
        <p>This slot is now available for rebooking.</p>
        <p style="color: #6aab99; font-style: italic;">— Life Mentor Platform 💚</p>
      </div>`
    ).catch(err => console.error("Counsellor cancel email error:", err));

    sendNotificationToCounsellor(
      "❌ Appointment Cancelled",
      `${appointment.clientName} cancelled their session on ${appointment.date} at ${appointment.time}.`
    );

  } catch (error) {
    console.error("CANCEL APPOINTMENT ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};
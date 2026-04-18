const Appointment = require("../models/Appointment");
const sendEmail = require("../utils/email");
const { sendNotificationToUser, sendNotificationToCounsellor } = require("../utils/pushNotification");
const User = require("../models/User");

// CREATE APPOINTMENT
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
      const overlap = requestedStart < existingEnd && requestedEnd > existingStart;
      if (overlap) {
        return res.status(400).json({ message: "This time slot overlaps with another booked session." });
      }
    }

    const appointment = await Appointment.create({
      clientName,
      clientEmail,
      date,
      time,
      status: "Pending",
      user: req.user.id,
    });

    // ✅ Send response first
    res.status(201).json(appointment);

    // 📧 Email to counsellor (background)
    sendEmail(
      "hrishabhadhikari@gmail.com",
      "New Session Booking - Life Mentor",
      `A new counselling session has been booked.\n\nClient Name: ${clientName}\nClient Email: ${clientEmail}\nDate: ${date}\nTime: ${time}\n\nPlease login to confirm the session.`
    ).catch((err) => console.error("EMAIL ERROR:", err));

    // 🔔 Push notification to counsellor
    sendNotificationToCounsellor(
      "📅 New Session Booked!",
      `${clientName} has booked a session on ${date} at ${time}. Please login to confirm.`
    );

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "This time slot is already booked." });
    }
    console.error("CREATE APPOINTMENT ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET ALL APPOINTMENTS (Counsellor)
exports.getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ createdAt: -1 });
    res.json(appointments);
  } catch (error) {
    console.error("GET APPOINTMENTS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE APPOINTMENT
exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    res.json({ message: "Appointment deleted successfully" });
  } catch (error) {
    console.error("DELETE APPOINTMENT ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE STATUS
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    appointment.status = req.body.status;
    await appointment.save();

    // ✅ Send response first
    res.json({ message: "Status updated successfully" });

    // 📧 Email to client (background)
    if (appointment.status === "Confirmed") {
      sendEmail(
        appointment.clientEmail,
        "Your Session is Confirmed ✅",
        `Your counselling session has been confirmed.\n\nDate: ${appointment.date}\nTime: ${appointment.time}\n\nThank you for choosing Life Mentor ❤️`
      ).catch((err) => console.error("EMAIL ERROR:", err));

      // 🔔 Push notification to client
      sendNotificationToUser(
        appointment.user,
        "✅ Session Confirmed!",
        `Your session on ${appointment.date} at ${appointment.time} has been confirmed. See you soon! 💚`
      );
    }

  } catch (error) {
    console.error("UPDATE STATUS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET USER'S APPOINTMENTS
exports.getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(appointments);
  } catch (error) {
    console.error("GET MY APPOINTMENTS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET BOOKED SLOTS BY DATE
exports.getBookedSlots = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: "Date is required" });
    const appointments = await Appointment.find({ date });
    const bookedSlots = appointments.map((appt) => appt.time).sort((a, b) => a.localeCompare(b));
    res.json(bookedSlots);
  } catch (error) {
    console.error("GET BOOKED SLOTS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// CLIENT CANCEL OWN APPOINTMENT
exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Make sure the appointment belongs to this user
    if (appointment.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Not authorized to cancel this appointment" });
    }

    // Only allow cancellation of pending appointments
    if (appointment.status === "Confirmed") {
      return res.status(400).json({ message: "Confirmed appointments cannot be cancelled. Please contact your counsellor." });
    }

    await Appointment.findByIdAndDelete(req.params.id);

    // Notify counsellor about cancellation
    sendNotificationToCounsellor(
      "❌ Appointment Cancelled",
      `${appointment.clientName} has cancelled their session on ${appointment.date} at ${appointment.time}.`
    );

    res.json({ message: "Appointment cancelled successfully" });
  } catch (error) {
    console.error("CANCEL APPOINTMENT ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const dns = require("dns");
dns.setDefaultResultOrder("ipv4first"); // ✅ IPv4 force fix

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ Booking email (HTML)
const sendBookingEmail = async (to, name, date, time) => {
  try {
    await transporter.sendMail({
      from: `"LifeMentor" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Session Booking Confirmation",
      html: `
        <h2>Hello ${name},</h2>
        <p>Your counselling session has been booked.</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${time}</p>
        <p>Status: Pending confirmation</p>
        <br/>
        <p>Thank you 💚</p>
      `,
    });

    console.log("✅ Booking email sent");
  } catch (error) {
    console.error("❌ Booking email error:", error);
  }
};

// ✅ Simple text email
const sendEmail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: `"LifeMentor" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });

    console.log("✅ Email sent");
  } catch (error) {
    console.error("❌ Email error:", error);
  }
};

module.exports = {
  sendBookingEmail,
  sendEmail,
};
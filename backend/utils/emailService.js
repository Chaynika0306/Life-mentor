const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,        // TLS — NOT SSL (port 465 is blocked on Render)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

exports.sendBookingEmail = async (to, name, date, time) => {
  await transporter.sendMail({
    from: `"Life Mentor" <${process.env.EMAIL_USER}>`,
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
};

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendBookingEmail = async (to, name, date, time) => {
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
};
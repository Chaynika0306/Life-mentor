const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "@gmail.com",
  port: 465,
  secure: true,
  auth: {

    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const sendEmail = async (to, subject, text, html) => {
  try {
    await transporter.sendMail({
      from: `"Life Mentor" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      ...(html ? { html } : { text }),
    });
    console.log("✅ Email sent to:", to);
  } catch (err) {
    console.error("❌ Email error:", err.message);
  }
};

module.exports = sendEmail;
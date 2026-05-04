const dns = require("dns");
dns.setDefaultResultOrder("ipv4first"); // ✅ IPv4 fix

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

// ✅ TEXT EMAIL
const sendEmail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: `"LifeMentor" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });

    console.log("✅ Text email sent");
  } catch (error) {
    console.error("❌ Text email error:", error);
  }
};

// ✅ HTML EMAIL (NEW FUNCTION 🔥)
const sendHtmlEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"LifeMentor" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("✅ HTML email sent");
  } catch (error) {
    console.error("❌ HTML email error:", error);
  }
};

module.exports = {
  sendEmail,
  sendHtmlEmail,
};
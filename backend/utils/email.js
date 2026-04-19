const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (to, subject, text, html) => {
  try {
    const result = await resend.emails.send({
      from: "Life Mentor <onboarding@resend.dev>",
      to,
      subject,
      ...(html ? { html } : { text }),
    });
    console.log("✅ Email sent to:", to, result);
  } catch (err) {
    console.error("❌ Email error:", err.message);
  }
};

module.exports = sendEmail;

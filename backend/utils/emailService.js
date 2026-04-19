const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

exports.sendBookingEmail = async (to, name, date, time) => {
  try {
    const result = await resend.emails.send({
      from: "Life Mentor <onboarding@resend.dev>",
      to,
      subject: "Session Booking Confirmation — Life Mentor",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2c6e5a;">Session Booked! 📅</h2>
          <p>Hello <strong>${name}</strong>,</p>
          <p>Your counselling session has been booked on <strong>Life Mentor</strong>.</p>
          <div style="background: #f5faf8; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <p><strong>📅 Date:</strong> ${date}</p>
            <p><strong>🕐 Time:</strong> ${time}</p>
            <p><strong>Status:</strong> <span style="color: #ffa500;">⏳ Pending Confirmation</span></p>
          </div>
          <p>Our counsellor will confirm your session shortly. Thank you for choosing Life Mentor 💚</p>
        </div>
      `,
    });
    console.log("✅ Booking email sent to:", to, result);
  } catch (err) {
    console.error("❌ Booking email error:", err.message);
  }
};

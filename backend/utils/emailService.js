const nodemailer = require("nodemailer");
const { google } = require("googleapis");

const OAuth2 = google.auth.OAuth2;

const createTransporter = async () => {
  const oauth2Client = new OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN,
  });

  const accessTokenResponse = await oauth2Client.getAccessToken();

  if (!accessTokenResponse?.token) {
    throw new Error(
      "Failed to retrieve access token — check refresh token or OAuth credentials"
    );
  }

  console.log("✅ Access token fetched successfully");

  const transporter = nodemailer.createTransport({
    service: "gmail",
    family: 4, // Force IPv4 to avoid connection timeout
    auth: {
      type: "OAuth2",
      user: process.env.EMAIL_USER,
      clientId: process.env.GMAIL_CLIENT_ID,
      clientSecret: process.env.GMAIL_CLIENT_SECRET,
      refreshToken: process.env.GMAIL_REFRESH_TOKEN,
      accessToken: accessTokenResponse.token,
    },
  });

  return transporter;
};

// ✅ Plain text email
const sendEmail = async (to, subject, text) => {
  try {
    const transporter = await createTransporter();
    await transporter.sendMail({
      from: `"Life Mentor" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });
    console.log("✅ Text email sent to:", to);
  } catch (err) {
    console.error("❌ Text email error:", err.message);
  }
};

// ✅ HTML booking confirmation email
const sendBookingEmail = async (to, name, date, time) => {
  try {
    const transporter = await createTransporter();
    await transporter.sendMail({
      from: `"Life Mentor" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Session Booking Confirmation — Life Mentor",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2c6e5a;">Session Booked! 📅</h2>
          <p>Hello <strong>${name}</strong>,</p>
          <p>Your counselling session has been booked on <strong>Life Mentor</strong>.</p>
          <div style="background: #f5faf8; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #6aab99;">
            <p><strong>📅 Date:</strong> ${date}</p>
            <p><strong>🕐 Time:</strong> ${time}</p>
            <p><strong>Status:</strong> <span style="color: #ffa500;">⏳ Pending Confirmation</span></p>
          </div>
          <p>Our counsellor will confirm your session shortly. Thank you for choosing Life Mentor 💚</p>
          <p style="color: #6aab99; font-style: italic;">— Life Mentor Platform</p>
        </div>
      `,
    });
    console.log("✅ Booking email sent to:", to);
  } catch (err) {
    console.error("❌ Booking email error:", err.message);
  }
};

module.exports = { sendEmail, sendBookingEmail };
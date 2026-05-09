const { google } = require("googleapis");

const createGmailClient = async () => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN,
  });

  return google.gmail({ version: "v1", auth: oauth2Client });
};

// ✅ Encodes subject to support emojis and special characters
const encodeSubject = (subject) => {
  return `=?UTF-8?B?${Buffer.from(subject).toString("base64")}?=`;
};

const buildRawEmail = (to, from, subject, bodyText, bodyHtml) => {
  const boundary = "boundary_lifementor";
  const encodedSubject = encodeSubject(subject);
  let message;

  if (bodyHtml) {
    message = [
      `From: "Life Mentor" <${from}>`,
      `To: ${to}`,
      `Subject: ${encodedSubject}`,
      `MIME-Version: 1.0`,
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      ``,
      `--${boundary}`,
      `Content-Type: text/plain; charset="UTF-8"`,
      `Content-Transfer-Encoding: base64`,
      ``,
      Buffer.from(bodyText || "").toString("base64"),
      ``,
      `--${boundary}`,
      `Content-Type: text/html; charset="UTF-8"`,
      `Content-Transfer-Encoding: base64`,
      ``,
      Buffer.from(bodyHtml).toString("base64"),
      ``,
      `--${boundary}--`,
    ].join("\n");
  } else {
    message = [
      `From: "Life Mentor" <${from}>`,
      `To: ${to}`,
      `Subject: ${encodedSubject}`,
      `MIME-Version: 1.0`,
      `Content-Type: text/plain; charset="UTF-8"`,
      `Content-Transfer-Encoding: base64`,
      ``,
      Buffer.from(bodyText || "").toString("base64"),
    ].join("\n");
  }

  return Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

// ✅ Plain text email
const sendEmail = async (to, subject, text) => {
  try {
    const gmail = await createGmailClient();
    const raw = buildRawEmail(to, process.env.EMAIL_USER, subject, text, null);

    await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw },
    });

    console.log("✅ Text email sent to:", to);
  } catch (err) {
    console.error("❌ Text email error:", err.message);
  }
};

// ✅ HTML booking confirmation email
const sendBookingEmail = async (to, name, date, time) => {
  const html = `
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
  `;

  try {
    const gmail = await createGmailClient();
    const raw = buildRawEmail(
      to,
      process.env.EMAIL_USER,
      "Session Booking Confirmation — Life Mentor",
      "",
      html
    );

    await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw },
    });

    console.log("✅ Booking email sent to:", to);
  } catch (err) {
    console.error("❌ Booking email error:", err.message);
  }
};

module.exports = { sendEmail, sendBookingEmail };
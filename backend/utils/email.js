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

const sendEmail = async (to, subject, text, html) => {
  try {
    const gmail = await createGmailClient();
    const raw = buildRawEmail(to, process.env.EMAIL_USER, subject, text, html);

    await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw },
    });

    console.log("✅ Email sent to:", to);
  } catch (err) {
    console.error("❌ Email error:", err.message);
  }
};

module.exports = sendEmail;
const { MailtrapClient } = require("mailtrap");

// ──────────────────────────────────────────────
//  Mailtrap HTTP-based email client
//  Works in all deployment environments (Render, Vercel, Railway, etc.)
//  No SMTP ports required – uses HTTPS / REST API
// ──────────────────────────────────────────────

const getMailtrapClient = () => {
  const token = process.env.MAILTRAP_API_TOKEN;
  if (!token) {
    throw new Error(
      "Missing MAILTRAP_API_TOKEN in environment variables. Add it to your .env file."
    );
  }
  return new MailtrapClient({ token });
};

// Default sender address – must be a verified domain on Mailtrap
const getSender = () => ({
  email: process.env.MAILTRAP_FROM_EMAIL || "hello@demomailtrap.co",
  name: process.env.FROM_NAME || "SkillBarter",
});

// ──────────────────────────────────────────────
//  Generate 6-digit OTP
// ──────────────────────────────────────────────
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ──────────────────────────────────────────────
//  Generic email sender
//  Usage: sendEmail({ email, subject, message, html })
// ──────────────────────────────────────────────
const sendEmail = async ({ email, subject, message, html }) => {
  // ── Mock mode for local/CI testing ──
  if (process.env.USE_MOCK_EMAIL === "true") {
    console.log(`[MockEmail] To: ${email} | Subject: ${subject}`);
    return { success: true, messageId: "mock-" + Date.now() };
  }

  const client = getMailtrapClient();
  const sender = getSender();

  const response = await client.send({
    from: sender,
    to: [{ email }],
    subject,
    text: message,
    html: html || `<p>${message}</p>`,
    category: "Transactional",
  });

  console.log(`[Mailtrap] Email sent to ${email} | Subject: ${subject}`);
  return { success: true, messageId: response?.message_ids?.[0] || "sent" };
};

// ──────────────────────────────────────────────
//  OTP email sender
//  Usage: sendOTPEmail(email, otp, username)
// ──────────────────────────────────────────────
const sendOTPEmail = async (email, otp, username) => {
  const subject = "Your SkillBarter Login OTP";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SkillBarter Login Verification</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0"
          style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:-0.5px;">
                SkillBarter
              </h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">
                Secure Login Verification
              </p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 8px;color:#374151;font-size:16px;">
                Hello <strong style="color:#111827;">${username || "User"}</strong>,
              </p>
              <p style="margin:0 0 24px;color:#6b7280;font-size:14px;line-height:1.6;">
                We received a request to sign in to your SkillBarter account.
                Use the OTP below — it expires in <strong>10 minutes</strong>.
              </p>

              <!-- OTP Box -->
              <div style="background:#f3f4f6;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
                <p style="margin:0 0 8px;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:2px;">
                  One-Time Password
                </p>
                <span style="font-size:38px;font-weight:800;letter-spacing:10px;color:#6366f1;">
                  ${otp}
                </span>
              </div>

              <p style="margin:0 0 6px;color:#6b7280;font-size:13px;">
                ⏱ This OTP is valid for <strong>10 minutes</strong>.
              </p>
              <p style="margin:0;color:#6b7280;font-size:13px;">
                🔒 If you didn't request this, please ignore this email. Your account remains secure.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb;text-align:center;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">
                © ${new Date().getFullYear()} SkillBarter · All rights reserved
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const result = await sendEmail({
    email,
    subject,
    message: `Hello ${username || "User"},\n\nYour SkillBarter login OTP is: ${otp}\n\nThis OTP is valid for 10 minutes.\n\nIf you didn't request this, please ignore this email.`,
    html,
  });

  return result;
};

// ──────────────────────────────────────────────
//  Exports — same API surface as before so no
//  controller changes are needed
// ──────────────────────────────────────────────
module.exports = {
  generateOTP,
  sendEmail,
  sendOTPEmail,
};

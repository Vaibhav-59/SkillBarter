// config/config.js
module.exports = {
  appName: "SkillBridge",
  emailFrom: process.env.FROM_EMAIL || "no-reply@skillbridge.com",
  frontendUrl: "https://skillbarter2.netlify.app" || "http://localhost:3000",
  smtp: {
    resendApiKey: process.env.RESEND_API_KEY,
    resendFromEmail: process.env.RESEND_FROM_EMAIL,
    fromName: process.env.FROM_NAME || "SkillBarter",
  },
};

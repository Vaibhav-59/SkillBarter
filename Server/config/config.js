// config/config.js
module.exports = {
  appName: "SkillBridge",
  emailFrom: process.env.FROM_EMAIL || "no-reply@skillbridge.com",
  frontendUrl: "https://skillbarter2.netlify.app" || "http://localhost:3000",
  smtp: {
    brevoApiKey: process.env.BREVO_API_KEY,
    brevoFromEmail: process.env.BREVO_FROM_EMAIL,
    fromName: process.env.FROM_NAME || "SkillBarter",
  },
};

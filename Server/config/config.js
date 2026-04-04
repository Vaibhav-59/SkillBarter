// config/config.js
module.exports = {
  appName: "SkillBridge",
  emailFrom: process.env.FROM_EMAIL || "no-reply@skillbridge.com",
  frontendUrl: "https://skillbarter2.netlify.app" || "http://localhost:3000",
  smtp: {
    mailtrapToken: process.env.MAILTRAP_API_TOKEN,
    mailtrapFromEmail: process.env.MAILTRAP_FROM_EMAIL,
    fromName: process.env.FROM_NAME || "SkillBarter",
  },
};

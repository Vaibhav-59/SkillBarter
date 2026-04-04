// config/config.js
module.exports = {
  appName: "SkillBridge",
  emailFrom: process.env.FROM_EMAIL || "no-reply@skillbridge.com",
  frontendUrl: "https://skillbarter1.netlify.app" || "http://localhost:3000",
  smtp: {
    host: process.env.SMTP_HOST || "smtp.mailtrap.io",
    port: process.env.SMTP_PORT || 2525,
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
};

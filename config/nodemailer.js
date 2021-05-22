const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  secure: true,
  auth: {
    user: process.env.NODE_MAILER_USER_EMAIL,
    pass: process.env.NODE_MAILER_USER_PASSWORD,
  },
});

module.exports = transporter;

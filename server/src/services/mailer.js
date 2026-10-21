const nodemailer = require("nodemailer");
const { mail, isProd } = require("../config/env");

let transporter;

function getTransporter() {
  if (transporter) return transporter;
  if (mail.smtpHost) {
    transporter = nodemailer.createTransport({
      host: mail.smtpHost,
      port: mail.smtpPort,
      secure: mail.smtpPort === 465,
      auth: { user: mail.smtpUser, pass: mail.smtpPass },
    });
  } else if (mail.gmailUser && mail.gmailPass) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: mail.gmailUser, pass: mail.gmailPass },
    });
  }
  return transporter;
}

async function sendMail({ to, subject, html, text }) {
  const tx = getTransporter();
  if (!tx) {
    if (isProd) throw new Error("Email is not configured on the server");
    // Development convenience: show the message in the server console.
    console.log(`\n[mail:dev] to=${to}\nsubject=${subject}\n${text || html}\n`);
    return;
  }
  const from = mail.smtpHost ? mail.smtpUser : mail.gmailUser;
  await tx.sendMail({ from: `"${mail.fromName}" <${from}>`, to, subject, html, text });
}

const sendOtpEmail = (to, code, purposeLabel) =>
  sendMail({
    to,
    subject: `Your ${mail.fromName} verification code`,
    text: `Your code for ${purposeLabel} is ${code}. It is valid for 10 minutes. Never share it with anyone.`,
    html: `<div style="font-family:Arial,sans-serif;max-width:480px">
      <h2 style="margin:0 0 8px">Verification code</h2>
      <p>Use this code for ${purposeLabel}:</p>
      <p style="font-size:28px;letter-spacing:6px;font-weight:700">${code}</p>
      <p style="color:#666">Valid for 10 minutes. If you didn't request it, you can ignore this email.</p>
    </div>`,
  });

module.exports = { sendMail, sendOtpEmail };

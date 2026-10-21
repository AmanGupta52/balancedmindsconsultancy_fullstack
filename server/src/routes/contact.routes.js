const express = require("express");
const rateLimit = require("express-rate-limit");
const ContactMessage = require("../models/ContactMessage");
const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");
const { isEmail, normalizeEmail } = require("../utils/validators");
const { sendMail } = require("../services/mailer");
const { contactInbox } = require("../config/env");

const router = express.Router();

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many messages sent. Please try again later." },
});

const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

router.post(
  "/",
  limiter,
  asyncHandler(async (req, res) => {
    const email = normalizeEmail(req.body.email);
    const name = String(req.body.name || "").trim();
    const phone = String(req.body.phone || "").trim();
    if (!name || !phone || !isEmail(email)) throw new HttpError(400, "Name, phone and a valid email are required");
    if (!/^[+\d][\d\s-]{6,18}$/.test(phone)) throw new HttpError(400, "Please enter a valid phone number");

    const saved = await ContactMessage.create({
      name,
      phone,
      email,
      service: req.body.service,
      message: req.body.message,
    });

    // Best effort: the message is already safely stored even if e-mail fails.
    if (contactInbox) {
      sendMail({
        to: contactInbox,
        subject: `New enquiry from ${name}`,
        html: `<p><b>Name:</b> ${escapeHtml(name)}<br><b>Phone:</b> ${escapeHtml(phone)}<br><b>Email:</b> ${escapeHtml(email)}<br><b>Service:</b> ${escapeHtml(saved.service || "-")}</p><p>${escapeHtml(saved.message || "")}</p>`,
      }).catch((err) => console.error("Contact e-mail failed:", err.message));
    }

    res.status(201).json({ message: "Thank you! We will get back to you shortly." });
  })
);

module.exports = router;

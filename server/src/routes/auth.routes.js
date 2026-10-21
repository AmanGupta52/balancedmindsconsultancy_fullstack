const express = require("express");
const bcrypt = require("bcryptjs");
const rateLimit = require("express-rate-limit");
const User = require("../models/User");
const Admin = require("../models/Admin");
const Expert = require("../models/Expert");
const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");
const { isEmail, normalizeEmail, isStrongPassword } = require("../utils/validators");
const { authenticate, signToken } = require("../middleware/auth");
const { issueOtp, consumeOtp } = require("../services/otp");
const { sendOtpEmail } = require("../services/mailer");

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts. Please try again in a few minutes." },
});
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many OTP requests. Please wait before trying again." },
});

const publicAccount = (doc, role) => {
  const { password, img, __v, ...rest } = doc.toObject();
  return { ...rest, role };
};

// Finds the account across the three collections (customer -> admin -> moderator).
async function findAccountByEmail(email) {
  // Case-insensitive match so older records with mixed-case e-mails still work.
  const ci = { locale: "en", strength: 2 };
  let account = await User.findOne({ email }).collation(ci);
  if (account) return { account, role: "user" };
  account = await Admin.findOne({ email }).collation(ci);
  if (account) return { account, role: "admin" };
  account = await Expert.findOne({ email }).collation(ci);
  if (account) return { account, role: "moderator" };
  return null;
}

// POST /api/auth/send-otp  { email, purpose: "register" | "reset" }
router.post(
  "/send-otp",
  otpLimiter,
  asyncHandler(async (req, res) => {
    const email = normalizeEmail(req.body.email);
    const purpose = req.body.purpose === "reset" ? "reset" : "register";
    if (!isEmail(email)) throw new HttpError(400, "Please enter a valid email address");

    const existing = await findAccountByEmail(email);
    if (purpose === "register" && existing) {
      throw new HttpError(409, "An account with this email already exists. Please sign in.");
    }

    // For password resets we answer identically whether or not the account
    // exists, so the endpoint cannot be used to discover registered emails.
    if (purpose === "reset" && !existing) {
      return res.json({ message: "If that email is registered, an OTP has been sent." });
    }

    const code = await issueOtp(email, purpose);
    await sendOtpEmail(email, code, purpose === "reset" ? "resetting your password" : "creating your account");
    res.json({
      message: purpose === "reset" ? "If that email is registered, an OTP has been sent." : "OTP sent to your email.",
    });
  })
);

// POST /api/auth/register  { fullName, age, email, password, otp }
router.post(
  "/register",
  authLimiter,
  asyncHandler(async (req, res) => {
    const { fullName, age, password, otp } = req.body;
    const email = normalizeEmail(req.body.email);

    if (!fullName?.trim() || !isEmail(email)) throw new HttpError(400, "Name and a valid email are required");
    const ageNum = Number(age);
    if (!Number.isInteger(ageNum) || ageNum < 1 || ageNum > 120) throw new HttpError(400, "Please enter a valid age");
    if (!isStrongPassword(password)) throw new HttpError(400, "Password must be at least 8 characters");

    if (await findAccountByEmail(email)) throw new HttpError(409, "An account with this email already exists");
    await consumeOtp(email, "register", otp);

    const user = await User.create({
      fullName: fullName.trim(),
      age: ageNum,
      email,
      password: await bcrypt.hash(password, 10),
      role: "user",
    });

    res.status(201).json({
      message: "Account created successfully",
      user: publicAccount(user, "user"),
      token: signToken(user, "user"), // sign the new user in straight away
    });
  })
);

// POST /api/auth/login  { email, password }
router.post(
  "/login",
  authLimiter,
  asyncHandler(async (req, res) => {
    const { password } = req.body;
    const email = normalizeEmail(req.body.email);
    if (!email || !password) throw new HttpError(400, "Email and password are required");

    const found = await findAccountByEmail(email);
    // Same message for unknown email and wrong password.
    const invalid = new HttpError(401, "Incorrect email or password");
    if (!found) throw invalid;
    if (!(await bcrypt.compare(password, found.account.password))) throw invalid;

    res.json({
      message: "Signed in successfully",
      user: publicAccount(found.account, found.role),
      token: signToken(found.account, found.role),
    });
  })
);

// POST /api/auth/reset-password  { email, otp, newPassword }
router.post(
  "/reset-password",
  authLimiter,
  asyncHandler(async (req, res) => {
    const email = normalizeEmail(req.body.email);
    const { otp, newPassword } = req.body;
    if (!isStrongPassword(newPassword)) throw new HttpError(400, "Password must be at least 8 characters");

    await consumeOtp(email, "reset", otp);
    const found = await findAccountByEmail(email);
    if (!found) throw new HttpError(400, "Invalid or expired OTP");

    found.account.password = await bcrypt.hash(newPassword, 10);
    await found.account.save();
    res.json({ message: "Password reset successfully. You can now sign in." });
  })
);

// GET /api/auth/me - current account (used to restore a session)
router.get(
  "/me",
  authenticate(),
  asyncHandler(async (req, res) => {
    res.json({ user: publicAccount(req.account, req.auth.role) });
  })
);

// GET/PUT /api/auth/profile - signed-in customer's own profile
router.get(
  "/profile",
  authenticate("user"),
  asyncHandler(async (req, res) => res.json(req.account))
);

router.put(
  "/profile",
  authenticate("user"),
  asyncHandler(async (req, res) => {
    const updates = {};
    if (req.body.fullName !== undefined) {
      if (!String(req.body.fullName).trim()) throw new HttpError(400, "Name cannot be empty");
      updates.fullName = String(req.body.fullName).trim();
    }
    if (req.body.age !== undefined) {
      const age = Number(req.body.age);
      if (!Number.isInteger(age) || age < 1 || age > 120) throw new HttpError(400, "Please enter a valid age");
      updates.age = age;
    }
    const user = await User.findByIdAndUpdate(req.auth.id, updates, { new: true, runValidators: true }).select(
      "-password"
    );
    res.json({ message: "Profile updated successfully", user: { ...user.toObject(), role: "user" } });
  })
);

module.exports = router;

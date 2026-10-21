const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const Otp = require("../models/Otp");
const HttpError = require("../utils/httpError");

const OTP_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

// Cryptographically secure 6-digit code (Math.random is predictable).
const generateCode = () => String(crypto.randomInt(100000, 1000000));

async function issueOtp(email, purpose, meta) {
  const code = generateCode();
  await Otp.deleteMany({ email, purpose });
  await Otp.create({
    email,
    purpose,
    codeHash: await bcrypt.hash(code, 8),
    meta,
    expiresAt: new Date(Date.now() + OTP_TTL_MS),
  });
  return code;
}

// Verifies and consumes the code. Returns the stored `meta` payload.
async function consumeOtp(email, purpose, code) {
  const record = await Otp.findOne({ email, purpose });
  if (!record || record.expiresAt < new Date()) {
    throw new HttpError(400, "Invalid or expired OTP");
  }
  if (record.attempts >= MAX_ATTEMPTS) {
    await record.deleteOne();
    throw new HttpError(429, "Too many attempts. Please request a new OTP.");
  }
  const ok = await bcrypt.compare(String(code || ""), record.codeHash);
  if (!ok) {
    record.attempts += 1;
    await record.save();
    throw new HttpError(400, "Invalid or expired OTP");
  }
  await record.deleteOne();
  return record.meta;
}

module.exports = { issueOtp, consumeOtp };

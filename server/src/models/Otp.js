const mongoose = require("mongoose");

// One-time codes live in MongoDB (not process memory) so they survive restarts
// and work across multiple server instances. Documents expire automatically.
const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, index: true },
  purpose: { type: String, enum: ["register", "reset", "admin-invite"], required: true },
  codeHash: { type: String, required: true },
  meta: { type: mongoose.Schema.Types.Mixed },
  attempts: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
});

module.exports = mongoose.model("Otp", otpSchema);

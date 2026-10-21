const mongoose = require("mongoose");

const expertSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true, maxlength: 100 },
    expertId: { type: String, unique: true, required: true },
    title: { type: String, trim: true },
    availability: { type: String, enum: ["Online", "In-person", "Both", ""], default: "Online" },
    time: String,
    experience: String,
    fee: { type: Number, min: 0 }, // falls back to DEFAULT_SESSION_FEE when empty
    specialities: [String],
    languages: [String],
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["expert", "moderator"], default: "expert" },
    img: { data: Buffer, contentType: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expert", expertSchema);

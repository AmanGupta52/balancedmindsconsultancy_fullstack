const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    age: { type: Number, min: 1, max: 120 },
    role: { type: String, default: "admin", immutable: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Admin", adminSchema);

const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    fullName: { type: String, default: "Anonymous", trim: true, maxlength: 100 },
    email: { type: String, default: "Not Provided", trim: true },
    stars: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    message: { type: String, required: true, trim: true, maxlength: 1500 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Feedback", feedbackSchema);

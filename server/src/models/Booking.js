const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    contact: { type: String, trim: true, default: "" },
    age: { type: Number, required: true, min: 1, max: 120 },
    issue: { type: String, required: true, trim: true, maxlength: 2000 },

    // Session slot: date (UTC midnight of the chosen day) + "HH:MM" 24h range
    meetingDate: { type: Date, index: true },
    timingFrom: { type: String, required: true },
    timingTo: { type: String, required: true },

    expertId: { type: mongoose.Schema.Types.ObjectId, ref: "Expert", required: true, index: true },
    expertName: { type: String, required: true },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed"],
      default: "pending",
    },
    meetingLink: { type: String, default: "" },
    notes: { type: String, default: "" },
    reminderSent: { type: Boolean, default: false },

    // Payment
    fee: { type: Number, default: 0 },
    couponCode: { type: String, default: "" },
    paymentStatus: { type: String, enum: ["unpaid", "paid", "free"], default: "unpaid" },
    orderId: { type: String, default: "" },
    paymentId: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);

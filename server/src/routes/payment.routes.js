const express = require("express");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const Booking = require("../models/Booking");
const Expert = require("../models/Expert");
const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");
const { assertObjectId } = require("../utils/validators");
const { authenticate } = require("../middleware/auth");
const { getSessionFee, priceSession } = require("../services/pricing");
const { razorpay: rzp } = require("../config/env");

const router = express.Router();
const razorpayEnabled = Boolean(rzp.keyId && rzp.secret);
const razorpay = razorpayEnabled ? new Razorpay({ key_id: rzp.keyId, key_secret: rzp.secret }) : null;

// GET /api/payment/config - lets the UI choose Razorpay or the UPI fallback
router.get("/config", (_req, res) => {
  res.json({ razorpayEnabled, keyId: razorpayEnabled ? rzp.keyId : null });
});

// POST /api/payment/quote { expertId, coupon } - server-side price + coupon check
router.post(
  "/quote",
  authenticate("user"),
  asyncHandler(async (req, res) => {
    assertObjectId(req.body.expertId, "expert id");
    const expert = await Expert.findById(req.body.expertId).select("fee");
    if (!expert) throw new HttpError(404, "Expert not found");
    if (!req.body.coupon) return res.json({ fee: getSessionFee(expert), total: getSessionFee(expert), percent: 0 });
    res.json(priceSession(expert, req.body.coupon));
  })
);

// POST /api/payment/order { bookingId } - amount is taken from the booking, never from the client
router.post(
  "/order",
  authenticate("user"),
  asyncHandler(async (req, res) => {
    if (!razorpayEnabled) throw new HttpError(503, "Online payments are not enabled");
    assertObjectId(req.body.bookingId, "booking id");

    const booking = await Booking.findById(req.body.bookingId);
    if (!booking || booking.email !== req.account.email) throw new HttpError(404, "Booking not found");
    if (booking.paymentStatus !== "unpaid" || booking.fee <= 0) {
      throw new HttpError(409, "This booking does not need payment");
    }

    let order;
    try {
      order = await razorpay.orders.create({
        amount: Math.round(booking.fee * 100), // paise
        currency: "INR",
        receipt: `booking_${booking._id}`,
      });
    } catch (err) {
      // Most common cause: wrong/expired RAZORPAY_KEY_ID or RAZORPAY_SECRET, or test/live keys mixed.
      console.error("Razorpay order failed:", err?.error?.description || err?.message || err);
      throw new HttpError(502, "Online payment is unavailable right now. Please pay by UPI instead.");
    }
    booking.orderId = order.id;
    await booking.save();
    res.json({ order, keyId: rzp.keyId });
  })
);

// POST /api/payment/verify { bookingId, razorpay_order_id, razorpay_payment_id, razorpay_signature }
router.post(
  "/verify",
  authenticate("user"),
  asyncHandler(async (req, res) => {
    if (!razorpayEnabled) throw new HttpError(503, "Online payments are not enabled");
    const { bookingId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    assertObjectId(bookingId, "booking id");

    const booking = await Booking.findById(bookingId);
    if (!booking || booking.email !== req.account.email) throw new HttpError(404, "Booking not found");
    if (!booking.orderId || booking.orderId !== razorpay_order_id) throw new HttpError(400, "Order mismatch");

    const expected = crypto
      .createHmac("sha256", rzp.secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");
    const given = Buffer.from(String(razorpay_signature || ""));
    const wanted = Buffer.from(expected);
    if (given.length !== wanted.length || !crypto.timingSafeEqual(given, wanted)) {
      throw new HttpError(400, "Payment verification failed");
    }

    booking.paymentStatus = "paid";
    booking.paymentId = razorpay_payment_id;
    await booking.save();
    res.json({ success: true, message: "Payment verified", booking });
  })
);

module.exports = router;

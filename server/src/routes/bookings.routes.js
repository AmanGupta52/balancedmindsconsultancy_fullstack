const express = require("express");
const Booking = require("../models/Booking");
const Expert = require("../models/Expert");
const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");
const { assertObjectId } = require("../utils/validators");
const { authenticate } = require("../middleware/auth");
const { priceSession } = require("../services/pricing");
const { frontendUrl, timezoneOffset } = require("../config/env");

const router = express.Router();

const STATUSES = ["pending", "accepted", "rejected", "completed"];
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const videoLinkFor = (booking) => `${frontendUrl}/videocall?booking=${booking._id}`;

// Moderators only see bookings for their own expert profile; admins see all.
const scopeFor = (auth) => (auth.role === "moderator" ? { expertId: auth.id } : {});

async function loadManageableBooking(req) {
  assertObjectId(req.params.id, "booking id");
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new HttpError(404, "Booking not found");
  if (req.auth.role === "moderator" && String(booking.expertId) !== req.auth.id) {
    throw new HttpError(403, "This booking belongs to another expert");
  }
  return booking;
}

// POST /api/bookings - a signed-in customer requests a session
router.post(
  "/",
  authenticate("user"),
  asyncHandler(async (req, res) => {
    const { contact, age, issue, date, timingFrom, timingTo, expertId, coupon } = req.body;

    if (!issue?.trim()) throw new HttpError(400, "Please describe what you would like help with");
    if (!DATE_RE.test(date || "")) throw new HttpError(400, "Please choose a session date");
    if (!TIME_RE.test(timingFrom || "") || !TIME_RE.test(timingTo || "")) {
      throw new HttpError(400, "Please choose a start and end time");
    }
    if (timingTo <= timingFrom) throw new HttpError(400, "End time must be after the start time");
    if (new Date(`${date}T${timingFrom}:00${timezoneOffset}`) <= new Date()) {
      throw new HttpError(400, "Please choose a time in the future");
    }
    assertObjectId(expertId, "expert id");

    const expert = await Expert.findById(expertId).select("-password -img");
    if (!expert) throw new HttpError(404, "Expert not found");

    // Overlap check: same expert, same day, intersecting time range.
    const meetingDate = new Date(`${date}T00:00:00.000Z`);
    const clash = await Booking.findOne({
      expertId: expert._id,
      meetingDate,
      status: { $in: ["pending", "accepted"] },
      timingFrom: { $lt: timingTo },
      timingTo: { $gt: timingFrom },
    });
    if (clash) throw new HttpError(409, "This time slot is already booked. Please choose another time.");

    const price = priceSession(expert, coupon);
    const booking = await Booking.create({
      fullName: req.account.fullName,
      email: req.account.email,
      contact: String(contact || "").trim().slice(0, 20),
      age: Number(age) || req.account.age,
      issue: issue.trim(),
      meetingDate,
      timingFrom,
      timingTo,
      expertId: expert._id,
      expertName: expert.fullName,
      fee: price.total,
      couponCode: price.code,
      paymentStatus: price.total === 0 ? "free" : "unpaid",
    });

    res.status(201).json({ message: "Booking request created", booking });
  })
);

// GET /api/bookings/mine - the signed-in customer's bookings
router.get(
  "/mine",
  authenticate("user"),
  asyncHandler(async (req, res) => {
    const bookings = await Booking.find({ email: req.account.email }).sort({ meetingDate: -1, createdAt: -1 });
    res.json(bookings);
  })
);

// GET /api/bookings - moderator (own bookings) or admin (all)
router.get(
  "/",
  authenticate("moderator", "admin"),
  asyncHandler(async (req, res) => {
    const bookings = await Booking.find(scopeFor(req.auth)).sort({ createdAt: -1 });
    res.json(bookings);
  })
);

// PUT /api/bookings/:id - moderator/admin updates status, link or notes
router.put(
  "/:id",
  authenticate("moderator", "admin"),
  asyncHandler(async (req, res) => {
    const booking = await loadManageableBooking(req);
    const { status, meetingLink, notes } = req.body;

    if (status !== undefined) {
      if (!STATUSES.includes(status)) throw new HttpError(400, `Status must be one of: ${STATUSES.join(", ")}`);
      booking.status = status;
    }
    if (notes !== undefined) booking.notes = String(notes).slice(0, 2000);
    if (meetingLink !== undefined) {
      const link = String(meetingLink).trim();
      if (link && !/^https?:\/\//i.test(link)) throw new HttpError(400, "Meeting link must start with http(s)://");
      booking.meetingLink = link;
    }
    if (req.body.paymentStatus !== undefined) {
      // Lets the expert/admin confirm a manual (UPI) payment. Free bookings stay free.
      if (!["paid", "unpaid"].includes(req.body.paymentStatus)) throw new HttpError(400, "Invalid payment status");
      if (booking.paymentStatus !== "free") booking.paymentStatus = req.body.paymentStatus;
    }
    // Accepted sessions always get a video-room link so the client can join.
    if (booking.status === "accepted" && !booking.meetingLink) booking.meetingLink = videoLinkFor(booking);

    await booking.save();
    res.json({ message: "Booking updated", booking });
  })
);

// DELETE /api/bookings/:id - customer cancels own booking (admins: any)
router.delete(
  "/:id",
  authenticate("user", "admin"),
  asyncHandler(async (req, res) => {
    assertObjectId(req.params.id, "booking id");
    const booking = await Booking.findById(req.params.id);
    if (!booking) throw new HttpError(404, "Booking not found");
    if (req.auth.role === "user") {
      if (booking.email !== req.account.email) throw new HttpError(403, "This is not your booking");
      if (booking.status === "completed") throw new HttpError(409, "Completed sessions cannot be cancelled");
    }
    await booking.deleteOne();
    res.json({ message: "Booking cancelled" });
  })
);

module.exports = router;

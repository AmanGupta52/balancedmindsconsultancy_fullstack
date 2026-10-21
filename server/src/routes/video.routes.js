const express = require("express");
const Booking = require("../models/Booking");
const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");
const { assertObjectId } = require("../utils/validators");
const { authenticate } = require("../middleware/auth");
const { generateToken04 } = require("../services/zegoToken");
const { zego } = require("../config/env");

const router = express.Router();

// POST /api/video/token { bookingId }
// Only the booking's client, its expert (moderator) or an admin can join the
// room, and only once the session has been accepted.
router.post(
  "/token",
  authenticate(),
  asyncHandler(async (req, res) => {
    const { bookingId } = req.body;
    assertObjectId(bookingId, "booking id");
    const booking = await Booking.findById(bookingId);
    if (!booking) throw new HttpError(404, "Booking not found");

    const { id, role } = req.auth;
    const isOwner = role === "user" && booking.email === req.account.email;
    const isExpert = role === "moderator" && String(booking.expertId) === id;
    if (!isOwner && !isExpert && role !== "admin") throw new HttpError(403, "You are not part of this session");
    if (!["accepted", "completed"].includes(booking.status)) {
      throw new HttpError(409, "This session has not been confirmed yet");
    }

    let token;
    try {
      token = generateToken04(zego.appId, id, zego.serverSecret);
    } catch (err) {
      throw new HttpError(503, "Video calling is not configured");
    }

    res.json({
      token,
      appId: zego.appId,
      roomId: `meeting-${booking._id}`,
      userId: id,
      userName: req.account.fullName,
    });
  })
);

module.exports = router;

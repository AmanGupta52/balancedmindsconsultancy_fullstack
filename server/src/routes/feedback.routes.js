const express = require("express");
const Feedback = require("../models/Feedback");
const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");
const { pick } = require("../utils/validators");

const router = express.Router();

// Public list - e-mail addresses are never exposed here.
router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const items = await Feedback.find().select("-email").sort({ createdAt: -1 }).limit(60);
    res.json(items);
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const data = pick(req.body, ["fullName", "email", "stars", "title", "message"]);
    const stars = Number(data.stars);
    if (!Number.isInteger(stars) || stars < 1 || stars > 5) throw new HttpError(400, "Rating must be 1 to 5 stars");
    if (!data.title?.trim() || !data.message?.trim()) throw new HttpError(400, "Title and message are required");

    const saved = await Feedback.create({
      fullName: data.fullName?.trim() || "Anonymous",
      email: data.email?.trim() || "Not Provided",
      stars,
      title: data.title,
      message: data.message,
    });
    const { email, ...publicFeedback } = saved.toObject();
    res.status(201).json(publicFeedback);
  })
);

module.exports = router;

const express = require("express");
const Expert = require("../models/Expert");
const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");
const { assertObjectId } = require("../utils/validators");
const { getSessionFee } = require("../services/pricing");

const router = express.Router();

// Public projection: no credentials, no e-mail, no raw image bytes.
const PUBLIC_FIELDS = "-password -email -img.data";

const toPublic = (expert) => {
  const obj = expert.toObject();
  const { img, ...rest } = obj;
  return { ...rest, fee: getSessionFee(obj), hasPhoto: Boolean(img?.contentType) };
};

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const experts = await Expert.find().select(PUBLIC_FIELDS).sort({ fullName: 1 });
    res.json(experts.map(toPublic));
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    assertObjectId(req.params.id, "expert id");
    const expert = await Expert.findById(req.params.id).select(PUBLIC_FIELDS);
    if (!expert) throw new HttpError(404, "Expert not found");
    res.json(toPublic(expert));
  })
);

// Photos are streamed as real images so browsers can cache them,
// instead of embedding base64 in every list response.
router.get(
  "/:id/photo",
  asyncHandler(async (req, res) => {
    assertObjectId(req.params.id, "expert id");
    const expert = await Expert.findById(req.params.id).select("img");
    if (!expert?.img?.data) throw new HttpError(404, "No photo");
    res.set("Content-Type", expert.img.contentType);
    res.set("Cache-Control", "public, max-age=86400");
    res.set("Cross-Origin-Resource-Policy", "cross-origin");
    res.send(expert.img.data);
  })
);

module.exports = router;

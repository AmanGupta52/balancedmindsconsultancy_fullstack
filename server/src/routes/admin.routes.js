const crypto = require("crypto");
const express = require("express");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const User = require("../models/User");
const Expert = require("../models/Expert");
const Admin = require("../models/Admin");
const Feedback = require("../models/Feedback");
const Booking = require("../models/Booking");
const ContactMessage = require("../models/ContactMessage");
const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");
const { isEmail, normalizeEmail, isStrongPassword, toArray, assertObjectId, pick } = require("../utils/validators");
const { authenticate } = require("../middleware/auth");
const { issueOtp, consumeOtp } = require("../services/otp");
const { sendMail } = require("../services/mailer");

const router = express.Router();
router.use(authenticate("admin")); // every admin route requires an admin token

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) =>
    ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)
      ? cb(null, true)
      : cb(new HttpError(400, "Only JPG, PNG or WebP images are allowed")),
});

const hash = (password) => bcrypt.hash(password, 10);

/* ----------------------------- STATS ----------------------------- */
router.get(
  "/stats",
  asyncHandler(async (_req, res) => {
    const [usersCount, adminsCount, expertsCount, feedbackCount, bookingsCount, byStatus] = await Promise.all([
      User.countDocuments(),
      Admin.countDocuments(),
      Expert.countDocuments(),
      Feedback.countDocuments(),
      Booking.countDocuments(),
      Booking.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    ]);
    res.json({
      usersCount,
      adminsCount,
      expertsCount,
      feedbackCount,
      bookingsCount,
      bookingsByStatus: Object.fromEntries(byStatus.map((s) => [s._id, s.count])),
    });
  })
);

/* ----------------------------- ADMINS ----------------------------- */
router.get(
  "/admins",
  asyncHandler(async (_req, res) => res.json({ admins: await Admin.find().select("-password") }))
);

// Step 1: request a new admin. A code is e-mailed to every existing admin.
router.post(
  "/admins/invite",
  asyncHandler(async (req, res) => {
    const email = normalizeEmail(req.body.email);
    const fullName = String(req.body.fullName || "").trim();
    if (!fullName || !isEmail(email)) throw new HttpError(400, "Name and a valid email are required");
    if (!isStrongPassword(req.body.password)) throw new HttpError(400, "Password must be at least 8 characters");
    if (await Admin.findOne({ email })) throw new HttpError(409, "An admin with this email already exists");

    const code = await issueOtp(email, "admin-invite", { fullName, passwordHash: await hash(req.body.password) });
    const admins = await Admin.find().select("email fullName");
    await Promise.allSettled(
      admins.map((a) =>
        sendMail({
          to: a.email,
          subject: "Admin approval code",
          text: `${req.account.fullName} wants to add ${fullName} (${email}) as an admin. Approval code: ${code} (valid 10 minutes).`,
        })
      )
    );
    res.json({ message: "An approval code was sent to the existing admins." });
  })
);

// Step 2: confirm with the code.
router.post(
  "/admins/confirm",
  asyncHandler(async (req, res) => {
    const email = normalizeEmail(req.body.email);
    const meta = await consumeOtp(email, "admin-invite", req.body.otp);
    const admin = await Admin.create({ fullName: meta.fullName, email, password: meta.passwordHash });
    const { password, ...safe } = admin.toObject();
    res.status(201).json({ message: "Admin added", admin: safe });
  })
);

router.put(
  "/admins/:id",
  asyncHandler(async (req, res) => {
    assertObjectId(req.params.id);
    const updates = pick(req.body, ["fullName", "age"]);
    if (req.body.email) {
      if (!isEmail(req.body.email)) throw new HttpError(400, "Invalid email");
      updates.email = normalizeEmail(req.body.email);
    }
    if (req.body.password) {
      if (!isStrongPassword(req.body.password)) throw new HttpError(400, "Password must be at least 8 characters");
      updates.password = await hash(req.body.password);
    }
    const admin = await Admin.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).select(
      "-password"
    );
    if (!admin) throw new HttpError(404, "Admin not found");
    res.json({ message: "Admin updated", admin });
  })
);

router.delete(
  "/admins/:id",
  asyncHandler(async (req, res) => {
    assertObjectId(req.params.id);
    if (req.params.id === req.auth.id) throw new HttpError(400, "You cannot delete your own account");
    if ((await Admin.countDocuments()) <= 1) throw new HttpError(400, "At least one admin must remain");
    const admin = await Admin.findByIdAndDelete(req.params.id);
    if (!admin) throw new HttpError(404, "Admin not found");
    res.json({ message: "Admin deleted" });
  })
);

/* ----------------------------- USERS ----------------------------- */
router.get(
  "/users",
  asyncHandler(async (_req, res) => {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json({ count: users.length, users });
  })
);

router.post(
  "/users",
  asyncHandler(async (req, res) => {
    const { fullName, age, password } = req.body;
    const email = normalizeEmail(req.body.email);
    if (!fullName?.trim() || !isEmail(email)) throw new HttpError(400, "Name and a valid email are required");
    if (!isStrongPassword(password)) throw new HttpError(400, "Password must be at least 8 characters");
    const user = await User.create({ fullName, age, email, password: await hash(password), role: "user" });
    const { password: _pw, ...safe } = user.toObject();
    res.status(201).json({ message: "User added", user: safe });
  })
);

router.put(
  "/users/:id",
  asyncHandler(async (req, res) => {
    assertObjectId(req.params.id);
    const updates = pick(req.body, ["fullName", "age"]);
    if (req.body.email) updates.email = normalizeEmail(req.body.email);
    if (req.body.password) {
      if (!isStrongPassword(req.body.password)) throw new HttpError(400, "Password must be at least 8 characters");
      updates.password = await hash(req.body.password);
    }
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).select(
      "-password"
    );
    if (!user) throw new HttpError(404, "User not found");
    res.json({ message: "User updated", user });
  })
);

router.delete(
  "/users/:id",
  asyncHandler(async (req, res) => {
    assertObjectId(req.params.id);
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) throw new HttpError(404, "User not found");
    res.json({ message: `User '${user.fullName}' deleted` });
  })
);

/* ----------------------------- EXPERTS & MODERATORS ----------------------------- */
const EXPERT_TEXT_FIELDS = ["fullName", "title", "availability", "time", "experience"];

const expertView = (doc) => {
  const { password, img, ...rest } = doc.toObject();
  return { ...rest, hasPhoto: Boolean(img?.contentType) };
};

router.get(
  "/experts",
  asyncHandler(async (_req, res) => {
    const experts = await Expert.find().select("-password -img.data").sort({ fullName: 1 });
    res.json(experts.map(expertView));
  })
);

router.post(
  "/experts",
  upload.single("img"),
  asyncHandler(async (req, res) => {
    const email = normalizeEmail(req.body.email);
    if (!req.body.fullName?.trim() || !isEmail(email)) throw new HttpError(400, "Name and a valid email are required");
    if (!isStrongPassword(req.body.password)) throw new HttpError(400, "Password must be at least 8 characters");
    const role = req.body.role === "moderator" ? "moderator" : "expert";

    const expert = new Expert({
      ...pick(req.body, EXPERT_TEXT_FIELDS),
      expertId: crypto.randomUUID(),
      email,
      role,
      password: await hash(req.body.password),
      specialities: toArray(req.body.specialities),
      languages: toArray(req.body.languages),
      fee: req.body.fee !== undefined && req.body.fee !== "" ? Number(req.body.fee) : undefined,
    });
    if (req.file) expert.img = { data: req.file.buffer, contentType: req.file.mimetype };
    await expert.save();
    res.status(201).json({ message: "Expert added", expert: expertView(expert) });
  })
);

router.put(
  "/experts/:id",
  upload.single("img"),
  asyncHandler(async (req, res) => {
    assertObjectId(req.params.id);
    const updates = pick(req.body, EXPERT_TEXT_FIELDS);
    if (req.body.email) {
      if (!isEmail(req.body.email)) throw new HttpError(400, "Invalid email");
      updates.email = normalizeEmail(req.body.email);
    }
    if (req.body.role) updates.role = req.body.role === "moderator" ? "moderator" : "expert";
    if (req.body.specialities !== undefined) updates.specialities = toArray(req.body.specialities);
    if (req.body.languages !== undefined) updates.languages = toArray(req.body.languages);
    if (req.body.fee !== undefined) updates.fee = req.body.fee === "" ? undefined : Number(req.body.fee);
    if (req.body.password) {
      if (!isStrongPassword(req.body.password)) throw new HttpError(400, "Password must be at least 8 characters");
      updates.password = await hash(req.body.password);
    }
    if (req.file) updates.img = { data: req.file.buffer, contentType: req.file.mimetype };

    const expert = await Expert.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).select(
      "-password -img.data"
    );
    if (!expert) throw new HttpError(404, "Expert not found");
    res.json({ message: "Expert updated", expert: expertView(expert) });
  })
);

router.delete(
  "/experts/:id",
  asyncHandler(async (req, res) => {
    assertObjectId(req.params.id);
    const expert = await Expert.findByIdAndDelete(req.params.id);
    if (!expert) throw new HttpError(404, "Expert not found");
    res.json({ message: "Expert deleted" });
  })
);

/* ----------------------------- FEEDBACK ----------------------------- */
router.get(
  "/feedbacks",
  asyncHandler(async (_req, res) => res.json(await Feedback.find().sort({ createdAt: -1 })))
);

router.put(
  "/feedbacks/:id",
  asyncHandler(async (req, res) => {
    assertObjectId(req.params.id);
    const updates = pick(req.body, ["fullName", "stars", "title", "message"]);
    const feedback = await Feedback.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!feedback) throw new HttpError(404, "Feedback not found");
    res.json(feedback);
  })
);

router.delete(
  "/feedbacks/:id",
  asyncHandler(async (req, res) => {
    assertObjectId(req.params.id);
    const feedback = await Feedback.findByIdAndDelete(req.params.id);
    if (!feedback) throw new HttpError(404, "Feedback not found");
    res.json({ message: "Feedback deleted" });
  })
);

/* ----------------------------- BOOKINGS ----------------------------- */
router.get(
  "/bookings",
  asyncHandler(async (_req, res) => res.json(await Booking.find().sort({ createdAt: -1 })))
);

router.delete(
  "/bookings/:id",
  asyncHandler(async (req, res) => {
    assertObjectId(req.params.id);
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) throw new HttpError(404, "Booking not found");
    res.json({ message: "Booking deleted" });
  })
);

/* ----------------------------- CONTACT MESSAGES ----------------------------- */
router.get(
  "/messages",
  asyncHandler(async (_req, res) => res.json(await ContactMessage.find().sort({ createdAt: -1 }).limit(200)))
);

router.delete(
  "/messages/:id",
  asyncHandler(async (req, res) => {
    assertObjectId(req.params.id);
    const msg = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!msg) throw new HttpError(404, "Message not found");
    res.json({ message: "Message deleted" });
  })
);

module.exports = router;

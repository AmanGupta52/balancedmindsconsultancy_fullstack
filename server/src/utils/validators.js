const mongoose = require("mongoose");
const HttpError = require("./httpError");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isEmail = (value) => typeof value === "string" && EMAIL_RE.test(value.trim());
const normalizeEmail = (value) => String(value || "").trim().toLowerCase();
const isStrongPassword = (value) => typeof value === "string" && value.length >= 8;
const toArray = (value) =>
  (Array.isArray(value) ? value : String(value || "").split(","))
    .map((v) => String(v).trim())
    .filter(Boolean);

const assertObjectId = (id, label = "id") => {
  if (!mongoose.isValidObjectId(id)) throw new HttpError(400, `Invalid ${label}`);
};

// Picks only allowed keys (prevents mass assignment).
const pick = (source = {}, keys = []) =>
  keys.reduce((acc, key) => {
    if (source[key] !== undefined) acc[key] = source[key];
    return acc;
  }, {});

module.exports = { isEmail, normalizeEmail, isStrongPassword, toArray, assertObjectId, pick };

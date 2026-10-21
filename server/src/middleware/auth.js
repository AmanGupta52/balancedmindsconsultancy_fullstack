const jwt = require("jsonwebtoken");
const { jwtSecret, jwtExpiresIn } = require("../config/env");
const User = require("../models/User");
const Admin = require("../models/Admin");
const Expert = require("../models/Expert");
const HttpError = require("../utils/httpError");
const asyncHandler = require("../utils/asyncHandler");

// A moderator is an Expert document with role "moderator".
const MODELS = { user: User, admin: Admin, moderator: Expert };

const signToken = (account, role) =>
  jwt.sign({ id: account._id, role }, jwtSecret, { expiresIn: jwtExpiresIn });

/**
 * Requires a valid JWT. If roles are given, the token role must be one of them.
 * The account is re-loaded from the database so deleted accounts lose access
 * immediately; it is exposed as req.account, and { id, role } as req.auth.
 */
const authenticate = (...roles) =>
  asyncHandler(async (req, _res, next) => {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) throw new HttpError(401, "Authentication required");

    let payload;
    try {
      payload = jwt.verify(token, jwtSecret);
    } catch {
      throw new HttpError(401, "Session expired. Please sign in again.");
    }

    if (roles.length && !roles.includes(payload.role)) {
      throw new HttpError(403, "You do not have permission to do that");
    }

    const Model = MODELS[payload.role];
    const account = Model && (await Model.findById(payload.id).select("-password -img"));
    if (!account) throw new HttpError(401, "Account no longer exists");

    req.auth = { id: String(account._id), role: payload.role };
    req.account = account;
    next();
  });

module.exports = { authenticate, signToken };

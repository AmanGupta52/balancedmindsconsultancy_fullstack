const { isProd } = require("../config/env");

const notFound = (req, res) =>
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
  let status = err.status || 500;
  let message = err.message || "Server error";

  if (err.name === "ValidationError") {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(", ");
  } else if (err.code === 11000) {
    status = 409;
    message = "A record with this value already exists";
  } else if (err.name === "CastError") {
    status = 400;
    message = "Invalid identifier";
  } else if (err.name === "MulterError") {
    status = 400;
    message = err.code === "LIMIT_FILE_SIZE" ? "Image must be 2 MB or smaller" : err.message;
  }

  if (status >= 500) {
    console.error(err);
    if (isProd) message = "Something went wrong. Please try again.";
  }
  res.status(status).json({ message });
};

module.exports = { notFound, errorHandler };

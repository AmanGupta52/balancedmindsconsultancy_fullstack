const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { clientUrls, isProd } = require("./config/env");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

app.set("trust proxy", 1); // correct client IPs behind Render/Netlify proxies (rate limiting)
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(
  cors({
    origin(origin, cb) {
      // Allow same-origin/non-browser calls (no Origin header) and listed frontends.
      if (!origin || clientUrls.includes(origin) || !isProd) return cb(null, true);
      return cb(new Error("Origin not allowed by CORS"));
    },
  })
);
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));

app.get("/api/health", (_req, res) => res.json({ status: "ok", time: new Date().toISOString() }));

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/experts", require("./routes/experts.routes"));
app.use("/api/bookings", require("./routes/bookings.routes"));
app.use("/api/feedback", require("./routes/feedback.routes"));
app.use("/api/admin", require("./routes/admin.routes"));
app.use("/api/payment", require("./routes/payment.routes"));
app.use("/api/news", require("./routes/news.routes"));
app.use("/api/contact", require("./routes/contact.routes"));
app.use("/api/video", require("./routes/video.routes"));

app.use(notFound);
app.use(errorHandler);

module.exports = app;

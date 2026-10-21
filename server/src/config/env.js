require("dotenv").config();

const required = ["MONGO_URI", "JWT_SECRET"];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
}

const list = (value) =>
  (value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const parseCoupons = (value) =>
  list(value).reduce((acc, pair) => {
    const [code, percent] = pair.split(":");
    const pct = Number(percent);
    if (code && Number.isFinite(pct) && pct > 0 && pct <= 100) {
      acc[code.trim().toUpperCase()] = pct;
    }
    return acc;
  }, {});

module.exports = {
  isProd: process.env.NODE_ENV === "production",
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "8h",
  clientUrls: list(process.env.CLIENT_URLS || "http://localhost:3000"),
  frontendUrl: (process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/$/, ""),
  mail: {
    gmailUser: process.env.EMAIL_USER,
    gmailPass: process.env.EMAIL_PASS,
    smtpHost: process.env.SMTP_HOST,
    smtpPort: Number(process.env.SMTP_PORT) || 587,
    smtpUser: process.env.SMTP_USER,
    smtpPass: process.env.SMTP_PASS,
    fromName: process.env.MAIL_FROM_NAME || "Balanced Minds Consultancy",
  },
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID,
    secret: process.env.RAZORPAY_SECRET,
  },
  timezoneOffset: process.env.BUSINESS_TZ_OFFSET || "+05:30", // IST
  defaultSessionFee: Number(process.env.DEFAULT_SESSION_FEE) || 1000,
  coupons: parseCoupons(process.env.COUPONS),
  zego: {
    appId: Number(process.env.ZEGO_APP_ID),
    serverSecret: process.env.ZEGO_SERVER_SECRET,
  },
  contactInbox: process.env.CONTACT_INBOX || process.env.EMAIL_USER || "",
  newsApiKey: process.env.NEWS_API_KEY,
};

const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");



dotenv.config();
connectDB();

const app = express();

// ✅ Allow bigger JSON requests (must be before routes)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// ✅ Enable CORS
app.use(cors());

// ✅ Auth routes
app.use("/api/auth", require("./routes/authRoutes"));

// ✅ Expert routes
app.use("/api/experts", require("./routes/expertRoutes"));

// ✅ Booking routes
app.use("/api/bookings", require("./routes/bookings"));

// ✅ Feedback routes
app.use("/api/feedback", require("./routes/feedbackRoutes"));

// ✅ Admin routes
app.use("/api/admin", require("./routes/adminRoutes"));

// ✅ Payment routes
app.use("/api/payment", require("./routes/paymentRoutes"));

// ✅ News routes
app.use("/api/news", require("./routes/newsRoutes"));


// ✅ Zego Video Call routes
app.use("/api/video-call", require("./routes/videoCall"));






const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

// middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// create HTTP server FIRST
const server = http.createServer(app);

// THEN attach socket.io
const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

// routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/experts", require("./routes/expertRoutes"));
app.use("/api/bookings", require("./routes/bookings"));
app.use("/api/feedback", require("./routes/feedbackRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/payment", require("./routes/paymentRoutes"));
app.use("/api/news", require("./routes/newsRoutes"));

// start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
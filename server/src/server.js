const { port } = require("./config/env"); // validates required env vars first
const connectDB = require("./config/db");
const app = require("./app");

async function start() {
  await connectDB();
  app.listen(port, () => console.log(`API listening on port ${port}`));
}

start().catch((err) => {
  console.error("Failed to start server:", err.message);
  process.exit(1);
});

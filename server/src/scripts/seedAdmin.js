// Creates the first admin account: npm run seed:admin
// Reads ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD from .env
require("../config/env");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Admin = require("../models/Admin");

(async () => {
  const { ADMIN_NAME = "Site Admin", ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 8) {
    console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD (min 8 characters) in server/.env first.");
    process.exit(1);
  }
  await connectDB();
  const email = ADMIN_EMAIL.trim().toLowerCase();
  if (await Admin.findOne({ email })) {
    console.log(`Admin ${email} already exists - nothing to do.`);
  } else {
    await Admin.create({ fullName: ADMIN_NAME, email, password: await bcrypt.hash(ADMIN_PASSWORD, 10) });
    console.log(`Admin ${email} created. You can remove ADMIN_PASSWORD from .env now.`);
  }
  await mongoose.disconnect();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});

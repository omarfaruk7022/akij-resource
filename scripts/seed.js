const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

async function seed() {
  console.log(" Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log(" Connected to:", MONGODB_URI);

  const User = mongoose.models.User || mongoose.model("User", UserSchema);

  const existingEmployer = await User.findOne({ email: "employer@demo.com" });
  if (!existingEmployer) {
    await User.create({
      name: "Demo Employer",
      email: "employer@demo.com",
      password: await bcrypt.hash("demo123", 12),
      role: "employer",
    });
    console.log(" Created employer:  employer@demo.com / demo123");
  } else {
    console.log("ℹ  Employer already exists: employer@demo.com");
  }

  const existingCandidate = await User.findOne({ email: "candidate@demo.com" });
  if (!existingCandidate) {
    await User.create({
      name: "Demo Candidate",
      email: "candidate@demo.com",
      password: await bcrypt.hash("demo123", 12),
      role: "candidate",
    });
    console.log("✅ Created candidate: candidate@demo.com / demo123");
  } else {
    console.log("ℹ️  Candidate already exists: candidate@demo.com");
  }

  console.log("\n Seeding complete!");
  console.log("   Employer login:  http://localhost:3000/login");
  console.log("   Candidate login: http://localhost:3000/login");
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error(" Seed failed:", err.message);
  process.exit(1);
});

/**
 * Run once to seed the demo nurse account:
 *   npx tsx scripts/seed-user.ts
 */
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import mongoose from "mongoose";
import bcryptjs from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error("MONGODB_URI not set in .env.local");

const UserSchema = new mongoose.Schema({
  name:          String,
  email:         { type: String, unique: true },
  password_hash: String,
  role:          { type: String, enum: ["nurse", "doctor", "admin"], default: "nurse" },
});

const User = mongoose.models.User ?? mongoose.model("User", UserSchema);

async function seed() {
  await mongoose.connect(MONGODB_URI as string);
  console.log("Connected to MongoDB");

  const existing = await User.findOne({ email: "nadia@dermasense.io" });
  if (existing) {
    console.log("Demo user already exists — skipping.");
    await mongoose.disconnect();
    return;
  }

  const password_hash = await bcryptjs.hash("DermaSense2026!", 12);

  await User.create({
    name:  "Nadia Sekkouri",
    email: "nadia@dermasense.io",
    password_hash,
    role:  "nurse",
  });

  console.log("\n✓ Demo user created:");
  console.log("  Email   : nadia@dermasense.io");
  console.log("  Password: DermaSense2026!");
  console.log("  Role    : nurse\n");

  await mongoose.disconnect();
}

seed().catch((e) => { console.error(e); process.exit(1); });

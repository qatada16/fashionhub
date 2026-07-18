import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { pathToFileURL } from "node:url";
import { connectDB } from "../config/db.js";
import Product from "../models/Product.js";
import Admin from "../models/Admin.js";
import Setting from "../models/Setting.js";
import { products } from "./products.js";
import { settings } from "./settings.js";

export async function runSeed({ disconnect = true } = {}) {
  const conn = await connectDB();
  console.log(`Connected to ${conn.name}`);

  await Promise.all([Product.deleteMany({}), Admin.deleteMany({}), Setting.deleteMany({})]);

  const insertedProducts = await Product.insertMany(products);
  console.log(`Products inserted: ${insertedProducts.length}`);

  const passwordHash = await bcrypt.hash("Admin@123", 10);
  await Admin.create({ name: "FashionHub Admin", email: "admin@fashionhub.pk", passwordHash });
  console.log("Admins inserted: 1 (admin@fashionhub.pk)");

  const insertedSettings = await Setting.insertMany(settings);
  console.log(`Settings inserted: ${insertedSettings.length} (${insertedSettings.map((s) => s.key).join(", ")})`);

  await Product.syncIndexes();
  console.log("Product indexes synced");

  if (disconnect) {
    await mongoose.disconnect();
    console.log("Seed complete");
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    await runSeed();
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  }
}

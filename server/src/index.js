import "dotenv/config";
import { connectDB } from "./config/db.js";
import { createApp } from "./app.js";

const port = process.env.PORT || 5000;

try {
  const conn = await connectDB();
  console.log(`MongoDB connected: ${conn.name}`);
  const app = createApp();
  app.listen(port, () => console.log(`FashionHub API listening on port ${port}`));
} catch (err) {
  console.error("Failed to start server:", err.message);
  process.exit(1);
}

import "dotenv/config";
import { connectDB } from "./config/db.js";
import { createApp } from "./app.js";

const port = process.env.PORT || 5000;

try {
  const conn = await connectDB();
  console.log(`MongoDB connected: ${conn.name}`);
  const app = createApp();
  const server = app.listen(port, () => console.log(`FashionHub API listening on port ${port}`));

  // Render sends SIGTERM on deploy/spin-down; finish in-flight requests first.
  for (const signal of ["SIGTERM", "SIGINT"]) {
    process.on(signal, () => {
      console.log(`${signal} received, shutting down`);
      server.close(() => process.exit(0));
      setTimeout(() => process.exit(0), 10000).unref();
    });
  }
} catch (err) {
  console.error("Failed to start server:", err.message);
  process.exit(1);
}

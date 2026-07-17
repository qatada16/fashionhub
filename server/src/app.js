import express from "express";
import cors from "cors";
import morgan from "morgan";
import routes from "./routes/index.js";
import { notFound, errorHandler } from "./middleware/error.js";

export function createApp() {
  const app = express();

  const allowedOrigins = [process.env.CLIENT_URL, "http://localhost:5173"].filter(Boolean);
  app.use(cors({ origin: allowedOrigins, credentials: true }));
  app.use(express.json({ limit: "1mb" }));
  if (process.env.NODE_ENV !== "test") app.use(morgan("dev"));

  app.use("/api", routes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

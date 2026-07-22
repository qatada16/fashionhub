import express from "express";
import cors from "cors";
import morgan from "morgan";
import routes from "./routes/index.js";
import { notFound, errorHandler } from "./middleware/error.js";

export function createApp() {
  const app = express();

  // Render/Vercel terminate TLS upstream; without this the rate limiter keys every
  // request to the proxy IP.
  app.set("trust proxy", 1);

  const allowedOrigins = [
    ...(process.env.CLIENT_URL || "").split(",").map((o) => o.trim()).filter(Boolean),
    "http://localhost:5173"
  ];
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin) || /\.vercel\.app$/.test(new URL(origin).hostname)) {
          return callback(null, true);
        }
        const err = new Error(`Origin ${origin} not allowed by CORS`);
        err.status = 403;
        return callback(err);
      },
      credentials: true
    })
  );
  app.use(
    express.json({
      limit: "1mb",
      verify: (req, res, buf) => {
        req.rawBody = buf;
      }
    })
  );
  if (process.env.NODE_ENV !== "test") app.use(morgan("dev"));

  app.use("/api", routes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

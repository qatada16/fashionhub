import { Router } from "express";
import rateLimit from "express-rate-limit";
import { validate } from "../middleware/validate.js";
import { chatBodySchema, chatHistoryParamsSchema } from "../validation/chat.schema.js";
import { postChat, getHistory } from "../controllers/chat.controller.js";

const router = Router();

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: Number(process.env.CHAT_RATE_LIMIT_PER_MIN) || 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many messages, please slow down a little." }
});

router.post("/", chatLimiter, validate({ body: chatBodySchema }), postChat);
router.get("/:sessionId/history", validate({ params: chatHistoryParamsSchema }), getHistory);

export default router;

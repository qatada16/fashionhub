import { z } from "zod";

export const chatBodySchema = z.object({
  sessionId: z.string().uuid(),
  message: z.string().min(1).max(1000)
});

export const chatHistoryParamsSchema = z.object({
  sessionId: z.string().uuid()
});

import { handleChatMessage, getChatHistory } from "../ai/engine.js";

export async function postChat(req, res, next) {
  try {
    const { sessionId, message } = req.body;
    const result = await handleChatMessage({ channel: "web", sessionId, message });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getHistory(req, res, next) {
  try {
    const messages = await getChatHistory(req.params.sessionId);
    res.json({ messages });
  } catch (err) {
    next(err);
  }
}

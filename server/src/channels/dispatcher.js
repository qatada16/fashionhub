import * as whatsapp from "./whatsapp.js";
import * as instagram from "./instagram.js";
import { transcribeAudio } from "../ai/transcribe.js";
import { handleChatMessage } from "../ai/engine.js";

const VOICE_FALLBACK =
  "Sorry, I couldn't hear that voice note clearly — could you type it?\nMaazrat, aapka voice note samajh nahi aaya — kya aap likh kar bhej sakte hain?";
const UNSUPPORTED_FALLBACK =
  "I can help with text and voice messages. Please type what you're looking for, or say hi to see the menu!";

async function resolveText(channel, inbound) {
  if (inbound.type === "text" || inbound.type === "interactive") return inbound.text;
  if (inbound.type !== "audio") return null;
  const media =
    channel === "whatsapp"
      ? await whatsapp.downloadMedia(inbound.mediaId)
      : await instagram.downloadMedia(inbound.mediaUrl);
  if (!media) return null;
  return transcribeAudio(media.buffer, media.mimeType);
}

export async function dispatch(channel, inbound) {
  const adapter = channel === "whatsapp" ? whatsapp : instagram;
  const to = inbound.senderId;
  try {
    if (channel === "whatsapp" && inbound.messageId) {
      whatsapp.markRead(inbound.messageId).catch(() => {});
    }

    if (inbound.type === "unsupported") {
      await adapter.sendText(to, UNSUPPORTED_FALLBACK);
      return;
    }

    const text = await resolveText(channel, inbound);
    if (!text) {
      await adapter.sendText(to, inbound.type === "audio" ? VOICE_FALLBACK : UNSUPPORTED_FALLBACK);
      return;
    }

    const result = await handleChatMessage({ channel, sessionId: to, message: text });

    if (channel === "whatsapp" && result.quickReplies?.length) {
      await whatsapp.sendMenu(to, result.reply, result.quickReplies);
    } else if (channel === "whatsapp") {
      await whatsapp.sendText(to, result.reply);
    } else {
      await instagram.sendText(to, result.reply, result.quickReplies || []);
    }

    if (result.products?.length) await adapter.sendProducts(to, result.products);
    if (result.order) await adapter.sendOrderConfirmation(to, result.order);
  } catch (err) {
    console.error(`[${channel}] dispatch failed for ${inbound.messageId}:`, err.message);
  }
}

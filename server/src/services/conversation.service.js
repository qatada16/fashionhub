import Conversation from "../models/Conversation.js";
import { HttpError } from "../middleware/error.js";

function truncate(text, max = 120) {
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

export async function listConversations(q) {
  const filter = {};
  if (q.channel) filter.channel = q.channel;
  if (q.isOpen !== undefined) filter.isOpen = q.isOpen;

  const skip = (q.page - 1) * q.limit;
  const [conversations, total] = await Promise.all([
    Conversation.find(filter)
      .sort({ lastMessageAt: -1 })
      .skip(skip)
      .limit(q.limit)
      .populate("customer", "name"),
    Conversation.countDocuments(filter)
  ]);

  return {
    items: conversations.map((c) => {
      const last = c.messages[c.messages.length - 1];
      const lastClassified = [...c.messages].reverse().find((m) => m.role === "customer" && m.intent);
      return {
        id: c._id,
        customer: c.customer ? { id: c.customer._id, name: c.customer.name || null } : null,
        channel: c.channel,
        lastMessageAt: c.lastMessageAt,
        isOpen: c.isOpen,
        lastMessage: last ? { role: last.role, text: truncate(last.text) } : null,
        messagesCount: c.messages.length,
        lastIntent: lastClassified?.intent || null,
        lastSentiment: lastClassified?.sentiment || null
      };
    }),
    page: q.page,
    total,
    totalPages: Math.ceil(total / q.limit)
  };
}

export async function getConversation(id) {
  const conversation = await Conversation.findById(id).populate(
    "customer",
    "name phone instagramId address language preferences"
  );
  if (!conversation) throw new HttpError(404, "Conversation not found");

  return {
    id: conversation._id,
    customer: conversation.customer,
    channel: conversation.channel,
    isOpen: conversation.isOpen,
    lastMessageAt: conversation.lastMessageAt,
    createdAt: conversation.createdAt,
    messages: conversation.messages.map((m) => ({
      role: m.role,
      text: m.text,
      mediaUrl: m.mediaUrl || null,
      intent: m.intent || null,
      sentiment: m.sentiment || null,
      products: m.products || [],
      createdAt: m.createdAt
    }))
  };
}

export async function updateConversation(id, { isOpen }) {
  const conversation = await Conversation.findByIdAndUpdate(
    id,
    { isOpen },
    { new: true }
  ).populate("customer", "name");
  if (!conversation) throw new HttpError(404, "Conversation not found");
  return { id: conversation._id, isOpen: conversation.isOpen };
}

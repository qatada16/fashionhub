import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ["customer", "assistant", "admin"], required: true },
    text: String,
    mediaUrl: String,
    intent: String,
    sentiment: {
      type: String,
      enum: ["happy", "angry", "frustrated", "interested", "neutral"],
      default: "neutral"
    },
    products: [{ type: mongoose.Schema.Types.Mixed }],
    createdAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const conversationSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    channel: { type: String, enum: ["whatsapp", "instagram", "web"], required: true },
    messages: [messageSchema],
    pendingOrder: { type: mongoose.Schema.Types.Mixed, default: null },
    context: {
      lastProductIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
      lastEntities: { type: mongoose.Schema.Types.Mixed }
    },
    isOpen: { type: Boolean, default: true },
    lastMessageAt: { type: Date, default: Date.now, index: true }
  },
  { timestamps: true }
);

export default mongoose.model("Conversation", conversationSchema);

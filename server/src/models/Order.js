import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    size: String,
    color: String,
    qty: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    deliveryCharges: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "packed", "shipped", "delivered", "cancelled", "returned"],
      default: "pending"
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "cod", "paid", "refunded"],
      default: "cod"
    },
    paymentMethod: { type: String, default: "cod" },
    trackingNumber: String,
    channel: { type: String, enum: ["whatsapp", "instagram", "web"], required: true },
    deliveryAddress: {
      street: String,
      city: String,
      province: String,
      postalCode: String
    }
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);

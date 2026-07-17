import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    phone: { type: String, unique: true, sparse: true },
    instagramId: { type: String, unique: true, sparse: true },
    webSessionId: { type: String, unique: true, sparse: true },
    address: {
      street: String,
      city: String,
      province: String,
      postalCode: String
    },
    preferences: {
      favoriteColors: [String],
      sizes: [String],
      budgetMax: Number,
      categories: [String]
    },
    orderHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
    language: { type: String, enum: ["en", "ur", "roman-ur"], default: "en" }
  },
  { timestamps: true }
);

export default mongoose.model("Customer", customerSchema);

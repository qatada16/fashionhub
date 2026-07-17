import mongoose from "mongoose";

const stockSchema = new mongoose.Schema(
  {
    size: { type: String, required: true },
    color: { type: String, required: true },
    qty: { type: Number, required: true, min: 0 }
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    category: {
      type: String,
      required: true,
      enum: ["dresses", "shirts", "shoes", "handbags", "accessories"]
    },
    gender: { type: String, required: true, enum: ["men", "women", "unisex"] },
    season: { type: String, enum: ["summer", "winter", "all"], default: "all" },
    style: { type: String, enum: ["formal", "casual", "party", "eid"], default: "casual" },
    price: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0, max: 100 },
    description: { type: String, default: "" },
    sizes: [String],
    colors: [String],
    stock: [stockSchema],
    images: [String],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    soldCount: { type: Number, default: 0 },
    isTrending: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

productSchema.index({ name: "text", description: "text" });
productSchema.index({ category: 1 });
productSchema.index({ gender: 1 });
productSchema.index({ price: 1 });

export default mongoose.model("Product", productSchema);

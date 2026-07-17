import Product from "../models/Product.js";
import { HttpError } from "../middleware/error.js";

const SORTS = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  "price-asc": { price: 1 },
  "price-desc": { price: -1 },
  "best-selling": { soldCount: -1 },
  rating: { rating: -1 }
};

function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s-]+/g, "-");
}

function buildFilter(q, { publicOnly = false } = {}) {
  const filter = {};
  if (publicOnly) filter.isActive = true;
  if (q.search) filter.$text = { $search: q.search };
  if (q.category) filter.category = q.category;
  if (q.gender) filter.gender = q.gender;
  if (q.season) filter.season = q.season;
  if (q.style) filter.style = q.style;
  if (q.color) filter.colors = q.color.toLowerCase();
  if (q.trending !== undefined) filter.isTrending = q.trending;
  if (q.minPrice !== undefined || q.maxPrice !== undefined) {
    filter.price = {};
    if (q.minPrice !== undefined) filter.price.$gte = q.minPrice;
    if (q.maxPrice !== undefined) filter.price.$lte = q.maxPrice;
  }
  return filter;
}

export async function listProducts(q, opts) {
  const filter = buildFilter(q, opts);
  const sort = SORTS[q.sort] || SORTS.newest;
  const skip = (q.page - 1) * q.limit;

  const [items, total] = await Promise.all([
    Product.find(filter).sort(sort).skip(skip).limit(q.limit),
    Product.countDocuments(filter)
  ]);

  return {
    items,
    page: q.page,
    limit: q.limit,
    total,
    totalPages: Math.ceil(total / q.limit)
  };
}

export async function getProductBySlug(slug) {
  const product = await Product.findOne({ slug, isActive: true });
  if (!product) throw new HttpError(404, "Product not found");
  return product;
}

export async function getProductById(id) {
  const product = await Product.findById(id);
  if (!product) throw new HttpError(404, "Product not found");
  return product;
}

export async function createProduct(data) {
  if (!data.slug) data.slug = slugify(data.name);
  return Product.create(data);
}

export async function updateProduct(id, data) {
  if (data.name && !data.slug) data.slug = slugify(data.name);
  const product = await Product.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!product) throw new HttpError(404, "Product not found");
  return product;
}

export async function deleteProduct(id) {
  const product = await Product.findByIdAndDelete(id);
  if (!product) throw new HttpError(404, "Product not found");
  return product;
}

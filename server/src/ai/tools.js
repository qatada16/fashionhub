import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Customer from "../models/Customer.js";
import Setting from "../models/Setting.js";
import { HttpError } from "../middleware/error.js";

async function getSetting(key) {
  const doc = await Setting.findOne({ key }).lean();
  return doc ? doc.value : null;
}

export function effectivePrice(product) {
  return Math.round(product.price * (1 - (product.discount || 0) / 100));
}

export async function searchProducts(entities = {}, opts = {}) {
  const relaxOrder = ["style", "season", "sizes", "maxPrice"];
  let attempt = { ...entities };
  let results = await searchProductsStrict(attempt, opts);
  for (const key of relaxOrder) {
    if (results.length) break;
    if (attempt[key] === undefined) continue;
    attempt = { ...attempt };
    delete attempt[key];
    results = await searchProductsStrict(attempt, opts);
  }
  return results;
}

async function searchProductsStrict(entities = {}, { limit = 4, sort = "best" } = {}) {
  const filter = { isActive: true };
  if (entities.category) filter.category = entities.category;
  if (entities.gender && entities.gender !== "unisex") filter.gender = { $in: [entities.gender, "unisex"] };
  if (entities.season) filter.season = { $in: [entities.season, "all"] };
  if (entities.style) filter.style = entities.style;
  if (entities.colors?.length) filter.colors = { $in: entities.colors.map((c) => c.toLowerCase()) };
  if (entities.sizes?.length) filter.sizes = { $in: entities.sizes.map((s) => s.toUpperCase()) };
  if (entities.minPrice !== undefined || entities.maxPrice !== undefined) {
    filter.price = {};
    if (entities.minPrice !== undefined) filter.price.$gte = entities.minPrice;
    if (entities.maxPrice !== undefined) filter.price.$lte = entities.maxPrice;
  }
  if (entities.onSale) filter.discount = { $gt: 0 };

  const sortSpec = sort === "newest" ? { createdAt: -1 } : { soldCount: -1, rating: -1 };

  if (entities.productRef) {
    const byText = await Product.find({ ...filter, $text: { $search: entities.productRef } })
      .sort(sortSpec)
      .limit(limit)
      .lean();
    if (byText.length) return byText;
    const byName = await Product.find({
      ...filter,
      name: { $regex: entities.productRef.split(/\s+/).join("|"), $options: "i" }
    })
      .sort(sortSpec)
      .limit(limit)
      .lean();
    if (byName.length) return byName;
  }

  return Product.find(filter).sort(sortSpec).limit(limit).lean();
}

export async function getProductsByIds(ids = []) {
  if (!ids.length) return [];
  return Product.find({ _id: { $in: ids }, isActive: true }).lean();
}

export function checkStock(product, size, color) {
  const entries = (product.stock || []).filter(
    (s) =>
      (!size || s.size.toLowerCase() === String(size).toLowerCase()) &&
      (!color || s.color.toLowerCase() === String(color).toLowerCase())
  );
  const qty = entries.reduce((sum, s) => sum + s.qty, 0);
  return { available: qty > 0, qty, entries };
}

export async function getDeliveryInfo(city) {
  const delivery = (await getSetting("delivery")) || {};
  const match = city
    ? (delivery.cities || []).find((c) => c.name.toLowerCase() === city.toLowerCase())
    : null;
  return {
    city: match || null,
    cityAsked: city || null,
    defaultCharges: delivery.defaultCharges,
    freeAbove: delivery.freeAbove,
    note: delivery.note,
    cities: delivery.cities || []
  };
}

export async function getPolicies() {
  return getSetting("policies");
}

export async function getFaq() {
  return getSetting("faq");
}

export async function getPersona() {
  return getSetting("persona");
}

export async function trackOrder({ orderId, customerId }) {
  let order = null;
  if (orderId) {
    order = await Order.findOne({ orderId: orderId.toUpperCase().trim() }).lean();
  }
  if (!order && customerId) {
    order = await Order.findOne({ customer: customerId }).sort({ createdAt: -1 }).lean();
  }
  if (!order) return null;
  return {
    orderId: order.orderId,
    status: order.status,
    total: order.total,
    items: order.items.map((i) => ({ name: i.name, size: i.size, color: i.color, qty: i.qty })),
    trackingNumber: order.trackingNumber || null,
    city: order.deliveryAddress?.city || null,
    placedAt: order.createdAt
  };
}

export async function getTrending(limit = 4) {
  const trending = await Product.find({ isActive: true, isTrending: true })
    .sort({ soldCount: -1 })
    .limit(limit)
    .lean();
  if (trending.length >= limit) return trending;
  const more = await Product.find({ isActive: true, isTrending: { $ne: true } })
    .sort({ soldCount: -1 })
    .limit(limit - trending.length)
    .lean();
  return [...trending, ...more];
}

export async function getUpsells(product, limit = 2) {
  if (!product) return [];
  const complementary = await Product.find({
    isActive: true,
    _id: { $ne: product._id },
    category: { $ne: product.category },
    gender: { $in: [product.gender, "unisex"] }
  })
    .sort({ soldCount: -1 })
    .limit(limit)
    .lean();
  if (complementary.length) return complementary;
  return Product.find({
    isActive: true,
    _id: { $ne: product._id },
    category: product.category
  })
    .sort({ soldCount: -1 })
    .limit(limit)
    .lean();
}

async function nextOrderId() {
  const year = new Date().getFullYear();
  const prefix = `FH-${year}-`;
  const last = await Order.findOne({ orderId: { $regex: `^${prefix}` } })
    .sort({ orderId: -1 })
    .lean();
  const seq = last ? parseInt(last.orderId.slice(prefix.length), 10) + 1 : 1;
  return `${prefix}${String(seq).padStart(4, "0")}`;
}

export async function createOrder({ customerId, channel, productId, size, color, qty, address }) {
  const product = await Product.findById(productId);
  if (!product) throw new HttpError(404, "Product no longer available");

  const stock = checkStock(product, size, color);
  if (!stock.available || stock.qty < qty) {
    throw new HttpError(409, `Only ${stock.qty} left in ${size}/${color}`);
  }

  const unitPrice = effectivePrice(product);
  const subtotal = unitPrice * qty;

  const delivery = (await getSetting("delivery")) || {};
  const cityMatch = (delivery.cities || []).find(
    (c) => address.city && c.name.toLowerCase() === address.city.toLowerCase()
  );
  let deliveryCharges = cityMatch ? cityMatch.charges : delivery.defaultCharges || 0;
  if (delivery.freeAbove && subtotal >= delivery.freeAbove) deliveryCharges = 0;

  const dec = await Product.updateOne(
    {
      _id: product._id,
      stock: {
        $elemMatch: {
          size: new RegExp(`^${size}$`, "i"),
          color: new RegExp(`^${color}$`, "i"),
          qty: { $gte: qty }
        }
      }
    },
    { $inc: { "stock.$.qty": -qty, soldCount: qty } }
  );
  if (dec.modifiedCount === 0) throw new HttpError(409, "Item just went out of stock");

  let order;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      order = await Order.create({
        orderId: await nextOrderId(),
        customer: customerId,
        items: [{ product: product._id, name: product.name, size, color, qty, unitPrice }],
        subtotal,
        deliveryCharges,
        total: subtotal + deliveryCharges,
        status: "pending",
        paymentStatus: "cod",
        paymentMethod: "cod",
        channel,
        deliveryAddress: address
      });
      break;
    } catch (err) {
      if (err.code === 11000 && attempt < 2) continue;
      throw err;
    }
  }

  await Customer.updateOne(
    { _id: customerId },
    { $push: { orderHistory: order._id }, $set: { address } }
  );

  return order;
}

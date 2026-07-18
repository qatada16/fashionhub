import crypto from "node:crypto";
import Order from "../models/Order.js";
import Customer from "../models/Customer.js";
import { HttpError } from "../middleware/error.js";

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function listOrders(q) {
  const filter = {};
  if (q.status) filter.status = q.status;
  if (q.paymentStatus) filter.paymentStatus = q.paymentStatus;
  if (q.channel) filter.channel = q.channel;

  if (q.search) {
    const rx = new RegExp(escapeRegex(q.search), "i");
    const matchingCustomers = await Customer.find({ name: rx }).select("_id");
    filter.$or = [{ orderId: rx }, { customer: { $in: matchingCustomers.map((c) => c._id) } }];
  }

  const skip = (q.page - 1) * q.limit;
  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(q.limit)
      .populate("customer", "name phone"),
    Order.countDocuments(filter)
  ]);

  return {
    items: orders.map((o) => ({
      id: o._id,
      orderId: o.orderId,
      customer: o.customer
        ? { id: o.customer._id, name: o.customer.name, phone: o.customer.phone || null }
        : null,
      itemsCount: o.items.reduce((sum, i) => sum + i.qty, 0),
      total: o.total,
      status: o.status,
      paymentStatus: o.paymentStatus,
      channel: o.channel,
      trackingNumber: o.trackingNumber || null,
      createdAt: o.createdAt
    })),
    page: q.page,
    total,
    totalPages: Math.ceil(total / q.limit)
  };
}

export async function getOrder(id) {
  const order = await Order.findById(id)
    .populate("customer", "name phone instagramId address language")
    .populate("items.product", "name images slug");
  if (!order) throw new HttpError(404, "Order not found");

  const obj = order.toObject();
  obj.id = obj._id;
  obj.items = obj.items.map((i) => ({
    product: i.product?._id || null,
    name: i.name || i.product?.name,
    image: i.product?.images?.[0] || null,
    slug: i.product?.slug || null,
    size: i.size,
    color: i.color,
    qty: i.qty,
    unitPrice: i.unitPrice
  }));
  return obj;
}

function generateTracking() {
  return `TRK-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
}

export async function updateOrder(id, patch) {
  const order = await Order.findById(id);
  if (!order) throw new HttpError(404, "Order not found");

  if (patch.status) order.status = patch.status;
  if (patch.paymentStatus) order.paymentStatus = patch.paymentStatus;
  if (patch.trackingNumber !== undefined) order.trackingNumber = patch.trackingNumber;

  if (order.status === "shipped" && !order.trackingNumber) {
    order.trackingNumber = generateTracking();
  }

  await order.save();
  return getOrder(id);
}

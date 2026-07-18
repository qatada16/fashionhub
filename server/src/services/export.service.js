import Order from "../models/Order.js";
import Customer from "../models/Customer.js";
import Product from "../models/Product.js";
import { toCsv } from "../utils/csv.js";

function dateStr(d) {
  return d ? new Date(d).toISOString().slice(0, 10) : "";
}

async function exportOrders() {
  const orders = await Order.find().sort({ createdAt: -1 }).populate("customer", "name phone");
  const headers = [
    "orderId",
    "customer",
    "phone",
    "items",
    "subtotal",
    "deliveryCharges",
    "total",
    "status",
    "paymentStatus",
    "channel",
    "trackingNumber",
    "city",
    "date"
  ];
  const rows = orders.map((o) => ({
    orderId: o.orderId,
    customer: o.customer?.name || "",
    phone: o.customer?.phone || "",
    items: o.items
      .map((i) => `${i.qty}x ${i.name} (${[i.size, i.color].filter(Boolean).join("/")})`)
      .join("; "),
    subtotal: o.subtotal,
    deliveryCharges: o.deliveryCharges,
    total: o.total,
    status: o.status,
    paymentStatus: o.paymentStatus,
    channel: o.channel,
    trackingNumber: o.trackingNumber || "",
    city: o.deliveryAddress?.city || "",
    date: dateStr(o.createdAt)
  }));
  return toCsv(headers, rows);
}

async function exportCustomers() {
  const customers = await Customer.find().sort({ createdAt: -1 });
  const counts = await Order.aggregate([{ $group: { _id: "$customer", count: { $sum: 1 } } }]);
  const countMap = new Map(counts.map((c) => [String(c._id), c.count]));
  const headers = ["name", "phone", "instagramId", "city", "ordersCount", "language", "joined"];
  const rows = customers.map((c) => ({
    name: c.name || "",
    phone: c.phone || "",
    instagramId: c.instagramId || "",
    city: c.address?.city || "",
    ordersCount: countMap.get(String(c._id)) || 0,
    language: c.language,
    joined: dateStr(c.createdAt)
  }));
  return toCsv(headers, rows);
}

async function exportProducts() {
  const products = await Product.find().sort({ createdAt: -1 });
  const headers = [
    "name",
    "category",
    "gender",
    "season",
    "style",
    "price",
    "discount",
    "totalStock",
    "soldCount",
    "rating",
    "active"
  ];
  const rows = products.map((p) => ({
    name: p.name,
    category: p.category,
    gender: p.gender,
    season: p.season,
    style: p.style,
    price: p.price,
    discount: p.discount,
    totalStock: (p.stock || []).reduce((s, i) => s + i.qty, 0),
    soldCount: p.soldCount,
    rating: p.rating,
    active: p.isActive ? "yes" : "no"
  }));
  return toCsv(headers, rows);
}

const exporters = { orders: exportOrders, customers: exportCustomers, products: exportProducts };

export function exportCsv(type) {
  return exporters[type]();
}

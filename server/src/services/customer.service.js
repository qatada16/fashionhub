import Customer from "../models/Customer.js";
import Order from "../models/Order.js";
import { HttpError } from "../middleware/error.js";

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function channelHint(c) {
  if (c.phone) return "whatsapp";
  if (c.instagramId) return "instagram";
  return "web";
}

export async function listCustomers(q) {
  const filter = {};
  if (q.search) {
    const rx = new RegExp(escapeRegex(q.search), "i");
    filter.$or = [{ name: rx }, { phone: rx }, { instagramId: rx }];
  }

  const skip = (q.page - 1) * q.limit;
  const [customers, total] = await Promise.all([
    Customer.find(filter).sort({ createdAt: -1 }).skip(skip).limit(q.limit),
    Customer.countDocuments(filter)
  ]);

  const ids = customers.map((c) => c._id);
  const orderCounts = await Order.aggregate([
    { $match: { customer: { $in: ids } } },
    { $group: { _id: "$customer", count: { $sum: 1 } } }
  ]);
  const countMap = new Map(orderCounts.map((o) => [String(o._id), o.count]));

  return {
    items: customers.map((c) => ({
      id: c._id,
      name: c.name || null,
      phone: c.phone || null,
      instagramId: c.instagramId || null,
      channelHint: channelHint(c),
      city: c.address?.city || null,
      ordersCount: countMap.get(String(c._id)) || 0,
      preferences: c.preferences,
      language: c.language,
      createdAt: c.createdAt
    })),
    page: q.page,
    total,
    totalPages: Math.ceil(total / q.limit)
  };
}

export async function getCustomer(id) {
  const customer = await Customer.findById(id);
  if (!customer) throw new HttpError(404, "Customer not found");

  const orders = await Order.find({ customer: id })
    .sort({ createdAt: -1 })
    .select("orderId total status createdAt");

  const obj = customer.toObject();
  obj.id = obj._id;
  obj.channelHint = channelHint(customer);
  obj.orders = orders.map((o) => ({
    id: o._id,
    orderId: o.orderId,
    total: o.total,
    status: o.status,
    createdAt: o.createdAt
  }));
  return obj;
}

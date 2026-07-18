import Order from "../models/Order.js";
import Customer from "../models/Customer.js";
import Conversation from "../models/Conversation.js";
import Product from "../models/Product.js";

function dayKey(date) {
  return date.toISOString().slice(0, 10);
}

export async function getStats() {
  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);
  since.setUTCDate(since.getUTCDate() - 13);

  const [
    revenueAgg,
    ordersCount,
    customersCount,
    conversationsCount,
    openConversations,
    statusAgg,
    salesAgg,
    topProductsDocs,
    recentOrdersDocs,
    lowStockAgg
  ] = await Promise.all([
    Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $group: { _id: null, revenue: { $sum: "$total" } } }
    ]),
    Order.countDocuments(),
    Customer.countDocuments(),
    Conversation.countDocuments(),
    Conversation.countDocuments({ isOpen: true }),
    Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Order.aggregate([
      { $match: { createdAt: { $gte: since }, status: { $ne: "cancelled" } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          total: { $sum: "$total" },
          count: { $sum: 1 }
        }
      }
    ]),
    Product.find().sort({ soldCount: -1 }).limit(5).select("name images soldCount price"),
    Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("orderId total status createdAt customer")
      .populate("customer", "name"),
    Product.aggregate([
      { $match: { isActive: true } },
      { $addFields: { totalQty: { $sum: "$stock.qty" } } },
      { $match: { totalQty: { $lte: 5 } } },
      { $sort: { totalQty: 1 } },
      { $project: { name: 1, totalQty: 1 } }
    ])
  ]);

  const ordersByStatus = {};
  for (const s of statusAgg) ordersByStatus[s._id] = s.count;

  const byDay = new Map(salesAgg.map((d) => [d._id, d]));
  const salesByDay = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(since);
    d.setUTCDate(since.getUTCDate() + i);
    const key = dayKey(d);
    const found = byDay.get(key);
    salesByDay.push({ date: key, total: found?.total || 0, count: found?.count || 0 });
  }

  return {
    revenue: revenueAgg[0]?.revenue || 0,
    ordersCount,
    customersCount,
    conversationsCount,
    openConversations,
    ordersByStatus,
    salesByDay,
    topProducts: topProductsDocs.map((p) => ({
      id: p._id,
      name: p.name,
      image: p.images?.[0] || null,
      soldCount: p.soldCount,
      price: p.price
    })),
    recentOrders: recentOrdersDocs.map((o) => ({
      id: o._id,
      orderId: o.orderId,
      customerName: o.customer?.name || "Unknown",
      total: o.total,
      status: o.status,
      createdAt: o.createdAt
    })),
    lowStock: lowStockAgg.map((p) => ({ id: p._id, name: p.name, totalQty: p.totalQty }))
  };
}

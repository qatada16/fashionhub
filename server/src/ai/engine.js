import Customer from "../models/Customer.js";
import Conversation from "../models/Conversation.js";
import { understand } from "./understand.js";
import { respond, CANNED_FALLBACK } from "./respond.js";
import {
  searchProducts,
  getProductsByIds,
  checkStock,
  getDeliveryInfo,
  getPolicies,
  getFaq,
  getPersona,
  trackOrder,
  getTrending,
  getUpsells,
  createOrder,
  effectivePrice
} from "./tools.js";

export const MENU = [
  "New Arrivals",
  "Women's Collection",
  "Men's Collection",
  "Order Tracking",
  "Delivery Information"
];

const LANG_MAP = { en: "en", ur: "ur", roman_ur: "roman-ur" };

function productCard(p) {
  return {
    id: String(p._id),
    name: p.name,
    slug: p.slug,
    price: p.price,
    discount: p.discount || 0,
    image: p.images?.[0] || null,
    sizes: p.sizes || [],
    colors: p.colors || [],
    rating: p.rating || 0
  };
}

function mapMenuSelection(text) {
  const t = text.trim().toLowerCase().replace(/[.!?]+$/, "");
  const map = {
    1: { intent: "product_search", entities: {}, sort: "newest", label: "New Arrivals" },
    "new arrivals": { intent: "product_search", entities: {}, sort: "newest", label: "New Arrivals" },
    2: { intent: "product_search", entities: { gender: "women" }, label: "Women's Collection" },
    "women's collection": { intent: "product_search", entities: { gender: "women" }, label: "Women's Collection" },
    "womens collection": { intent: "product_search", entities: { gender: "women" }, label: "Women's Collection" },
    3: { intent: "product_search", entities: { gender: "men" }, label: "Men's Collection" },
    "men's collection": { intent: "product_search", entities: { gender: "men" }, label: "Men's Collection" },
    "mens collection": { intent: "product_search", entities: { gender: "men" }, label: "Men's Collection" },
    4: { intent: "order_track", entities: {}, label: "Order Tracking" },
    "order tracking": { intent: "order_track", entities: {}, label: "Order Tracking" },
    5: { intent: "delivery_query", entities: {}, label: "Delivery Information" },
    "delivery information": { intent: "delivery_query", entities: {}, label: "Delivery Information" }
  };
  return map[t] || null;
}

function historyLines(messages, n = 6) {
  return messages
    .slice(-n)
    .map((m) => `${m.role === "customer" ? "Customer" : "Assistant"}: ${(m.text || "").slice(0, 200)}`);
}

async function loadCustomer({ channel, sessionId }) {
  const key =
    channel === "web" ? "webSessionId" : channel === "whatsapp" ? "phone" : "instagramId";
  let customer = await Customer.findOne({ [key]: sessionId });
  if (!customer) customer = await Customer.create({ [key]: sessionId });
  return customer;
}

async function loadConversation(customer, channel) {
  let convo = await Conversation.findOne({ customer: customer._id, channel, isOpen: true }).sort({
    lastMessageAt: -1
  });
  if (!convo) convo = await Conversation.create({ customer: customer._id, channel, messages: [] });
  return convo;
}

function updatePreferences(customer, entities, language) {
  const prefs = customer.preferences || {};
  const addUnique = (arr = [], vals = []) => [...new Set([...arr, ...vals.map((v) => v.toLowerCase())])];
  if (entities.colors?.length) prefs.favoriteColors = addUnique(prefs.favoriteColors, entities.colors);
  if (entities.sizes?.length)
    prefs.sizes = [...new Set([...(prefs.sizes || []), ...entities.sizes.map((s) => s.toUpperCase())])];
  if (entities.category) prefs.categories = addUnique(prefs.categories, [entities.category]);
  if (entities.maxPrice) prefs.budgetMax = Math.max(prefs.budgetMax || 0, entities.maxPrice);
  customer.preferences = prefs;
  if (language && LANG_MAP[language]) customer.language = LANG_MAP[language];
}

const PHONE_RE = /(\+?\d[\d\s-]{8,14}\d)/;

function extractPhone(text) {
  const m = text.match(PHONE_RE);
  return m ? m[1].replace(/[\s-]/g, "") : null;
}

function matchOption(value, options = []) {
  if (!value) return null;
  return options.find((o) => o.toLowerCase() === String(value).toLowerCase()) || null;
}

function orderMissingField(po, customer) {
  if (!po.productId) return "product";
  if (!po.size && po.productSizes?.length) return "size";
  if (!po.color) return "color";
  if (!po.qty) return "qty";
  if (!po.customerName && !customer.name) return "name";
  if (!po.phone && !customer.phone) return "phone";
  if (!po.street || !po.city) return "address";
  return null;
}

async function advanceOrderFlow({ convo, customer, understanding, message, channel }) {
  const po = convo.pendingOrder || {};
  const e = understanding.entities || {};
  const rawText = message.trim();

  if (/\b(cancel|cancel order|rehne do|nahi chahiye|forget it)\b/i.test(rawText) && understanding.intent !== "order_place") {
    convo.pendingOrder = null;
    convo.markModified("pendingOrder");
    return { data: { orderFlow: { cancelled: true } }, products: [], order: null };
  }

  // Change of mind or first turn: resolve the product.
  // Guard: providers sometimes echo productRef from history — only honor it if the
  // current message actually mentions it.
  const refWords = e.productRef
    ? String(e.productRef).toLowerCase().split(/\s+/).filter((w) => w.length > 2)
    : [];
  const refInMessage = refWords.some((w) => rawText.toLowerCase().includes(w));
  let product = null;
  if ((e.productRef && (refInMessage || !po.productId)) || (!po.productId && (e.category || e.colors?.length || e.style))) {
    const results = await searchProducts(e, { limit: 3 });
    if (results.length) {
      product = results[0];
      po.productId = String(product._id);
      po.productName = product.name;
      po.productSizes = product.sizes;
      po.productColors = product.colors;
      po.unitPrice = effectivePrice(product);
      if (po.size && !matchOption(po.size, product.sizes)) po.size = null;
      if (po.color && !matchOption(po.color, product.colors)) po.color = null;
    }
  }
  if (!product && po.productId) {
    const found = await getProductsByIds([po.productId]);
    product = found[0] || null;
  }
  if (!product && !po.productId && convo.context?.lastProductIds?.length) {
    const last = await getProductsByIds([convo.context.lastProductIds[0]]);
    if (last.length) {
      product = last[0];
      po.productId = String(product._id);
      po.productName = product.name;
      po.productSizes = product.sizes;
      po.productColors = product.colors;
      po.unitPrice = effectivePrice(product);
    }
  }

  if (e.sizes?.length) {
    const s = matchOption(e.sizes[0], po.productSizes || []);
    if (s) po.size = s;
  }
  if (e.colors?.length) {
    const c = matchOption(e.colors[0], po.productColors || []);
    if (c) po.color = c;
  }
  if (po.productColors?.length === 1) po.color = po.productColors[0];
  if (e.quantity) po.qty = e.quantity;
  if (e.city) po.city = e.city;

  const awaiting = po.awaiting;
  if (awaiting === "size" && !po.size) {
    const WORD_SIZES = { "extra large": "XL", xxl: "XXL", xl: "XL", small: "S", medium: "M", large: "L" };
    const lower = rawText.toLowerCase();
    for (const [word, s] of Object.entries(WORD_SIZES)) {
      const hit = lower.includes(word) && matchOption(s, po.productSizes);
      if (hit) {
        po.size = hit;
        break;
      }
    }
    if (!po.size) {
      for (const s of po.productSizes || []) {
        if (new RegExp(`\\b${s}\\b`, "i").test(rawText)) {
          po.size = s;
          break;
        }
      }
    }
  }
  if (awaiting === "color" && !po.color) {
    for (const c of po.productColors || []) {
      if (rawText.toLowerCase().includes(c.toLowerCase())) {
        po.color = c;
        break;
      }
    }
  }
  if (awaiting === "qty" && !po.qty) {
    const n = rawText.match(/\b(\d{1,2})\b/);
    if (n) po.qty = parseInt(n[1], 10);
  }
  if (awaiting === "name" && !extractPhone(rawText)) {
    const name = rawText.replace(/^(my name is|i am|i'm|mera naam)\s*/i, "").replace(/\s*(hai)$/i, "").trim();
    const looksLikeAddress = /\d|flat|house|street|road|block|phase|sector|colony|town|boulevard|gali/i.test(name);
    if (name && name.length <= 60 && !refInMessage && !looksLikeAddress) po.customerName = name;
  }
  const phone = extractPhone(rawText);
  if (phone && (awaiting === "phone" || !po.phone)) po.phone = phone;
  if (awaiting === "address") {
    po.street = rawText.replace(PHONE_RE, "").trim();
    if (!po.city) {
      const { cities } = await getDeliveryInfo();
      const hit = cities.find((c) => rawText.toLowerCase().includes(c.name.toLowerCase()));
      if (hit) po.city = hit.name;
    }
  }

  const missing = orderMissingField(po, customer);

  if (!missing) {
    if (po.customerName && !customer.name) customer.name = po.customerName;
    if (po.phone && !customer.phone) {
      try {
        customer.phone = po.phone;
        await customer.save();
      } catch {
        customer.phone = undefined;
      }
    }
    const address = { street: po.street, city: po.city };
    const order = await createOrder({
      customerId: customer._id,
      channel,
      productId: po.productId,
      size: po.size || null,
      color: po.color,
      qty: po.qty,
      address
    });
    convo.pendingOrder = null;
    convo.markModified("pendingOrder");
    const upsells = product ? await getUpsells(product) : [];
    return {
      data: {
        orderConfirmed: {
          orderId: order.orderId,
          item: order.items[0],
          subtotal: order.subtotal,
          deliveryCharges: order.deliveryCharges,
          total: order.total,
          paymentMethod: "Cash on Delivery",
          deliveryCity: po.city
        },
        upsells: upsells.map((u) => ({ name: u.name, price: effectivePrice(u) }))
      },
      products: upsells.map(productCard),
      order: { orderId: order.orderId, total: order.total, status: order.status }
    };
  }

  po.awaiting = missing;
  convo.pendingOrder = po;
  convo.markModified("pendingOrder");

  const stockInfo =
    product && po.size && po.color ? checkStock(product, po.size, po.color) : null;
  return {
    data: {
      orderFlow: {
        collectingOrderDetails: true,
        product: product
          ? { name: product.name, price: effectivePrice(product), sizes: product.sizes, colors: product.colors }
          : null,
        collected: {
          size: po.size || null,
          color: po.color || null,
          qty: po.qty || null,
          name: po.customerName || customer.name || null,
          phone: po.phone || customer.phone || null,
          address: po.street ? `${po.street}, ${po.city || ""}` : null
        },
        stock: stockInfo ? { available: stockInfo.available, qty: stockInfo.qty } : null,
        askCustomerFor: missing,
        instruction: `Ask the customer ONLY for their ${missing}${missing === "product" ? " (which item they want to order)" : ""}. If asking size or color, list the available options from product data. Do not mention or suggest any other product.`
      }
    },
    products: product ? [productCard(product)] : [],
    order: null
  };
}

async function routeIntent({ understanding, convo, customer, message, channel, menuSort }) {
  const e = understanding.entities || {};
  let data = {};
  let products = [];
  let quickReplies = [];
  let order = null;

  switch (understanding.intent) {
    case "greeting": {
      const persona = await getPersona();
      data = { greeting: persona?.greeting, menu: MENU, instruction: "Give a warm short welcome from FashionHub and present the menu options." };
      quickReplies = MENU;
      break;
    }
    case "product_search":
    case "color_query":
    case "price_query": {
      const prev = convo.context?.lastEntities || {};
      // inherit previous filters only for refinement queries ("in red?", "cheaper?")
      const merged = !e.category && !e.productRef ? { ...prev, ...e } : e;
      const results = await searchProducts(merged, { sort: menuSort || "best" });
      products = results.map(productCard);
      data = {
        searchedFor: merged,
        products: results.map((p) => ({
          name: p.name,
          price: effectivePrice(p),
          originalPrice: p.discount ? p.price : undefined,
          discount: p.discount || 0,
          sizes: p.sizes,
          colors: p.colors,
          rating: p.rating
        }))
      };
      if (results.length) data.upsells = (await getUpsells(results[0], 1)).map((u) => ({ name: u.name, price: effectivePrice(u) }));
      else data.instruction = "No matching products found — say so honestly and suggest the customer browse other categories.";
      convo.context = { ...(convo.context || {}), lastProductIds: results.map((p) => p._id), lastEntities: merged };
      convo.markModified("context");
      break;
    }
    case "size_query": {
      const lastIds = convo.context?.lastProductIds || [];
      let pool = await getProductsByIds(lastIds);
      if (!pool.length) pool = await searchProducts(e, { limit: 4 });
      const size = e.sizes?.[0];
      data = {
        sizeAsked: size || null,
        availability: pool.map((p) => ({
          name: p.name,
          sizes: p.sizes,
          hasSize: size ? p.sizes.map((s) => s.toLowerCase()).includes(size.toLowerCase()) : null,
          stock: size ? checkStock(p, size, e.colors?.[0]).qty : undefined
        }))
      };
      products = pool.slice(0, 4).map(productCard);
      if (pool.length) data.upsells = (await getUpsells(pool[0], 1)).map((u) => ({ name: u.name, price: effectivePrice(u) }));
      break;
    }
    case "delivery_query":
      data = { delivery: await getDeliveryInfo(e.city) };
      break;
    case "order_track": {
      const tracked = await trackOrder({ orderId: e.orderId, customerId: customer._id });
      data = tracked
        ? { order: tracked }
        : { order: null, instruction: "No order found — ask for their order ID (format FH-YYYY-NNNN)." };
      if (tracked) order = { orderId: tracked.orderId, total: tracked.total, status: tracked.status };
      break;
    }
    case "return_exchange":
      data = { policies: await getPolicies() };
      break;
    case "complaint": {
      data = {
        policies: await getPolicies(),
        order: await trackOrder({ orderId: e.orderId, customerId: customer._id }),
        instruction: "Apologize sincerely, share any order status found, and offer to escalate to a human team member."
      };
      break;
    }
    case "discount_query": {
      const onSale = await searchProducts({ ...e, onSale: true });
      products = onSale.map(productCard);
      data = {
        discountedProducts: onSale.map((p) => ({
          name: p.name,
          originalPrice: p.price,
          discount: p.discount,
          salePrice: effectivePrice(p)
        })),
        faq: (await getFaq())?.filter((f) => /sale|discount/i.test(f.q))
      };
      break;
    }
    default: {
      if (/trend|best.?sell|popular|famous|hit/i.test(message) || e.style) {
        const trending = await getTrending();
        products = trending.map(productCard);
        data = { trendingProducts: trending.map((p) => ({ name: p.name, price: effectivePrice(p), rating: p.rating, soldCount: p.soldCount })) };
      } else {
        data = { faq: await getFaq(), note: "Answer only from FAQ if relevant, otherwise ask a clarifying question or offer the menu." };
        quickReplies = MENU;
      }
    }
  }

  return { data, products, quickReplies, order };
}

export async function handleChatMessage({ channel = "web", sessionId, message }) {
  const customer = await loadCustomer({ channel, sessionId });
  const convo = await loadConversation(customer, channel);
  const history = convo.messages.slice(-16);

  let understanding;
  let menuSort = null;
  const menu = mapMenuSelection(message);

  if (menu) {
    understanding = {
      intent: menu.intent,
      sentiment: "interested",
      language: customer.language === "roman-ur" ? "roman_ur" : customer.language || "en",
      entities: menu.entities
    };
    menuSort = menu.sort || null;
  } else {
    try {
      understanding = await understand({
        message,
        historyLines: historyLines(history),
        orderInProgress: Boolean(convo.pendingOrder)
      });
    } catch (err) {
      console.error("[ai] understand failed on all providers:", err.message);
      convo.messages.push({ role: "customer", text: message });
      convo.messages.push({ role: "assistant", text: CANNED_FALLBACK, intent: "other" });
      convo.lastMessageAt = new Date();
      await convo.save();
      return { reply: CANNED_FALLBACK, products: [], quickReplies: [], intent: "other", sentiment: "neutral", order: null };
    }
  }

  const trendingAsk = /trend|best.?sell|popular/i.test(message);
  if (trendingAsk && understanding.intent === "product_search" && !understanding.entities?.category) {
    understanding.intent = "other";
  }

  let routed;
  const orderActive = Boolean(convo.pendingOrder) || understanding.intent === "order_place";
  const interruptsOrder = ["delivery_query", "order_track", "return_exchange", "complaint", "greeting"];
  if (orderActive && !interruptsOrder.includes(understanding.intent)) {
    try {
      const flow = await advanceOrderFlow({ convo, customer, understanding, message, channel });
      routed = { ...flow, quickReplies: [] };
    } catch (err) {
      if (!err.status) throw err;
      routed = { data: { orderProblem: err.message, instruction: "Explain the problem and suggest an alternative size/color or product." }, products: [], quickReplies: [], order: null };
    }
  } else {
    routed = await routeIntent({ understanding, convo, customer, message, channel, menuSort });
  }

  const persona = await getPersona();
  let reply;
  try {
    reply = await respond({
      message,
      understanding,
      data: routed.data,
      persona,
      history
    });
  } catch (err) {
    console.error("[ai] respond failed on all providers:", err.message);
    reply = routed.order
      ? `Your order ${routed.order.orderId} is confirmed! Total: Rs ${routed.order.total} (Cash on Delivery).`
      : CANNED_FALLBACK;
  }

  convo.messages.push({
    role: "customer",
    text: message,
    intent: understanding.intent,
    sentiment: understanding.sentiment
  });
  convo.messages.push({
    role: "assistant",
    text: reply,
    intent: understanding.intent,
    products: routed.products.length ? routed.products : undefined
  });
  convo.lastMessageAt = new Date();
  await convo.save();

  updatePreferences(customer, understanding.entities || {}, understanding.language);
  try {
    await customer.save();
  } catch (err) {
    console.error("[ai] customer save failed:", err.message);
  }

  return {
    reply,
    products: routed.products.slice(0, 4),
    quickReplies: routed.quickReplies || [],
    intent: understanding.intent,
    sentiment: understanding.sentiment,
    order: routed.order || null
  };
}

export async function getChatHistory(sessionId) {
  const customer = await Customer.findOne({ webSessionId: sessionId });
  if (!customer) return [];
  const convo = await Conversation.findOne({ customer: customer._id, channel: "web" })
    .sort({ lastMessageAt: -1 })
    .lean();
  if (!convo) return [];
  return convo.messages
    .filter((m) => m.role !== "admin")
    .map((m) => ({
      role: m.role,
      text: m.text,
      products: m.products || undefined,
      createdAt: m.createdAt
    }));
}

import { z } from "zod";
import { invokeWithFallback } from "./llm.js";

export const INTENTS = [
  "greeting",
  "product_search",
  "size_query",
  "color_query",
  "price_query",
  "delivery_query",
  "order_place",
  "order_track",
  "return_exchange",
  "complaint",
  "discount_query",
  "menu_selection",
  "other"
];

const ENTITY_DESCRIPTIONS = {
  category: "one of: dresses, shirts, shoes, handbags, accessories. Omit if not mentioned",
  gender: "one of: men, women, unisex. Omit if not mentioned",
  colors: "lowercase English color names",
  sizes: 'uppercase sizes like "S","M","L","XL" or numeric shoe sizes',
  maxPrice: "maximum budget in Rs, digits only",
  minPrice: "minimum price in Rs, digits only",
  city: "Pakistani city name",
  orderId: 'order id like "FH-2026-0001"',
  productRef: "words referring to a specific product, e.g. 'black maxi', 'the second one'",
  season: "summer or winter. Omit if not mentioned",
  style: "one of: formal, casual, party, eid. Omit if not mentioned",
  quantity: "number of pieces, digits only"
};

// Gemini's response_schema rejects type unions, so its schema is plain optional
// strings. Groq's server-side tool validation is brittle (nulls, stringified arrays,
// extra keys), so it gets JSON mode + a lenient client-side schema instead.
function buildSchema({ lenient }) {
  const str = (key) => (lenient ? z.string().nullish() : z.string().optional()).describe(ENTITY_DESCRIPTIONS[key]);
  const arr = (key) => {
    if (!lenient) return z.array(z.string()).optional().describe(ENTITY_DESCRIPTIONS[key]);
    return z
      .preprocess((v) => {
        if (typeof v === "string") {
          try {
            const parsed = JSON.parse(v);
            return Array.isArray(parsed) ? parsed : [v];
          } catch {
            return v.split(",").map((s) => s.trim());
          }
        }
        return v;
      }, z.array(z.string()).nullish())
      .describe(ENTITY_DESCRIPTIONS[key]);
  };
  const entities = z.object({
    category: str("category"),
    gender: str("gender"),
    colors: arr("colors"),
    sizes: arr("sizes"),
    maxPrice: str("maxPrice"),
    minPrice: str("minPrice"),
    city: str("city"),
    orderId: str("orderId"),
    productRef: str("productRef"),
    season: str("season"),
    style: str("style"),
    quantity: str("quantity")
  });
  const intent = lenient
    ? z.string().describe(`The customer's primary intent, one of: ${INTENTS.join(", ")}`)
    : z.enum(INTENTS).describe("The customer's primary intent");
  const sentiment = lenient
    ? z.string().describe("one of: happy, angry, frustrated, interested, neutral")
    : z.enum(["happy", "angry", "frustrated", "interested", "neutral"]);
  const language = lenient
    ? z.string().describe("en=English, ur=Urdu script, roman_ur=Urdu in Latin letters")
    : z.enum(["en", "ur", "roman_ur"]).describe("en=English, ur=Urdu script, roman_ur=Urdu written in Latin letters");
  return z.object({
    intent,
    sentiment,
    language,
    entities: lenient ? entities.passthrough() : entities
  });
}

const INTENT_ALIASES = {
  browse: "product_search",
  search: "product_search",
  shopping: "product_search",
  product: "product_search",
  products: "product_search",
  recommendation: "product_search",
  recommend: "product_search",
  buy: "order_place",
  purchase: "order_place",
  order: "order_place",
  checkout: "order_place",
  track: "order_track",
  tracking: "order_track",
  status: "order_track",
  refund: "return_exchange",
  return: "return_exchange",
  exchange: "return_exchange",
  price: "price_query",
  pricing: "price_query",
  cost: "price_query",
  delivery: "delivery_query",
  shipping: "delivery_query",
  discount: "discount_query",
  sale: "discount_query",
  hello: "greeting",
  hi: "greeting",
  welcome: "greeting",
  size: "size_query",
  color: "color_query",
  menu: "menu_selection",
  faq: "other",
  question: "other"
};

const SENTIMENTS = ["happy", "angry", "frustrated", "interested", "neutral"];
const LANGUAGES = ["en", "ur", "roman_ur"];

function normalizeClassification(result) {
  const rawIntent = String(result.intent || "").toLowerCase().trim().replace(/[\s-]+/g, "_");
  if (INTENTS.includes(rawIntent)) result.intent = rawIntent;
  else result.intent = INTENT_ALIASES[rawIntent] ?? INTENT_ALIASES[rawIntent.split("_")[0]] ?? "other";

  const rawSentiment = String(result.sentiment || "").toLowerCase().trim();
  result.sentiment = SENTIMENTS.includes(rawSentiment) ? rawSentiment : "neutral";

  const rawLanguage = String(result.language || "").toLowerCase().trim().replace("-", "_");
  if (LANGUAGES.includes(rawLanguage)) result.language = rawLanguage;
  else if (rawLanguage.startsWith("urdu") || rawLanguage === "ur_pk") result.language = "ur";
  else if (rawLanguage.includes("roman")) result.language = "roman_ur";
  else result.language = "en";
  return result;
}

const strictSchema = buildSchema({ lenient: false });
const lenientSchema = buildSchema({ lenient: true });

const SYSTEM = `You classify a customer message for FashionHub, a Pakistani online fashion store (dresses, shirts, shoes, handbags, accessories; prices in Rs).
Return intent, sentiment, language and any entities actually mentioned or clearly implied by the conversation.
Rules:
- "kurti", "frock", "maxi", "anarkali" => category dresses. "joggers", "heels", "khussa", "sneakers" => shoes.
- Urdu in Arabic script => language ur. Urdu written with Latin letters ("aap ke pass ... hai?") => roman_ur. Otherwise en.
- If the message answers a question the assistant just asked (e.g. a size, a color, a quantity, a city), extract that entity and keep intent order_place if an order is in progress.
- Mentioning Eid/wedding/party implies style. "under Rs 3000" => maxPrice 3000.
- A late/damaged/wrong parcel complaint => intent complaint. Asking about returns/exchange => return_exchange.
- Availability questions ("do you have XL?", "is it in red?") are size_query/color_query — NOT order_place. Use order_place only when the customer clearly wants to buy ("I want to order this", "book it").
- Do NOT invent entities that are not in the message or context.
Respond with a single JSON object: {"intent": string, "sentiment": string, "language": string, "entities": {only the fields that apply}}.`;

const CATEGORY_HINTS = [
  [/(dress|maxi|frock|kurti|anarkali|gown|abaya|lehenga|saree)/i, "dresses"],
  [/(shoe|sneaker|heel|jogger|loafer|chappal|khussa|sandal|boot)/i, "shoes"],
  [/(shirt|tee|t-shirt|polo|kameez|kurta(?! set)|hoodie|sweater)/i, "shirts"],
  [/(handbag|bag|clutch|tote|purse|wallet)/i, "handbags"],
  [/(sunglass|belt|watch|scarf|cap|jewel|earring|accessor)/i, "accessories"]
];
const COLOR_WORDS = /(black|white|red|blue|green|beige|brown|pink|purple|yellow|orange|grey|gray|maroon|navy|golden|gold|silver|olive|cream)/gi;

const ENUMS = {
  category: ["dresses", "shirts", "shoes", "handbags", "accessories"],
  gender: ["men", "women", "unisex"],
  season: ["summer", "winter"],
  style: ["formal", "casual", "party", "eid"]
};

function augmentEntities(message, entities = {}) {
  const e = { ...entities };
  // LLM schema is all-strings for provider compatibility; enforce real types here
  for (const key of Object.keys(e)) {
    if (e[key] === null || e[key] === "") delete e[key];
  }
  // providers sometimes emit singular keys despite the schema
  if (e.size && !e.sizes) e.sizes = [String(e.size)];
  if (e.color && !e.colors) e.colors = [String(e.color)];
  delete e.size;
  delete e.color;
  delete e.name;
  for (const [key, allowed] of Object.entries(ENUMS)) {
    if (e[key] !== undefined) {
      const v = String(e[key]).toLowerCase().trim();
      if (allowed.includes(v)) e[key] = v;
      else delete e[key];
    }
  }
  for (const key of ["maxPrice", "minPrice", "quantity"]) {
    if (e[key] !== undefined) {
      const n = parseInt(String(e[key]).replace(/[^\d]/g, ""), 10);
      if (Number.isNaN(n) || n === 0) delete e[key];
      else e[key] = n;
    }
  }
  for (const key of ["city", "orderId", "productRef"]) {
    if (e[key] !== undefined && !String(e[key]).trim()) delete e[key];
  }
  for (const key of ["colors", "sizes"]) {
    if (e[key]) {
      e[key] = e[key].filter((v) => String(v).trim());
      if (!e[key].length) delete e[key];
    }
  }
  if (!e.category) {
    for (const [re, cat] of CATEGORY_HINTS) {
      if (re.test(message)) {
        e.category = cat;
        break;
      }
    }
  }
  if (!e.colors?.length) {
    const found = message.match(COLOR_WORDS);
    if (found) e.colors = [...new Set(found.map((c) => c.toLowerCase().replace("gray", "grey")))];
  }
  if (e.maxPrice === undefined) {
    const m = message.match(/(?:under|below|less than|max|se kam|tak)\s*(?:rs\.?|rupees)?\s*([\d,]{3,6})/i);
    if (m) e.maxPrice = parseInt(m[1].replace(/,/g, ""), 10);
  }
  return e;
}

export async function understand({ message, historyLines = [], orderInProgress = false }) {
  const context = historyLines.length
    ? `Recent conversation (oldest first):\n${historyLines.join("\n")}\n\n`
    : "";
  const orderNote = orderInProgress ? "NOTE: an order is currently being placed in this conversation.\n" : "";
  const prompt = `${context}${orderNote}Customer message: "${message}"`;

  const result = await invokeWithFallback(
    (model) => {
      const isGroq = model.constructor.name === "ChatGroq";
      const structured = isGroq
        ? model.withStructuredOutput(lenientSchema, { name: "classify_message", method: "jsonMode" })
        : model.withStructuredOutput(strictSchema, { name: "classify_message" });
      return structured.invoke([
        ["system", SYSTEM],
        ["human", prompt]
      ]);
    },
    { temperature: 0 }
  );
  normalizeClassification(result);
  result.entities = augmentEntities(message, result.entities);
  return result;
}

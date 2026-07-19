const GRAPH = "https://graph.facebook.com";
const VERSION = process.env.META_GRAPH_VERSION || "v25.0";

function api(path) {
  return `${GRAPH}/${VERSION}/${path}`;
}

async function waPost(body) {
  const res = await fetch(api(`${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const text = await res.text();
    console.error(`[whatsapp] send failed (${res.status}):`, text);
    return null;
  }
  return res.json();
}

export function parseWebhook(entry) {
  const out = [];
  for (const change of entry.changes || []) {
    if (change.field !== "messages") continue;
    for (const msg of change.value?.messages || []) {
      const base = { senderId: msg.from, messageId: msg.id };
      if (msg.type === "text") {
        out.push({ ...base, type: "text", text: msg.text?.body || "" });
      } else if (msg.type === "audio") {
        out.push({ ...base, type: "audio", mediaId: msg.audio?.id, mimeType: msg.audio?.mime_type });
      } else if (msg.type === "interactive") {
        const reply = msg.interactive?.list_reply || msg.interactive?.button_reply;
        out.push({ ...base, type: "interactive", text: reply?.title || reply?.id || "" });
      } else if (msg.type === "button") {
        out.push({ ...base, type: "interactive", text: msg.button?.text || "" });
      } else {
        out.push({ ...base, type: "unsupported" });
      }
    }
  }
  return out;
}

export async function sendText(to, text) {
  if (!text) return;
  return waPost({
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "text",
    text: { preview_url: false, body: text.slice(0, 4096) }
  });
}

export async function sendMenu(to, bodyText, options) {
  const rows = options.slice(0, 10).map((title, i) => ({
    id: `menu_${i + 1}`,
    title: title.slice(0, 24)
  }));
  return waPost({
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "interactive",
    interactive: {
      type: "list",
      body: { text: (bodyText || "How can I help you today?").slice(0, 1024) },
      action: {
        button: "View options",
        sections: [{ title: "FashionHub Menu", rows }]
      }
    }
  });
}

function productCaption(p) {
  const price =
    p.discount > 0
      ? `Rs ${Math.round(p.price * (1 - p.discount / 100)).toLocaleString()} (was Rs ${p.price.toLocaleString()}, -${p.discount}%)`
      : `Rs ${p.price.toLocaleString()}`;
  return `${p.name}\n${price}`;
}

export async function sendProducts(to, products) {
  const withImage = products.filter((p) => p.image).slice(0, 4);
  if (!withImage.length) {
    const digest = products
      .slice(0, 4)
      .map((p, i) => `${i + 1}. ${productCaption(p).replace("\n", " — ")}`)
      .join("\n");
    if (digest) await sendText(to, digest);
    return;
  }
  for (const p of withImage) {
    const ok = await waPost({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "image",
      image: { link: p.image, caption: productCaption(p) }
    });
    if (!ok) await sendText(to, productCaption(p));
  }
}

export async function sendOrderConfirmation(to, order) {
  return sendText(
    to,
    `Order confirmed! ✅\nOrder ID: ${order.orderId}\nTotal: Rs ${order.total.toLocaleString()} (Cash on Delivery)\nYou can track it anytime by sending "track ${order.orderId}".`
  );
}

export async function markRead(messageId) {
  return waPost({ messaging_product: "whatsapp", status: "read", message_id: messageId });
}

export async function downloadMedia(mediaId) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const meta = await fetch(api(mediaId), { headers: { Authorization: `Bearer ${token}` } });
  if (!meta.ok) {
    console.error(`[whatsapp] media lookup failed (${meta.status}):`, await meta.text());
    return null;
  }
  const { url, mime_type: mimeType } = await meta.json();
  const bin = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!bin.ok) {
    console.error(`[whatsapp] media download failed (${bin.status})`);
    return null;
  }
  return { buffer: Buffer.from(await bin.arrayBuffer()), mimeType: mimeType || "audio/ogg" };
}

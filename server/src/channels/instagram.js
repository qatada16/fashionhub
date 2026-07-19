const IG_GRAPH = "https://graph.instagram.com";
const VERSION = process.env.META_GRAPH_VERSION || "v25.0";

async function igPost(body) {
  const res = await fetch(`${IG_GRAPH}/${VERSION}/me/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.INSTAGRAM_ACCESS_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const text = await res.text();
    console.error(`[instagram] send failed (${res.status}):`, text);
    return null;
  }
  return res.json();
}

export function parseWebhook(entry) {
  const out = [];
  for (const event of entry.messaging || []) {
    const msg = event.message;
    if (!msg || msg.is_echo) continue;
    if (String(event.sender?.id) === String(process.env.INSTAGRAM_ACCOUNT_ID)) continue;
    const base = { senderId: String(event.sender.id), messageId: msg.mid };
    const audio = (msg.attachments || []).find((a) => a.type === "audio");
    if (msg.text) out.push({ ...base, type: "text", text: msg.text });
    else if (audio) out.push({ ...base, type: "audio", mediaUrl: audio.payload?.url });
    else out.push({ ...base, type: "unsupported" });
  }
  return out;
}

export async function sendText(to, text, quickReplies = []) {
  if (!text) return;
  let body = text;
  if (quickReplies.length) {
    body += "\n\n" + quickReplies.map((q, i) => `${i + 1}. ${q}`).join("\n");
  }
  return igPost({ recipient: { id: to }, message: { text: body.slice(0, 1000) } });
}

function productLine(p, i) {
  const price =
    p.discount > 0
      ? `Rs ${Math.round(p.price * (1 - p.discount / 100)).toLocaleString()} (-${p.discount}%)`
      : `Rs ${p.price.toLocaleString()}`;
  return `${i + 1}. ${p.name} — ${price}`;
}

export async function sendProducts(to, products) {
  const top = products.slice(0, 4);
  for (const [i, p] of top.entries()) {
    if (p.image) {
      const ok = await igPost({
        recipient: { id: to },
        message: { attachment: { type: "image", payload: { url: p.image } } }
      });
      if (ok) {
        await igPost({ recipient: { id: to }, message: { text: productLine(p, i) } });
        continue;
      }
    }
    await igPost({ recipient: { id: to }, message: { text: productLine(p, i) } });
  }
}

export async function sendOrderConfirmation(to, order) {
  return sendText(
    to,
    `Order confirmed! ✅\nOrder ID: ${order.orderId}\nTotal: Rs ${order.total.toLocaleString()} (Cash on Delivery)`
  );
}

export async function downloadMedia(mediaUrl) {
  if (!mediaUrl) return null;
  const res = await fetch(mediaUrl);
  if (!res.ok) {
    console.error(`[instagram] media download failed (${res.status})`);
    return null;
  }
  const mimeType = res.headers.get("content-type") || "audio/mp4";
  return { buffer: Buffer.from(await res.arrayBuffer()), mimeType };
}

import "dotenv/config";

const VERSION = process.env.META_GRAPH_VERSION || "v25.0";

async function check(label, url, token, fields) {
  try {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (!res.ok) {
      console.log(`FAIL  ${label}: ${data.error?.message || `HTTP ${res.status}`}`);
      return false;
    }
    const summary = fields.map((f) => `${f}=${data[f]}`).join(", ");
    console.log(`PASS  ${label}: ${summary}`);
    return true;
  } catch (err) {
    console.log(`FAIL  ${label}: ${err.message}`);
    return false;
  }
}

const { WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_ACCESS_TOKEN, INSTAGRAM_ACCESS_TOKEN } = process.env;

if (!WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_ACCESS_TOKEN) {
  console.log("SKIP  WhatsApp: WHATSAPP_PHONE_NUMBER_ID / WHATSAPP_ACCESS_TOKEN not set");
} else {
  await check(
    "WhatsApp",
    `https://graph.facebook.com/${VERSION}/${WHATSAPP_PHONE_NUMBER_ID}?fields=display_phone_number,verified_name`,
    WHATSAPP_ACCESS_TOKEN,
    ["display_phone_number", "verified_name"]
  );
}

if (!INSTAGRAM_ACCESS_TOKEN) {
  console.log("SKIP  Instagram: INSTAGRAM_ACCESS_TOKEN not set");
} else {
  await check(
    "Instagram",
    `https://graph.instagram.com/${VERSION}/me?fields=user_id,username`,
    INSTAGRAM_ACCESS_TOKEN,
    ["user_id", "username"]
  );
}

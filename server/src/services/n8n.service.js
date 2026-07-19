export async function notifyN8n(event, payload) {
  const base = process.env.N8N_WEBHOOK_BASE_URL;
  if (!base) {
    console.debug(`[n8n] skipped "${event}" (N8N_WEBHOOK_BASE_URL not set)`);
    return;
  }
  try {
    const res = await fetch(`${base.replace(/\/$/, "")}/webhook/${event}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) console.error(`[n8n] "${event}" webhook returned ${res.status}`);
  } catch (err) {
    console.error(`[n8n] "${event}" webhook failed:`, err.message);
  }
}

import { Router } from "express";
import crypto from "node:crypto";
import * as whatsapp from "../channels/whatsapp.js";
import * as instagram from "../channels/instagram.js";
import { dispatch } from "../channels/dispatcher.js";

const router = Router();

const SEEN_MAX = 500;
const seen = new Map();

function alreadyProcessed(id) {
  if (!id) return false;
  if (seen.has(id)) return true;
  seen.set(id, Date.now());
  if (seen.size > SEEN_MAX) seen.delete(seen.keys().next().value);
  return false;
}

function validSignature(req) {
  const signature = req.get("x-hub-signature-256");
  if (!signature || !req.rawBody) return false;
  const expected =
    "sha256=" +
    crypto.createHmac("sha256", process.env.META_APP_SECRET).update(req.rawBody).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

router.get("/meta", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  if (mode === "subscribe" && token === process.env.META_VERIFY_TOKEN) {
    return res.status(200).send(req.query["hub.challenge"]);
  }
  res.sendStatus(403);
});

router.post("/meta", (req, res) => {
  if (!validSignature(req)) return res.sendStatus(401);
  res.status(200).send("EVENT_RECEIVED");

  const body = req.body;
  setImmediate(async () => {
    try {
      const channel =
        body.object === "whatsapp_business_account"
          ? "whatsapp"
          : body.object === "instagram"
            ? "instagram"
            : null;
      if (!channel) return;
      const adapter = channel === "whatsapp" ? whatsapp : instagram;
      for (const entry of body.entry || []) {
        for (const inbound of adapter.parseWebhook(entry)) {
          if (alreadyProcessed(inbound.messageId)) {
            console.log(`[webhook] duplicate ${inbound.messageId} skipped`);
            continue;
          }
          await dispatch(channel, inbound);
        }
      }
    } catch (err) {
      console.error("[webhook] async processing failed:", err.message);
    }
  });
});

export default router;

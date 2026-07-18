import Setting from "../models/Setting.js";
import { HttpError } from "../middleware/error.js";
import { validateSettingValue } from "../validation/admin.schema.js";

const KEYS = ["policies", "delivery", "persona", "faq"];

// Phase 1 seed used older key names; normalize so the admin UI always sees one shape.
function normalize(key, value) {
  if (!value) return value;
  if (key === "policies" && value.returns && !value.returnPolicy) {
    return {
      returnPolicy: value.returns,
      exchangePolicy: value.exchange,
      refundProcess: value.refund
    };
  }
  if (key === "persona" && value.extraInstructions === undefined) {
    return { ...value, extraInstructions: "" };
  }
  return value;
}

export async function getSettings() {
  const docs = await Setting.find({ key: { $in: KEYS } });
  const map = Object.fromEntries(docs.map((d) => [d.key, d.value]));
  const result = {};
  for (const key of KEYS) result[key] = normalize(key, map[key]) ?? null;
  return result;
}

export async function updateSetting(key, value) {
  const parsed = validateSettingValue(key, value);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((i) => `${i.path.join(".") || "value"}: ${i.message}`)
      .join("; ");
    throw new HttpError(400, `Invalid ${key} value — ${details}`);
  }

  const doc = await Setting.findOneAndUpdate(
    { key },
    { value: parsed.data },
    { new: true, upsert: true }
  );
  return { key: doc.key, value: doc.value };
}

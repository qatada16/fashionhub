import { z } from "zod";

const idParams = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "invalid id")
});

const pageQuery = {
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
};

const orderStatuses = [
  "pending",
  "confirmed",
  "packed",
  "shipped",
  "delivered",
  "cancelled",
  "returned"
];
const paymentStatuses = ["unpaid", "cod", "paid", "refunded"];
const channels = ["whatsapp", "instagram", "web"];

export const idSchema = { params: idParams };

export const ordersListSchema = {
  query: z.object({
    ...pageQuery,
    status: z.enum(orderStatuses).optional(),
    paymentStatus: z.enum(paymentStatuses).optional(),
    channel: z.enum(channels).optional(),
    search: z.string().trim().min(1).max(100).optional()
  })
};

export const orderPatchSchema = {
  params: idParams,
  body: z
    .object({
      status: z.enum(orderStatuses).optional(),
      paymentStatus: z.enum(paymentStatuses).optional(),
      trackingNumber: z.string().trim().max(60).optional()
    })
    .refine((b) => Object.keys(b).length > 0, { message: "empty update" })
};

export const customersListSchema = {
  query: z.object({
    ...pageQuery,
    search: z.string().trim().min(1).max(100).optional()
  })
};

export const conversationsListSchema = {
  query: z.object({
    ...pageQuery,
    channel: z.enum(channels).optional(),
    isOpen: z
      .enum(["true", "false"])
      .transform((v) => v === "true")
      .optional()
  })
};

export const conversationPatchSchema = {
  params: idParams,
  body: z.object({ isOpen: z.boolean() })
};

export const exportSchema = {
  params: z.object({ type: z.enum(["orders", "customers", "products"]) })
};

const settingValueSchemas = {
  policies: z.object({
    returnPolicy: z.string().min(1),
    exchangePolicy: z.string().min(1),
    refundProcess: z.string().min(1)
  }),
  delivery: z.object({
    defaultCharges: z.number().min(0),
    freeAbove: z.number().min(0),
    cities: z.array(
      z.object({
        name: z.string().min(1),
        days: z.number().int().min(0),
        charges: z.number().min(0),
        sameDay: z.boolean()
      })
    ),
    note: z.string().optional()
  }),
  persona: z.object({
    brandVoice: z.string().min(1),
    extraInstructions: z.string().default(""),
    greeting: z.string().optional()
  }),
  faq: z.array(z.object({ q: z.string().min(1), a: z.string().min(1) }))
};

export const settingsPutSchema = {
  params: z.object({ key: z.enum(["policies", "delivery", "persona", "faq"]) }),
  body: z.object({
    value: z.union([z.record(z.any()), z.array(z.any())])
  })
};

export function validateSettingValue(key, value) {
  return settingValueSchemas[key].safeParse(value);
}

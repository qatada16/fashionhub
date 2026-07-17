import { z } from "zod";

const categories = ["dresses", "shirts", "shoes", "handbags", "accessories"];
const genders = ["men", "women", "unisex"];
const seasons = ["summer", "winter", "all"];
const styles = ["formal", "casual", "party", "eid"];

const stockItem = z.object({
  size: z.string().min(1),
  color: z.string().min(1),
  qty: z.number().int().min(0)
});

const productBody = z.object({
  name: z.string().min(2),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "must be url-safe (kebab-case)")
    .optional(),
  category: z.enum(categories),
  gender: z.enum(genders),
  season: z.enum(seasons).default("all"),
  style: z.enum(styles).default("casual"),
  price: z.number().min(0),
  discount: z.number().min(0).max(100).default(0),
  description: z.string().default(""),
  sizes: z.array(z.string()).default([]),
  colors: z.array(z.string()).default([]),
  stock: z.array(stockItem).default([]),
  images: z.array(z.string().url()).default([]),
  rating: z.number().min(0).max(5).default(0),
  soldCount: z.number().int().min(0).default(0),
  isTrending: z.boolean().default(false),
  isActive: z.boolean().default(true)
});

const idParams = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "invalid id")
});

const listQuery = z.object({
  search: z.string().optional(),
  category: z.enum(categories).optional(),
  gender: z.enum(genders).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z
    .enum(["newest", "oldest", "price-asc", "price-desc", "best-selling", "rating"])
    .default("newest")
});

export const createProductSchema = { body: productBody };
export const updateProductSchema = { params: idParams, body: productBody.partial() };
export const productIdSchema = { params: idParams };
export const adminListSchema = { query: listQuery };

export const publicListSchema = {
  query: listQuery.extend({
    season: z.enum(seasons).optional(),
    style: z.enum(styles).optional(),
    color: z.string().optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    trending: z.coerce.boolean().optional()
  })
};

export const slugParamsSchema = {
  params: z.object({ slug: z.string().min(1) })
};

import { Router } from "express";
import * as controller from "../controllers/products.controller.js";
import { validate } from "../middleware/validate.js";
import { publicListSchema, slugParamsSchema } from "../validation/product.schema.js";

const router = Router();

router.get("/", validate(publicListSchema), controller.list);
router.get("/:slug", validate(slugParamsSchema), controller.getBySlug);

export default router;

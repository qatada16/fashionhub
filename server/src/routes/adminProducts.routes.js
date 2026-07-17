import { Router } from "express";
import * as controller from "../controllers/adminProducts.controller.js";
import { validate } from "../middleware/validate.js";
import {
  adminListSchema,
  createProductSchema,
  updateProductSchema,
  productIdSchema
} from "../validation/product.schema.js";

const router = Router();

router.get("/", validate(adminListSchema), controller.list);
router.post("/", validate(createProductSchema), controller.create);
router.get("/:id", validate(productIdSchema), controller.getOne);
router.put("/:id", validate(updateProductSchema), controller.update);
router.delete("/:id", validate(productIdSchema), controller.remove);

export default router;

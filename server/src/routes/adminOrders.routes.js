import { Router } from "express";
import * as controller from "../controllers/adminOrders.controller.js";
import { validate } from "../middleware/validate.js";
import { ordersListSchema, orderPatchSchema, idSchema } from "../validation/admin.schema.js";

const router = Router();

router.get("/", validate(ordersListSchema), controller.list);
router.get("/:id", validate(idSchema), controller.getOne);
router.patch("/:id", validate(orderPatchSchema), controller.update);

export default router;

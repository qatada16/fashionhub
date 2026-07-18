import { Router } from "express";
import * as controller from "../controllers/adminCustomers.controller.js";
import { validate } from "../middleware/validate.js";
import { customersListSchema, idSchema } from "../validation/admin.schema.js";

const router = Router();

router.get("/", validate(customersListSchema), controller.list);
router.get("/:id", validate(idSchema), controller.getOne);

export default router;

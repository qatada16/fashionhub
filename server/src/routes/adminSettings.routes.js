import { Router } from "express";
import * as controller from "../controllers/adminSettings.controller.js";
import { validate } from "../middleware/validate.js";
import { settingsPutSchema } from "../validation/admin.schema.js";

const router = Router();

router.get("/", controller.getAll);
router.put("/:key", validate(settingsPutSchema), controller.put);

export default router;

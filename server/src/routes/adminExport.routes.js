import { Router } from "express";
import * as controller from "../controllers/adminExport.controller.js";
import { validate } from "../middleware/validate.js";
import { exportSchema } from "../validation/admin.schema.js";

const router = Router();

router.get("/:type", validate(exportSchema), controller.download);

export default router;

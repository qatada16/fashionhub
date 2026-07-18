import { Router } from "express";
import * as controller from "../controllers/adminConversations.controller.js";
import { validate } from "../middleware/validate.js";
import {
  conversationsListSchema,
  conversationPatchSchema,
  idSchema
} from "../validation/admin.schema.js";

const router = Router();

router.get("/", validate(conversationsListSchema), controller.list);
router.get("/:id", validate(idSchema), controller.getOne);
router.patch("/:id", validate(conversationPatchSchema), controller.update);

export default router;

import { Router } from "express";
import authRoutes from "./auth.routes.js";
import productsRoutes from "./products.routes.js";
import adminProductsRoutes from "./adminProducts.routes.js";
import adminOrdersRoutes from "./adminOrders.routes.js";
import adminCustomersRoutes from "./adminCustomers.routes.js";
import adminConversationsRoutes from "./adminConversations.routes.js";
import adminSettingsRoutes from "./adminSettings.routes.js";
import adminUploadsRoutes from "./adminUploads.routes.js";
import adminExportRoutes from "./adminExport.routes.js";
import { stats } from "../controllers/adminStats.controller.js";
import chatRoutes from "./chat.routes.js";
import webhooksRoutes from "./webhooks.routes.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

router.use("/auth", authRoutes);
router.use("/products", productsRoutes);
router.use("/chat", chatRoutes);
router.use("/webhooks", webhooksRoutes);

router.use("/admin", requireAuth);
router.get("/admin/stats", stats);
router.use("/admin/products", adminProductsRoutes);
router.use("/admin/orders", adminOrdersRoutes);
router.use("/admin/customers", adminCustomersRoutes);
router.use("/admin/conversations", adminConversationsRoutes);
router.use("/admin/settings", adminSettingsRoutes);
router.use("/admin/uploads", adminUploadsRoutes);
router.use("/admin/export", adminExportRoutes);

export default router;

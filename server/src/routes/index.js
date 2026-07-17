import { Router } from "express";
import authRoutes from "./auth.routes.js";
import productsRoutes from "./products.routes.js";
import adminProductsRoutes from "./adminProducts.routes.js";
import chatRoutes from "./chat.routes.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

router.use("/auth", authRoutes);
router.use("/products", productsRoutes);
router.use("/chat", chatRoutes);

router.use("/admin", requireAuth);
router.use("/admin/products", adminProductsRoutes);

export default router;

import { Router } from "express";
import multer from "multer";
import * as controller from "../controllers/adminUploads.controller.js";
import { HttpError } from "../middleware/error.js";

const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    if (!ALLOWED.includes(file.mimetype)) {
      return cb(new HttpError(400, "Only jpeg, png or webp images are allowed"));
    }
    cb(null, true);
  }
});

const router = Router();

router.post("/", upload.single("image"), controller.upload);

export default router;

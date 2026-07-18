import { uploadImage } from "../services/upload.service.js";
import { HttpError } from "../middleware/error.js";

export async function upload(req, res, next) {
  try {
    if (!req.file) throw new HttpError(400, "No image file provided (field name: image)");
    res.status(201).json(await uploadImage(req.file.buffer));
  } catch (err) {
    next(err);
  }
}

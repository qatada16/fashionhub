import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import { HttpError } from "../middleware/error.js";

export async function login(email, password) {
  const admin = await Admin.findOne({ email: email.toLowerCase() });
  if (!admin) throw new HttpError(401, "Invalid credentials");

  const ok = await bcrypt.compare(password, admin.passwordHash);
  if (!ok) throw new HttpError(401, "Invalid credentials");

  const token = jwt.sign({ sub: admin._id.toString(), role: admin.role }, process.env.JWT_SECRET, {
    expiresIn: "7d"
  });

  return {
    token,
    admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role }
  };
}

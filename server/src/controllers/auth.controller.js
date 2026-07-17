import * as authService from "../services/auth.service.js";

export async function login(req, res, next) {
  try {
    const result = await authService.login(req.body.email, req.body.password);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export function me(req, res) {
  const { _id, name, email, role } = req.admin;
  res.json({ admin: { id: _id, name, email, role } });
}

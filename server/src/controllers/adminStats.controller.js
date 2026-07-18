import { getStats } from "../services/stats.service.js";

export async function stats(req, res, next) {
  try {
    res.json(await getStats());
  } catch (err) {
    next(err);
  }
}

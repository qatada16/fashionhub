import { exportCsv } from "../services/export.service.js";

export async function download(req, res, next) {
  try {
    const { type } = req.params;
    const csv = await exportCsv(type);
    const date = new Date().toISOString().slice(0, 10);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="fashionhub-${type}-${date}.csv"`
    );
    res.send(csv);
  } catch (err) {
    next(err);
  }
}

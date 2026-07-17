export function notFound(req, res) {
  res.status(404).json({ error: "Not found" });
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  if (err.name === "CastError") {
    return res.status(400).json({ error: "Invalid id" });
  }
  if (err.code === 11000) {
    return res.status(409).json({ error: "Duplicate value", fields: Object.keys(err.keyValue || {}) });
  }

  const status = err.status || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ error: err.message || "Internal server error" });
}

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function validate(schemas) {
  return (req, res, next) => {
    for (const key of ["params", "query", "body"]) {
      if (!schemas[key]) continue;
      const result = schemas[key].safeParse(req[key]);
      if (!result.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: result.error.issues.map((i) => ({
            path: `${key}.${i.path.join(".")}`,
            message: i.message
          }))
        });
      }
      if (key === "query") req.validatedQuery = result.data;
      else req[key] = result.data;
    }
    next();
  };
}

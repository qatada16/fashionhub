import * as productService from "../services/product.service.js";

export async function list(req, res, next) {
  try {
    res.json(await productService.listProducts(req.validatedQuery, { publicOnly: true }));
  } catch (err) {
    next(err);
  }
}

export async function getBySlug(req, res, next) {
  try {
    res.json(await productService.getProductBySlug(req.params.slug));
  } catch (err) {
    next(err);
  }
}

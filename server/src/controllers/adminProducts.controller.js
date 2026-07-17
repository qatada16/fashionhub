import * as productService from "../services/product.service.js";

export async function list(req, res, next) {
  try {
    res.json(await productService.listProducts(req.validatedQuery));
  } catch (err) {
    next(err);
  }
}

export async function getOne(req, res, next) {
  try {
    res.json(await productService.getProductById(req.params.id));
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    res.status(201).json(await productService.createProduct(req.body));
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    res.json(await productService.updateProduct(req.params.id, req.body));
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    await productService.deleteProduct(req.params.id);
    res.json({ deleted: true });
  } catch (err) {
    next(err);
  }
}

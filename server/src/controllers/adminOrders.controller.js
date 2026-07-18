import * as orderService from "../services/order.service.js";

export async function list(req, res, next) {
  try {
    res.json(await orderService.listOrders(req.validatedQuery));
  } catch (err) {
    next(err);
  }
}

export async function getOne(req, res, next) {
  try {
    res.json(await orderService.getOrder(req.params.id));
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    res.json(await orderService.updateOrder(req.params.id, req.body));
  } catch (err) {
    next(err);
  }
}

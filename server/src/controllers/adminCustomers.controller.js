import * as customerService from "../services/customer.service.js";

export async function list(req, res, next) {
  try {
    res.json(await customerService.listCustomers(req.validatedQuery));
  } catch (err) {
    next(err);
  }
}

export async function getOne(req, res, next) {
  try {
    res.json(await customerService.getCustomer(req.params.id));
  } catch (err) {
    next(err);
  }
}

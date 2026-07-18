import * as settingsService from "../services/settings.service.js";

export async function getAll(req, res, next) {
  try {
    res.json(await settingsService.getSettings());
  } catch (err) {
    next(err);
  }
}

export async function put(req, res, next) {
  try {
    res.json(await settingsService.updateSetting(req.params.key, req.body.value));
  } catch (err) {
    next(err);
  }
}

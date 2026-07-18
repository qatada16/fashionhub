import * as conversationService from "../services/conversation.service.js";

export async function list(req, res, next) {
  try {
    res.json(await conversationService.listConversations(req.validatedQuery));
  } catch (err) {
    next(err);
  }
}

export async function getOne(req, res, next) {
  try {
    res.json(await conversationService.getConversation(req.params.id));
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    res.json(await conversationService.updateConversation(req.params.id, req.body));
  } catch (err) {
    next(err);
  }
}

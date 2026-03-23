const groupService = require('../services/groupService');
const AppError = require('../utils/errors');

const handle = (fn) => async (req, res) => {
  try {
    return await fn(req, res);
  } catch (err) {
    if (err instanceof AppError) return res.status(err.statusCode).json({ error: err.message });
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const createGroup = handle(async (req, res) => {
  const { name, description, visibility, tasks } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  const group = await groupService.createGroup(req.user.id, { name, description, visibility, tasks });
  return res.status(201).json(group);
});

const searchGroups = handle(async (req, res) => {
  const { q = '', page = 1, limit = 20 } = req.query;
  const result = await groupService.searchGroups({ query: q, page: parseInt(page), limit: parseInt(limit) });
  return res.status(200).json(result);
});

const getGroup = handle(async (req, res) => {
  const group = await groupService.getGroupById(parseInt(req.params.id), req.user.id);
  return res.status(200).json(group);
});

const joinGroup = handle(async (req, res) => {
  const { invite_token } = req.body;
  if (!invite_token) return res.status(400).json({ error: 'invite_token is required' });
  const result = await groupService.joinGroup(parseInt(req.params.id), req.user.id, invite_token);
  return res.status(200).json(result);
});

const generateInvite = handle(async (req, res) => {
  const result = await groupService.generateInvite(parseInt(req.params.id), req.user.id);
  return res.status(200).json(result);
});

module.exports = { createGroup, searchGroups, getGroup, joinGroup, generateInvite };

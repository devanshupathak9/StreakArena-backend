const taskService = require('../services/taskService');
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

const getTodaysTasks = handle(async (req, res) => {
  const result = await taskService.getTodaysTasks(req.user.id);
  return res.status(200).json(result);
});

const createTask = handle(async (req, res) => {
  const { group_id, name, type, config, is_required } = req.body;
  if (!group_id || !name) return res.status(400).json({ error: 'group_id and name are required' });
  const task = await taskService.createTask(req.user.id, { group_id, name, type, config, is_required });
  return res.status(201).json(task);
});

const deleteTask = handle(async (req, res) => {
  const result = await taskService.deleteTask(parseInt(req.params.id), req.user.id);
  return res.status(200).json(result);
});

const completeTask = handle(async (req, res) => {
  const result = await taskService.completeTask(parseInt(req.params.id), req.user.id);
  return res.status(200).json(result);
});

module.exports = { getTodaysTasks, createTask, deleteTask, completeTask };

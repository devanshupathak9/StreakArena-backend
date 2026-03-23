const userService = require('../services/userService');
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

const getMe = handle(async (req, res) => {
  const user = await userService.getProfile(req.user.id);
  return res.status(200).json(user);
});

const getDashboard = handle(async (req, res) => {
  const dashboard = await userService.getDashboard(req.user.id);
  return res.status(200).json(dashboard);
});

module.exports = { getMe, getDashboard };

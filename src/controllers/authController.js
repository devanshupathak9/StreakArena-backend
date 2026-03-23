const authService = require('../services/authService');
const AppError = require('../utils/errors');

const handle = (fn) => async (req, res) => {
  try {
    const result = await fn(req, res);
    return result;
  } catch (err) {
    if (err instanceof AppError) return res.status(err.statusCode).json({ error: err.message });
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const register = handle(async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) return res.status(400).json({ error: 'username, email, and password are required' });
  const user = await authService.register({ username, email, password });
  return res.status(201).json(user);
});

const login = handle(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password are required' });
  const token = await authService.login({ email, password });
  return res.status(200).json(token);
});

const logout = handle(async (req, res) => {
  return res.status(200).json({ message: 'Logged out successfully' });
});

const requestPasswordReset = handle(async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'email is required' });
  const result = await authService.requestPasswordReset(email);
  return res.status(200).json(result);
});

const resetPassword = handle(async (req, res) => {
  const { token } = req.params;
  const { new_password } = req.body;
  if (!new_password) return res.status(400).json({ error: 'new_password is required' });
  const result = await authService.resetPassword(token, new_password);
  return res.status(200).json(result);
});

module.exports = { register, login, logout, requestPasswordReset, resetPassword };

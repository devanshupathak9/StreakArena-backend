const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { User } = require('../models');
const { sign } = require('../utils/jwt');
const AppError = require('../utils/errors');

const SALT_ROUNDS = 12;
const JWT_EXPIRATION = parseInt(process.env.JWT_EXPIRATION || '604800');

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\d\W]).{8,}$/;

async function register({ username, email, password }) {
  if (!passwordRegex.test(password)) {
    throw new AppError('Password must be 8+ chars with uppercase, lowercase, and a number or special character', 422);
  }
  const existing = await User.findOne({ where: { email } });
  if (existing) throw new AppError('Email already in use', 409);
  const existingUsername = await User.findOne({ where: { username } });
  if (existingUsername) throw new AppError('Username already taken', 409);

  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({ username, email, password_hash });
  return { id: user.id, username: user.username, email: user.email, created_at: user.created_at };
}

async function login({ email, password }) {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new AppError('Invalid credentials', 401);

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw new AppError('Invalid credentials', 401);

  const access_token = sign(user.id);
  return { access_token, token_type: 'Bearer', expires_in: JWT_EXPIRATION };
}

async function requestPasswordReset(email) {
  const user = await User.findOne({ where: { email } });
  // Don't reveal whether email exists
  if (!user) return { message: 'If that email exists, a reset token has been sent' };

  const rawToken = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 30 * 60 * 1000); // 30 min

  await user.update({
    reset_token: hashToken(rawToken),
    reset_token_expires: expires,
  });

  // In production: send email. For now, return token directly.
  return {
    message: 'Password reset token generated',
    reset_token: rawToken, // Dev only — remove when email is set up
  };
}

async function resetPassword(rawToken, newPassword) {
  if (!passwordRegex.test(newPassword)) {
    throw new AppError('Password must be 8+ chars with uppercase, lowercase, and a number or special character', 422);
  }

  const hashed = hashToken(rawToken);
  const user = await User.findOne({ where: { reset_token: hashed } });

  if (!user || !user.reset_token_expires || user.reset_token_expires < new Date()) {
    throw new AppError('Reset token is invalid or expired', 400);
  }

  const password_hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await user.update({ password_hash, reset_token: null, reset_token_expires: null });

  return { message: 'Password reset successfully' };
}

module.exports = { register, login, requestPasswordReset, resetPassword };

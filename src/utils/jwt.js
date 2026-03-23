const jwt = require('jsonwebtoken');

const sign = (userId) =>
  jwt.sign({ sub: userId }, process.env.JWT_SECRET, {
    expiresIn: parseInt(process.env.JWT_EXPIRATION || '604800'),
  });

const verify = (token) => jwt.verify(token, process.env.JWT_SECRET);

module.exports = { sign, verify };

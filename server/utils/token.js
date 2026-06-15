const jwt = require('jsonwebtoken');

const TOKEN_TTL = '7d';

function signAuthToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: TOKEN_TTL });
}

module.exports = { signAuthToken, TOKEN_TTL };

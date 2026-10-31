const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');

const cookieOptions = () => ({
  httpOnly: true, // JavaScript in the page cannot read the token, so XSS cannot steal it
  secure: config.isProd, // only sent over HTTPS in production
  sameSite: 'strict', // never sent on requests started by another site -> blocks CSRF
  maxAge: 24 * 60 * 60 * 1000,
  path: '/',
});

function issueToken(res, user) {
  const token = jwt.sign({ sub: user.id }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
    algorithm: 'HS256',
  });
  res.cookie(config.cookieName, token, cookieOptions());
}

function clearToken(res) {
  const { maxAge, ...opts } = cookieOptions();
  res.clearCookie(config.cookieName, opts);
}

async function requireAuth(req, res, next) {
  const token = req.cookies?.[config.cookieName];
  if (!token) return res.status(401).json({ error: 'Please log in to continue' });
  try {
    const payload = jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'] });
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ error: 'Session is no longer valid' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Session expired, please log in again' });
  }
}

module.exports = { issueToken, clearToken, requireAuth, cookieOptions };

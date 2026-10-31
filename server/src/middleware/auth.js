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

// Returns the logged-in user for this request, or null if the cookie is missing, forged or expired.
async function userFromRequest(req) {
  const token = req.cookies?.[config.cookieName];
  if (!token) return null;
  try {
    const payload = jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'] });
    return await User.findById(payload.sub);
  } catch {
    return null;
  }
}

async function requireAuth(req, res, next) {
  try {
    const user = await userFromRequest(req);
    if (!user) return res.status(401).json({ error: 'Please log in to continue' });
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { issueToken, clearToken, requireAuth, userFromRequest, cookieOptions };

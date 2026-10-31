const config = require('../config');

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

// Defence in depth on top of SameSite=Strict cookies: a state-changing request that a
// browser sends from another website carries that site's Origin header, so reject it.
// Requests without an Origin (curl, server-to-server, tests) carry no browser cookies
// from a victim and are allowed through.
function verifyOrigin(req, res, next) {
  if (SAFE_METHODS.has(req.method)) return next();
  const origin = req.get('origin');
  if (!origin || config.clientOrigins.includes(origin)) return next();
  return res.status(403).json({ error: 'Cross-site request blocked' });
}

module.exports = verifyOrigin;

const config = require('../config');

function notFound(req, res) {
  res.status(404).json({ error: 'Route not found' });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON body' });
  if (err.type === 'entity.too.large') return res.status(413).json({ error: 'Request body too large' });
  if (err.code === 11000) return res.status(409).json({ error: 'Already exists' });
  if (err.name === 'ValidationError' || err.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid data' });
  }
  if (!config.isProd || process.env.LOG_ERRORS) console.error(err);
  // Never leak stack traces or internal messages to the client in production.
  res.status(500).json({ error: config.isProd ? 'Something went wrong' : err.message });
}

module.exports = { notFound, errorHandler };

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const config = require('./config');
const verifyOrigin = require('./middleware/csrf');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.set('trust proxy', config.trustProxy);
app.disable('x-powered-by');

// Security headers: CSP, HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy...
// The API only ever returns JSON, so its CSP allows nothing to load at all.
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: { defaultSrc: ["'none'"], frameAncestors: ["'none'"] },
    },
    crossOriginResourcePolicy: { policy: 'same-site' },
  })
);

// Only the real frontend may call the API from a browser with cookies.
app.use(cors({ origin: config.clientOrigins, credentials: true }));

app.use(compression());
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// Removes keys starting with "$" or containing "." from body/query/params,
// so {"email": {"$ne": null}} cannot become a MongoDB operator.
app.use(mongoSanitize());

app.use(verifyOrigin);

app.get('/api/health', (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json({ status: 'ok' });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events'));
app.use('/api/registrations', require('./routes/registrations'));
app.use('/api/feedback', require('./routes/feedback'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;

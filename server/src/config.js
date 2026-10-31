require('dotenv').config({ quiet: true });

const env = process.env.NODE_ENV || 'development';
const isProd = env === 'production';

const jwtSecret = process.env.JWT_SECRET || (isProd ? '' : 'dev-only-secret-change-me-0123456789abcdef');
if (isProd && jwtSecret.length < 32) {
  throw new Error('JWT_SECRET must be set to at least 32 characters in production');
}

module.exports = {
  env,
  isProd,
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/techfest2026',
  jwtSecret,
  jwtExpiresIn: '1d',
  // Comma-separated list of exact frontend origins allowed to call the API (no trailing slash).
  clientOrigins: (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim().replace(/\/$/, ''))
    .filter(Boolean),
  // Render (and the Netlify proxy) sit in front of the app; trust their X-Forwarded-* headers.
  trustProxy: Number(process.env.TRUST_PROXY ?? (isProd ? 2 : 0)),
  cookieName: 'tf_token',
};

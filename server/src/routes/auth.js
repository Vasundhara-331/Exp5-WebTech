const router = require('express').Router();
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const validate = require('../middleware/validate');
const { issueToken, clearToken, requireAuth } = require('../middleware/auth');

// Slows down password guessing: 20 attempts per 15 minutes per IP.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: process.env.NODE_ENV === 'test' ? 1000 : 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many attempts, please try again in 15 minutes' },
});

// .isString() runs before anything else, so an object such as {"$ne": null} can never
// reach the database query. This is the main NoSQL-injection fix for login.
const emailRule = body('email')
  .isString().withMessage('Email must be text')
  .bail()
  .trim()
  .isEmail().withMessage('Enter a valid email address')
  .normalizeEmail({ gmail_remove_dots: false });

router.post(
  '/register',
  authLimiter,
  [
    body('name').isString().bail().trim().isLength({ min: 2, max: 60 }).withMessage('Name must be 2-60 characters'),
    emailRule,
    body('password')
      .isString().withMessage('Password must be text')
      .bail()
      .isLength({ min: 8, max: 72 }).withMessage('Password must be 8-72 characters')
      .matches(/[A-Za-z]/).withMessage('Password needs at least one letter')
      .matches(/\d/).withMessage('Password needs at least one number'),
    body('college').optional().isString().bail().trim().isLength({ max: 120 }),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { name, email, password, college } = req.body;
      if (await User.exists({ email })) {
        return res.status(409).json({ error: 'An account with this email already exists' });
      }
      const user = await User.create({ name, email, password, college });
      issueToken(res, user);
      res.status(201).json({ user });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/login',
  authLimiter,
  [emailRule, body('password').isString().withMessage('Password must be text').bail().notEmpty()],
  validate,
  async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email }).select('+password');
      // Same message for "no such user" and "wrong password" so attackers cannot probe emails.
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      issueToken(res, user);
      res.json({ user });
    } catch (err) {
      next(err);
    }
  }
);

router.post('/logout', (req, res) => {
  clearToken(res);
  res.json({ ok: true });
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;

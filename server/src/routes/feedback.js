const router = require('express').Router();
const { body } = require('express-validator');
const Feedback = require('../models/Feedback');
const validate = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');

router.get('/', async (req, res, next) => {
  try {
    const feedback = await Feedback.find().sort({ createdAt: -1 }).limit(50);
    res.json({ feedback });
  } catch (err) {
    next(err);
  }
});

router.post(
  '/',
  requireAuth,
  [
    body('message').isString().bail().trim().isLength({ min: 3, max: 500 }).withMessage('Feedback must be 3-500 characters'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1 to 5').toInt(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const item = await Feedback.create({
        user: req.user._id,
        name: req.user.name,
        message: req.body.message,
        rating: req.body.rating,
      });
      res.status(201).json({ feedback: item });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;

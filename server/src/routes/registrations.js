const router = require('express').Router();
const Registration = require('../models/Registration');
const { requireAuth } = require('../middleware/auth');

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const regs = await Registration.find({ user: req.user._id }).populate('event').sort({ createdAt: -1 });
    res.set('Cache-Control', 'private, no-store');
    res.json({ events: regs.filter((r) => r.event).map((r) => r.event) });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

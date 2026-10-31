const router = require('express').Router();
const { param, query } = require('express-validator');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const validate = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');

const idRule = param('id').isMongoId().withMessage('Invalid event id');

router.get(
  '/',
  [query('category').optional().isIn(Event.CATEGORIES).withMessage('Unknown category')],
  validate,
  async (req, res, next) => {
    try {
      const filter = req.query.category ? { category: req.query.category } : {};
      const events = await Event.find(filter).sort({ date: 1 });
      res.set('Cache-Control', 'public, max-age=60');
      res.json({ events });
    } catch (err) {
      next(err);
    }
  }
);

router.get('/:id', [idRule], validate, async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json({ event });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/register', requireAuth, [idRule], validate, async (req, res, next) => {
  try {
    const eventId = req.params.id;
    if (!(await Event.exists({ _id: eventId }))) return res.status(404).json({ error: 'Event not found' });
    if (await Registration.exists({ user: req.user._id, event: eventId })) {
      return res.status(409).json({ error: 'You are already registered for this event' });
    }
    // Atomically take a seat only if one is free, so two users cannot both get the last seat.
    const event = await Event.findOneAndUpdate(
      { _id: eventId, $expr: { $lt: ['$registeredCount', '$capacity'] } },
      { $inc: { registeredCount: 1 } },
      { returnDocument: 'after' }
    );
    if (!event) return res.status(409).json({ error: 'This event is full' });
    try {
      await Registration.create({ user: req.user._id, event: eventId });
    } catch (err) {
      await Event.updateOne({ _id: eventId }, { $inc: { registeredCount: -1 } });
      throw err;
    }
    res.status(201).json({ event });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id/register', requireAuth, [idRule], validate, async (req, res, next) => {
  try {
    const removed = await Registration.findOneAndDelete({ user: req.user._id, event: req.params.id });
    if (!removed) return res.status(404).json({ error: 'You are not registered for this event' });
    const event = await Event.findByIdAndUpdate(req.params.id, { $inc: { registeredCount: -1 } }, { returnDocument: 'after' });
    res.json({ event });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

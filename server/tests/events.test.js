const request = require('supertest');
const { app, connect, reset, close, loggedInAgent } = require('./helpers');
const Event = require('../src/models/Event');

beforeAll(connect);
beforeEach(reset);
afterAll(close);

describe('events', () => {
  it('lists seeded events sorted by date', async () => {
    const res = await request(app).get('/api/events').expect(200);
    expect(res.body.events.length).toBeGreaterThan(0);
    const dates = res.body.events.map((e) => new Date(e.date).getTime());
    expect([...dates].sort((a, b) => a - b)).toEqual(dates);
  });

  it('filters by category and rejects unknown ones', async () => {
    const res = await request(app).get('/api/events?category=Workshop').expect(200);
    expect(res.body.events.every((e) => e.category === 'Workshop')).toBe(true);
    await request(app).get('/api/events?category=Hacking').expect(400);
  });

  it('rejects malformed ids', async () => {
    await request(app).get('/api/events/not-an-id').expect(400);
  });

  it('requires login to register', async () => {
    const event = await Event.findOne();
    await request(app).post(`/api/events/${event.id}/register`).expect(401);
  });

  it('registers once, blocks duplicates, and lists it under my registrations', async () => {
    const agent = await loggedInAgent();
    const event = await Event.findOne();
    const res = await agent.post(`/api/events/${event.id}/register`).expect(201);
    expect(res.body.event.registeredCount).toBe(1);
    await agent.post(`/api/events/${event.id}/register`).expect(409);
    const mine = await agent.get('/api/registrations/me').expect(200);
    expect(mine.body.events.map((e) => e.id)).toEqual([event.id]);
  });

  it('cancels a registration', async () => {
    const agent = await loggedInAgent();
    const event = await Event.findOne();
    await agent.post(`/api/events/${event.id}/register`).expect(201);
    const res = await agent.delete(`/api/events/${event.id}/register`).expect(200);
    expect(res.body.event.registeredCount).toBe(0);
  });

  it('refuses registration when the event is full', async () => {
    const event = await Event.findOne();
    await Event.updateOne({ _id: event._id }, { capacity: 1, registeredCount: 1 });
    const agent = await loggedInAgent();
    const res = await agent.post(`/api/events/${event.id}/register`).expect(409);
    expect(res.body.error).toBe('This event is full');
  });
});

const request = require('supertest');
const { app, connect, reset, close, VALID_USER, loggedInAgent } = require('./helpers');
const User = require('../src/models/User');

beforeAll(connect);
beforeEach(reset);
afterAll(close);

describe('NoSQL injection (OWASP A03)', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/register').send(VALID_USER).expect(201);
  });

  it('login bypass payload {"$ne": null} is rejected', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: { $ne: null }, password: { $ne: null } });
    expect(res.status).toBe(400);
    expect(res.headers['set-cookie']).toBeUndefined();
  });

  it('$gt / $regex operators in login are rejected', async () => {
    await request(app).post('/api/auth/login').send({ email: VALID_USER.email, password: { $gt: '' } }).expect(400);
    await request(app).post('/api/auth/login').send({ email: { $regex: '.*' }, password: 'x' }).expect(400);
  });

  it('operators in query strings are stripped by mongo-sanitize', async () => {
    await request(app).get('/api/events?category[$ne]=Talk').expect(400);
  });
});

describe('XSS (OWASP A03)', () => {
  it('stores feedback as plain text and serves it as JSON, never HTML', async () => {
    const agent = await loggedInAgent();
    const payload = "<script>alert('hi')</script>";
    await agent.post('/api/feedback').send({ message: payload, rating: 5 }).expect(201);
    const res = await request(app).get('/api/feedback').expect(200);
    expect(res.headers['content-type']).toMatch(/application\/json/);
    expect(res.body.feedback[0].message).toBe(payload);
  });
});

describe('security headers (Helmet)', () => {
  it('sends CSP, HSTS, nosniff and frame protection; hides X-Powered-By', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['content-security-policy']).toContain("default-src 'none'");
    expect(res.headers['strict-transport-security']).toBeDefined();
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });
});

describe('session cookie & CSRF (OWASP A01/A07)', () => {
  it('auth cookie is HttpOnly and SameSite=Strict', async () => {
    const res = await request(app).post('/api/auth/register').send(VALID_USER).expect(201);
    const cookie = res.headers['set-cookie'][0];
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=Strict/i);
  });

  it('blocks state-changing requests from a foreign origin', async () => {
    const agent = await loggedInAgent();
    await agent
      .post('/api/feedback')
      .set('Origin', 'https://evil.example.com')
      .send({ message: 'forged request', rating: 1 })
      .expect(403);
  });

  it('allows requests from the configured frontend origin', async () => {
    const agent = await loggedInAgent();
    await agent
      .post('/api/feedback')
      .set('Origin', 'http://localhost:5173')
      .send({ message: 'genuine request', rating: 4 })
      .expect(201);
  });

  it('CORS does not grant access to other origins', async () => {
    const res = await request(app).get('/api/health').set('Origin', 'https://evil.example.com');
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });
});

describe('sensitive data', () => {
  it('stores passwords as bcrypt hashes', async () => {
    await request(app).post('/api/auth/register').send(VALID_USER).expect(201);
    const user = await User.findOne({ email: VALID_USER.email }).select('+password');
    expect(user.password).not.toBe(VALID_USER.password);
    expect(user.password).toMatch(/^\$2[aby]\$12\$/);
  });

  it('rejects oversized request bodies', async () => {
    await request(app)
      .post('/api/auth/login')
      .send({ email: 'a@b.com', password: 'x'.repeat(20000) })
      .expect(413);
  });
});

const request = require('supertest');
const { app, connect, reset, close, VALID_USER, loggedInAgent } = require('./helpers');

beforeAll(connect);
beforeEach(reset);
afterAll(close);

describe('auth', () => {
  it('registers a user, sets a cookie and never returns the password', async () => {
    const res = await request(app).post('/api/auth/register').send(VALID_USER).expect(201);
    expect(res.body.user.email).toBe(VALID_USER.email);
    expect(res.body.user.password).toBeUndefined();
    expect(res.headers['set-cookie'][0]).toMatch(/^tf_token=/);
  });

  it('rejects weak passwords and bad emails', async () => {
    await request(app).post('/api/auth/register').send({ ...VALID_USER, password: 'short' }).expect(400);
    await request(app).post('/api/auth/register').send({ ...VALID_USER, email: 'not-an-email' }).expect(400);
  });

  it('rejects duplicate emails', async () => {
    await request(app).post('/api/auth/register').send(VALID_USER).expect(201);
    await request(app).post('/api/auth/register').send(VALID_USER).expect(409);
  });

  it('logs in with the right password and rejects the wrong one', async () => {
    await request(app).post('/api/auth/register').send(VALID_USER).expect(201);
    await request(app)
      .post('/api/auth/login')
      .send({ email: VALID_USER.email, password: VALID_USER.password })
      .expect(200);
    const bad = await request(app)
      .post('/api/auth/login')
      .send({ email: VALID_USER.email, password: 'Wrong1234' })
      .expect(401);
    expect(bad.body.error).toBe('Invalid email or password');
  });

  it('protects /me and returns the user once logged in', async () => {
    await request(app).get('/api/auth/me').expect(401);
    const agent = await loggedInAgent();
    const res = await agent.get('/api/auth/me').expect(200);
    expect(res.body.user.name).toBe(VALID_USER.name);
  });

  it('/session returns null for visitors and the user once logged in', async () => {
    const anon = await request(app).get('/api/auth/session').expect(200);
    expect(anon.body.user).toBeNull();
    const agent = await loggedInAgent();
    const res = await agent.get('/api/auth/session').expect(200);
    expect(res.body.user.email).toBe(VALID_USER.email);
  });

  it('rejects a forged token', async () => {
    await request(app)
      .get('/api/auth/me')
      .set('Cookie', 'tf_token=eyJhbGciOiJub25lIn0.eyJzdWIiOiIxIn0.')
      .expect(401);
  });

  it('logout clears the cookie', async () => {
    const agent = await loggedInAgent();
    await agent.post('/api/auth/logout').expect(200);
    await agent.get('/api/auth/me').expect(401);
  });
});

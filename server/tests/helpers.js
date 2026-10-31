const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const app = require('../src/app');
const { seedEvents } = require('../src/seed');

let mongod;

async function connect() {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
}

async function reset() {
  await Promise.all(Object.values(mongoose.connection.collections).map((c) => c.deleteMany({})));
  await seedEvents();
}

async function close() {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
}

const VALID_USER = { name: 'Asha Rao', email: 'asha@example.com', password: 'Secret123', college: 'NIT' };

// Returns a supertest agent that keeps the auth cookie between requests, like a browser.
async function loggedInAgent(user = VALID_USER) {
  const agent = request.agent(app);
  await agent.post('/api/auth/register').send(user).expect(201);
  return agent;
}

module.exports = { app, connect, reset, close, VALID_USER, loggedInAgent };

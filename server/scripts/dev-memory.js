// Runs the real API against a throw-away in-memory MongoDB, for trying the app before Atlas is set up.
// Usage: npm run dev:memory
const { MongoMemoryServer } = require('mongodb-memory-server');

(async () => {
  const mongod = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongod.getUri('techfest2026');
  console.log('Using in-memory MongoDB (data is lost when this process stops)');
  require('../server');
})();

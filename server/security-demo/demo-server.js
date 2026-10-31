// Usage: npm run demo:vulnerable   (http://localhost:4001)
//        npm run demo:secure       (http://localhost:4002)
// Uses a throw-away in-memory MongoDB, so it never touches your real database.
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { createDemoApp, seedDemo, DEMO_USER } = require('./demo-app');

const mode = process.argv[2] === 'secure' ? 'secure' : 'vulnerable';
const port = mode === 'secure' ? 4002 : 4001;

(async () => {
  const mongod = await MongoMemoryServer.create();
  const connection = await mongoose.createConnection(mongod.getUri()).asPromise();
  const app = createDemoApp(mode, connection);
  await seedDemo(connection, mode);
  app.listen(port, () => {
    console.log(`Security demo running in ${mode.toUpperCase()} mode: http://localhost:${port}`);
    console.log(`Demo account: ${DEMO_USER.email} / ${DEMO_USER.password}`);
  });
})();

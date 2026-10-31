const mongoose = require('mongoose');
const config = require('./src/config');
const app = require('./src/app');
const { seedEvents } = require('./src/seed');

async function start() {
  await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 10000 });
  console.log('Connected to MongoDB');
  const seeded = await seedEvents();
  if (seeded) console.log(`Seeded ${seeded} events`);
  app.listen(config.port, () => console.log(`API listening on port ${config.port}`));
}

start().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});

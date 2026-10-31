// Runs the same two attacks against the vulnerable and the secure demo and prints the outcome.
// Usage: npm run demo:attack
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { createDemoApp, seedDemo } = require('./demo-app');

const XSS = "<script>alert('hi')</script>";

async function runAgainst(mode, uri) {
  const connection = await mongoose.createConnection(uri, { dbName: `demo_${mode}` }).asPromise();
  const app = createDemoApp(mode, connection);
  await seedDemo(connection, mode);
  const server = app.listen(0);
  const base = `http://127.0.0.1:${server.address().port}`;

  const login = await fetch(`${base}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: { $ne: null }, password: { $ne: null } }),
  });
  const loginBody = await login.json();

  await fetch(`${base}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ message: XSS }),
    redirect: 'manual',
  });
  const page = await fetch(base);
  const html = await page.text();

  server.close();
  await connection.close();
  return {
    mode,
    injection: loginBody.ok ? `BYPASSED - ${loginBody.message}` : `blocked (${login.status} ${loginBody.error})`,
    xss: html.includes(XSS) ? 'SCRIPT INJECTED into page' : 'escaped, shown as text',
    csp: page.headers.get('content-security-policy') ? 'present' : 'missing',
  };
}

(async () => {
  const mongod = await MongoMemoryServer.create();
  const rows = [];
  for (const mode of ['vulnerable', 'secure']) rows.push(await runAgainst(mode, mongod.getUri()));
  await mongod.stop();
  console.log('\nPayloads: login body {"email":{"$ne":null},"password":{"$ne":null}}, feedback ' + XSS + '\n');
  console.table(rows);
})();

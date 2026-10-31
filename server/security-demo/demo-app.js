// A deliberately small "test copy" of the portal's login + feedback features, used ONLY
// to demonstrate attacks and their fixes (lab procedure steps 2-4). Do not deploy it.
//
//   mode = 'vulnerable'  -> no Helmet, no sanitising, raw query, raw HTML output
//   mode = 'secure'      -> the same fixes the real portal uses
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const DEMO_USER = { email: 'admin@techfest.in', password: 'S3cretAdmin!' };

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function createDemoApp(mode, connection) {
  const secure = mode === 'secure';
  const User = connection.model('DemoUser', new mongoose.Schema({ email: String, password: String }));
  const Feedback = connection.model('DemoFeedback', new mongoose.Schema({ message: String }, { timestamps: true }));

  const app = express();
  app.disable('x-powered-by');

  if (secure) {
    app.use(helmet()); // CSP: script-src 'self' -> inline/injected scripts are blocked
  }
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  if (secure) {
    app.use(mongoSanitize()); // strips $ne / $gt / $regex keys from the body
  }
  app.use('/static', express.static(path.join(__dirname, 'public')));

  app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!secure) {
      // VULNERABLE: the request body goes straight into the query. Sending
      // {"email":{"$ne":null},"password":{"$ne":null}} matches the first user in the DB.
      const user = await User.findOne({ email, password });
      if (!user) return res.status(401).json({ ok: false, error: 'Invalid email or password' });
      return res.json({ ok: true, message: `Logged in as ${user.email}` });
    }
    // FIXED: only plain strings are accepted, and the password is checked with bcrypt.
    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ ok: false, error: 'Email and password must be text' });
    }
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ ok: false, error: 'Invalid email or password' });
    }
    return res.json({ ok: true, message: `Logged in as ${user.email}` });
  });

  app.post('/feedback', async (req, res) => {
    if (typeof req.body.message === 'string' && req.body.message.trim()) {
      await Feedback.create({ message: req.body.message.slice(0, 500) });
    }
    res.redirect('/');
  });

  app.get('/', async (req, res) => {
    const items = await Feedback.find().sort({ createdAt: -1 });
    // VULNERABLE: user text is pasted into HTML, so <script> tags run in every visitor's browser.
    // FIXED: user text is escaped, so it is displayed as plain text.
    const render = secure ? escapeHtml : (s) => s;
    const list = items.map((f) => `<li>${render(f.message)}</li>`).join('') || '<li><em>No feedback yet</em></li>';
    res.send(`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Security demo (${mode})</title><link rel="stylesheet" href="/static/demo.css"></head>
<body class="${mode}">
  <header><h1>TechFest security demo</h1><span class="badge">${mode.toUpperCase()} MODE</span></header>
  <section>
    <h2>1. Login (NoSQL injection)</h2>
    <form id="login">
      <input name="email" type="email" placeholder="Email" required>
      <input name="password" type="password" placeholder="Password" required>
      <button>Log in</button>
    </form>
    <button id="attack" class="danger">Send login-bypass payload {"$ne": null}</button>
    <pre id="login-result">Result appears here</pre>
  </section>
  <section>
    <h2>2. Feedback (XSS)</h2>
    <form method="post" action="/feedback">
      <textarea name="message" rows="3" placeholder="Try: &lt;script&gt;alert('hi')&lt;/script&gt;"></textarea>
      <button>Submit feedback</button>
    </form>
    <ul id="feedback">${list}</ul>
  </section>
  <script src="/static/demo.js"></script>
</body></html>`);
  });

  return app;
}

async function seedDemo(connection, mode) {
  const User = connection.model('DemoUser');
  await User.deleteMany({});
  const password = mode === 'secure' ? await bcrypt.hash(DEMO_USER.password, 10) : DEMO_USER.password;
  await User.create({ email: DEMO_USER.email, password });
}

module.exports = { createDemoApp, seedDemo, DEMO_USER, escapeHtml };

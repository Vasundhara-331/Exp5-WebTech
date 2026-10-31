# TechFest 2026 Portal

A MERN-stack portal for TechFest 2026. Visitors browse events, view the schedule and gallery,
create an account, register for events and leave feedback. It is prepared for production with
OWASP-focused security, automated CI, cloud deployment and performance tuning.

| Tier | Tech | Hosted on |
| --- | --- | --- |
| Frontend | React 19 + Vite, React Router | Netlify |
| API | Node.js 22 + Express 4 | Render |
| Database | MongoDB (Mongoose 8) | MongoDB Atlas |

See **[DEPLOYMENT_REPORT.md](DEPLOYMENT_REPORT.md)** for the architecture, security fixes, Git
history, CI pipeline, deployment steps and performance results.

## Project structure

```
Exp5/
├── client/                 React + Vite frontend
│   ├── src/pages/          Home, Events, Schedule, Gallery, Feedback, Login, Register, Dashboard
│   ├── scripts/            write-redirects.mjs (Netlify /api proxy + SPA fallback)
│   └── netlify.toml        build settings, security + cache headers
├── server/                 Express API
│   ├── src/                app, config, models, routes, middleware
│   ├── tests/              Jest + Supertest (incl. security tests)
│   └── security-demo/      vulnerable vs secure copy for the attack demo
├── .github/workflows/ci.yml
├── render.yaml             Render blueprint
└── docs/                   Lighthouse reports, screenshots, Git evidence
```

## Run locally

Prerequisites: Node.js 20+ and Git.

```bash
# 1. API
cd server
npm install
cp .env.example .env          # then put your Atlas MONGO_URI and a JWT_SECRET in .env
npm run dev                   # http://localhost:5000/api/health -> {"status":"ok"}
# No Atlas yet? `npm run dev:memory` runs the API on a throw-away in-memory MongoDB.

# 2. Frontend (second terminal)
cd client
npm install
npm run dev                   # http://localhost:5173 (Vite forwards /api to port 5000)
```

## Scripts

| Where | Command | What it does |
| --- | --- | --- |
| server | `npm test` | Jest + Supertest suite (28 tests, in-memory MongoDB) |
| server | `npm run demo:vulnerable` / `demo:secure` | Security demo on :4001 / :4002 |
| server | `npm run demo:attack` | Runs NoSQL-injection + XSS against both modes, prints a table |
| client | `npm test` | Vitest unit tests |
| client | `npm run build` | Minified, code-split production build in `client/dist` |

## API

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/api/health` | - | Health check |
| POST | `/api/auth/register` | - | Create account, sets session cookie |
| POST | `/api/auth/login` | - | Log in, sets session cookie |
| POST | `/api/auth/logout` | - | Clears session cookie |
| GET | `/api/auth/session` | - | Current user or `null` |
| GET | `/api/auth/me` | ✔ | Current user (401 if logged out) |
| GET | `/api/events?category=` | - | List events |
| GET | `/api/events/:id` | - | One event |
| POST / DELETE | `/api/events/:id/register` | ✔ | Register / cancel |
| GET | `/api/registrations/me` | ✔ | My registered events |
| GET / POST | `/api/feedback` | POST ✔ | Read / add feedback |

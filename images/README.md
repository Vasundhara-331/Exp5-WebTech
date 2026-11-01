# Report images

Captured on 1 Nov 2026 from the project running locally (`npm run dev:memory` + `npm run dev`,
the security demo on ports 4001/4002, and the API in `NODE_ENV=production` on port 5001).
Terminal images are real command output rendered as images.

## Architecture
| File | Shows |
| --- | --- |
| `01-architecture-diagram.png` | Browser → Netlify (React) → Render (Express) → MongoDB Atlas, plus the GitHub → CI → deploy flow |

## Security (before / after)
| File | Shows |
| --- | --- |
| `02-security-nosql-injection-before.png` | Vulnerable demo: `{"$ne": null}` payload logs in as admin (HTTP 200) |
| `03-security-nosql-injection-after.png` | Secure demo: same payload rejected (HTTP 400, "Email and password must be text") |
| `04-security-xss-before.png` | Vulnerable demo: `<script>` stored raw in the HTML; Chrome executed `alert('hi')` |
| `05-security-xss-after-page.png` | Secure demo: the same input displayed as plain text |
| `06-security-xss-after-source.png` | Secure demo: HTML source shows the script escaped (`&lt;script&gt;`), no alert ran |
| `07-security-headers-before.png` | Vulnerable demo: no CSP / HSTS / X-Frame-Options headers |
| `08-security-headers-after.png` | Secure demo: Helmet headers present |
| `09-security-attack-summary.png` | `npm run demo:attack`: both attacks vs both modes |
| `10-security-api-cookie-csrf-injection.png` | Real API in production mode: cookie `HttpOnly; Secure; SameSite=Strict`, injection 400, forged cross-site request 403, wrong password 401, security headers |

## Git
| File | Shows |
| --- | --- |
| `11-git-branch-merge-graph.png` | `git log --graph`: feature branches and merge commits |
| `12-git-branches.png` | Local and GitHub (`remotes/origin/...`) branches |
| `13-git-merge-conflict-resolution.png` | The conflict markers in `Home.jsx` and the resolved line |

## Tests and build
| File | Shows |
| --- | --- |
| `14-tests-server-jest-supertest.png` | 28 Jest + Supertest tests passing (the same tests CI runs) |
| `15-tests-client-and-build.png` | Vitest passing and the production build output |
| `16-perf-build-size-before-after.png` | Bundle sizes before and after lazy loading |

## Lighthouse (local production build, mobile)
| File | Scores (Perf / A11y / Best Practices / SEO) |
| --- | --- |
| `17-lighthouse-home-before.png` | 99 / 100 / 96 / 91 |
| `18-lighthouse-home-after.png` | 99 / 100 / 100 / 100 |
| `19-lighthouse-gallery-before.png` | 99 / 100 / 96 / 92 |
| `20-lighthouse-gallery-after.png` | 99 / 100 / 100 / 100 |

These audits were run before the switch to the light theme, so the page preview inside the full
reports (`docs/lighthouse/*.html`) shows the old dark design.

## Application (local)
| File | Shows |
| --- | --- |
| `21`-`24` | Home, Events, Schedule, Gallery (desktop) |
| `25-app-register-desktop.png` | Registration form |
| `26-app-event-registered-desktop.png` | Registered for an event (success message, seats updated) |
| `27-app-dashboard-my-events-desktop.png` | Protected "My events" dashboard |
| `28-app-feedback-xss-safe-desktop.png` | XSS attempt in the real app shown as plain text |
| `29-app-login-wrong-password-desktop.png` | Invalid login rejected |
| `30-app-protected-route-redirects-to-login.png` | `/dashboard` while logged out redirects to login |
| `31`-`34` | Mobile: home, open menu, events, schedule |

## Still to capture yourself (these need your accounts or the live site)
- [ ] The `hi` alert popup on http://localhost:4001 (browser dialogs can't be captured automatically)
- [ ] GitHub repository page and the **Actions** tab: a red run, then a green run
- [ ] MongoDB Atlas: cluster overview and the `users` collection after registering on the live site
- [ ] Render service showing **Live**, and `/api/health` returning `{"status":"ok"}`
- [ ] Netlify deploy showing **Published**, and the live site with the 🔒 lock icon
- [ ] Live-site pages (desktop + phone) and Lighthouse run on the live URL
- [ ] DevTools → Application → Cookies on the live site (`tf_token`: HttpOnly, Secure, SameSite Strict)

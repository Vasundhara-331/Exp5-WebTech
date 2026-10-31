// Runs automatically after `npm run build` (npm "postbuild" hook) and writes dist/_redirects:
//
//   /api/*  -> the Render backend (VITE_API_URL), proxied so the browser sees one HTTPS origin
//   /*      -> /index.html, so React Router pages still work when refreshed or opened directly
import { writeFileSync } from 'node:fs';

const apiUrl = (process.env.VITE_API_URL || '').trim().replace(/\/+$/, '');
const lines = [];

if (apiUrl) {
  if (!/^https:\/\//.test(apiUrl)) {
    console.error(`VITE_API_URL must start with https:// (got "${apiUrl}")`);
    process.exit(1);
  }
  lines.push(`/api/*  ${apiUrl}/api/:splat  200!`);
} else {
  console.warn('VITE_API_URL is not set: /api requests will not be proxied to a backend.');
}
lines.push('/*  /index.html  200');

writeFileSync(new URL('../dist/_redirects', import.meta.url), lines.join('\n') + '\n');
console.log('dist/_redirects written:\n' + lines.map((l) => '  ' + l).join('\n'));

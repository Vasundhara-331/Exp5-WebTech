import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // In development the browser talks to Vite only; Vite forwards /api to Express.
    // In production Netlify does the same forwarding (see scripts/write-redirects.mjs),
    // so the auth cookie is always first-party and SameSite=Strict works on every browser.
    proxy: { '/api': 'http://localhost:5000' },
  },
  test: {
    environment: 'node',
  },
});

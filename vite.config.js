import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: ['.trycloudflare.com'], // Allow tunnel access
    proxy: {
      '/api': 'http://localhost:3000', // Keep this if frontend talks to backend via /api
    },
  },
});

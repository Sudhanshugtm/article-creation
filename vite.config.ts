import { defineConfig } from 'vite';

export default defineConfig({
  base: '/article-creation/',
  server: {
    host: true,
    port: 5173,
    open: true
  }
});
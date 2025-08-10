import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/article-creation/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        prototype: resolve(__dirname, 'article-creation.html'),
        'section-creation': resolve(__dirname, 'section-creation.html'),
        'section-expansion': resolve(__dirname, 'section-expansion.html')
      }
    }
  },
  server: {
    host: true,
    port: 5173,
    open: true
  }
});
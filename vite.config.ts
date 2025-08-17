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
        'section-expansion': resolve(__dirname, 'section-expansion.html'),
        'section-expansion-sidebar': resolve(__dirname, 'section-expansion-sidebar.html'),
        'section-expansion-wizard': resolve(__dirname, 'section-expansion-wizard.html'),
        'section-suggestions': resolve(__dirname, 'section-suggestions.html')
      }
    }
  },
  server: {
    host: true,
    port: 5173,
    open: true
  }
});
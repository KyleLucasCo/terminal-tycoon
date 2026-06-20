import { defineConfig } from 'vite';

export default defineConfig({
  base: '/terminal-tycoon/',
  
  server: {
    port: 5173,
    open: true
  }
});
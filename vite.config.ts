import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  // GitHub Pages serves the site under /<repo>/; locally and on Vercel it is the root.
  base: process.env.BASE_PATH ?? '/',
  plugins: [tailwindcss()],
  server: {
    port: 3000,
  },
});

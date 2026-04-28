import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/sprint_to_nowhere/',
  build: {
    rollupOptions: {
      output: {
        // Split the static dialog-data files into their own chunk so they
        // don't bloat the main bundle. Game logic and dialog content are
        // versioned independently; this also lets the browser cache them
        // separately across re-deploys.
        manualChunks(id) {
          if (id.includes('/src/data/')) return 'data';
        },
      },
    },
  },
})

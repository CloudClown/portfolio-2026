import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    // three.js alone is ~680 kB minified; it is a known, deliberate cost.
    chunkSizeWarningLimit: 800,
    // three + postprocessing is a big chunk; split it so the shell paints fast.
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          r3f: ['@react-three/fiber', '@react-three/drei'],
          fx: ['postprocessing', '@react-three/postprocessing'],
        },
      },
    },
  },
})

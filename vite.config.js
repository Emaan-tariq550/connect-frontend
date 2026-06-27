import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
   // https: true,  // ✅ camera/mic ke liye zaroori
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'jsdom',
    env: { NEXT_PUBLIC_API_BASE_URL: 'https://api.example.com' },
    setupFiles: ['./src/test/setup.ts'],
  },
})

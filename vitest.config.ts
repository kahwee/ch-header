import { defineConfig } from 'vitest/config'
import { resolve } from 'path'
import { playwright } from '@vitest/browser-playwright'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    // All tests run with DOM support
    include: ['src/**/__tests__/**/*.test.ts', 'src/**/__tests__/**/*.ui.test.ts'],
    exclude: ['node_modules/', 'dist/', '**/*.config.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/', '**/*.config.ts', '**/__tests__/**'],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})

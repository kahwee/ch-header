import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    pool: 'vmThreads',
    setupFiles: ['./src/test/setup.ts'],
    // All tests run with DOM support
    include: ['src/**/__tests__/**/*.test.ts', 'src/**/__tests__/**/*.ui.test.ts'],
    exclude: ['node_modules/', 'dist/', '**/*.config.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: ['node_modules/', 'dist/', '**/*.config.ts', '**/__tests__/**'],
    },
  },
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, './src'),
    },
  },
})

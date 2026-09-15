import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  esbuild: { jsx: 'automatic' },
  resolve: {
    alias: { '@': fileURLToPath(new URL('.', import.meta.url)) },
  },
  test: {
    globals: false,
    environment: 'node',
    environmentMatchGlobs: [['**/*.test.tsx', 'jsdom']],
    setupFiles: ['./test-setup.ts'],
    include: [
      'app/**/*.test.{ts,tsx}',
      'lib/**/*.test.{ts,tsx}',
      'components/**/*.test.{ts,tsx}',
      'features/**/*.test.{ts,tsx}',
      'config/**/*.test.{ts,tsx}',
      'stores/**/*.test.{ts,tsx}',
      'tooling/**/*.test.ts',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      include: ['lib/**'],
      exclude: ['lib/**/*.test.{ts,tsx}'],
      reportsDirectory: 'coverage-ratchet',
    },
  },
});

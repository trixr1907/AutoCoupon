import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    environmentOptions: {
      jsdom: {
        url: 'https://www.payback.de/coupons',
      },
    },
    include: ['tests/**/*.test.ts'],
  },
});

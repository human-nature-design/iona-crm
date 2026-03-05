import { defineConfig, devices } from '@playwright/test';
import path from 'path';

// Read environment variables for Playwright tests
require('dotenv').config({ path: path.resolve(__dirname, '.env.local') });
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

/**
 * Playwright E2E test configuration for billing limits testing.
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './__tests__/e2e',

  /* Run tests in files in parallel - disabled for billing tests that share state */
  fullyParallel: false,

  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Use single worker to prevent billing test data conflicts */
  workers: 1,

  /* Reporter to use */
  reporter: 'html',

  /* Shared settings for all the projects below */
  use: {
    /* Base URL to use in actions like `await page.goto('/')` */
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',

    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',

    /* Take screenshot on failure */
    screenshot: 'only-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    // Setup project for authentication
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },

    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Use prepared auth state
        storageState: 'playwright/.auth/user.json',
      },
      testIgnore: [/.*mobile-nav.*\.spec\.ts/, /.*auth-validation.*\.spec\.ts/],
      dependencies: ['setup'],
    },

    // Mobile Chrome for mobile nav testing
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
      },
      testMatch: /.*mobile-nav.*\.spec\.ts/,
    },

    // WebKit for Safari-like testing (no auth needed for marketing pages)
    {
      name: 'webkit',
      use: {
        ...devices['iPhone 13'],
      },
      testMatch: /.*mobile-nav.*\.spec\.ts/,
    },

    // Anonymous project for testing auth validation as unauthenticated user
    {
      name: 'anonymous',
      use: {
        ...devices['Desktop Chrome'],
        // No storageState — unauthenticated
      },
      testMatch: /.*auth-validation.*\.spec\.ts/,
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});

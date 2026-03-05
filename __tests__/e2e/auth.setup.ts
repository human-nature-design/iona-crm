/**
 * Playwright Auth Setup
 *
 * This setup file handles authentication for E2E tests.
 * It logs in once and saves the session state for reuse.
 *
 * PREREQUISITES:
 * 1. Run `pnpm db:seed` to create the test user
 * 2. Or set TEST_USER_EMAIL and TEST_USER_PASSWORD env vars
 */

import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../../playwright/.auth/user.json');

// Test user credentials - should match db:seed user
const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL;
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD;

setup('authenticate', async ({ page }) => {
  console.log(`Authenticating with: ${TEST_USER_EMAIL}`);

  // Go to sign-in page
  await page.goto('/sign-in');

  // Fill in credentials
  await page.getByLabel('Email').fill(TEST_USER_EMAIL);
  await page.getByLabel('Password').fill(TEST_USER_PASSWORD);

  // Click sign in button
  await page.getByRole('button', { name: /sign in/i }).click();

  // Wait for either success (redirect) or error message
  const result = await Promise.race([
    page.waitForURL('/app/**', { timeout: 15000 }).then(() => 'success'),
    page.waitForURL('**/app', { timeout: 15000 }).then(() => 'success'),
    page.getByText(/invalid email or password/i).waitFor({ timeout: 15000 }).then(() => 'invalid_credentials'),
    page.getByText(/check your email/i).waitFor({ timeout: 15000 }).then(() => 'needs_confirmation'),
  ]).catch(() => 'timeout');

  if (result === 'invalid_credentials') {
    throw new Error(
      `Login failed: Invalid credentials for ${TEST_USER_EMAIL}\n` +
      `Make sure to run 'pnpm db:seed' to create the test user, ` +
      `or set TEST_USER_EMAIL and TEST_USER_PASSWORD environment variables.`
    );
  }

  if (result === 'needs_confirmation') {
    throw new Error(
      `Login failed: Email confirmation required for ${TEST_USER_EMAIL}\n` +
      `The test user needs to have a confirmed email. Check Supabase Auth settings.`
    );
  }

  if (result === 'timeout') {
    throw new Error(
      `Login timed out for ${TEST_USER_EMAIL}\n` +
      `Check if the dev server is running and the login form works.`
    );
  }

  // Verify we're logged in
  await expect(page).toHaveURL(/\/app/);

  // Save the authentication state
  await page.context().storageState({ path: authFile });

  console.log('Authentication successful, state saved.');
});

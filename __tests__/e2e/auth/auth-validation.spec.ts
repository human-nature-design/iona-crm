/**
 * E2E Tests: Auth Form Validation
 *
 * Tests sign-in and sign-up form validation as an unauthenticated user.
 * Uses the 'anonymous' Playwright project (no storageState).
 * Run with: pnpm exec playwright test --project=anonymous __tests__/e2e/auth/auth-validation.spec.ts
 */

import { test, expect } from '@playwright/test';

test.describe('Auth Form Validation', () => {
  test.describe('Sign In', () => {
    test('shows error for empty submission', async ({ page }) => {
      await page.goto('/sign-in');
      await page.waitForLoadState('networkidle');

      // The form uses HTML5 required attributes, so submitting empty
      // should trigger browser validation. We test by checking the
      // required attribute exists on the email field.
      const emailInput = page.getByLabel('Email');
      await expect(emailInput).toHaveAttribute('required', '');

      const passwordInput = page.getByLabel('Password');
      await expect(passwordInput).toHaveAttribute('required', '');
    });

    test('email field requires valid email format', async ({ page }) => {
      await page.goto('/sign-in');
      await page.waitForLoadState('networkidle');

      // The email input has type="email" which browsers validate
      const emailInput = page.getByLabel('Email');
      await expect(emailInput).toHaveAttribute('type', 'email');
    });

    test('password field requires minimum length', async ({ page }) => {
      await page.goto('/sign-in');
      await page.waitForLoadState('networkidle');

      const passwordInput = page.getByLabel('Password');
      await expect(passwordInput).toHaveAttribute('minlength', '8');
    });

    test('shows error for wrong credentials', async ({ page }) => {
      await page.goto('/sign-in');
      await page.waitForLoadState('networkidle');

      await page.getByLabel('Email').fill('nonexistent@example.com');
      await page.getByLabel('Password').fill('wrongpassword123');
      await page.getByRole('button', { name: /Sign in/i }).click();

      // Should show error message
      await expect(page.getByText(/Invalid email or password/i)).toBeVisible({ timeout: 15000 });
    });

    test('sign-in page has link to sign-up', async ({ page }) => {
      await page.goto('/sign-in');
      await page.waitForLoadState('networkidle');

      const signUpLink = page.getByRole('link', { name: /Create an account/i });
      await expect(signUpLink).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Sign Up', () => {
    test('password field requires minimum 8 characters', async ({ page }) => {
      await page.goto('/sign-up');
      await page.waitForLoadState('networkidle');

      const passwordInput = page.getByLabel('Password');
      await expect(passwordInput).toHaveAttribute('minlength', '8');
    });

    test('sign-up page has link to sign-in', async ({ page }) => {
      await page.goto('/sign-up');
      await page.waitForLoadState('networkidle');

      const signInLink = page.getByRole('link', { name: /Sign in instead/i });
      await expect(signInLink).toBeVisible({ timeout: 10000 });
    });
  });
});

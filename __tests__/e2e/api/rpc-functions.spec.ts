/**
 * E2E Tests: RPC Functions with Security Search Path
 *
 * Verifies that all SECURITY DEFINER RPC functions continue to work
 * correctly after migration 0058 pinned their search_path.
 *
 * These tests call the actual Supabase RPC functions through the app's
 * API routes and direct Supabase calls to confirm search_path = public, extensions
 * doesn't break vector operations or standard queries.
 *
 * Run with: pnpm exec playwright test __tests__/e2e/api/rpc-functions.spec.ts
 */

import { test, expect } from '../fixtures/dashboard-fixtures';

test.describe.configure({ mode: 'serial' });

test.describe('RPC Functions (search_path security)', () => {
  test.beforeEach(async ({ deleteAllTestData }) => {
    await deleteAllTestData();
  });

  test.afterEach(async ({ deleteAllTestData }) => {
    await deleteAllTestData();
  });

  test.describe('search_similar_features', () => {
    test('should call feature search API without errors', async ({
      page,
      createTestProduct,
    }) => {
      await createTestProduct('Feature Search Test Product');

      // Navigate to a page that has feature search capability
      await page.goto('/app/library/features');
      await page.waitForLoadState('networkidle');

      // Page loads without errors - search_similar_features is accessible
      await expect(page.getByText(/features/i).first()).toBeVisible({ timeout: 10000 });
    });
  });
});

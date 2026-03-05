/**
 * E2E Tests: Organization Management
 *
 * Tests organization CRUD operations.
 * Run with: pnpm exec playwright test __tests__/e2e/organizations/organization-lifecycle.spec.ts
 */

import { test, expect } from '../fixtures/organization-fixtures';

test.describe.configure({ mode: 'serial' });

test.describe('Organization Management', () => {
  test.beforeEach(async ({ deleteAllTeamOrganizations }) => {
    await deleteAllTeamOrganizations();
  });

  test.afterAll(async ({ deleteAllTeamOrganizations }) => {
    await deleteAllTeamOrganizations();
  });

  test('organizations page loads', async ({ page }) => {
    await page.goto('/app/organizations');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: /Organizations/i, level: 1 })).toBeVisible({ timeout: 10000 });
  });

  test('create organization via form', async ({ page }) => {
    await page.goto('/app/organizations/new');
    await page.waitForLoadState('networkidle');

    // Fill in organization name
    await page.getByLabel(/Organization name/i).first().fill('E2E Test Organization');

    // Submit the form
    await page.getByRole('button', { name: /Create organization/i }).click();

    // Wait for navigation or success message
    await page.waitForTimeout(3000);

    // Navigate to organizations list to verify
    await page.goto('/app/organizations');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await expect(page.getByRole('cell', { name: 'E2E Test Organization' })).toBeVisible({ timeout: 10000 });
  });

  test('new organization appears in list', async ({ page, createTestOrganization }) => {
    await createTestOrganization({ name: 'Listed Organization' });

    await page.goto('/app/organizations');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await expect(page.getByRole('cell', { name: 'Listed Organization' })).toBeVisible({ timeout: 10000 });
  });

  test('navigate to organization detail', async ({ page, createTestOrganization }) => {
    const organizationId = await createTestOrganization({ name: 'Detail Organization' });

    await page.goto('/app/organizations');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Click on the organization row
    await page.getByRole('row', { name: /Detail Organization/ }).click();
    await page.waitForURL(/\/app\/organizations\/\d+/, { timeout: 10000 });

    expect(page.url()).toContain(`/app/organizations/${organizationId}`);
  });

  test('delete organization removes it from list', async ({ page, createTestOrganization }) => {
    await createTestOrganization({ name: 'Delete Organization' });

    await page.goto('/app/organizations');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Verify organization is visible
    await expect(page.getByRole('cell', { name: 'Delete Organization' })).toBeVisible({ timeout: 10000 });

    // Open the action menu on the organization row
    const row = page.locator('tr', { hasText: 'Delete Organization' }).first();
    const actionButton = row.locator('button').last();
    await actionButton.click();

    // Click delete in dropdown menu
    await page.getByRole('menuitem', { name: /delete/i }).click();

    // Confirm deletion in the AlertDialog
    await expect(page.getByRole('alertdialog')).toBeVisible({ timeout: 5000 });
    await page.getByRole('alertdialog').getByRole('button', { name: /delete organization/i }).click();

    // Wait for deletion to complete
    await page.waitForTimeout(2000);
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await expect(page.getByRole('row', { name: /Delete Organization/ })).not.toBeVisible({ timeout: 5000 });
  });

  test('organization count is correct after operations', async ({
    createTestOrganization,
    getOrganizationCount,
  }) => {
    expect(await getOrganizationCount()).toBe(0);

    await createTestOrganization({ name: 'Count Organization 1' });
    await createTestOrganization({ name: 'Count Organization 2' });

    expect(await getOrganizationCount()).toBe(2);
  });
});

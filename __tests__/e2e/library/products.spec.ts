/**
 * E2E Tests: Product & Feature Management
 *
 * Tests product CRUD operations and feature display.
 * Run with: pnpm exec playwright test __tests__/e2e/library/products.spec.ts
 */

import { test, expect } from '../fixtures/dashboard-fixtures';

test.describe.configure({ mode: 'serial' });

test.describe('Product & Feature Management', () => {
  test.beforeEach(async ({ deleteAllTestData }) => {
    await deleteAllTestData();
  });

  test.afterAll(async ({ deleteAllTestData }) => {
    await deleteAllTestData();
  });

  test('products page loads at /app/library/products', async ({ page }) => {
    await page.goto('/app/library/products');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: /Product library/i })).toBeVisible({ timeout: 10000 });
  });

  test('create product via Add dialog', async ({ page }) => {
    await page.goto('/app/library/products');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Click Add product button
    await page.getByRole('button', { name: /Add product/i }).click();

    // Fill in the dialog form
    await page.getByLabel(/Product name/i).fill('E2E Test Product');
    await page.getByLabel(/Product owner/i).fill('Test Owner');

    // Submit
    await page.getByRole('button', { name: /Add product/i }).last().click();

    // Wait for the dialog to close and product to appear
    await page.waitForTimeout(2000);

    // Product should now be visible
    await expect(page.getByText('E2E Test Product').first()).toBeVisible({ timeout: 10000 });
  });

  test('new product appears in list', async ({ page, createTestProduct }) => {
    await createTestProduct('Listed Product');

    await page.goto('/app/library/products');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await expect(page.getByText('Listed Product').first()).toBeVisible({ timeout: 10000 });
  });

  test('navigate to product detail', async ({ page, createTestProduct }) => {
    const productId = await createTestProduct('Detail Product');

    await page.goto('/app/library/products');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Click on the product card
    await page.getByText('Detail Product').first().click();
    await page.waitForURL(/\/app\/library\/products\/\d+/, { timeout: 10000 });

    expect(page.url()).toContain(`/app/library/products/${productId}`);
  });

  test('delete product removes it from list', async ({ page, createTestProduct }) => {
    await createTestProduct('Delete Product');

    await page.goto('/app/library/products');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Verify product is visible
    await expect(page.getByRole('heading', { name: 'Delete Product', level: 3 })).toBeVisible({ timeout: 10000 });

    // Hover the product card to reveal the dropdown menu trigger
    const productCard = page.locator('[data-slot="card"]', { hasText: 'Delete Product' }).first();
    await productCard.hover();

    // Click the dropdown menu trigger (the MoreHorizontal icon button)
    const menuButton = productCard.locator('button').first();
    await menuButton.click({ force: true });

    // Click Delete in dropdown menu
    await page.getByRole('menuitem', { name: /delete/i }).click();

    // Confirm deletion in the AlertDialog
    await expect(page.getByRole('alertdialog')).toBeVisible({ timeout: 5000 });
    await page.getByRole('alertdialog').getByRole('button', { name: /delete/i }).click();

    // Wait for deletion to process, then reload to verify
    await page.waitForTimeout(2000);
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await expect(page.getByText('Delete Product')).not.toBeVisible({ timeout: 5000 });
  });

  test('empty features state on new product', async ({ page, createTestProduct }) => {
    const productId = await createTestProduct('Empty Features Product');

    await page.goto(`/app/library/products/${productId}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Should see the product detail page with no features
    await expect(page.getByText('Empty Features Product').first()).toBeVisible({ timeout: 10000 });
  });

  test('empty state shows when no products exist', async ({ page }) => {
    await page.goto('/app/library/products');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await expect(page.getByText(/No products found/i)).toBeVisible({ timeout: 10000 });
  });
});

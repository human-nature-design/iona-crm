/**
 * E2E Tests: Settings Page
 *
 * Tests team settings display and update functionality.
 * Run with: pnpm exec playwright test __tests__/e2e/settings/settings.spec.ts
 */

import { test, expect } from '../fixtures/team-fixtures';

test.describe.configure({ mode: 'serial' });

test.describe('Settings Page', () => {
  const originalTeamName = 'Test Team';

  test.beforeEach(async ({ updateTeamName }) => {
    // Reset team name before each test
    await updateTeamName(originalTeamName);
  });

  test.afterAll(async ({ updateTeamName }) => {
    await updateTeamName(originalTeamName);
  });

  test('settings page loads', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: /Team & billing/i })).toBeVisible({ timeout: 10000 });
  });

  test('current team name is displayed', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Team name label should be visible
    await expect(page.getByText('Team name')).toBeVisible({ timeout: 10000 });
    // The actual team name should be visible somewhere on the page
    await expect(page.getByText(originalTeamName).first()).toBeVisible();
  });

  test('update team name shows success', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // The team name should be in an editable field (InlineEditField)
    // Click on the team name text to enter edit mode
    const teamNameElement = page.getByText(originalTeamName).first();
    await teamNameElement.click();

    // Clear and type the new name
    const editInput = page.getByRole('textbox', { name: /team name/i });
    await expect(editInput).toBeVisible({ timeout: 5000 });
    await editInput.clear();
    await editInput.fill('Updated Team Name');

    // Save (either press Enter or click save button)
    await editInput.press('Enter');
    await page.waitForTimeout(2000);

    // Verify the name updated
    await expect(page.getByText('Updated Team Name').first()).toBeVisible({ timeout: 10000 });
  });

  test('updated name persists after reload', async ({ page, updateTeamName }) => {
    await updateTeamName('Persistent Name');

    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await expect(page.getByText('Persistent Name').first()).toBeVisible({ timeout: 10000 });

    // Reload and verify persistence
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await expect(page.getByText('Persistent Name').first()).toBeVisible({ timeout: 10000 });
  });

  test('team subscription section is visible', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await expect(page.getByRole('heading', { name: /Team subscription/i })).toBeVisible({ timeout: 10000 });
    // Should show current plan info
    await expect(page.getByText(/Current plan/i)).toBeVisible();
  });
});

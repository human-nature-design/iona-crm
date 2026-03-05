import { test, expect } from '@playwright/test';

/**
 * Mobile navigation tests
 * Runs on mobile-chrome (Pixel 5) and webkit (iPhone 13) projects.
 * These are unauthenticated — they test the marketing page.
 */
test.describe('Mobile Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    // Wait for React hydration — the toggle button's aria-label is set by React state
    await page.waitForFunction(() => {
      const btn = document.querySelector('button[aria-expanded]');
      return btn !== null;
    });
  });

  test('mobile nav toggle is visible on mobile viewport', async ({ page }) => {
    const toggle = page.getByRole('button', { name: 'Open menu' });
    await expect(toggle).toBeVisible();
  });

  test('clicking toggle opens the slide-in panel', async ({ page }) => {
    const toggle = page.getByRole('button', { name: 'Open menu' });
    await toggle.click();

    // Panel should become visible (role="dialog" with aria-label)
    const panel = page.getByRole('dialog', { name: 'Mobile navigation' });
    await expect(panel).toBeVisible();

    // Close button inside panel should be visible
    const closeButton = panel.getByRole('button', { name: 'Close menu' });
    await expect(closeButton).toBeVisible();
  });

  test('panel has solid background when open', async ({ page }) => {
    const toggle = page.getByRole('button', { name: 'Open menu' });
    await toggle.click();

    const panel = page.getByRole('dialog', { name: 'Mobile navigation' });
    await expect(panel).toBeVisible();

    // Check that the panel has a non-transparent background
    const bgColor = await panel.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    expect(bgColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(bgColor).not.toBe('transparent');
  });

  test('nav links are visible in panel', async ({ page }) => {
    const toggle = page.getByRole('button', { name: 'Open menu' });
    await toggle.click();

    const panel = page.getByRole('dialog', { name: 'Mobile navigation' });
    await expect(panel).toBeVisible();

    // Check all nav links within the mobile nav panel
    await expect(panel.getByRole('link', { name: 'How it works' })).toBeVisible();
    await expect(panel.getByRole('link', { name: 'Features' })).toBeVisible();
    await expect(panel.getByRole('link', { name: 'Pricing' })).toBeVisible();
    await expect(panel.getByRole('link', { name: 'About' })).toBeVisible();
    await expect(panel.getByRole('link', { name: 'Log in' })).toBeVisible();
  });

  test('close button closes the panel', async ({ page }) => {
    const toggle = page.getByRole('button', { name: 'Open menu' });
    await toggle.click();

    const panel = page.getByRole('dialog', { name: 'Mobile navigation' });
    await expect(panel).toBeVisible();

    // Click close button
    const closeButton = panel.getByRole('button', { name: 'Close menu' });
    await closeButton.click();

    // Toggle should show "Open menu" again (panel closed)
    await expect(page.getByRole('button', { name: 'Open menu' })).toBeVisible();

    // Panel should no longer be visible (translateX(100%) + visibility: hidden)
    await expect(panel).toBeHidden();
  });

  test('escape key closes the panel', async ({ page }) => {
    const toggle = page.getByRole('button', { name: 'Open menu' });
    await toggle.click();

    const panel = page.getByRole('dialog', { name: 'Mobile navigation' });
    await expect(panel).toBeVisible();

    // Press Escape
    await page.keyboard.press('Escape');

    // Toggle should show "Open menu" again
    await expect(page.getByRole('button', { name: 'Open menu' })).toBeVisible();

    // Panel should be hidden
    await expect(panel).toBeHidden();
  });

  test('clicking backdrop closes the panel', async ({ page }) => {
    const toggle = page.getByRole('button', { name: 'Open menu' });
    await toggle.click();

    const panel = page.getByRole('dialog', { name: 'Mobile navigation' });
    await expect(panel).toBeVisible();

    // The backdrop is the aria-hidden div that covers the left side of the screen.
    // Click at the far left edge of the viewport where only the backdrop is.
    const viewport = page.viewportSize();
    if (viewport) {
      await page.mouse.click(10, viewport.height / 2);
    }

    // Panel should close
    await expect(panel).toBeHidden();
    await expect(page.getByRole('button', { name: 'Open menu' })).toBeVisible();
  });

  test('visual screenshot - panel open state', async ({ page }) => {
    const toggle = page.getByRole('button', { name: 'Open menu' });
    await toggle.click();

    const panel = page.getByRole('dialog', { name: 'Mobile navigation' });
    await expect(panel).toBeVisible();

    // Small wait for animation to settle before screenshot
    await page.waitForTimeout(350);

    await expect(page).toHaveScreenshot('mobile-nav-open.png', {
      maxDiffPixelRatio: 0.1,
    });
  });
});

/**
 * E2E Tests: Chat Interface
 *
 * Tests chat UI shell and persistence. Does NOT test AI streaming.
 * Run with: pnpm exec playwright test __tests__/e2e/chat/chat-interface.spec.ts
 */

import { test, expect } from '../fixtures/chat-fixtures';

test.describe.configure({ mode: 'serial' });

test.describe('Chat Interface', () => {
  test.beforeEach(async ({ deleteAllTeamChats }) => {
    await deleteAllTeamChats();
  });

  test.afterAll(async ({ deleteAllTeamChats }) => {
    await deleteAllTeamChats();
  });

  test('chat page loads at /app/chat', async ({ page }) => {
    await page.goto('/app/chat');
    await page.waitForLoadState('networkidle');

    // Should see the chat brand/heading
    await expect(page.getByText('sage').first()).toBeVisible({ timeout: 10000 });
  });

  test('empty state when no chats', async ({ page }) => {
    await page.goto('/app/chat');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Should see the empty/welcome state with brand and tagline
    await expect(page.getByText('sage').first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/AI assistant/i).first()).toBeVisible();

    // Should see suggestion chips
    await expect(page.getByText(/Tell me about our products/i)).toBeVisible();
  });

  test('pre-seeded chats appear in dropdown', async ({ page, createTestChat, createTestMessage }) => {
    const chatId = await createTestChat('Test Chat History');
    await createTestMessage({ chatId, role: 'user', content: 'Hello' });
    await createTestMessage({ chatId, role: 'assistant', content: 'Hi there!' });

    await page.goto('/app/chat');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Click "Continue a previous conversation" to reveal the chat list
    const historyButton = page.getByRole('button', { name: /previous conversation/i });
    await expect(historyButton).toBeVisible({ timeout: 10000 });
    await historyButton.click();
    await page.waitForTimeout(1000);

    // The seeded chat should now be visible in the expanded chat list
    await expect(page.getByText('Test Chat History').first()).toBeVisible({ timeout: 10000 });
  });

  test('delete chat removes it', async ({ page, createTestChat, createTestMessage }) => {
    const chatId = await createTestChat('Delete This Chat');
    await createTestMessage({ chatId, role: 'user', content: 'To be deleted' });

    await page.goto('/app/chat');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Open the "Continue a previous conversation" dropdown to see chat history
    const historyTrigger = page.getByText('Continue a previous conversation');
    await expect(historyTrigger).toBeVisible({ timeout: 10000 });
    await historyTrigger.click();

    // The chat should appear in the dropdown
    await expect(page.getByText('Delete This Chat').first()).toBeVisible({ timeout: 10000 });

    // Click the delete button next to the chat title in the dropdown
    const chatItem = page.getByText('Delete This Chat').first();
    await chatItem.hover();
    const trashButton = chatItem.locator('..').locator('button').last();
    await trashButton.click();

    // Confirm deletion if there's a dialog
    const confirmDelete = page.getByRole('button', { name: /Delete$/i });
    if (await confirmDelete.isVisible({ timeout: 2000 }).catch(() => false)) {
      await confirmDelete.click();
    }

    await page.waitForTimeout(2000);

    // The chat should no longer be visible
    await expect(page.getByText('Delete This Chat')).not.toBeVisible({ timeout: 5000 });
  });

  test('chat input is available', async ({ page }) => {
    await page.goto('/app/chat');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Should see a chat input
    const chatInput = page.getByPlaceholder(/Ask sage anything/i)
      .or(page.getByPlaceholder(/Type a message/i));
    await expect(chatInput).toBeVisible({ timeout: 10000 });
  });
});

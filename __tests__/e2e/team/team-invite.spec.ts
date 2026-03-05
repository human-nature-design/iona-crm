/**
 * E2E Tests: Team Invite Flow
 *
 * Tests the full team invitation flow including:
 * - Inviting new members
 * - Role-based access control
 * - Plan limit enforcement
 * - Last owner protection
 * - Invitation management (cancel, resend)
 *
 * Prerequisites:
 * - Dev server running: pnpm dev
 * - Test user created: pnpm db:seed
 * - User should be an owner on their team
 */

import { test, expect } from '../fixtures/team-fixtures';

test.describe('Team Invite Flow', () => {
  // Clean up before each test
  test.beforeEach(async ({
    deleteAllTeamInvitations,
    deleteTestMembers,
    setTeamPlan,
  }) => {
    await deleteAllTeamInvitations();
    await deleteTestMembers();
    await setTeamPlan('team'); // Use Team plan (5 members) for most tests
  });

  test('owner can see invite button on settings page', async ({ page }) => {
    await page.goto('/settings');

    // Wait for the page to load
    await expect(page.getByRole('heading', { name: /team & billing/i })).toBeVisible();

    // Verify invite button is visible (it says "Invite" with a Plus icon)
    const inviteButton = page.getByRole('button', { name: /invite/i });
    await expect(inviteButton).toBeVisible();
  });

  test('owner can open invite dialog', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.getByRole('heading', { name: /team & billing/i })).toBeVisible();

    // Click invite button
    await page.getByRole('button', { name: /invite/i }).click();

    // Verify dialog opens with email field and role selector
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    // Role is a Select component, check for the combobox
    await expect(page.getByRole('dialog').getByRole('combobox')).toBeVisible();
  });

  test('owner can send invitation', async ({
    page,
    getInvitationCount,
  }) => {
    const testEmail = `test-invite-${Date.now()}@example.com`;

    await page.goto('/settings');
    await expect(page.getByRole('heading', { name: /team & billing/i })).toBeVisible();

    // Click invite button
    await page.getByRole('button', { name: /invite/i }).click();

    // Fill in email
    await page.getByLabel(/email/i).fill(testEmail);

    // Submit - click the "Send invitation" button in the dialog
    await page.getByRole('button', { name: /send invitation/i }).click();

    // Wait for success message (be specific to avoid matching button text)
    await expect(
      page.getByText('Invitation sent successfully')
    ).toBeVisible({ timeout: 15000 });

    // Verify invitation was created in database
    const count = await getInvitationCount();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('owner can cancel pending invitation', async ({
    page,
    createTestInvitation,
    getInvitationCount,
  }) => {
    // Create a pending invitation
    const testEmail = `cancel-test-${Date.now()}@example.com`;
    await createTestInvitation(testEmail, 'member');

    // Verify we have one invitation
    const initialCount = await getInvitationCount();
    expect(initialCount).toBe(1);

    await page.goto('/settings');
    await expect(page.getByRole('heading', { name: /team & billing/i })).toBeVisible();

    // Find the invitation row with the email
    const invitationRow = page.getByRole('row').filter({ hasText: testEmail });
    await expect(invitationRow).toBeVisible();

    // Click the menu button (three dots)
    const menuButton = invitationRow.getByRole('button').filter({ has: page.locator('svg') });
    await menuButton.click();

    // Click cancel invitation in the dropdown
    await page.getByRole('menuitem', { name: /cancel invitation/i }).click();

    // Wait for invitation to be removed from UI
    await expect(invitationRow).not.toBeVisible({ timeout: 5000 });

    // Wait a moment for the database to be updated
    await page.waitForTimeout(1000);

    // Verify invitation was deleted from database
    const count = await getInvitationCount();
    expect(count).toBe(0);
  });

  test('owner can resend invitation', async ({
    page,
    createTestInvitation,
  }) => {
    // Create a pending invitation
    const testEmail = `resend-test-${Date.now()}@example.com`;
    await createTestInvitation(testEmail, 'member');

    await page.goto('/settings');
    await expect(page.getByRole('heading', { name: /team & billing/i })).toBeVisible();

    // Find the invitation row
    const invitationRow = page.getByRole('row').filter({ hasText: testEmail });
    await expect(invitationRow).toBeVisible();

    // Click the menu button
    const menuButton = invitationRow.getByRole('button').filter({ has: page.locator('svg') });
    await menuButton.click();

    // Click resend invite
    await page.getByRole('menuitem', { name: /resend invite/i }).click();

    // Wait for success indication
    await expect(
      page.getByText(/resent successfully/i)
    ).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Team Member Role Management', () => {
  test.beforeEach(async ({
    deleteAllTeamInvitations,
    deleteTestMembers,
    setTeamPlan,
  }) => {
    await deleteAllTeamInvitations();
    await deleteTestMembers();
    await setTeamPlan('team');
  });

  test('owner can change member role', async ({
    page,
    createTestMember,
  }) => {
    // Create a test member
    const testEmail = `role-test-${Date.now()}@example.com`;
    await createTestMember(testEmail, 'member');

    await page.goto('/settings');
    await expect(page.getByRole('heading', { name: /team & billing/i })).toBeVisible();

    // Find the member row
    const memberRow = page.getByRole('row').filter({ hasText: testEmail });
    await expect(memberRow).toBeVisible();

    // Click on the role dropdown (Select component)
    const roleSelect = memberRow.getByRole('combobox');
    await roleSelect.click();

    // Select owner role
    await page.getByRole('option', { name: /owner/i }).click();

    // Wait for update - the select should now show "Owner"
    await expect(roleSelect).toHaveText(/owner/i, { timeout: 5000 });
  });
});

test.describe('Plan Limit Enforcement', () => {
  test.beforeEach(async ({
    deleteAllTeamInvitations,
    deleteTestMembers,
  }) => {
    await deleteAllTeamInvitations();
    await deleteTestMembers();
  });

  test('Free plan shows upgrade popover when inviting', async ({
    page,
    setTeamPlan,
  }) => {
    await setTeamPlan('free');

    await page.goto('/settings');
    await expect(page.getByRole('heading', { name: /team & billing/i })).toBeVisible();

    // The invite button should show a Lock icon and trigger upgrade popover on hover
    const inviteButton = page.getByRole('button', { name: /invite/i });
    await expect(inviteButton).toBeVisible();

    // Hover to trigger popover
    await inviteButton.hover();

    // Should show upgrade message in popover - be specific
    await expect(
      page.getByText('Upgrade your plan to invite more team members.')
    ).toBeVisible({ timeout: 5000 });
  });

  test('Team plan allows invitations (5 member limit)', async ({
    page,
    setTeamPlan,
  }) => {
    await setTeamPlan('team');

    await page.goto('/settings');
    await expect(page.getByRole('heading', { name: /team & billing/i })).toBeVisible();

    // Click invite button
    await page.getByRole('button', { name: /invite/i }).click();

    // Dialog should open without error
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });

  test('shows upgrade popover when at Team plan limit', async ({
    page,
    setTeamPlan,
    createTestMember,
  }) => {
    await setTeamPlan('team');

    // Create 4 more members to hit the limit (owner + 4 = 5)
    for (let i = 0; i < 4; i++) {
      await createTestMember(`limit-test-${i}-${Date.now()}@example.com`, 'member');
    }

    await page.goto('/settings');
    await expect(page.getByRole('heading', { name: /team & billing/i })).toBeVisible();

    // The invite button should now show the upgrade popover
    const inviteButton = page.getByRole('button', { name: /invite/i });
    await inviteButton.hover();

    // Should show upgrade message - be specific
    await expect(
      page.getByText('Upgrade your plan to invite more team members.')
    ).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Last Owner Protection', () => {
  test.beforeEach(async ({
    deleteAllTeamInvitations,
    deleteTestMembers,
    setTeamPlan,
  }) => {
    await deleteAllTeamInvitations();
    await deleteTestMembers();
    await setTeamPlan('team');
  });

  test('cannot change own role as sole owner', async ({
    page,
    getOwnerCount,
  }) => {
    // Verify we're the only owner
    const ownerCount = await getOwnerCount();
    expect(ownerCount).toBe(1);

    await page.goto('/settings');
    await expect(page.getByRole('heading', { name: /team & billing/i })).toBeVisible();

    // Find the test user row
    const testEmail = process.env.TEST_USER_EMAIL!;
    const ownerRow = page.getByRole('row').filter({ hasText: testEmail });
    await expect(ownerRow).toBeVisible();

    // The role selector should be disabled for the current user
    const roleSelect = ownerRow.getByRole('combobox');
    await expect(roleSelect).toBeDisabled();
  });

  test('can demote owner when there are multiple owners', async ({
    page,
    createTestMember,
    getOwnerCount,
  }) => {
    // Create another owner
    const testEmail = `second-owner-${Date.now()}@example.com`;
    await createTestMember(testEmail, 'owner');

    // Verify we have 2 owners
    const ownerCount = await getOwnerCount();
    expect(ownerCount).toBe(2);

    await page.goto('/settings');
    await expect(page.getByRole('heading', { name: /team & billing/i })).toBeVisible();

    // Find the second owner
    const ownerRow = page.getByRole('row').filter({ hasText: testEmail });
    await expect(ownerRow).toBeVisible();

    // Change role to member
    const roleSelect = ownerRow.getByRole('combobox');
    await roleSelect.click();
    await page.getByRole('option', { name: /member/i }).click();

    // Should succeed - the select should now show "Member"
    await expect(roleSelect).toHaveText(/member/i, { timeout: 5000 });
  });
});

test.describe('Team Settings', () => {
  test('owner can update team name', async ({
    page,
    getTeamName,
    updateTeamName,
  }) => {
    const originalName = await getTeamName();
    const newName = `Test Team ${Date.now()}`;

    await page.goto('/settings');
    await expect(page.getByRole('heading', { name: /team & billing/i })).toBeVisible();

    // Find the team name section and hover to show edit button
    const teamNameSection = page.locator('text=Team name').locator('..');
    await teamNameSection.hover();

    // Click the edit button (pencil icon)
    const editButton = teamNameSection.getByRole('button');
    if (await editButton.isVisible().catch(() => false)) {
      await editButton.click();
    } else {
      // Try clicking on the name itself
      await page.getByText(originalName).click();
    }

    // Fill in new name
    const nameInput = page.getByRole('textbox');
    await nameInput.fill(newName);

    // Save (press Enter)
    await nameInput.press('Enter');

    // Verify name updated
    await expect(page.getByText(newName)).toBeVisible({ timeout: 5000 });

    // Reset name for other tests
    await updateTeamName(originalName);
  });
});

test.describe('Re-adding Removed Users', () => {
  test.beforeEach(async ({
    deleteAllTeamInvitations,
    deleteTestMembers,
    setTeamPlan,
  }) => {
    await deleteAllTeamInvitations();
    await deleteTestMembers();
    await setTeamPlan('team');
  });

  test('re-inviting removed user adds them directly', async ({
    page,
    createTestMember,
    getTeamMemberCount,
  }) => {
    // Create a member
    const testEmail = `readd-test-${Date.now()}@example.com`;
    await createTestMember(testEmail, 'member');

    await page.goto('/settings');
    await expect(page.getByRole('heading', { name: /team & billing/i })).toBeVisible();

    // Find and remove the member
    const memberRow = page.getByRole('row').filter({ hasText: testEmail });
    await expect(memberRow).toBeVisible();

    // Click menu button
    const menuButton = memberRow.getByRole('button').filter({ has: page.locator('svg') });
    await menuButton.click();

    // Click remove member
    await page.getByRole('menuitem', { name: /remove member/i }).click();

    // Wait for removal
    await expect(memberRow).not.toBeVisible({ timeout: 5000 });

    // Wait for database update
    await page.waitForTimeout(1000);

    const countAfterRemoval = await getTeamMemberCount();

    // Now re-invite the same email
    await page.getByRole('button', { name: /invite/i }).click();
    await page.getByLabel(/email/i).fill(testEmail);
    await page.getByRole('button', { name: /send invitation/i }).click();

    // Should succeed - for existing users it shows "added to team successfully"
    await expect(
      page.getByText(/added to team successfully|sent successfully/i)
    ).toBeVisible({ timeout: 10000 });

    // Wait for database update
    await page.waitForTimeout(1000);

    // Verify member count increased
    const countAfterReAdd = await getTeamMemberCount();
    expect(countAfterReAdd).toBe(countAfterRemoval + 1);
  });
});

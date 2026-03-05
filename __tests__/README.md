# Test Suite

This project uses **Jest** for unit tests and **Playwright** for E2E tests, following the [Next.js testing recommendations](https://nextjs.org/docs/app/guides/testing).

## Quick Start

```bash
# Run unit tests
pnpm test

# Run E2E tests (requires dev server)
pnpm test:e2e

# Run specific E2E test file
pnpm exec playwright test __tests__/e2e/billing/free-plan-limits.spec.ts
```

## Test Structure

```
__tests__/
├── unit/                           # Jest unit tests
│   └── billing/
│       ├── limits.test.ts          # Plan limits configuration
│       ├── product-limits.test.ts
│       └── team-member-limits.test.ts
└── e2e/                            # Playwright E2E tests
    ├── auth.setup.ts               # Authentication setup (runs first)
    ├── fixtures/
    │   └── billing-fixtures.ts     # Database manipulation utilities
    └── billing/
        ├── free-plan-limits.spec.ts    # Free plan limit enforcement
        ├── upgrade-flow.spec.ts        # Upgrade journey tests
        ├── downgrade-flow.spec.ts      # Downgrade/cancellation tests
        └── plan-transitions.spec.ts    # Full plan lifecycle tests
```

## Running Tests

### Unit Tests (Jest)

```bash
pnpm test              # Run all unit tests
pnpm test:billing      # Run billing tests only
pnpm test:watch        # Watch mode
pnpm test:coverage     # With coverage
```

### E2E Tests (Playwright)

```bash
# Prerequisites:
# 1. Database seeded: pnpm db:seed
# 2. Dev server auto-starts, or run: pnpm dev

pnpm test:e2e                                    # Run all E2E tests
pnpm exec playwright test __tests__/e2e/billing/ # Run billing tests only
pnpm exec playwright test --ui                   # Run with UI mode
pnpm exec playwright test --debug                # Debug mode
```

## E2E Test Architecture

### Fixtures System

E2E tests use Playwright fixtures for database manipulation. Fixtures use the admin Supabase client to bypass RLS:

```typescript
import { test, expect } from '../fixtures/billing-fixtures';

test('my test', async ({ page, resetTeamToFreePlan, createTestOrganizations }) => {
  await resetTeamToFreePlan();
  await createTestOrganizations(3);
  // ... test code
});
```

### Available Fixtures

| Fixture | Description |
|---------|-------------|
| `resetTeamToFreePlan()` | Reset team to Free plan (null plan_name) |
| `setTeamPlan(plan)` | Set team to 'free', 'solo', 'team', or 'enterprise' |
| `createTestOrganizations(count)` | Create test organizations, returns array of IDs |
| `createTestProducts(count)` | Create test products, returns array of IDs |
| `deleteAllTeamOrganizations()` | Delete all organizations for test team |
| `deleteAllTeamProducts()` | Delete all products for test team |
| `deleteAllTeamInvitations()` | Delete all invitations for test team |
| `getTeamPlan()` | Get current team plan name |
| `getOrganizationCount()` | Get organization count for team |
| `getProductCount()` | Get product count for team |
| `teamId` | Test team's ID |
| `userId` | Test user's ID |

### Plan Limits Reference

| Plan | Organizations | Products | Team Members |
|------|---------------|----------|--------------|
| Free | 1 total | 1 total | 1 |
| Solo | 5/month | 3 total | 1 |
| Team | 25/month | 10 total | 5 |
| Enterprise | Unlimited | Unlimited | Unlimited |

## Key Patterns & Learnings

### 1. Serial Execution Required

Billing tests share database state. Parallel execution causes race conditions.

**Configuration** (`playwright.config.ts`):
```typescript
export default defineConfig({
  fullyParallel: false,
  workers: 1,
});
```

### 2. SWR Caching

The app uses SWR for data fetching. After database changes, add waits:

```typescript
await setTeamPlan('solo');
await page.reload();
await page.waitForLoadState('networkidle');
await page.waitForTimeout(1000); // Wait for SWR cache
```

### 3. Stripe Checkout Cannot Be Automated

Stripe's hosted checkout has anti-automation measures. Mock the post-checkout behavior instead:

```typescript
// Simulate what happens after Stripe webhook processes
await setTeamPlan('solo');
await page.reload();
await expect(page.getByText('Solo')).toBeVisible();
```

### 4. Stripe Portal Requires Real Customer

Simulated subscriptions redirect to `/pricing`. Test the redirect behavior:

```typescript
if (await manageButton.isVisible().catch(() => false)) {
  await manageButton.click();
  await page.waitForURL(/pricing|billing\.stripe\.com/, { timeout: 15000 });
}
```

### 5. Exact Text Matching

Use `{ exact: true }` to avoid matching "Team Settings", "Team members", etc.:

```typescript
// Bad - matches multiple elements
await expect(page.getByText('Team')).toBeVisible();

// Good - matches only "Team"
await expect(page.getByText('Team', { exact: true })).toBeVisible();
```

### 6. UI Behavior by Plan

- **Free plan**: Shows usage counts in header, "Upgrade plan" link
- **Paid plans**: Shows stats cards, "Manage subscription" button
- **At limit**: Add buttons show Lock icon and popover on hover

## Writing New Tests

### Template

```typescript
import { test, expect } from '../fixtures/billing-fixtures';

test.describe.configure({ mode: 'serial' });

test.describe('My Feature', () => {
  test.beforeEach(async ({ resetTeamToFreePlan, deleteAllTeamOrganizations }) => {
    await resetTeamToFreePlan();
    await deleteAllTeamOrganizations();
  });

  test('should do something', async ({ page, setTeamPlan, createTestOrganizations }) => {
    await setTeamPlan('solo');
    await createTestOrganizations(3);

    await page.goto('/app/organizations');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await expect(page.getByText('Organizations')).toBeVisible();
  });
});
```

### Testing Limit Enforcement

```typescript
test('should block at limit', async ({ page, setTeamPlan, createTestOrganizations }) => {
  await setTeamPlan('free');
  await createTestOrganizations(1); // At Free limit

  await page.goto('/app/organizations');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  const addButton = page.getByRole('button', { name: 'Add organization' });
  await addButton.hover();

  await expect(page.getByText(/Upgrade your plan/i)).toBeVisible({ timeout: 5000 });
});
```

## Test Coverage

| Area | Unit Tests | E2E Tests |
|------|------------|-----------|
| Plan limits config | Yes | - |
| Organization limit logic | Yes | Yes |
| Product limit logic | Yes | Yes |
| Team member limit logic | Yes | Yes |
| Free plan enforcement | Yes | Yes |
| Upgrade flow | - | Yes |
| Downgrade flow | - | Yes |
| Cancellation | - | Yes |
| Plan transitions | - | Yes |
| Data preservation | - | Yes |
| UI consistency | - | Yes |

**Total: 59 E2E tests** across 4 spec files.

## Test User

Tests use the test user configured in `.env.local`:

```bash
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=...
```

Seed with: `pnpm db:seed`

## Debugging

### View Failed Screenshots

```bash
open test-results/
```

### Run with Trace

```bash
pnpm exec playwright test --trace on
pnpm exec playwright show-trace test-results/.../trace.zip
```

### Common Issues

**"Team membership not found"**: Re-seed database with `pnpm db:seed`

**Tests timing out**: Increase timeout with `test.setTimeout(60000)`

**Flaky tests**: Add explicit waits:
```typescript
await page.waitForLoadState('networkidle');
await page.waitForTimeout(1000);
await expect(element).toBeVisible({ timeout: 5000 });
```

## Stripe Test Mode

E2E tests use Stripe Sandbox:
- Test card: `4242 4242 4242 4242`
- Any future expiry date
- Any CVC

Ensure `.env.local` has sandbox keys (`sk_test_...`).

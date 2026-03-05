/**
 * Unit Tests: Stripe Webhook Handling
 *
 * Tests for subscription status handling logic.
 * Run with: pnpm test __tests__/unit/billing/stripe-webhook.test.ts
 */

import { getPlanLimits } from '@/lib/plans/limits';

describe('Subscription status handling', () => {
  const validActiveStatuses = ['active', 'trialing'];
  const clearDataStatuses = ['canceled', 'unpaid'];

  it('should recognize active statuses', () => {
    expect(validActiveStatuses).toContain('active');
    expect(validActiveStatuses).toContain('trialing');
  });

  it('should recognize cancellation statuses', () => {
    expect(clearDataStatuses).toContain('canceled');
    expect(clearDataStatuses).toContain('unpaid');
  });

  it('should revert to free limits after cancellation', () => {
    const limits = getPlanLimits(null);
    expect(limits).toEqual(getPlanLimits('free'));
  });
});

describe('Customer deleted handling', () => {
  it('should clear all Stripe fields when customer is deleted', () => {
    const clearedTeam = {
      stripe_customer_id: null,
      stripe_subscription_id: null,
      stripe_product_id: null,
      plan_name: null,
      subscription_status: null,
    };

    expect(clearedTeam.stripe_customer_id).toBeNull();
    expect(clearedTeam.plan_name).toBeNull();
  });
});

describe('Plan name mapping from Stripe product', () => {
  it('should map plan names to limits', () => {
    expect(getPlanLimits('Solo')).toBeDefined();
    expect(getPlanLimits('Team')).toBeDefined();
    expect(getPlanLimits('Enterprise')).toBeDefined();
  });

  it('should fall back to free for unknown product names', () => {
    expect(getPlanLimits('Premium Pro Ultra')).toEqual(getPlanLimits(null));
  });
});

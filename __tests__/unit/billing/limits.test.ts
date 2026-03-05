/**
 * Unit Tests: Plan Limits Configuration
 *
 * Run with: pnpm test __tests__/unit/billing/limits.test.ts
 */

import { PLAN_LIMITS, getPlanLimits, BILLING_ENABLED } from '@/lib/plans/limits';

describe('PLAN_LIMITS configuration', () => {
  it('should have billing disabled by default', () => {
    expect(BILLING_ENABLED).toBe(false);
  });

  it('all plans should have unlimited access when billing is disabled', () => {
    for (const plan of Object.values(PLAN_LIMITS)) {
      expect(plan.maxCollections).toBe(Infinity);
      expect(plan.maxTeamMembers).toBe(Infinity);
    }
  });
});

describe('getPlanLimits()', () => {
  it('should return limits for valid plan names', () => {
    expect(getPlanLimits('free')).toEqual(PLAN_LIMITS.free);
    expect(getPlanLimits('solo')).toEqual(PLAN_LIMITS.solo);
    expect(getPlanLimits('team')).toEqual(PLAN_LIMITS.team);
    expect(getPlanLimits('enterprise')).toEqual(PLAN_LIMITS.enterprise);
  });

  it('should be case insensitive', () => {
    expect(getPlanLimits('Solo')).toEqual(PLAN_LIMITS.solo);
    expect(getPlanLimits('TEAM')).toEqual(PLAN_LIMITS.team);
  });

  it('should fall back to free for null or unknown plan', () => {
    expect(getPlanLimits(null)).toEqual(PLAN_LIMITS.free);
    expect(getPlanLimits('unknown')).toEqual(PLAN_LIMITS.free);
  });
});

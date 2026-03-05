/**
 * Unit Tests: Collection Limit Enforcement Logic
 *
 * Run with: pnpm test __tests__/unit/billing/product-limits.test.ts
 */

import { getPlanLimits } from '@/lib/plans/limits';

describe('Collection Limit Enforcement Logic', () => {
  function canCreateCollection(planName: string | null, count: number): boolean {
    const limits = getPlanLimits(planName);
    return count < limits.maxCollections;
  }

  it('should allow unlimited collections on all plans (billing disabled)', () => {
    expect(canCreateCollection(null, 0)).toBe(true);
    expect(canCreateCollection(null, 1000)).toBe(true);
    expect(canCreateCollection('Solo', 100)).toBe(true);
    expect(canCreateCollection('Team', 100)).toBe(true);
    expect(canCreateCollection('Enterprise', 100)).toBe(true);
  });
});

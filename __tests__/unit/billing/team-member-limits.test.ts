/**
 * Unit Tests: Team Member Limit Enforcement Logic
 *
 * Run with: pnpm test __tests__/unit/billing/team-member-limits.test.ts
 */

import { getPlanLimits, PLAN_LIMITS } from '@/lib/plans/limits';

describe('Team Member Limit Enforcement Logic', () => {
  function canInviteTeamMember(planName: string | null, memberCount: number): boolean {
    const limits = getPlanLimits(planName);
    return memberCount < limits.maxTeamMembers;
  }

  it('should allow unlimited team members on all plans (billing disabled)', () => {
    expect(canInviteTeamMember(null, 1)).toBe(true);
    expect(canInviteTeamMember(null, 100)).toBe(true);
    expect(canInviteTeamMember('Solo', 100)).toBe(true);
    expect(canInviteTeamMember('Team', 100)).toBe(true);
    expect(canInviteTeamMember('Enterprise', 100)).toBe(true);
  });

  it('all plans should have same unlimited team members', () => {
    expect(PLAN_LIMITS.free.maxTeamMembers).toBe(Infinity);
    expect(PLAN_LIMITS.solo.maxTeamMembers).toBe(Infinity);
    expect(PLAN_LIMITS.team.maxTeamMembers).toBe(Infinity);
    expect(PLAN_LIMITS.enterprise.maxTeamMembers).toBe(Infinity);
  });
});

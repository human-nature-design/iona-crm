/**
 * Billing & Plan Limits
 *
 * Set BILLING_ENABLED to true when you're ready to make this a paid application.
 * Then customize the plan tiers below to match your pricing.
 * While false, all users get unlimited access.
 */
export const BILLING_ENABLED = false;

export const PLAN_LIMITS = {
  free: { maxCollections: Infinity, maxTeamMembers: Infinity },
  solo: { maxCollections: Infinity, maxTeamMembers: Infinity },
  team: { maxCollections: Infinity, maxTeamMembers: Infinity },
  enterprise: { maxCollections: Infinity, maxTeamMembers: Infinity },
} as const;

export type PlanName = keyof typeof PLAN_LIMITS;

export function getPlanLimits(planName: string | null) {
  const normalized = planName?.toLowerCase() as PlanName;
  return PLAN_LIMITS[normalized] || PLAN_LIMITS.free;
}

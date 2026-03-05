'use client';

import useSWR from 'swr';
import { PLAN_LIMITS } from '@/lib/plans/limits';

interface TeamData {
  id: number;
  plan_name: string | null;
}

interface UsageData {
  totalCollections: number;
  teamMembers: number;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function usePlanLimits() {
  const { data: team, isLoading: teamLoading } = useSWR<TeamData>('/api/team', fetcher);
  const { data: usage, isLoading: usageLoading } = useSWR<UsageData>(team ? '/api/usage' : null, fetcher);

  const isLoading = teamLoading || usageLoading;

  // Determine the plan
  const planName = team?.plan_name?.toLowerCase() || 'free';
  const limits = PLAN_LIMITS[planName as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.free;

  // Check if user can create more collections
  const canCreateCollection = usage ? usage.totalCollections < limits.maxCollections : true;

  // Check if user can invite more team members
  const canInviteTeamMember = usage ? usage.teamMembers < limits.maxTeamMembers : true;

  const collectionLimitMessage = `You've reached your limit of ${limits.maxCollections} collections on the ${team?.plan_name || 'Free'} plan.`;

  const teamMemberLimitMessage = `You've reached your limit of ${limits.maxTeamMembers} team member${limits.maxTeamMembers === 1 ? '' : 's'} on the ${team?.plan_name || 'Free'} plan.`;

  return {
    isLoading,
    planName: team?.plan_name || 'Free',
    limits,
    usage,
    canCreateCollection,
    canInviteTeamMember,
    collectionLimitMessage,
    teamMemberLimitMessage,
  };
}

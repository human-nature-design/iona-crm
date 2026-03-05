/**
 * Playwright Team Fixtures
 *
 * Provides database manipulation utilities for E2E team invite tests.
 * Uses admin Supabase client to bypass RLS for test isolation.
 *
 * Usage:
 *   import { test, expect } from './fixtures/team-fixtures';
 *
 *   test('my test', async ({ page, createTestInvitation, deleteAllTeamInvitations }) => {
 *     await deleteAllTeamInvitations();
 *     const invitationId = await createTestInvitation('test@example.com', 'member');
 *     // ... test code
 *   });
 */

import { test as base, expect } from '@playwright/test';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../../lib/db/database.types';

// Fixture type definition
type TeamFixtures = {
  // Plan state management
  setTeamPlan: (plan: 'free' | 'solo' | 'team' | 'enterprise') => Promise<void>;

  // Invitation management
  createTestInvitation: (
    email: string,
    role: 'member' | 'owner'
  ) => Promise<number>;
  deleteAllTeamInvitations: () => Promise<number>;
  getInvitationCount: () => Promise<number>;

  // Team member management
  createTestMember: (
    email: string,
    role: 'member' | 'owner'
  ) => Promise<{ userId: number; memberId: number }>;
  deleteTestMembers: () => Promise<number>;
  getOwnerCount: () => Promise<number>;
  getTeamMemberCount: () => Promise<number>;

  // Team settings
  updateTeamName: (name: string) => Promise<void>;
  getTeamName: () => Promise<string>;

  // Test context
  teamId: number;
  userId: number;
};

// Helper to create admin Supabase client
function createAdminClient(): SupabaseClient<Database> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY.'
    );
  }

  return createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Helper to get test user info
async function getTestUserInfo(supabase: SupabaseClient<Database>): Promise<{
  userId: number;
  teamId: number;
}> {
  const testEmail = process.env.TEST_USER_EMAIL;
  if (!testEmail) {
    throw new Error('TEST_USER_EMAIL environment variable not set');
  }

  // Get user by email
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('email', testEmail)
    .single();

  if (userError || !user) {
    throw new Error(`Test user not found: ${testEmail}. Run 'pnpm db:seed' first.`);
  }

  // Get team membership
  const { data: teamMember, error: teamError } = await supabase
    .from('team_members')
    .select('team_id')
    .eq('user_id', user.id)
    .single();

  if (teamError || !teamMember) {
    throw new Error(`Team membership not found for user ${testEmail}`);
  }

  return {
    userId: user.id,
    teamId: teamMember.team_id,
  };
}

// Extended test with fixtures
export const test = base.extend<TeamFixtures>({
  // Initialize context values (lazy - computed on first use)
  teamId: async ({}, use) => {
    const supabase = createAdminClient();
    const { teamId } = await getTestUserInfo(supabase);
    await use(teamId);
  },

  userId: async ({}, use) => {
    const supabase = createAdminClient();
    const { userId } = await getTestUserInfo(supabase);
    await use(userId);
  },

  // Set team to specific plan
  setTeamPlan: async ({}, use) => {
    const fixture = async (plan: 'free' | 'solo' | 'team' | 'enterprise') => {
      const supabase = createAdminClient();
      const { teamId } = await getTestUserInfo(supabase);

      if (plan === 'free') {
        const { error } = await supabase
          .from('teams')
          .update({
            plan_name: null,
            stripe_subscription_id: null,
            stripe_product_id: null,
            subscription_status: null,
          })
          .eq('id', teamId);

        if (error) {
          throw new Error(`Failed to set team to Free plan: ${error.message}`);
        }
      } else {
        // For paid plans, simulate an active subscription
        const { error } = await supabase
          .from('teams')
          .update({
            plan_name: plan.charAt(0).toUpperCase() + plan.slice(1), // Capitalize: solo -> Solo
            stripe_subscription_id: `sub_test_${Date.now()}`,
            stripe_product_id: `prod_test_${plan}`,
            subscription_status: 'active',
          })
          .eq('id', teamId);

        if (error) {
          throw new Error(`Failed to set team to ${plan} plan: ${error.message}`);
        }
      }
    };
    await use(fixture);
  },

  // Create test invitation
  createTestInvitation: async ({}, use) => {
    const fixture = async (
      email: string,
      role: 'member' | 'owner'
    ): Promise<number> => {
      const supabase = createAdminClient();
      const { teamId, userId } = await getTestUserInfo(supabase);

      const { data, error } = await supabase
        .from('invitations')
        .insert({
          team_id: teamId,
          email,
          role,
          invited_by: userId,
          status: 'pending',
        })
        .select('id')
        .single();

      if (error) {
        throw new Error(`Failed to create test invitation: ${error.message}`);
      }

      return data.id;
    };
    await use(fixture);
  },

  // Delete all team invitations
  deleteAllTeamInvitations: async ({}, use) => {
    const fixture = async (): Promise<number> => {
      const supabase = createAdminClient();
      const { teamId } = await getTestUserInfo(supabase);

      const { data, error } = await supabase
        .from('invitations')
        .delete()
        .eq('team_id', teamId)
        .select('id');

      if (error) {
        throw new Error(`Failed to delete team invitations: ${error.message}`);
      }

      return data?.length || 0;
    };
    await use(fixture);
  },

  // Get invitation count
  getInvitationCount: async ({}, use) => {
    const fixture = async (): Promise<number> => {
      const supabase = createAdminClient();
      const { teamId } = await getTestUserInfo(supabase);

      const { count, error } = await supabase
        .from('invitations')
        .select('*', { count: 'exact', head: true })
        .eq('team_id', teamId)
        .eq('status', 'pending');

      if (error) {
        throw new Error(`Failed to get invitation count: ${error.message}`);
      }

      return count || 0;
    };
    await use(fixture);
  },

  // Create test member (for testing removal and role changes)
  createTestMember: async ({}, use) => {
    const fixture = async (
      email: string,
      role: 'member' | 'owner'
    ): Promise<{ userId: number; memberId: number }> => {
      const supabase = createAdminClient();
      const { teamId } = await getTestUserInfo(supabase);

      // Create a test user
      const { data: user, error: userError } = await supabase
        .from('users')
        .insert({
          email,
          password_hash: null,
          role,
        })
        .select('id')
        .single();

      if (userError) {
        throw new Error(`Failed to create test user: ${userError.message}`);
      }

      // Add to team
      const { data: member, error: memberError } = await supabase
        .from('team_members')
        .insert({
          user_id: user.id,
          team_id: teamId,
          role,
        })
        .select('id')
        .single();

      if (memberError) {
        throw new Error(`Failed to create team member: ${memberError.message}`);
      }

      return { userId: user.id, memberId: member.id };
    };
    await use(fixture);
  },

  // Delete test members (cleanup - excludes the main test user)
  deleteTestMembers: async ({}, use) => {
    const fixture = async (): Promise<number> => {
      const supabase = createAdminClient();
      const { teamId, userId } = await getTestUserInfo(supabase);

      // Get test members (not the main test user)
      const { data: members } = await supabase
        .from('team_members')
        .select('id, user_id')
        .eq('team_id', teamId)
        .neq('user_id', userId);

      if (!members || members.length === 0) {
        return 0;
      }

      // Delete team memberships
      const { error: memberError } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', teamId)
        .neq('user_id', userId);

      if (memberError) {
        throw new Error(`Failed to delete team members: ${memberError.message}`);
      }

      // Delete the test users
      const userIds = members.map(m => m.user_id);
      const { error: userError } = await supabase
        .from('users')
        .delete()
        .in('id', userIds);

      if (userError) {
        throw new Error(`Failed to delete test users: ${userError.message}`);
      }

      return members.length;
    };
    await use(fixture);
  },

  // Get owner count
  getOwnerCount: async ({}, use) => {
    const fixture = async (): Promise<number> => {
      const supabase = createAdminClient();
      const { teamId } = await getTestUserInfo(supabase);

      const { count, error } = await supabase
        .from('team_members')
        .select('*', { count: 'exact', head: true })
        .eq('team_id', teamId)
        .eq('role', 'owner');

      if (error) {
        throw new Error(`Failed to get owner count: ${error.message}`);
      }

      return count || 0;
    };
    await use(fixture);
  },

  // Get team member count
  getTeamMemberCount: async ({}, use) => {
    const fixture = async (): Promise<number> => {
      const supabase = createAdminClient();
      const { teamId } = await getTestUserInfo(supabase);

      const { count, error } = await supabase
        .from('team_members')
        .select('*', { count: 'exact', head: true })
        .eq('team_id', teamId);

      if (error) {
        throw new Error(`Failed to get team member count: ${error.message}`);
      }

      return count || 0;
    };
    await use(fixture);
  },

  // Update team name
  updateTeamName: async ({}, use) => {
    const fixture = async (name: string): Promise<void> => {
      const supabase = createAdminClient();
      const { teamId } = await getTestUserInfo(supabase);

      const { error } = await supabase
        .from('teams')
        .update({ name })
        .eq('id', teamId);

      if (error) {
        throw new Error(`Failed to update team name: ${error.message}`);
      }
    };
    await use(fixture);
  },

  // Get team name
  getTeamName: async ({}, use) => {
    const fixture = async (): Promise<string> => {
      const supabase = createAdminClient();
      const { teamId } = await getTestUserInfo(supabase);

      const { data, error } = await supabase
        .from('teams')
        .select('name')
        .eq('id', teamId)
        .single();

      if (error) {
        throw new Error(`Failed to get team name: ${error.message}`);
      }

      return data.name;
    };
    await use(fixture);
  },
});

export { expect };

/**
 * Playwright Chat Fixtures
 *
 * Provides database manipulation utilities for E2E chat interface tests.
 * Uses admin Supabase client to bypass RLS for test isolation.
 *
 * Usage:
 *   import { test, expect } from '../fixtures/chat-fixtures';
 *
 *   test('my test', async ({ page, createTestChat, deleteAllTeamChats }) => {
 *     await deleteAllTeamChats();
 *     const chatId = await createTestChat('My Chat');
 *     // ... test code
 *   });
 */

import { test as base, expect } from '@playwright/test';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../../lib/db/database.types';

type ChatFixtures = {
  createTestChat: (title: string) => Promise<number>;

  createTestMessage: (data: {
    chatId: number;
    role: 'user' | 'assistant';
    content: string;
  }) => Promise<number>;

  deleteAllTeamChats: () => Promise<void>;

  teamId: number;
  userId: number;
};

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

async function getTestUserInfo(supabase: SupabaseClient<Database>): Promise<{
  userId: number;
  teamId: number;
}> {
  const testEmail = process.env.TEST_USER_EMAIL;
  if (!testEmail) {
    throw new Error('TEST_USER_EMAIL environment variable not set');
  }

  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('email', testEmail)
    .single();

  if (userError || !user) {
    throw new Error(`Test user not found: ${testEmail}. Run 'pnpm db:seed' first.`);
  }

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

export const test = base.extend<ChatFixtures>({
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

  createTestChat: async ({}, use) => {
    const fixture = async (title: string) => {
      const supabase = createAdminClient();
      const { teamId, userId } = await getTestUserInfo(supabase);

      const { data: chat, error } = await supabase
        .from('chats')
        .insert({
          team_id: teamId,
          user_id: userId,
          title,
        })
        .select('id')
        .single();

      if (error) {
        throw new Error(`Failed to create test chat: ${error.message}`);
      }

      return chat.id;
    };
    await use(fixture);
  },

  createTestMessage: async ({}, use) => {
    const fixture = async (data: {
      chatId: number;
      role: 'user' | 'assistant';
      content: string;
    }) => {
      const supabase = createAdminClient();
      const { teamId, userId } = await getTestUserInfo(supabase);

      const { data: message, error } = await supabase
        .from('messages')
        .insert({
          chat_id: data.chatId,
          team_id: teamId,
          user_id: userId,
          role: data.role,
          content: data.content,
        })
        .select('id')
        .single();

      if (error) {
        throw new Error(`Failed to create test message: ${error.message}`);
      }

      return message.id;
    };
    await use(fixture);
  },

  deleteAllTeamChats: async ({}, use) => {
    const fixture = async () => {
      const supabase = createAdminClient();
      const { teamId } = await getTestUserInfo(supabase);

      // Delete messages first (foreign key)
      await supabase.from('messages').delete().eq('team_id', teamId);
      await supabase.from('chats').delete().eq('team_id', teamId);
    };
    await use(fixture);
  },
});

export { expect };

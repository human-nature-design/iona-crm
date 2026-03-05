import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/db/database.types';

/**
 * Admin Supabase client that bypasses Row Level Security (RLS).
 *
 * USE CASES:
 * - Stripe webhooks (no user session available)
 * - Admin scripts and migrations
 * - Background jobs without user context
 *
 * WARNING: Never use this client for user-facing queries!
 * Always use createClient() from ./server.ts for authenticated requests.
 */
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

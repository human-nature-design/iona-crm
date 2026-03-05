/**
 * Auth Session Utilities
 *
 * NOTE: This application now uses Supabase Auth for authentication.
 * The hashPassword function is retained for:
 * - Legacy password verification during migration
 * - Any admin scripts that need to work with legacy passwords
 *
 * For all authentication operations, use the Supabase client from @/lib/supabase/server
 */

import { hash } from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * Hash a password using bcrypt.
 * @deprecated Use Supabase Auth for new users. This is only for legacy/migration purposes.
 */
export async function hashPassword(password: string) {
  return hash(password, SALT_ROUNDS);
}

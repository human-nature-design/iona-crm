import { getUser } from '@/lib/db/supabase-queries';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';
import SecurityForm from './security-form';

export default async function SecurityPage() {
  const user = await getUser();
  if (!user) {
    redirect('/sign-in');
  }

  // Detect if user has a password set (email/password auth vs OAuth-only)
  let hasPassword = false;
  if (user.supabase_auth_id) {
    const adminSupabase = createAdminClient();
    const { data: authUser } = await adminSupabase.auth.admin.getUserById(user.supabase_auth_id);
    hasPassword = authUser?.user?.identities?.some(i => i.provider === 'email') ?? false;
  }

  return <SecurityForm hasPassword={hasPassword} />;
}

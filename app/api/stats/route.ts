import { getUser, getTeamForUser } from '@/lib/db/supabase-queries';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const user = await getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const team = await getTeamForUser();
  if (!team) {
    return Response.json({ error: 'No team' }, { status: 400 });
  }

  const supabase = await createClient();

  const [orgs, contacts, chats, collections] = await Promise.all([
    supabase.from('organizations').select('id', { count: 'exact', head: true }).eq('team_id', team.id),
    supabase.from('contacts').select('id', { count: 'exact', head: true }).eq('team_id', team.id),
    supabase.from('chats').select('id', { count: 'exact', head: true }).eq('team_id', team.id),
    supabase.from('collections').select('id', { count: 'exact', head: true }).eq('team_id', team.id),
  ]);

  return Response.json({
    organizations: orgs.count ?? 0,
    contacts: contacts.count ?? 0,
    conversations: chats.count ?? 0,
    collections: collections.count ?? 0,
  });
}

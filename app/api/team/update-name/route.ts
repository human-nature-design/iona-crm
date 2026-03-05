import { createClient } from '@/lib/supabase/server';
import { getUserWithTeam } from '@/lib/db/supabase-queries';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = await createClient();

  // Get current user
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get app user with team
  const { data: appUser } = await supabase
    .from('users')
    .select('id')
    .eq('supabase_auth_id', authUser.id)
    .single();

  if (!appUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const userWithTeam = await getUserWithTeam(appUser.id);
  const teamId = userWithTeam?.team_members?.[0]?.team_id;
  const userRole = userWithTeam?.team_members?.[0]?.role;

  if (!teamId) {
    return NextResponse.json({ error: 'User is not part of a team' }, { status: 400 });
  }

  // Only owners can update team name
  if (userRole !== 'owner') {
    return NextResponse.json({ error: 'Only team owners can update the team name' }, { status: 403 });
  }

  // Get the new name from request body
  const body = await request.json();
  const { name } = body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return NextResponse.json({ error: 'Team name is required' }, { status: 400 });
  }

  if (name.length > 100) {
    return NextResponse.json({ error: 'Team name is too long' }, { status: 400 });
  }

  // Update the team name
  const { error } = await supabase
    .from('teams')
    .update({ name: name.trim() })
    .eq('id', teamId);

  if (error) {
    return NextResponse.json({ error: 'Failed to update team name' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

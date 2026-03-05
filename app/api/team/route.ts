import { getTeamForUser, getTeamWithInvitations } from '@/lib/db/supabase-queries';

export async function GET(request: Request) {
  // Check if we need to include invitations
  const { searchParams } = new URL(request.url);
  const includeInvitations = searchParams.get('includeInvitations') === 'true';
  
  if (includeInvitations) {
    const team = await getTeamWithInvitations();
    return Response.json(team);
  }
  
  const team = await getTeamForUser();
  return Response.json(team);
}

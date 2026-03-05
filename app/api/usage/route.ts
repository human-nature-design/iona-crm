import { NextResponse } from 'next/server';
import {
  getTeamForUser,
  countCollectionsForTeam,
  countTeamMembersAndInvitations,
} from '@/lib/db/supabase-queries';

export async function GET() {
  const team = await getTeamForUser();

  if (!team) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const [totalCollections, teamMembers] = await Promise.all([
    countCollectionsForTeam(team.id),
    countTeamMembersAndInvitations(team.id),
  ]);

  return NextResponse.json({
    totalCollections,
    teamMembers,
  });
}

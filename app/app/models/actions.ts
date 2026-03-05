'use server';

import { getTeamForUser, updateTeam } from '@/lib/db/supabase-queries';

export async function updateTeamModel(provider: string, model: string) {
  try {
    const team = await getTeamForUser();
    if (!team) {
      return { success: false, error: 'Not part of a team' };
    }

    // Check if user is team owner
    if (team.currentUserRole !== 'owner') {
      return { success: false, error: 'Only team owners can update model settings' };
    }

    // Update team model settings
    await updateTeam(team.id, {
      ai_provider: provider,
      ai_model: model,
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating team model:', error);
    return { success: false, error: 'Failed to update model settings' };
  }
}

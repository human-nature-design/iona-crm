'use server';

import { z } from 'zod';
import { validatedActionWithUser } from '@/lib/auth/middleware';
import { getTeamForUser, updateTeam } from '@/lib/db/supabase-queries';

const updateMatchingThresholdsSchema = z.object({
  minHistoricalSimilarity: z
    .string()
    .transform((val) => parseFloat(val))
    .pipe(z.number().min(0).max(1)),
  minHistoricalEvaluationRank: z
    .string()
    .transform((val) => parseInt(val))
    .pipe(z.number().min(1).max(5)),
  includeUnratedHistorical: z
    .string()
    .transform((val) => val === 'true'),
});

export const updateMatchingThresholds = validatedActionWithUser(
  updateMatchingThresholdsSchema,
  async (data, _, user) => {
    const team = await getTeamForUser();

    if (!team) {
      return { error: 'No team found' };
    }

    try {
      await updateTeam(team.id, {
        min_historical_similarity: data.minHistoricalSimilarity.toString(),
        min_historical_evaluation_rank: data.minHistoricalEvaluationRank,
        include_unrated_historical: data.includeUnratedHistorical,
      });

      return { success: 'Matching thresholds updated successfully' };
    } catch (error) {
      console.error('Error updating matching thresholds:', error);
      return { error: 'Failed to update thresholds' };
    }
  }
);

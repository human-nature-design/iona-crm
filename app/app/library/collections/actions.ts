'use server';

import { z } from 'zod';
import { validatedActionWithUser } from '@/lib/auth/middleware';
import {
  createCollection as dbCreateCollection,
  updateCollection as dbUpdateCollection,
  deleteCollection as dbDeleteCollection,
  getTeamForUser,
  getUser,
  countCollectionsForTeam,
} from '@/lib/db/supabase-queries';
import { getPlanLimits } from '@/lib/plans/limits';
import { revalidatePath } from 'next/cache';

export async function createCollectionAction(
  _: any,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const user = await getUser();
  if (!user) {
    return { error: 'Unauthorized' };
  }

  const team = await getTeamForUser();
  if (!team) {
    return { error: 'No team found' };
  }

  // Check plan limits
  const collectionCount = await countCollectionsForTeam(team.id);
  const limits = getPlanLimits(team.plan_name);
  if (collectionCount >= limits.maxCollections) {
    return { error: `You've reached your ${team.plan_name || 'Free'} plan limit of ${limits.maxCollections} collections. Upgrade to add more.` };
  }

  const name = formData.get('name') as string;
  const owner = formData.get('owner') as string;
  const icon = formData.get('icon') as string | null;

  if (!name?.trim() || !owner?.trim()) {
    return { error: 'Please fill in all required fields' };
  }

  try {
    await dbCreateCollection({
      name: name.trim(),
      owner: owner.trim(),
      icon: icon || null,
      team_id: team.id,
    });

    revalidatePath('/app/library');
    return { success: true };
  } catch (error) {
    console.error('Failed to create collection:', error);
    return { error: 'Failed to create collection' };
  }
}

export async function updateCollectionAction(
  _: any,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const user = await getUser();
  if (!user) {
    return { error: 'Unauthorized' };
  }

  const team = await getTeamForUser();
  if (!team) {
    return { error: 'No team found' };
  }

  const collectionId = parseInt(formData.get('collectionId') as string);
  const name = (formData.get('name') || formData.get('name')) as string;
  const owner = (formData.get('owner') || formData.get('owner')) as string;
  const description = formData.get('description') as string;

  if (!name?.trim() || !owner?.trim()) {
    return { error: 'Please fill in all required fields' };
  }

  try {
    const collection = await dbUpdateCollection(collectionId, team.id, {
      name: name.trim(),
      owner: owner.trim(),
      description: description?.trim() || null,
    });

    if (!collection) {
      return { error: 'Collection not found' };
    }

    revalidatePath('/app/library');
    revalidatePath(`/app/library/collections/${collectionId}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to update collection:', error);
    return { error: 'Failed to update collection' };
  }
}

export async function deleteCollectionAction(
  collectionId: number
): Promise<{ error?: string; success?: boolean }> {
  const user = await getUser();
  if (!user) {
    return { error: 'Unauthorized' };
  }

  const team = await getTeamForUser();
  if (!team) {
    return { error: 'No team found' };
  }

  try {
    const success = await dbDeleteCollection(collectionId, team.id);

    if (!success) {
      return { error: 'Collection not found' };
    }

    revalidatePath('/app/library');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete collection:', error);
    // Return more detailed error message
    if (error instanceof Error) {
      return { error: `Failed to delete collection: ${error.message}` };
    }
    return { error: 'Failed to delete collection' };
  }
}

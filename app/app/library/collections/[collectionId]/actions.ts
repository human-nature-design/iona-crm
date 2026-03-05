'use server';

import { z } from 'zod';
import { getUser, getTeamForUser, updateCollection } from '@/lib/db/supabase-queries';
import { validatedActionWithUser } from '@/lib/auth/middleware';
import { revalidatePath } from 'next/cache';
import { resourceTypeSchema } from '@/lib/constants/resource';

const updateCollectionFieldSchema = z.object({
  id: z.string().transform((val) => parseInt(val)),
  name: z.string().min(1, 'Collection name is required').max(255),
  owner: z.string().min(1, 'Collection owner is required').max(255),
  description: z.string().max(2000).optional(),
});

export const updateCollectionFieldAction = validatedActionWithUser(
  updateCollectionFieldSchema,
  async (data, _, user) => {
    const team = await getTeamForUser();
    if (!team) {
      return { error: 'No team found' };
    }

    try {
      const collection = await updateCollection(data.id, team.id, {
        name: data.name,
        owner: data.owner,
        description: data.description || null,
      });

      if (!collection) {
        return { error: 'Collection not found' };
      }

      revalidatePath('/app/library');
      revalidatePath(`/app/library/collections/${data.id}`);

      return { success: 'Collection updated successfully' };
    } catch (error) {
      console.error('Failed to update collection:', error);
      return { error: 'Failed to update collection' };
    }
  }
);

// Schema for icon update
const updateCollectionIconSchema = z.object({
  collectionId: z.number(),
  icon: z.string().max(50),
});

export async function updateCollectionIconAction(data: z.infer<typeof updateCollectionIconSchema>) {
  const user = await getUser();
  if (!user) {
    return { error: 'User is not authenticated' };
  }

  const validated = updateCollectionIconSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.errors[0].message };
  }

  const team = await getTeamForUser();
  if (!team) {
    return { error: 'No team found' };
  }

  try {
    const collection = await updateCollection(validated.data.collectionId, team.id, {
      icon: validated.data.icon,
    });

    if (!collection) {
      return { error: 'Collection not found' };
    }

    revalidatePath('/app/library');
    revalidatePath(`/app/library/collections/${validated.data.collectionId}`);

    return { success: 'Collection icon updated successfully' };
  } catch (error) {
    console.error('Failed to update collection icon:', error);
    return { error: 'Failed to update collection icon' };
  }
}

// Schema for URL objects
const collectionUrlSchema = z.object({
  label: z.string().min(1).max(100),
  url: z.string().url().max(500),
  type: resourceTypeSchema,
});

const updateCollectionUrlsSchema = z.object({
  collectionId: z.number(),
  urls: z.array(collectionUrlSchema),
});

export async function updateCollectionUrlsAction(data: z.infer<typeof updateCollectionUrlsSchema>) {
  const user = await getUser();
  if (!user) {
    return { error: 'User is not authenticated' };
  }

  const validated = updateCollectionUrlsSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.errors[0].message };
  }

  const team = await getTeamForUser();
  if (!team) {
    return { error: 'No team found' };
  }

  try {
    const collection = await updateCollection(validated.data.collectionId, team.id, {
      urls: validated.data.urls,
    });

    if (!collection) {
      return { error: 'Collection not found' };
    }

    revalidatePath('/app/library');
    revalidatePath(`/app/library/collections/${validated.data.collectionId}`);

    return { success: 'Collection URLs updated successfully' };
  } catch (error) {
    console.error('Failed to update collection URLs:', error);
    return { error: 'Failed to update collection URLs' };
  }
}

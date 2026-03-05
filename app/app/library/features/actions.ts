'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import {
  createBlock,
  updateBlock,
  deleteBlock,
  getBlockById,
  bulkCreateBlocks,
  getOrCreateDefaultCollection,
  logActivity,
  getUser,
  getTeamForUser
} from '@/lib/db/supabase-queries';
import { ActivityType } from '@/lib/db/schema';

const createBlockSchema = z.object({
  blockNumber: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  title: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  collectionId: z.number().optional(),
});

export const createBlockAction = async (data: z.infer<typeof createBlockSchema>) => {
  const user = await getUser();
  if (!user) {
    return { error: 'User is not authenticated' };
  }

  const validated = createBlockSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.errors[0].message };
  }

  const team = await getTeamForUser();
  if (!team) {
    return { error: 'No team found' };
  }

  try {
    // Use provided collectionId or get/create default collection
    let collectionId = validated.data.collectionId;
    if (!collectionId) {
      const collection = await getOrCreateDefaultCollection(team.id, user.name || user.email);
      collectionId = collection.id;
    }

    await createBlock({
      block_number: validated.data.blockNumber || null,
      category: validated.data.category || null,
      title: validated.data.title || null,
      description: validated.data.description || null,
      updated_by: user.id,
      team_id: team.id,
      collection_id: collectionId!,
    });

    await logActivity(team.id, user.id, ActivityType.CREATE_FEATURE);

    revalidatePath('/app/library/features');
    return { success: 'Block created successfully' };
  } catch (error) {
    console.error('Failed to create block:', error);
    return { error: 'Failed to create block' };
  }
};

const updateBlockSchema = z.object({
  id: z.union([z.string(), z.number()]).transform((val) => typeof val === 'string' ? parseInt(val, 10) : val),
  blockNumber: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  title: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

export const updateBlockAction = async (data: z.infer<typeof updateBlockSchema>) => {
  const user = await getUser();
  if (!user) {
    return { error: 'User is not authenticated' };
  }

  const validated = updateBlockSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.errors[0].message };
  }

  const team = await getTeamForUser();
  if (!team) {
    return { error: 'No team found' };
  }

  try {
    const block = await getBlockById(validated.data.id, team.id);
    if (!block) {
      return { error: 'Block not found' };
    }

    await updateBlock(validated.data.id, team.id, {
      block_number: validated.data.blockNumber,
      category: validated.data.category,
      title: validated.data.title,
      description: validated.data.description,
      updated_by: user.id,
    });

    await logActivity(team.id, user.id, ActivityType.UPDATE_FEATURE);

    revalidatePath('/app/library/features');
    return { success: 'Block updated successfully' };
  } catch (error) {
    console.error('Failed to update block:', error);
    return { error: 'Failed to update block' };
  }
};

const deleteBlockSchema = z.object({
  id: z.string().transform((val) => parseInt(val, 10)),
});

export const deleteBlockAction = async (data: z.infer<typeof deleteBlockSchema>) => {
  const user = await getUser();
  if (!user) {
    return { error: 'User is not authenticated' };
  }

  const validated = deleteBlockSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.errors[0].message };
  }

  const team = await getTeamForUser();
  if (!team) {
    return { error: 'No team found' };
  }

  try {
    const deleted = await deleteBlock(validated.data.id, team.id);
    if (!deleted) {
      return { error: 'Block not found' };
    }

    await logActivity(team.id, user.id, ActivityType.DELETE_FEATURE);

    revalidatePath('/app/library/features');
    return { success: 'Block deleted successfully' };
  } catch (error) {
    console.error('Failed to delete block:', error);
    return { error: 'Failed to delete block' };
  }
};

const bulkCreateBlocksSchema = z.object({
  blocks: z.array(z.object({
    blockNumber: z.string().optional().nullable(),
    category: z.string().optional().nullable(),
    title: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
  })),
  collectionId: z.number().optional(),
});

export const bulkCreateBlocksAction = async (data: z.infer<typeof bulkCreateBlocksSchema>) => {
  const user = await getUser();
  if (!user) {
    return { error: 'User is not authenticated' };
  }

  const validated = bulkCreateBlocksSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.errors[0].message };
  }

  const team = await getTeamForUser();
  if (!team) {
    return { error: 'No team found' };
  }

  try {
    // Use provided collectionId or get/create default collection
    let collectionId = validated.data.collectionId;
    if (!collectionId) {
      const collection = await getOrCreateDefaultCollection(team.id, user.name || user.email);
      collectionId = collection.id;
    }

    const blocksWithMetadata = validated.data.blocks.map(b => ({
      block_number: b.blockNumber || null,
      category: b.category || null,
      title: b.title || null,
      description: b.description || null,
      updated_by: user.id,
      team_id: team.id,
      collection_id: collectionId!,
    }));

    await bulkCreateBlocks(blocksWithMetadata);

    await logActivity(team.id, user.id, ActivityType.BULK_IMPORT_FEATURES);

    revalidatePath('/app/library/features');
    return { success: `${validated.data.blocks.length} blocks imported successfully` };
  } catch (error) {
    console.error('Failed to bulk create blocks:', error);
    return { error: 'Failed to import blocks' };
  }
};

'use server';

import { z } from 'zod';
import {
  getUser,
  getTeamForUser,
  getCollectionById,
  getBlockById,
  createBlock,
  updateBlock,
  deleteBlock,
  bulkCreateBlocks,

  updateBlockEmbedding,
} from '@/lib/db/supabase-queries';
import { generateBlockEmbedding } from '@/lib/ai/embeddings';
import { revalidatePath } from 'next/cache';

const createBlockSchema = z.object({
  collectionId: z.number(),
  blockNumber: z.string().optional(),
  category: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
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
    // Verify the collection belongs to the user's team
    const collection = await getCollectionById(validated.data.collectionId, team.id);
    if (!collection) {
      return { error: 'Collection not found' };
    }

    // Create the block
    const newBlock = await createBlock({
      collection_id: validated.data.collectionId,
      block_number: validated.data.blockNumber || null,
      category: validated.data.category || null,
      title: validated.data.title || null,
      description: validated.data.description || null,
      updated_by: user.id,
      team_id: team.id,
    });

    if (!newBlock) {
      return { error: 'Failed to create block' };
    }

    // Generate embedding for the new block
    try {
      const embedding = await generateBlockEmbedding({
        blockNumber: validated.data.blockNumber,
        category: validated.data.category,
        title: validated.data.title,
        description: validated.data.description,
      });
      await updateBlockEmbedding(newBlock.id, embedding);
    } catch (error) {
      console.error('Failed to generate embedding for new block:', error);
      // Don't fail the entire operation if embedding fails
    }

    // Fetch the created block
    const blockWithRelations = await getBlockById(newBlock.id, team.id);

    revalidatePath(`/app/library/collections/${validated.data.collectionId}`);

    return { success: 'Block created successfully', data: blockWithRelations };
  } catch (error) {
    console.error('Failed to create block:', error);
    return { error: 'Failed to create block' };
  }
};

const updateBlockSchema = z.object({
  id: z.number(),
  blockNumber: z.string().optional(),
  category: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
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
    // Get the existing block to verify ownership and get collection_id
    const existingBlock = await getBlockById(validated.data.id, team.id);
    if (!existingBlock) {
      return { error: 'Block not found' };
    }

    // Update the block
    const updatedBlock = await updateBlock(validated.data.id, team.id, {
      block_number: validated.data.blockNumber || null,
      category: validated.data.category || null,
      title: validated.data.title || null,
      description: validated.data.description || null,
      updated_by: user.id,
    });

    if (!updatedBlock) {
      return { error: 'Failed to update block' };
    }

    // Regenerate embedding for the updated block
    try {
      const embedding = await generateBlockEmbedding({
        blockNumber: validated.data.blockNumber,
        category: validated.data.category,
        title: validated.data.title,
        description: validated.data.description,
      });
      await updateBlockEmbedding(validated.data.id, embedding);
    } catch (error) {
      console.error('Failed to regenerate embedding for updated block:', error);
      // Don't fail the entire operation if embedding fails
    }

    // Fetch the updated block
    const blockWithRelations = await getBlockById(validated.data.id, team.id);

    revalidatePath(`/app/library/collections/${existingBlock.collection_id}`);

    return { success: 'Block updated successfully', data: blockWithRelations };
  } catch (error) {
    console.error('Failed to update block:', error);
    return { error: 'Failed to update block' };
  }
};

const deleteBlockSchema = z.object({
  id: z.number(),
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
    // Get the existing block to verify ownership and get collection_id
    const existingBlock = await getBlockById(validated.data.id, team.id);
    if (!existingBlock) {
      return { error: 'Block not found' };
    }

    // Delete the block
    const deleted = await deleteBlock(validated.data.id, team.id);
    if (!deleted) {
      return { error: 'Failed to delete block' };
    }

    revalidatePath(`/app/library/collections/${existingBlock.collection_id}`);

    return { success: 'Block deleted successfully' };
  } catch (error) {
    console.error('Failed to delete block:', error);
    return { error: 'Failed to delete block' };
  }
};

const bulkCreateCollectionBlocksSchema = z.object({
  collectionId: z.number(),
  blocks: z.array(z.object({
    category: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
  })),
});

export const bulkCreateCollectionBlocksAction = async (data: z.infer<typeof bulkCreateCollectionBlocksSchema>) => {
  const user = await getUser();
  if (!user) {
    return { error: 'User is not authenticated' };
  }

  const validated = bulkCreateCollectionBlocksSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.errors[0].message };
  }

  const team = await getTeamForUser();
  if (!team) {
    return { error: 'No team found' };
  }

  try {
    // Verify the collection belongs to the user's team
    const collection = await getCollectionById(validated.data.collectionId, team.id);
    if (!collection) {
      return { error: 'Collection not found' };
    }

    // Prepare blocks for bulk insert
    const blocksWithMetadata = validated.data.blocks.map(b => ({
      collection_id: validated.data.collectionId,
      block_number: null,
      category: b.category || null,
      title: b.title || null,
      description: b.description || null,
      updated_by: user.id,
      team_id: team.id,
    }));

    // Bulk insert blocks
    const createdBlocks = await bulkCreateBlocks(blocksWithMetadata);

    // Generate embeddings for all created blocks
    let embeddingsGenerated = 0;
    let embeddingsFailed = 0;

    for (let i = 0; i < createdBlocks.length; i++) {
      const block = createdBlocks[i];
      const blockInput = validated.data.blocks[i];
      try {
        const embedding = await generateBlockEmbedding({
          category: blockInput.category,
          title: blockInput.title,
          description: blockInput.description,
        });
        await updateBlockEmbedding(block.id, embedding);
        embeddingsGenerated++;
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Failed to generate embedding for block ${block.id}:`, error);
        embeddingsFailed++;
      }
    }

    revalidatePath(`/app/library/collections/${validated.data.collectionId}`);

    const embeddingMessage = embeddingsFailed > 0
      ? ` (${embeddingsGenerated} embeddings generated, ${embeddingsFailed} failed)`
      : ` with embeddings`;

    return { success: `${validated.data.blocks.length} blocks imported successfully${embeddingMessage}` };
  } catch (error) {
    console.error('Failed to bulk create blocks:', error);
    return { error: 'Failed to import blocks' };
  }
};

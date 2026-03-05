import { embed } from 'ai';
import { openai } from '@ai-sdk/openai';
import { createClient } from '@/lib/supabase/server';

const embeddingModel = openai.embedding('text-embedding-3-small');

/**
 * Generate a single embedding vector for a text query.
 */
export async function generateEmbedding(value: string): Promise<number[]> {
  const input = value.replaceAll('\n', ' ');
  const { embedding } = await embed({
    model: embeddingModel,
    value: input,
  });
  return embedding;
}

/**
 * Combine content block fields into a single text for embedding.
 */
export function combineBlockText(block: {
  blockNumber?: string | null;
  category?: string | null;
  title?: string | null;
  description?: string | null;
}): string {
  const parts = [];

  if (block.category) parts.push(`Category: ${block.category}`);
  if (block.blockNumber) parts.push(`Block Number: ${block.blockNumber}`);
  if (block.title) parts.push(`Title: ${block.title}`);
  if (block.description) parts.push(`Description: ${block.description}`);

  return parts.join('. ');
}

/**
 * Generate embedding for a content block.
 */
export async function generateBlockEmbedding(block: {
  blockNumber?: string | null;
  category?: string | null;
  title?: string | null;
  description?: string | null;
}): Promise<number[]> {
  const text = combineBlockText(block);

  if (!text) {
    throw new Error('No text to generate embedding from');
  }

  return generateEmbedding(text);
}

/**
 * Search content_blocks by vector similarity for the chat RAG tool.
 */
export async function findRelevantContent(userQuery: string, teamId: number) {
  const userQueryEmbedded = await generateEmbedding(userQuery);
  const supabase = await createClient();

  const vectorString = `[${userQueryEmbedded.join(',')}]`;

  const { data: allResults, error } = await supabase.rpc('search_similar_blocks', {
    p_query_vector: vectorString,
    p_team_id: teamId,
    p_limit: 10,
  });

  if (error) {
    console.error('Error in vector search:', error);
    return { contentBlocks: [] };
  }

  const similarGuides = (allResults || []).filter((r: any) => (r.similarity || 0) > 0.35);

  const formattedBlocks = similarGuides.map((guide: any) => ({
    source: 'content_blocks',
    title: guide.title,
    description: guide.description,
    content: `${guide.title}: ${guide.description}`,
    similarity: guide.similarity,
  }));

  return {
    contentBlocks: formattedBlocks,
  };
}

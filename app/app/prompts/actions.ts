'use server';

import { z } from 'zod';
import { validatedActionWithUser } from '@/lib/auth/middleware';
import {
  createSystemPrompt,
  updateSystemPrompt,
  deleteSystemPrompt,
  getAllSystemPrompts,
  getActiveSystemPrompt,
  getTeamForUser
} from '@/lib/db/supabase-queries';

const createPromptSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  prompt: z.string().min(1, 'Prompt is required'),
  setAsActive: z.coerce.boolean().optional().default(false),
});

export const createPromptAction = validatedActionWithUser(
  createPromptSchema,
  async (data, _, user) => {
    try {
      const team = await getTeamForUser();
      if (!team) {
        return { error: 'No team found' };
      }

      const newPrompt = await createSystemPrompt({
        team_id: team.id,
        name: data.name,
        prompt: data.prompt,
        is_active: data.setAsActive
      });

      return { success: true, data: newPrompt };
    } catch (error) {
      console.error('Error creating prompt:', error);
      return { error: 'Failed to create prompt' };
    }
  }
);

const updatePromptSchema = z.object({
  promptId: z.coerce.number(),
  name: z.string().min(1).max(255).optional(),
  prompt: z.string().min(1).optional(),
  isActive: z.coerce.boolean().optional(),
});

export const updatePromptAction = validatedActionWithUser(
  updatePromptSchema,
  async (data, _, user) => {
    try {
      console.log('📝 updatePromptAction called with:', data);
      
      const team = await getTeamForUser();
      if (!team) {
        console.error('❌ No team found for user:', user.id);
        return { error: 'No team found' };
      }

      const { promptId, name, prompt, isActive } = data;
      console.log('📝 Updating prompt:', { promptId, name, prompt, isActive, teamId: team.id });

      const updatedPrompt = await updateSystemPrompt(
        promptId,
        team.id,
        {
          name,
          prompt,
          is_active: isActive
        }
      );

      if (!updatedPrompt) {
        console.error('❌ Prompt not found:', promptId);
        return { error: 'Prompt not found' };
      }

      console.log('✅ Prompt updated successfully:', updatedPrompt);
      return { success: true, data: updatedPrompt };
    } catch (error) {
      console.error('❌ Error updating prompt:', error);
      console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
      return { error: 'Failed to update prompt' };
    }
  }
);

const deletePromptSchema = z.object({
  promptId: z.coerce.number(),
});

export const deletePromptAction = validatedActionWithUser(
  deletePromptSchema,
  async (data, _, user) => {
    try {
      const team = await getTeamForUser();
      if (!team) {
        return { error: 'No team found' };
      }

      await deleteSystemPrompt(data.promptId, team.id);

      return { success: true };
    } catch (error) {
      console.error('Error deleting prompt:', error);
      return { error: 'Failed to delete prompt' };
    }
  }
);
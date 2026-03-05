'use server';

import { z } from 'zod';
import {
  updateOrganization,
  logActivity,
  getTeamForUser
} from '@/lib/db/supabase-queries';
import { validatedActionWithUser } from '@/lib/auth/middleware';
import { ActivityType } from '@/lib/db/schema';
import { organizationStatusSchema } from '@/lib/constants/organization';

const updateOrganizationSchema = z.object({
  id: z.coerce.number(),
  name: z.string().min(1, 'Organization name is required').max(255),
  description: z.string().optional(),
  website: z.string()
    .transform((val) => {
      if (!val) return '';
      // Add https:// if no protocol is specified
      if (val && !val.match(/^https?:\/\//)) {
        return `https://${val}`;
      }
      return val;
    })
    .pipe(z.string().url().optional().or(z.literal(''))),
  industry: z.string().optional(),
  location: z.string().optional(),
  size: z.string().optional(),
  status: organizationStatusSchema.optional(),
});

export const updateOrganizationAction = validatedActionWithUser(
  updateOrganizationSchema,
  async (data, _, user) => {
    const team = await getTeamForUser();
    if (!team) {
      return { error: 'No team found' };
    }

    try {
      const result = await updateOrganization(
        data.id,
        team.id,
        {
          name: data.name,
          description: data.description || null,
          website: data.website || null,
          industry: data.industry || null,
          location: data.location || null,
          size: data.size || null,
          status: data.status || 'Lead',
        }
      );

      if (!result) {
        return { error: 'Organization not found or unauthorized' };
      }

      await logActivity(team.id, user.id, ActivityType.UPDATE_ORGANIZATION);

      return { success: true };
    } catch (error) {
      console.error('Failed to update organization:', error);
      return { error: 'Failed to update organization' };
    }
  }
);

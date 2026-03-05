import { z } from 'zod';

export const TEAM_ROLES = ['member', 'owner'] as const;
export type TeamRole = (typeof TEAM_ROLES)[number];
export const teamRoleSchema = z.enum(TEAM_ROLES);

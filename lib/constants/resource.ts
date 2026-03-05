import { z } from 'zod';

export const RESOURCE_TYPES = ['marketing', 'docs', 'support', 'other'] as const;
export type ResourceType = (typeof RESOURCE_TYPES)[number];
export const resourceTypeSchema = z.enum(RESOURCE_TYPES);
export const DEFAULT_RESOURCE_TYPE: ResourceType = 'other';

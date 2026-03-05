/**
 * Security allowlists for content slugs
 * Only slugs in these lists will be accessible to prevent directory traversal attacks
 */

import { ContentType } from './types';

export const blogSlugs = [] as const;

export const helpSlugs = [
  'getting-started-guide',
] as const;

export const legalSlugs = [
  'privacy-policy',
  'terms-of-service',
] as const;

export type BlogSlug = (typeof blogSlugs)[number];
export type HelpSlug = (typeof helpSlugs)[number];
export type LegalSlug = (typeof legalSlugs)[number];

/**
 * Get the allowlist for a specific content type
 */
export function getAllowlist(type: ContentType): readonly string[] {
  switch (type) {
    case 'blog':
      return blogSlugs;
    case 'help':
      return helpSlugs;
    case 'legal':
      return legalSlugs;
    default:
      return [];
  }
}

/**
 * Check if a slug is valid for a given content type
 */
export function isValidSlug(type: ContentType, slug: string): boolean {
  const allowlist = getAllowlist(type);
  return allowlist.includes(slug);
}

/**
 * Get all valid slugs across all content types (for legacy support)
 */
export function getAllSlugs(): string[] {
  return [...blogSlugs, ...helpSlugs, ...legalSlugs];
}

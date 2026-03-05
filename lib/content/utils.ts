/**
 * Content utilities for reading and parsing MDX content
 */

import { readFile, readdir } from 'fs/promises';
import { join } from 'path';
import matter from 'gray-matter';
import { ContentType, ContentItem, ContentListItem, ContentFrontmatter } from './types';
import { isValidSlug, getAllowlist } from './allowlists';

/**
 * Get the directory path for a content type
 */
function getContentDirectory(type: ContentType): string {
  return join(process.cwd(), 'content', type);
}

/**
 * Get a single content item by type and slug
 */
export async function getContentBySlug(
  type: ContentType,
  slug: string
): Promise<ContentItem | null> {
  try {
    // Validate slug against allowlist
    if (!isValidSlug(type, slug)) {
      return null;
    }

    const filePath = join(getContentDirectory(type), `${slug}.mdx`);
    const fileContent = await readFile(filePath, 'utf-8');
    const { content, data } = matter(fileContent);

    return {
      slug,
      type,
      frontmatter: data as ContentFrontmatter,
      content,
    };
  } catch (error) {
    console.error(`Error reading content ${type}/${slug}:`, error);
    return null;
  }
}

/**
 * Get all content items for a specific type
 */
export async function getContentByType(type: ContentType): Promise<ContentListItem[]> {
  try {
    const directory = getContentDirectory(type);
    const allowlist = getAllowlist(type);

    // Only read files that are in the allowlist
    const items = await Promise.all(
      allowlist.map(async (slug) => {
        try {
          const filePath = join(directory, `${slug}.mdx`);
          const fileContent = await readFile(filePath, 'utf-8');
          const { data } = matter(fileContent);
          const frontmatter = data as ContentFrontmatter;

          // Default published to true if not specified
          const isPublished = frontmatter.published !== false;

          return {
            slug,
            type,
            title: frontmatter.title || 'Untitled',
            description: frontmatter.description || '',
            date: frontmatter.date || '',
            featured: frontmatter.featured || false,
            published: isPublished,
            image: frontmatter.image || null,
            author: frontmatter.author,
            tags: frontmatter.tags,
            order: frontmatter.order,
            category: frontmatter.category,
          };
        } catch {
          // File doesn't exist or can't be read
          return null;
        }
      })
    );

    // Filter out nulls and unpublished content, then sort
    const validItems = items
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .filter((item) => item.published);

    // Sort by order first (for help articles), then by date (newest first)
    return validItems.sort((a, b) => {
      // If both have order, sort by order
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      // If only one has order, prioritize it
      if (a.order !== undefined) return -1;
      if (b.order !== undefined) return 1;
      // Otherwise sort by date
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  } catch (error) {
    console.error(`Error reading content type ${type}:`, error);
    return [];
  }
}

/**
 * Get featured content items for a specific type
 */
export async function getFeaturedContent(type: ContentType): Promise<ContentListItem[]> {
  const items = await getContentByType(type);
  return items.filter((item) => item.featured);
}

/**
 * Get all content across all types
 */
export async function getAllContent(): Promise<ContentListItem[]> {
  const [blog, help, legal] = await Promise.all([
    getContentByType('blog'),
    getContentByType('help'),
    getContentByType('legal'),
  ]);

  return [...blog, ...help, ...legal];
}

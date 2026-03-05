/**
 * Content types for blog, help, and legal content
 */

export type ContentType = 'blog' | 'help' | 'legal';

export interface ContentFrontmatter {
  title: string;
  description?: string;
  date?: string;
  author?: string;
  tags?: string[];
  featured?: boolean;
  published?: boolean; // Defaults to true if not specified
  image?: string;
  // Help-specific fields
  order?: number;
  category?: string;
}

export interface ContentItem {
  slug: string;
  type: ContentType;
  frontmatter: ContentFrontmatter;
  content?: string;
}

export interface ContentListItem {
  slug: string;
  type: ContentType;
  title: string;
  description: string;
  date: string;
  featured: boolean;
  published: boolean;
  image: string | null;
  author?: string;
  tags?: string[];
  order?: number;
  category?: string;
}

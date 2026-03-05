import { NextRequest, NextResponse } from 'next/server';
import { serialize } from 'next-mdx-remote/serialize';
import { getContentBySlug, ContentType } from '@/lib/content';

const validTypes = ['blog', 'help', 'legal'] as const;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; slug: string }> }
) {
  try {
    const { type, slug } = await params;

    // Validate content type
    if (!validTypes.includes(type as ContentType)) {
      return NextResponse.json(
        { error: `Invalid content type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    const contentType = type as ContentType;
    const content = await getContentBySlug(contentType, slug);

    if (!content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    // Serialize MDX for client-side rendering (used by help-article-dialog)
    const mdxSource = await serialize(content.content || '');

    return NextResponse.json({
      slug: content.slug,
      type: content.type,
      frontmatter: content.frontmatter,
      mdxSource,
    });
  } catch (error) {
    console.error('Error loading content:', error);
    return NextResponse.json({ error: 'Failed to load content' }, { status: 500 });
  }
}

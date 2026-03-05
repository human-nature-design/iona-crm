import { NextRequest, NextResponse } from 'next/server';
import { getContentByType, getFeaturedContent, ContentType } from '@/lib/content';

const validTypes = ['blog', 'help', 'legal'] as const;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params;

    // Validate content type
    if (!validTypes.includes(type as ContentType)) {
      return NextResponse.json(
        { error: `Invalid content type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    const contentType = type as ContentType;
    const [content, featured] = await Promise.all([
      getContentByType(contentType),
      getFeaturedContent(contentType),
    ]);

    return NextResponse.json({
      type: contentType,
      content,
      featured,
      total: content.length,
    });
  } catch (error) {
    console.error('Error loading content:', error);
    return NextResponse.json({ error: 'Failed to load content' }, { status: 500 });
  }
}

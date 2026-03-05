import { NextResponse } from 'next/server';
import { getAllContent } from '@/lib/content';

export async function GET() {
  try {
    const content = await getAllContent();

    return NextResponse.json({
      content,
      total: content.length,
    });
  } catch (error) {
    console.error('Error loading content:', error);
    return NextResponse.json({ error: 'Failed to load content' }, { status: 500 });
  }
}

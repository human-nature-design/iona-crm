import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { serialize } from 'next-mdx-remote/serialize';
import matter from 'gray-matter';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Security: Only allow specific article slugs to prevent directory traversal
    const allowedSlugs = [
      'building-sales-engineering-prompts',
      'sales-engineering-prompt-engineering',
      'keeping-product-knowledge-fresh',
      'getting-started-guide'
    ];

    if (!allowedSlugs.includes(slug)) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Read the MDX file from the filesystem
    const filePath = join(process.cwd(), 'content', 'articles', `${slug}.mdx`);
    const fileContent = await readFile(filePath, 'utf-8');

    // Parse frontmatter
    const { content, data: frontmatter } = matter(fileContent);

    // Serialize the MDX content on the server
    const mdxSource = await serialize(content);

    return NextResponse.json({ mdxSource, frontmatter });
  } catch (error) {
    console.error('Error reading article:', error);

    // Check if it's a file not found error
    if ((error as any)?.code === 'ENOENT') {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    return NextResponse.json(
      { error: 'Failed to load article' },
      { status: 500 }
    );
  }
} 
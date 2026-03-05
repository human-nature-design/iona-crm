import { NextResponse } from 'next/server';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import matter from 'gray-matter';

export async function GET() {
  try {
    const articlesDirectory = join(process.cwd(), 'content', 'articles');
    const filenames = await readdir(articlesDirectory);

    // Filter only .mdx files
    const mdxFiles = filenames.filter((filename) => filename.endsWith('.mdx'));

    // Read and parse each article's frontmatter
    const articles = await Promise.all(
      mdxFiles.map(async (filename) => {
        const filePath = join(articlesDirectory, filename);
        const fileContent = await readFile(filePath, 'utf-8');
        const { data: frontmatter } = matter(fileContent);

        // Extract slug from filename (remove .mdx extension)
        const slug = filename.replace(/\.mdx$/, '');

        return {
          slug,
          title: frontmatter.title || 'Untitled',
          description: frontmatter.description || '',
          date: frontmatter.date || '',
          featured: frontmatter.featured || false,
          image: frontmatter.image || null,
        };
      })
    );

    // Sort by date (newest first) and filter featured articles
    const sortedArticles = articles.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    const featuredArticles = sortedArticles.filter((article) => article.featured);

    return NextResponse.json({
      articles: sortedArticles,
      featured: featuredArticles,
    });
  } catch (error) {
    console.error('Error reading articles:', error);
    return NextResponse.json(
      { error: 'Failed to load articles' },
      { status: 500 }
    );
  }
}

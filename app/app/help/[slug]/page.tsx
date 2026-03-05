import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { format } from 'date-fns';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Calendar, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { appMdxComponents } from '@/components/mdx';
import { getContentBySlug, helpSlugs } from '@/lib/content';

interface HelpArticlePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return helpSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: HelpArticlePageProps) {
  const { slug } = await params;
  const article = await getContentBySlug('help', slug);

  if (!article) {
    return { title: 'Article Not Found' };
  }

  return {
    title: article.frontmatter.title,
    description: article.frontmatter.description,
  };
}

export default async function HelpArticlePage({ params }: HelpArticlePageProps) {
  const { slug } = await params;
  const article = await getContentBySlug('help', slug);

  if (!article) {
    notFound();
  }

  const { frontmatter, content } = article;

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto p-6 md:p-8">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/app' },
            { label: 'Help center', href: '/app/help' },
          ]}
          currentPage={frontmatter.title}
        />

        {/* Article header with metadata */}
        <header className="mb-8 pb-8 border-b border-gray-700">
          <h1 className="text-4xl font-bold text-white mb-4">{frontmatter.title}</h1>

          {frontmatter.description && (
            <p className="text-lg text-gray-300 mb-4 leading-relaxed">
              {frontmatter.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {frontmatter.date && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <time dateTime={frontmatter.date}>
                  {format(new Date(frontmatter.date), 'MMMM d, yyyy')}
                </time>
              </div>
            )}
          </div>

          {frontmatter.tags && frontmatter.tags.length > 0 && (
            <div className="flex items-start gap-2 mt-4">
              <Tag className="h-4 w-4 mt-1 text-muted-foreground shrink-0" />
              <div className="flex flex-wrap gap-2">
                {frontmatter.tags.map((tag: string) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-gray-800 text-gray-300 hover:bg-gray-700"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </header>

        {/* Article content */}
        <article className="prose prose-invert max-w-none [&>h1:first-child]:hidden">
          <MDXRemote source={content!} components={appMdxComponents} />
        </article>
      </div>
    </div>
  );
}

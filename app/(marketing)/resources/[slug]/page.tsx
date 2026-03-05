import { redirect } from 'next/navigation';

interface ResourcePageProps {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * Legacy redirect for /resources/[slug] to new locations:
 * - privacy-policy, terms-of-service -> /legal/[slug]
 * - getting-started-guide -> /help/[slug]
 * - blog posts -> /blog/[slug]
 */
export default async function ResourceRedirectPage({ params }: ResourcePageProps) {
  const { slug } = await params;

  // Legal pages
  if (slug === 'privacy-policy' || slug === 'terms-of-service') {
    redirect(`/legal/${slug}`);
  }

  // Help articles
  if (slug === 'getting-started-guide') {
    redirect(`/help/${slug}`);
  }

  // Blog posts
  if (
    slug === 'keeping-product-knowledge-fresh' ||
    slug === 'sales-engineering-prompt-engineering'
  ) {
    redirect(`/blog/${slug}`);
  }

  // Default: redirect to help center
  redirect('/help');
}

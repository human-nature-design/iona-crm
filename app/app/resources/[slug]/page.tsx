import { redirect } from 'next/navigation';

interface ResourcePageProps {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * Legacy redirect for /app/resources/[slug] to new help pages
 */
export default async function ResourceRedirectPage({ params }: ResourcePageProps) {
  const { slug } = await params;

  // Help articles
  if (slug === 'getting-started-guide') {
    redirect(`/app/help/${slug}`);
  }

  // Blog posts - redirect to marketing blog
  if (
    slug === 'keeping-product-knowledge-fresh' ||
    slug === 'sales-engineering-prompt-engineering'
  ) {
    redirect(`/blog/${slug}`);
  }

  // Legal pages - redirect to marketing legal
  if (slug === 'privacy-policy' || slug === 'terms-of-service') {
    redirect(`/legal/${slug}`);
  }

  // Default: redirect to app help center
  redirect('/app/help');
}

'use client';

import useSWR from 'swr';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Article {
  slug: string;
  title: string;
  description: string;
  date: string;
  featured: boolean;
  image: string | null;
}

export function HelpArticlesSection() {
  const { data, error, isLoading } = useSWR<{ featured: Article[] }>(
    '/api/articles',
    fetcher
  );

  if (isLoading) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Help articles and resources</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 bg-muted animate-pulse rounded mb-2" />
                <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Help articles and resources</h2>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              Failed to load help articles
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const featuredArticles = data?.featured || [];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Help articles and resources</h2>

      {featuredArticles.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No help articles available yet
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {featuredArticles.slice(0, 3).map((article) => (
            <Link
              key={article.slug}
              href={`/app/help/${article.slug}`}
            >
              <Card className="hover:bg-accent transition-colors cursor-pointer group h-full">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Image Column */}
                    {article.image ? (
                      <div className="relative w-[100px] h-[100px] shrink-0 rounded-md overflow-hidden bg-gray-800">
                        <Image
                          src={article.image}
                          alt={article.title}
                          fill
                          className="object-cover"
                          sizes="100px"
                        />
                      </div>
                    ) : (
                      <div className="w-[100px] h-[100px] shrink-0 rounded-md bg-gray-800 flex items-center justify-center">
                        <BookOpen className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}

                    {/* Content Column */}
                    <div className="flex-1 min-w-0 flex flex-col">
                      <CardTitle className="text-base group-hover:text-primary transition-colors line-clamp-2 mb-2">
                        {article.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2 text-sm mb-2">
                        {article.description}
                      </CardDescription>
                      {article.date && (
                        <div className="flex items-center gap-1 mt-auto text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {format(new Date(article.date), 'MMM d, yyyy')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

import Link from 'next/link';
import { format } from 'date-fns';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, HelpCircle, Mail } from 'lucide-react';
import { getContentByType } from '@/lib/content';

export const metadata = {
  title: 'Help center',
};

export default async function HelpCenterPage() {
  const articles = await getContentByType('help');

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto p-6 md:p-8">
        <Breadcrumbs items={[{ label: 'Home', href: '/app' }]} currentPage="Help center" />

        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Help center</h1>
          <p className="text-gray-400">Find guides, tutorials, and answers to common questions.</p>
        </header>

        {/* Quick Links */}
        <div className="grid gap-4 md:grid-cols-2 mb-8">
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
                  <BookOpen className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <CardTitle className="text-white mb-1">Getting started</CardTitle>
                  <CardDescription>
                    Learn the basics and get started in minutes.
                  </CardDescription>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
                  <Mail className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <CardTitle className="text-white mb-1">Contact support</CardTitle>
                  <CardDescription>
                    Can't find what you need? Reach out to our team.
                  </CardDescription>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Help Articles */}
        <section>
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-muted-foreground" />
            Help articles
          </h2>

          {articles.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="py-12 text-center">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No help articles available yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {articles.map((article) => (
                <Link key={article.slug} href={`/app/help/${article.slug}`}>
                  <Card className="bg-card border-border hover:bg-muted transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base text-white mb-1">
                            {article.title}
                          </CardTitle>
                          {article.description && (
                            <CardDescription className="line-clamp-1">
                              {article.description}
                            </CardDescription>
                          )}
                        </div>
                        {article.date && (
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {format(new Date(article.date), 'MMM d, yyyy')}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

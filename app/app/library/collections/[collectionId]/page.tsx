import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getTeamForUser, getCollectionById } from '@/lib/db/supabase-queries';
import CollectionDetails from './collection-details';

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ collectionId: string }>;
}) {
  const team = await getTeamForUser();

  if (!team) {
    notFound();
  }

  const { collectionId: collectionIdParam } = await params;
  const collectionId = parseInt(collectionIdParam);
  if (isNaN(collectionId)) {
    notFound();
  }

  const collection = await getCollectionById(collectionId, team.id);

  if (!collection) {
    notFound();
  }

  return (
    <section className="flex-1 p-4 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <Link href="/app/library">
          <Button variant="ghost" size="sm" className="mb-6 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to collections
          </Button>
        </Link>

        <CollectionDetails collection={collection} />
      </div>
    </section>
  );
}

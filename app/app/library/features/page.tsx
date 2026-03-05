import { Suspense } from 'react';
import { getTeamForUser, getBlocksForTeam, getCollectionById, getBlocksForCollection } from '@/lib/db/supabase-queries';
import FeatureTable from './feature-table';
import UploadCsvDialog from './upload-csv-dialog';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default async function ContentBlocksPage({
  searchParams,
}: {
  searchParams: Promise<{ collectionId?: string }>;
}) {
  const team = await getTeamForUser();

  if (!team) {
    return (
      <section className="p-6 lg:p-8">
        <h1 className="text-2xl font-bold text-white mb-4">Content blocks</h1>
        <p className="text-gray-400">No team found. Please contact support.</p>
      </section>
    );
  }

  // Check if we're viewing blocks for a specific collection
  const params = await searchParams;
  const collectionId = params.collectionId ? parseInt(params.collectionId) : null;
  let blocks;
  let collection = null;

  if (collectionId && !isNaN(collectionId)) {
    // Get blocks for specific collection
    collection = await getCollectionById(collectionId, team.id);
    if (collection) {
      blocks = await getBlocksForCollection(collectionId, team.id);
    } else {
      // Invalid collection ID, fallback to all blocks
      blocks = await getBlocksForTeam(team.id);
    }
  } else {
    // Get all blocks for the team
    blocks = await getBlocksForTeam(team.id);
  }

  return (
    <section className="p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          {collection && (
            <Link href="/app/library">
              <Button variant="ghost" size="sm" className="mb-2">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to collections
              </Button>
            </Link>
          )}
          <h1 className="text-2xl font-bold text-white mb-1">
            {collection ? `${collection.name} blocks` : 'Content blocks'}
          </h1>
          <p className="text-sm text-gray-400">
            {collection
              ? `Manage blocks for ${collection.name}`
              : 'Manage your content blocks and specifications'
            }
          </p>
        </div>
        <UploadCsvDialog collectionId={collectionId} />
      </div>

      <Suspense fallback={<div className="text-gray-400">Loading blocks...</div>}>
        <FeatureTable
          initialFeatures={blocks}
          teamId={team.id}
          collectionId={collectionId}
        />
      </Suspense>
    </section>
  );
}
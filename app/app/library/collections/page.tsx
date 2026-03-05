import { Suspense } from 'react';
import { getTeamForUser, getCollectionsForTeam } from '@/lib/db/supabase-queries';
import CollectionList from './collection-list';
import AddCollectionDialog from './add-collection-dialog';

export default async function CollectionLibraryPage() {
  const team = await getTeamForUser();

  if (!team) {
    return (
      <section className="flex-1 p-4 lg:p-8">
        <h1 className="text-lg lg:text-2xl font-medium mb-6">Collection library</h1>
        <p className="text-muted-foreground">No team found. Please contact support.</p>
      </section>
    );
  }

  const collections = await getCollectionsForTeam(team.id);

  return (
    <section className="flex-1 p-4 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-lg lg:text-2xl font-medium">Collection library</h1>
        <AddCollectionDialog />
      </div>

      <Suspense fallback={<div className="text-muted-foreground">Loading collections...</div>}>
        <CollectionList initialCollections={collections} teamId={team.id} />
      </Suspense>
    </section>
  );
}

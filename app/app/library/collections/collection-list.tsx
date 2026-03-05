'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Trash2, MoreHorizontal } from 'lucide-react';
import { ProductIcon } from '@/components/icon-picker';
import DeleteCollectionDialog from './delete-collection-dialog';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CollectionWithBlocks {
  id: number;
  name: string;
  owner: string;
  icon?: string | null;
  created_at: string;
  updated_at: string;
  blocks: Array<{ count: number }>;
}

interface CollectionListProps {
  initialCollections: CollectionWithBlocks[];
  teamId: number;
}

export default function CollectionList({ initialCollections }: CollectionListProps) {
  const router = useRouter();
  const [deleteCollection, setDeleteCollection] = useState<CollectionWithBlocks | null>(null);

  const handleCardClick = (collectionId: number) => {
    router.push(`/app/library/collections/${collectionId}`);
  };

  if (initialCollections.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <p className="text-muted-foreground mb-4">No collections found</p>
          <p className="text-sm text-muted-foreground">
            Click the "Add collection" button to create your first collection
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {initialCollections.map((collection) => (
          <Card
            key={collection.id}
            className="cursor-pointer hover:bg-accent/50 transition-colors group relative"
            onClick={() => handleCardClick(collection.id)}
          >
            <CardContent className="p-5">
              {/* Menu in top right */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteCollection(collection);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Icon */}
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <ProductIcon
                  icon={collection.icon}
                  className="h-6 w-6 text-primary"
                />
              </div>

              {/* Collection name */}
              <h3 className="font-semibold text-foreground truncate mb-1">
                {collection.name}
              </h3>

              {/* Owner */}
              <p className="text-sm text-muted-foreground truncate mb-3">
                {collection.owner}
              </p>

              {/* Footer info */}
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/50">
                <span>{collection.blocks[0]?.count ?? 0} blocks</span>
                <span>{format(new Date(collection.updated_at), 'MMM d, yyyy')}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {deleteCollection && (
        <DeleteCollectionDialog
          collection={deleteCollection}
          open={!!deleteCollection}
          onOpenChange={(open) => !open && setDeleteCollection(null)}
        />
      )}
    </>
  );
}

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Package, MoreHorizontal, Eye, Trash2 } from 'lucide-react';
import { DataTable, Column } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CollectionWithBlocks {
  id: number;
  name: string;
  owner: string;
  created_at: string;
  updated_at: string;
  blocks: Array<{ id: number }> | { count: number }[];
}

interface CollectionsTableProps {
  collections: CollectionWithBlocks[];
  onDelete?: (collection: CollectionWithBlocks) => void;
}

export function CollectionsTable({ collections, onDelete }: CollectionsTableProps) {
  const router = useRouter();
  const [sortKey, setSortKey] = React.useState<string>('updated_at');
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('desc');

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  const getBlockCount = (collection: CollectionWithBlocks) => {
    if (!collection.blocks || collection.blocks.length === 0) return 0;
    // Handle both { count: number } and { id: number } array formats
    const firstBlock = collection.blocks[0];
    if ('count' in firstBlock) {
      return firstBlock.count;
    }
    return collection.blocks.length;
  };

  const sortedCollections = React.useMemo(() => {
    return [...collections].sort((a, b) => {
      let aValue: any = a[sortKey as keyof CollectionWithBlocks];
      let bValue: any = b[sortKey as keyof CollectionWithBlocks];

      // Handle block count sorting
      if (sortKey === 'blocks') {
        aValue = getBlockCount(a);
        bValue = getBlockCount(b);
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        // Try to parse as date
        const aDate = new Date(aValue).getTime();
        const bDate = new Date(bValue).getTime();
        if (!isNaN(aDate) && !isNaN(bDate)) {
          return sortDirection === 'asc' ? aDate - bDate : bDate - aDate;
        }
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortDirection === 'asc'
        ? (aValue as any) - (bValue as any)
        : (bValue as any) - (aValue as any);
    });
  }, [collections, sortKey, sortDirection]);

  const columns: Column<CollectionWithBlocks>[] = [
    {
      key: 'name',
      label: 'Collection',
      sortable: true,
      className: 'w-[35%]',
      render: (collection) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Package className="h-4 w-4 text-primary" />
          </div>
          <span className="font-medium text-foreground group-hover:text-primary transition-colors">
            {collection.name}
          </span>
        </div>
      ),
    },
    {
      key: 'owner',
      label: 'Owner',
      sortable: true,
      render: (collection) => (
        <span className="text-sm text-muted-foreground">
          {collection.owner || '-'}
        </span>
      ),
    },
    {
      key: 'blocks',
      label: 'Blocks',
      sortable: true,
      render: (collection) => (
        <span className="text-sm text-muted-foreground tabular-nums">
          {getBlockCount(collection)} blocks
        </span>
      ),
    },
    {
      key: 'updated_at',
      label: 'Last updated',
      sortable: true,
      render: (collection) => (
        <span className="text-sm text-muted-foreground tabular-nums">
          {format(new Date(collection.updated_at), 'MMM d, yyyy')}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      sortable: false,
      className: 'w-12',
      render: (collection) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/app/library/collections/${collection.id}`);
              }}
            >
              <Eye className="mr-2 h-4 w-4" />
              View collection
            </DropdownMenuItem>
            {onDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(collection);
                  }}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const emptyState = (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="rounded-full bg-muted p-6 mb-4">
        <Package className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No collections found</h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm">
        Click the "New collection" button to create your first collection
      </p>
    </div>
  );

  return (
    <DataTable
      data={sortedCollections}
      columns={columns}
      onRowClick={(collection) => router.push(`/app/library/collections/${collection.id}`)}
      sortKey={sortKey}
      sortDirection={sortDirection}
      onSort={handleSort}
      emptyState={emptyState}
    />
  );
}

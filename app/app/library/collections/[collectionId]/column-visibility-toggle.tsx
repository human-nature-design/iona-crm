'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Columns3, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export interface BlockColumnVisibility {
  blockNumber: boolean;
  category: boolean;
  title: boolean;
  description: boolean;
  lastUpdated: boolean;
}

interface ColumnVisibilityToggleProps {
  visibility: BlockColumnVisibility;
  onVisibilityChange: (visibility: BlockColumnVisibility) => void;
}

const columns = [
  { key: 'blockNumber' as const, label: 'Block #' },
  { key: 'category' as const, label: 'Category' },
  { key: 'title' as const, label: 'Block' },
  { key: 'description' as const, label: 'Description' },
  { key: 'lastUpdated' as const, label: 'Last updated' },
];

export function ColumnVisibilityToggle({
  visibility,
  onVisibilityChange,
}: ColumnVisibilityToggleProps) {
  const [open, setOpen] = useState(false);

  const toggleColumn = (column: keyof BlockColumnVisibility) => {
    onVisibilityChange({
      ...visibility,
      [column]: !visibility[column],
    });
  };

  const visibleCount = Object.values(visibility).filter(v => v).length;
  const totalCount = columns.length;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-3 text-sm"
        >
          <Columns3 className="h-4 w-4 mr-2" />
          Columns
          {visibleCount < totalCount && (
            <span className="ml-2 text-xs text-muted-foreground">
              ({visibleCount}/{totalCount})
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {columns.map((column) => (
          <DropdownMenuItem
            key={column.key}
            className="flex items-center justify-between cursor-pointer"
            onSelect={(e) => {
              e.preventDefault();
              toggleColumn(column.key);
            }}
          >
            <span className="text-sm">{column.label}</span>
            <div
              className={cn(
                "ml-auto h-4 w-4 rounded-sm border flex items-center justify-center",
                visibility[column.key]
                  ? "bg-primary border-primary"
                  : "border-border"
              )}
            >
              {visibility[column.key] && (
                <Check className="h-3 w-3 text-primary-foreground" />
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const defaultBlockColumnVisibility: BlockColumnVisibility = {
  blockNumber: false,
  category: true,
  title: true,
  description: true,
  lastUpdated: false,
};

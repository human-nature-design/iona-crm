'use client';

import * as React from 'react';
import { X, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterGroup {
  key: string;
  label: string;
  options: FilterOption[];
  multiple?: boolean;
}

interface FilterPanelProps {
  groups: FilterGroup[];
  activeFilters: Record<string, string[]>;
  onFilterChange: (key: string, values: string[]) => void;
  onClearAll: () => void;
  className?: string;
}

export function FilterPanel({
  groups,
  activeFilters,
  onFilterChange,
  onClearAll,
  className,
}: FilterPanelProps) {
  const totalActiveFilters = Object.values(activeFilters).flat().length;

  const toggleFilter = (groupKey: string, value: string, multiple: boolean = false) => {
    const current = activeFilters[groupKey] || [];

    if (multiple) {
      const newValues = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      onFilterChange(groupKey, newValues);
    } else {
      const newValues = current.includes(value) ? [] : [value];
      onFilterChange(groupKey, newValues);
    }
  };

  const removeFilter = (groupKey: string, value: string) => {
    const current = activeFilters[groupKey] || [];
    onFilterChange(
      groupKey,
      current.filter((v) => v !== value)
    );
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm">Filters</h3>
          {totalActiveFilters > 0 && (
            <Badge variant="secondary" className="h-5 px-1.5 text-xs">
              {totalActiveFilters}
            </Badge>
          )}
        </div>
        {totalActiveFilters > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            Clear all
          </Button>
        )}
      </div>

      {/* Active Filters */}
      {totalActiveFilters > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(activeFilters).map(([groupKey, values]) =>
            values.map((value) => {
              const group = groups.find((g) => g.key === groupKey);
              const option = group?.options.find((o) => o.value === value);
              if (!option) return null;

              return (
                <Badge
                  key={`${groupKey}-${value}`}
                  variant="secondary"
                  className="gap-1 pr-1 transition-all duration-150 hover:bg-secondary/80"
                >
                  <span className="text-xs">{option.label}</span>
                  <button
                    onClick={() => removeFilter(groupKey, value)}
                    className="rounded-sm hover:bg-muted p-0.5 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              );
            })
          )}
        </div>
      )}

      {/* Filter Groups */}
      <div className="space-y-5">
        {groups.map((group) => (
          <div key={group.key} className="space-y-2">
            <h4 className="text-sm font-medium text-foreground/90">{group.label}</h4>
            <div className="space-y-1.5">
              {group.options.map((option) => {
                const isActive = (activeFilters[group.key] || []).includes(option.value);

                return (
                  <button
                    key={option.value}
                    onClick={() => toggleFilter(group.key, option.value, group.multiple)}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-1.5 rounded-md text-sm transition-all duration-150',
                      isActive
                        ? 'bg-primary/10 text-primary font-medium border border-primary/20'
                        : 'hover:bg-muted/50 text-foreground/80 hover:text-foreground border border-transparent'
                    )}
                  >
                    <span>{option.label}</span>
                    {option.count !== undefined && (
                      <span
                        className={cn(
                          'text-xs',
                          isActive ? 'text-primary/70' : 'text-muted-foreground'
                        )}
                      >
                        {option.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

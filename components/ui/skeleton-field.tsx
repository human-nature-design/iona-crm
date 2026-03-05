'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonFieldProps {
  label?: boolean;
  lines?: number;
  height?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const heightMap = {
  sm: 'h-8',
  md: 'h-10',
  lg: 'h-20',
  xl: 'h-32',
};

export function SkeletonField({
  label = true,
  lines = 1,
  height = 'md',
  className,
}: SkeletonFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <div className="h-4 w-20 bg-muted rounded animate-pulse" />
      )}
      {lines === 1 ? (
        <div className={cn('w-full bg-muted rounded animate-pulse', heightMap[height])} />
      ) : (
        <div className="space-y-2">
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              className="h-4 bg-muted rounded animate-pulse"
              style={{ width: i === lines - 1 ? '70%' : '100%' }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface SkeletonFormProps {
  fields?: number;
  className?: string;
}

export function SkeletonForm({ fields = 6, className }: SkeletonFormProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {Array.from({ length: fields }).map((_, i) => (
        <SkeletonField key={i} />
      ))}
      <div className="flex gap-3 pt-4">
        <div className="h-10 w-24 bg-muted rounded animate-pulse" />
        <div className="h-10 w-20 bg-muted rounded animate-pulse" />
      </div>
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('p-6 border border-border/50 rounded-lg space-y-4', className)}>
      <div className="h-6 w-32 bg-muted rounded animate-pulse" />
      <div className="space-y-2">
        <div className="h-4 w-full bg-muted rounded animate-pulse" />
        <div className="h-4 w-4/5 bg-muted rounded animate-pulse" />
      </div>
      <div className="flex gap-2">
        <div className="h-6 w-16 bg-muted rounded-full animate-pulse" />
        <div className="h-6 w-20 bg-muted rounded-full animate-pulse" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-lg border border-border/50 overflow-hidden">
      {/* Header */}
      <div className="bg-muted/30 p-4 border-b border-border/50 flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-4 bg-muted rounded animate-pulse flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="p-4 border-b border-border/30 last:border-0 flex gap-4"
        >
          {Array.from({ length: cols }).map((_, colIndex) => (
            <div
              key={colIndex}
              className="h-4 bg-muted rounded animate-pulse flex-1"
              style={{
                width: colIndex === 0 ? '25%' : 'auto',
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonStats({ cards = 5 }: { cards?: number }) {
  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4')}>
      {Array.from({ length: cards }).map((_, i) => (
        <div
          key={i}
          className="relative p-4 rounded-lg border border-border/50"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-2 flex-1">
              <div className="h-4 w-20 bg-muted rounded animate-pulse" />
              <div className="h-8 w-12 bg-muted rounded animate-pulse" />
            </div>
            <div className="h-9 w-9 rounded-md bg-muted/50 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

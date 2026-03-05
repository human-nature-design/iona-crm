import { SkeletonTable } from '@/components/ui/skeleton-field';

export default function OrganizationsLoading() {
  return (
    <div className="p-6 lg:p-8 space-y-6 animate-in fade-in duration-200">
      {/* Header Skeleton */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="h-9 w-48 bg-muted rounded animate-pulse" />
          <div className="h-5 w-80 bg-muted rounded animate-pulse hidden sm:block" />
        </div>
        <div className="h-9 w-9 sm:w-32 bg-muted rounded animate-pulse flex-shrink-0" />
      </div>

      {/* Search and Filter Skeleton */}
      <div className="flex gap-2">
        <div className="flex-1 h-10 bg-muted rounded animate-pulse" />
        <div className="h-10 w-10 bg-muted rounded animate-pulse flex-shrink-0" />
      </div>

      {/* Table Skeleton */}
      <SkeletonTable rows={5} cols={7} />
    </div>
  );
}

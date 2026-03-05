import { SkeletonTable } from '@/components/ui/skeleton-field';

export default function Loading() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <div className="h-9 w-48 bg-muted animate-pulse rounded" />
        <div className="h-5 w-80 bg-muted animate-pulse rounded mt-2" />
      </div>
      <SkeletonTable rows={5} cols={6} />
    </div>
  );
}

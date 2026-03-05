import { SkeletonForm } from '@/components/ui/skeleton-field';

export default function NewOrganizationLoading() {
  return (
    <div className="flex flex-col min-h-screen animate-in fade-in duration-200">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 w-full">
        {/* Breadcrumb Skeleton */}
        <div className="flex items-center gap-2">
          <div className="h-4 w-24 bg-muted rounded animate-pulse" />
          <div className="h-4 w-4 bg-muted rounded animate-pulse" />
          <div className="h-4 w-28 bg-muted rounded animate-pulse" />
        </div>

        {/* Header Skeleton */}
        <div className="space-y-2">
          <div className="h-9 w-64 bg-muted rounded animate-pulse" />
          <div className="h-5 w-96 bg-muted rounded animate-pulse" />
        </div>

        {/* Form Card Skeleton */}
        <div className="rounded-lg border border-border/50 overflow-hidden">
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <div className="h-5 w-40 bg-muted rounded animate-pulse" />
              <div className="h-4 w-80 bg-muted rounded animate-pulse" />
            </div>
            <SkeletonForm fields={8} />
          </div>
        </div>
      </div>
    </div>
  );
}

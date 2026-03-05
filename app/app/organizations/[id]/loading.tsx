import { SkeletonTable } from '@/components/ui/skeleton-field';

export default function OrganizationDetailLoading() {
  return (
    <div className="flex flex-col min-h-screen animate-in fade-in duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 w-full">
        {/* Breadcrumb Skeleton */}
        <div className="flex items-center gap-2">
          <div className="h-4 w-24 bg-muted rounded animate-pulse" />
          <div className="h-4 w-4 bg-muted rounded animate-pulse" />
          <div className="h-4 w-32 bg-muted rounded animate-pulse" />
        </div>

        {/* Hero Section Skeleton */}
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-xl bg-muted animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-64 bg-muted rounded animate-pulse" />
                <div className="h-6 w-16 bg-muted rounded-full animate-pulse" />
                <div className="h-6 w-24 bg-muted rounded-full animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-full max-w-2xl bg-muted rounded animate-pulse" />
                <div className="h-4 w-3/4 max-w-xl bg-muted rounded animate-pulse" />
              </div>
              <div className="flex items-center gap-4 mt-4">
                <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                <div className="h-4 w-28 bg-muted rounded animate-pulse" />
                <div className="h-4 w-36 bg-muted rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Organization Details Card Skeleton */}
        <div className="rounded-lg border border-border/50 overflow-hidden">
          <div className="p-6 space-y-4">
            <div className="h-6 w-32 bg-muted rounded animate-pulse" />
            <div className="grid gap-8 md:grid-cols-2">
              {/* First Column */}
              <div className="space-y-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                    <div className="h-10 bg-muted rounded animate-pulse" />
                  </div>
                ))}
              </div>
              {/* Second Column */}
              <div className="space-y-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                    <div className="h-10 bg-muted rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Contacts Section Skeleton */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <div className="h-6 w-40 bg-muted rounded animate-pulse" />
              <div className="h-4 w-48 bg-muted rounded animate-pulse" />
            </div>
          </div>
          <SkeletonTable rows={3} cols={4} />
        </div>
      </div>
    </div>
  );
}

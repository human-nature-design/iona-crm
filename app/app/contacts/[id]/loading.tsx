export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4 w-full">
        <div className="h-5 w-48 bg-muted animate-pulse rounded" />
        <div className="flex items-start gap-3">
          <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
          <div className="space-y-2 flex-1">
            <div className="h-7 w-56 bg-muted animate-pulse rounded" />
            <div className="h-4 w-80 bg-muted animate-pulse rounded" />
          </div>
        </div>
        <div className="h-64 bg-muted/30 animate-pulse rounded-lg border border-border/50" />
      </div>
    </div>
  );
}

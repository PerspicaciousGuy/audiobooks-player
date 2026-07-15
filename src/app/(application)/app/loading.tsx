export default function ApplicationLoading() {
  return (
    <div
      aria-label="Loading page"
      className="flex animate-pulse flex-col gap-8 py-12 motion-reduce:animate-none"
      role="status"
    >
      <div className="bg-surface-muted h-12 w-2/5 rounded-full" />
      <div className="bg-surface-muted rounded-panel h-80" />
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
        {Array.from(
          { length: 4 },
          (_, index) => `page-skeleton-${index + 1}`,
        ).map((skeletonId) => (
          <div
            className="bg-surface-muted rounded-card aspect-3/4"
            key={skeletonId}
          />
        ))}
      </div>
      <span className="sr-only">Loading Quiet Library</span>
    </div>
  );
}

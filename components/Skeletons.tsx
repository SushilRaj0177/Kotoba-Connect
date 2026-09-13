export function EntryCardSkeleton() {
  return (
    <div className="flex gap-3 rounded-2xl bg-ink-bg-secondary p-4 border-2 border-ink-border">
      <div className="skeleton h-10 w-10 flex-none rounded-full bg-ink-bg-input" />
      <div className="min-w-0 flex-1">
        <div className="skeleton mb-2 h-4 w-1/3 rounded bg-ink-bg-input" />
        <div className="skeleton mb-2 h-6 w-2/3 rounded bg-ink-bg-input" />
        <div className="skeleton h-4 w-1/2 rounded bg-ink-bg-input" />
      </div>
    </div>
  );
}

export function EntryListSkeleton() {
  return (
    <div className="space-y-3">
      <EntryCardSkeleton />
      <EntryCardSkeleton />
      <EntryCardSkeleton />
    </div>
  );
}

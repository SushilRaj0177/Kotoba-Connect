export function EntryCardSkeleton() {
  return (
    <div className="flex gap-3 px-3 py-2.5">
      <div className="skeleton h-10 w-10 flex-none rounded-full bg-discord-bg-input" />
      <div className="min-w-0 flex-1">
        <div className="skeleton mb-2 h-4 w-1/3 rounded bg-discord-bg-input" />
        <div className="skeleton mb-2 h-6 w-2/3 rounded bg-discord-bg-input" />
        <div className="skeleton h-4 w-1/2 rounded bg-discord-bg-input" />
      </div>
    </div>
  );
}

export function EntryListSkeleton() {
  return (
    <div>
      <EntryCardSkeleton />
      <EntryCardSkeleton />
      <EntryCardSkeleton />
    </div>
  );
}

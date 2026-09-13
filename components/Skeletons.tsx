export function EntryCardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="skeleton mb-3 h-6 w-2/3 rounded bg-slate-200" />
      <div className="skeleton mb-2 h-4 w-full rounded bg-slate-200" />
      <div className="skeleton h-4 w-1/2 rounded bg-slate-200" />
      <div className="mt-4 flex gap-2">
        <div className="skeleton h-6 w-16 rounded-full bg-slate-200" />
        <div className="skeleton h-6 w-16 rounded-full bg-slate-200" />
      </div>
    </div>
  );
}

export function EntryListSkeleton() {
  return (
    <div className="space-y-4">
      <EntryCardSkeleton />
      <EntryCardSkeleton />
      <EntryCardSkeleton />
    </div>
  );
}

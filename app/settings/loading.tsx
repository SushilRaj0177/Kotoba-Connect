import NavbarSkeleton from "@/components/skeletons/NavbarSkeleton";

function GroupSkeleton({ rows }: { rows: number }) {
  return (
    <div className="mb-6">
      <div className="skeleton mb-2 h-4 w-20 rounded bg-ink-bg-input" />
      <div className="divide-y divide-ink-border/70 overflow-hidden rounded-2xl border border-ink-border/70 bg-ink-bg-secondary">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3.5">
            <div className="skeleton h-8 w-8 flex-none rounded-full bg-ink-bg-input" />
            <div className="skeleton h-4 w-24 rounded bg-ink-bg-input" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <>
      <NavbarSkeleton />
      <main className="mx-auto max-w-lg px-4 py-6 sm:px-6 lg:max-w-3xl">
        <GroupSkeleton rows={3} />
        <GroupSkeleton rows={1} />
      </main>
    </>
  );
}

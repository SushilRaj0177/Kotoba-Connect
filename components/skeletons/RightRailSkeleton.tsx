export default function RightRailSkeleton() {
  return (
    <aside className="hidden w-72 flex-none space-y-5 lg:block">
      <div className="skeleton h-40 rounded-2xl bg-ink-bg-secondary" />
      <div className="skeleton h-56 rounded-2xl bg-ink-bg-secondary" />
    </aside>
  );
}

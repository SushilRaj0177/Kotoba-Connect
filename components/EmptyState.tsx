export default function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl bg-ink-bg-secondary px-6 py-12 text-center shadow-cozy">
      <p className="font-jp text-2xl text-ink-accent">言葉</p>
      <h3 className="mt-2 text-sm font-semibold text-ink-text-header">{title}</h3>
      <p className="mt-1 text-sm text-ink-text-muted">{description}</p>
    </div>
  );
}

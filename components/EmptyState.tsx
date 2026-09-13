export default function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <p className="font-jp text-2xl">言葉</p>
      <h3 className="mt-2 text-sm font-semibold text-ink">{title}</h3>
      <p className="mt-1 text-sm text-slate-muted">{description}</p>
    </div>
  );
}

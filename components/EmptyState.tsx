import Mascot from "@/components/Mascot";

export default function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl bg-ink-bg-secondary px-6 py-14 text-center border-2 border-ink-border">
      <Mascot size={88} mood="sleepy" className="mx-auto" />
      <h3 className="mt-4 font-display text-lg font-bold text-ink-text-header">{title}</h3>
      <p className="mt-1.5 text-sm text-ink-text-muted">{description}</p>
    </div>
  );
}

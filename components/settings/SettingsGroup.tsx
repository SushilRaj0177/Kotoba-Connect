export default function SettingsGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h2 className="mb-2 px-1 font-display text-sm font-bold text-ink-text-header">{title}</h2>
      <div className="divide-y divide-ink-border/70 overflow-hidden rounded-2xl border border-ink-border/70 bg-ink-bg-secondary shadow-sm">
        {children}
      </div>
    </div>
  );
}

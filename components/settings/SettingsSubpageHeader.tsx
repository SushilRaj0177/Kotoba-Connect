import Link from "next/link";

export default function SettingsSubpageHeader({ backLabel, title }: { backLabel: string; title: string }) {
  return (
    <div className="mb-5">
      <Link
        href="/settings"
        className="mb-2 inline-block text-sm font-medium text-ink-text-link transition active:scale-95 hover:underline"
      >
        {backLabel}
      </Link>
      <h1 className="font-display text-xl font-bold text-ink-text-header">{title}</h1>
    </div>
  );
}

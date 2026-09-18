import Link from "next/link";

// A single drill-down row inside a grouped settings card — icon, label,
// chevron, full-row tap target. Several of these stacked inside a
// rounded card (with a divider between them) is what makes a flat list
// of settings read as a handful of cozy, scannable groups instead of one
// undifferentiated menu.
export default function SettingsRow({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-3.5 transition active:scale-[0.98] active:bg-ink-bg-hover hover:bg-ink-bg-hover"
    >
      <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-ink-bg-input text-ink-text-muted">
        {icon}
      </span>
      <span className="min-w-0 flex-1 text-sm font-semibold text-ink-text">{label}</span>
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="flex-none text-ink-text-muted"
      >
        <path d="m9 6 6 6-6 6" />
      </svg>
    </Link>
  );
}

import Link from "next/link";
import Avatar from "@/components/Avatar";

const SIZES = {
  sm: { avatar: 22, text: "text-xs", pad: "py-0.5 pl-0.5 pr-2.5", gap: "gap-1.5" },
  md: { avatar: 28, text: "text-sm", pad: "py-1 pl-1 pr-3", gap: "gap-2" },
  lg: { avatar: 40, text: "text-base", pad: "py-1.5 pl-1.5 pr-4", gap: "gap-2.5" },
} as const;

// A single consistent "who posted/ranked/notified this" treatment — a
// pill chip pairing the avatar with the name — used everywhere a bare
// "@username" text string used to sit loose against the background.
// Shows the display name when a profile has set one (most people don't
// want their raw handle plastered everywhere), falling back to
// "@username" only when no display name exists — the handle still
// underlies the profile link either way.
export default function UserHandle({
  username,
  displayName,
  avatarUrl,
  size = "md",
  href,
  trailing,
  className = "",
}: {
  username: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  size?: keyof typeof SIZES;
  href?: string;
  trailing?: React.ReactNode;
  className?: string;
}) {
  const s = SIZES[size];
  const label = displayName?.trim() || `@${username}`;
  const content = (
    <>
      <Avatar username={username} avatarUrl={avatarUrl} size={s.avatar} />
      <span className={`min-w-0 truncate font-display font-semibold text-ink-text-header ${s.text}`}>
        {label}
      </span>
      {trailing}
    </>
  );

  const classes = `inline-flex max-w-full items-center ${s.gap} ${s.pad} rounded-full bg-ink-bg-input ${className}`;

  if (href) {
    return (
      <Link href={href} className={`${classes} transition hover:bg-ink-bg-hover`}>
        {content}
      </Link>
    );
  }

  return <span className={classes}>{content}</span>;
}

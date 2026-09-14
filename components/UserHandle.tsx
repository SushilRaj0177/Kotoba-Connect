import Link from "next/link";
import Avatar from "@/components/Avatar";

const SIZES = {
  sm: { avatar: 22, text: "text-xs", pad: "py-0.5 pl-0.5 pr-2.5", gap: "gap-1.5" },
  md: { avatar: 28, text: "text-sm", pad: "py-1 pl-1 pr-3", gap: "gap-2" },
  lg: { avatar: 40, text: "text-base", pad: "py-1.5 pl-1.5 pr-4", gap: "gap-2.5" },
} as const;

// A single consistent "who posted/ranked/notified this" treatment — a
// pill chip pairing the avatar with the handle — used everywhere a bare
// "@username" text string used to sit loose against the background.
export default function UserHandle({
  username,
  size = "md",
  href,
  trailing,
  className = "",
}: {
  username: string;
  size?: keyof typeof SIZES;
  href?: string;
  trailing?: React.ReactNode;
  className?: string;
}) {
  const s = SIZES[size];
  const content = (
    <>
      <Avatar username={username} size={s.avatar} />
      <span className={`min-w-0 truncate font-display font-semibold text-ink-text-header ${s.text}`}>
        @{username}
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

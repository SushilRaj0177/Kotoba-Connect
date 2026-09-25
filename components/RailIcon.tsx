"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function RailIcon({
  href,
  title,
  children,
}: {
  href: string;
  title: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname?.startsWith(href);

  return (
    <Link
      href={href}
      title={title}
      className={`flex h-12 w-12 flex-none items-center justify-center rounded-2xl transition active:scale-90 ${
        active
          ? "bg-ink-accent text-[rgb(var(--c-on-accent))] shadow-[0_4px_14px_-4px_rgb(var(--c-accent)/0.6)]"
          : "text-ink-text-muted hover:bg-ink-bg-hover hover:text-ink-accent"
      }`}
    >
      {children}
    </Link>
  );
}

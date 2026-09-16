"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Avatar from "@/components/Avatar";
import { signOut } from "@/app/auth/actions";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { usePopoverClamp } from "@/lib/use-popover-clamp";

// The header shouldn't spell out "@username" in a chip — every reference
// app (X, Discord, Slack) reduces the account cluster in the top bar to
// just the avatar, with the handle and account actions living in a
// dropdown behind it instead of sitting in the chrome at all times.
export default function AccountMenu({
  username,
  displayName,
  avatarUrl,
  isAdmin,
}: {
  username: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  isAdmin: boolean;
}) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const shift = usePopoverClamp(open, menuRef);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center rounded-full transition hover:ring-2 hover:ring-ink-accent/40"
        aria-label={t("nav.profile")}
      >
        <Avatar username={username} avatarUrl={avatarUrl} size={32} />
      </button>

      {open && (
        <div
          ref={menuRef}
          style={{ transform: shift ? `translateX(${shift}px)` : undefined }}
          className="absolute right-0 top-full z-20 mt-2 w-52 overflow-hidden rounded-2xl bg-ink-bg-secondary border border-ink-border/70 shadow-xl"
        >
          <div className="flex items-center gap-2.5 border-b border-ink-border p-3">
            <Avatar username={username} avatarUrl={avatarUrl} size={32} />
            <span className="min-w-0 flex-1 truncate font-display text-sm font-bold text-ink-text-header">
              {displayName?.trim() || `@${username}`}
            </span>
          </div>
          <div className="p-1.5">
            <Link
              href={`/u/${username}`}
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-2 text-sm text-ink-text transition hover:bg-ink-bg-hover"
            >
              {t("nav.profile")}
            </Link>
            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-2 text-sm text-ink-text transition hover:bg-ink-bg-hover"
            >
              {t("nav.settings")}
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="block rounded-xl px-3 py-2 text-sm text-ink-text transition hover:bg-ink-bg-hover"
              >
                {t("nav.moderation")}
              </Link>
            )}
          </div>
          <form action={signOut} className="border-t border-ink-border p-1.5">
            <button
              type="submit"
              className="block w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-ink-red transition hover:bg-ink-bg-hover"
            >
              {t("nav.signOut")}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

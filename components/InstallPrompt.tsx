"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/components/i18n/LocaleProvider";

const DISMISSED_KEY = "kotoba-install-dismissed-at";
const DISMISS_SNOOZE_MS = 14 * 24 * 60 * 60 * 1000; // 2 weeks
const SHOWN_THIS_SESSION_KEY = "kotoba-install-shown-this-session";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function recentlyDismissed() {
  try {
    const dismissedAt = Number(localStorage.getItem(DISMISSED_KEY) ?? 0);
    return Date.now() - dismissedAt < DISMISS_SNOOZE_MS;
  } catch {
    return false;
  }
}

function alreadyShownThisSession() {
  try {
    return sessionStorage.getItem(SHOWN_THIS_SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

function markShownThisSession() {
  try {
    sessionStorage.setItem(SHOWN_THIS_SESSION_KEY, "1");
  } catch {
    // Not persisting just means it could show again later this tab — fine.
  }
}

// Chrome/Edge/Android fire beforeinstallprompt and let us defer + trigger
// it ourselves; iOS Safari never fires it at all (there's no programmatic
// install there — only the manual Share -> Add to Home Screen flow), so
// this banner is a no-op on iOS by design rather than something broken.
//
// Chrome can dispatch beforeinstallprompt more than once in a single tab
// (e.g. after a bfcache restore or certain navigations) — the previous
// version only checked the dismissal/snooze once, at mount, so a second
// firing re-showed the banner even right after the visitor dismissed it.
// Gating on a sessionStorage flag (in addition to the localStorage
// snooze) makes "Not now" and a completed/declined install prompt both
// mean "not again this tab", regardless of how many times the browser
// re-fires the event.
export default function InstallPrompt() {
  const { t } = useLocale();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    if (isStandalone) return;

    function handler(event: Event) {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      if (recentlyDismissed() || alreadyShownThisSession()) return;
      markShownThisSession();
      setVisible(true);
    }
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  function dismiss() {
    setVisible(false);
    markShownThisSession();
    try {
      localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    } catch {
      // Not persisting the dismissal just means it can reappear — fine.
    }
  }

  async function install() {
    if (!deferredPrompt) return;
    markShownThisSession();
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-16 z-30 mx-auto max-w-sm px-3 sm:bottom-4">
      <div className="flex items-center gap-3 rounded-2xl border border-ink-border bg-ink-bg-secondary p-3.5 shadow-lg">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-ink-text-header">{t("install.title")}</p>
          <p className="mt-0.5 text-xs text-ink-text-muted">{t("install.body")}</p>
        </div>
        <div className="flex flex-none flex-col items-end gap-1.5">
          <button
            type="button"
            onClick={install}
            className="rounded-xl bg-ink-accent px-3 py-1.5 text-xs font-bold text-[rgb(var(--c-on-accent))] active:scale-95"
          >
            {t("install.action")}
          </button>
          <button type="button" onClick={dismiss} className="text-xs text-ink-text-muted hover:underline">
            {t("install.dismiss")}
          </button>
        </div>
      </div>
    </div>
  );
}

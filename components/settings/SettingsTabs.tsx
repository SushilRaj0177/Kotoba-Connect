"use client";

import { useRef, useState, type ReactNode } from "react";
import { useLocale } from "@/components/i18n/LocaleProvider";

type TabId = "profile" | "account" | "privacy" | "appearance";

// Settings had grown into one long stack of forms (profile fields,
// password, danger zone, appearance, blocked users all one after
// another) — fine when there were two sections, not once there were
// five. Splitting into tabs means opening Settings to change your theme
// doesn't require scrolling past a password form and a delete-account
// button first.
export default function SettingsTabs({
  profile,
  account,
  privacy,
  appearance,
}: {
  profile: ReactNode;
  account: ReactNode;
  privacy: ReactNode;
  appearance: ReactNode;
}) {
  const { t } = useLocale();
  const [active, setActive] = useState<TabId>("profile");
  const listRef = useRef<HTMLDivElement>(null);

  const tabs: { id: TabId; label: string; content: ReactNode }[] = [
    { id: "profile", label: t("settings.tabs.profile"), content: profile },
    { id: "account", label: t("settings.tabs.account"), content: account },
    { id: "privacy", label: t("settings.tabs.privacy"), content: privacy },
    { id: "appearance", label: t("settings.tabs.appearance"), content: appearance },
  ];

  function selectTab(id: TabId, el: HTMLButtonElement) {
    setActive(id);
    // The row can be narrower than all four labels combined on small
    // phones (deliberately: shrinking tab text further to force-fit
    // hurts tap targets and readability more than a swipeable row does).
    // Scrolling the tapped tab into view means a tab picked from the
    // partially-faded edge still ends up fully visible afterward.
    el.scrollIntoView({ behavior: "smooth", inline: "nearest", block: "nearest" });
  }

  return (
    <div>
      {/* The mask fade (not a separate overlay div) hints that the row
         keeps going past the visible edge — a plain overflow-x-auto with
         no affordance left the last tab looking cut off/broken rather
         than "swipe for more". Harmless when everything already fits
         (nothing sits at the masked edge to fade). */}
      <div
        ref={listRef}
        role="tablist"
        className="mb-5 flex gap-1 overflow-x-auto rounded-full bg-ink-bg-input p-1"
        style={{
          WebkitMaskImage: "linear-gradient(to right, black calc(100% - 20px), transparent)",
          maskImage: "linear-gradient(to right, black calc(100% - 20px), transparent)",
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active === tab.id}
            onClick={(e) => selectTab(tab.id, e.currentTarget)}
            className={`flex-none whitespace-nowrap rounded-full px-2.5 py-1.5 text-xs font-semibold transition active:scale-95 ${
              active === tab.id
                ? "bg-ink-accent text-white"
                : "text-ink-text-muted hover:text-ink-text"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {tabs.map((tab) => (
        <div key={tab.id} hidden={active !== tab.id}>
          {tab.content}
        </div>
      ))}
    </div>
  );
}

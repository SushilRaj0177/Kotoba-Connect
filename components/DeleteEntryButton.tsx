"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { useToast } from "@/components/Toast";

export default function DeleteEntryButton({
  entryId,
  redirectHome,
}: {
  entryId: string;
  redirectHome?: boolean;
}) {
  const { t } = useLocale();
  const { showToast } = useToast();
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.from("context_entries").delete().eq("id", entryId);
    setBusy(false);

    if (error) {
      showToast(t("profile.actionError"), "error");
      return;
    }

    showToast(t("toast.deleted"));
    if (redirectHome) router.push("/");
  }

  if (confirming) {
    return (
      <span className="flex items-center gap-1.5 text-xs">
        <button
          type="button"
          onClick={handleDelete}
          disabled={busy}
          className="font-semibold text-ink-red hover:underline disabled:opacity-60"
        >
          {busy ? t("card.deleting") : t("card.confirmDelete")}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="text-ink-text-muted hover:underline"
        >
          {t("card.cancel")}
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      title={t("card.delete")}
      className="flex h-10 w-10 items-center justify-center rounded-full text-ink-text-muted transition hover:bg-ink-bg-hover hover:text-ink-red active:scale-90"
    >
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 6h18" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <path d="M10 11v6M14 11v6" />
      </svg>
    </button>
  );
}

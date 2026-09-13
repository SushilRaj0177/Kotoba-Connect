"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useLocale } from "@/components/i18n/LocaleProvider";

export default function DeleteEntryButton({
  entryId,
  redirectHome,
}: {
  entryId: string;
  redirectHome?: boolean;
}) {
  const { t } = useLocale();
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    setBusy(true);
    const supabase = createClient();
    await supabase.from("context_entries").delete().eq("id", entryId);
    setBusy(false);
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
      className="rounded px-2 py-1 text-xs font-semibold text-ink-text-muted transition hover:text-ink-red"
    >
      {t("card.delete")}
    </button>
  );
}

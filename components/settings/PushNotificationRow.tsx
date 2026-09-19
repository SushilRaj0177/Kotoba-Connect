"use client";

import { useState } from "react";
import { usePushSubscription } from "@/lib/use-push-subscription";
import { useLocale } from "@/components/i18n/LocaleProvider";

export default function PushNotificationRow() {
  const { t } = useLocale();
  const { status, busy, subscribe, unsubscribe } = usePushSubscription();
  const [testState, setTestState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function sendTest() {
    setTestState("sending");
    try {
      const res = await fetch("/api/push/send-test", { method: "POST" });
      setTestState(res.ok ? "sent" : "error");
    } catch {
      setTestState("error");
    }
  }

  return (
    <div className="mt-4 border-t border-ink-border/70 pt-4">
      <p className="text-sm font-semibold text-ink-text">{t("settings.push.title")}</p>
      <p className="text-xs text-ink-text-muted">{t("settings.push.hint")}</p>

      {status === "unsupported" && <p className="mt-2 text-xs text-ink-text-muted">{t("settings.push.unsupported")}</p>}
      {status === "unconfigured" && <p className="mt-2 text-xs text-ink-text-muted">{t("settings.push.unconfigured")}</p>}
      {status === "denied" && <p className="mt-2 text-xs text-ink-red">{t("settings.push.denied")}</p>}

      {(status === "subscribed" || status === "unsubscribed") && (
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={status === "subscribed" ? unsubscribe : subscribe}
            disabled={busy}
            className={`rounded-xl px-3.5 py-2 text-xs font-bold transition active:scale-95 disabled:opacity-60 ${
              status === "subscribed"
                ? "border border-ink-border text-ink-text hover:bg-ink-bg-hover"
                : "btn-chunky text-white"
            }`}
          >
            {busy
              ? t("settings.push.busy")
              : status === "subscribed"
                ? t("settings.push.disable")
                : t("settings.push.enable")}
          </button>

          {status === "subscribed" && (
            <button
              type="button"
              onClick={sendTest}
              disabled={testState === "sending"}
              className="text-xs font-semibold text-ink-text-link hover:underline disabled:opacity-60"
            >
              {t("settings.push.test")}
            </button>
          )}

          {testState === "sent" && <p className="w-full text-xs text-ink-accent">{t("settings.push.testSent")}</p>}
          {testState === "error" && <p className="w-full text-xs text-ink-red">{t("settings.push.testFailed")}</p>}
        </div>
      )}
    </div>
  );
}

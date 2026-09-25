"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Mascot from "@/components/Mascot";
import ChatMessageText from "@/components/ChatMessageText";
import FormalityBadge from "@/components/FormalityBadge";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { useEntryChatContext } from "@/components/EntryChatContext";
import type { FormalityLevel } from "@/types/database";

interface RetrievedEntry {
  id: string;
  raw_japanese: string;
  primary_translation: string;
  formality_level: FormalityLevel | null;
  similarity: number;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  retrieved?: RetrievedEntry[];
}

// The mascot as an in-app presence: a floating chat widget that can answer
// questions about how the board works and about Japanese formality/nuance
// in general. It does not take actions on the user's behalf (no API key
// lets a chat message post, delete, or edit anything) — moderation
// "messages" from the same mascot persona are sent server-side from the
// admin queue (see AdminQueue.tsx) and show up in the notification bell.
export default function MascotChat() {
  const { t } = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { entry: entryContext } = useEntryChatContext();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  // Not useful mid-conversation on a profile page (self, bot, or anyone
  // else's) — profiles are about the person, not a place to chat with the
  // mascot. On the login/signup page it stays for desktop (plenty of
  // room) but is dropped on mobile, where the auth card already fills the
  // screen and the floating bubble just sits on top of the form.
  const isProfilePage = pathname?.startsWith("/u/") ?? false;
  const isAuthPage = pathname === "/login";

  if (isProfilePage) return null;

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    setError(null);
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/bot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, entryContext }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Kotoba Bot couldn't reply.");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply, retrieved: data.retrieved ?? [] },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      className={`fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom)+0.75rem)] right-5 z-30 ${isAuthPage ? "hidden md:flex" : "flex"} flex-col items-end md:bottom-5`}
    >
      {open && (
        <div className="mb-3 flex h-[28rem] w-80 max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl bg-ink-bg-secondary border border-ink-border/70 shadow-2xl">
          <div className="flex items-center gap-2.5 border-b border-ink-border p-3">
            <Mascot size={30} mood="happy" />
            <div className="min-w-0 flex-1">
              <p className="font-display text-sm font-bold text-ink-text-header">{t("bot.name")}</p>
              {entryContext ? (
                <p className="truncate text-xs text-ink-accent" title={entryContext.raw_japanese}>
                  {t("bot.aboutEntry")} {entryContext.raw_japanese}
                </p>
              ) : (
                <p className="text-xs text-ink-text-muted">{t("bot.subtitle")}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-7 w-7 flex-none items-center justify-center rounded-full text-ink-text-muted hover:bg-ink-bg-hover"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-2.5 overflow-y-auto p-3">
            {messages.length === 0 && (
              <div className="flex items-start gap-2">
                <Mascot size={26} mood="happy" />
                <p className="max-w-[85%] rounded-2xl rounded-tl-sm bg-ink-bg-input px-3 py-2 text-sm text-ink-text">
                  <ChatMessageText text={t("bot.greeting")} />
                </p>
              </div>
            )}
            {messages.map((m, i) =>
              m.role === "user" ? (
                <p
                  key={i}
                  className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-ink-accent px-3 py-2 text-sm text-[rgb(var(--c-on-accent))]"
                >
                  {m.content}
                </p>
              ) : (
                <div key={i} className="flex items-start gap-2">
                  <Mascot size={26} mood="happy" />
                  <div className="max-w-[85%] space-y-1.5">
                    <p className="rounded-2xl rounded-tl-sm bg-ink-bg-input px-3 py-2 text-sm text-ink-text">
                      <ChatMessageText text={m.content} />
                    </p>
                    {!!m.retrieved?.length && (
                      <div className="space-y-1">
                        <p className="px-1 text-[10px] font-semibold uppercase tracking-wide text-ink-text-muted">
                          🔍 {t("bot.foundOnBoard")}
                        </p>
                        {m.retrieved.map((r) => (
                          <Link
                            key={r.id}
                            href={`/entries/${r.id}`}
                            className="flex items-center gap-1.5 rounded-xl bg-ink-bg-input px-2.5 py-1.5 text-xs transition hover:bg-ink-bg-hover"
                          >
                            <span className="min-w-0 flex-1 truncate font-jp text-ink-text-header">
                              {r.raw_japanese}
                            </span>
                            <FormalityBadge level={r.formality_level} />
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            )}
            {sending && (
              <div className="flex items-start gap-2">
                <Mascot size={26} mood="sleepy" />
                <p className="rounded-2xl rounded-tl-sm bg-ink-bg-input px-3 py-2 text-sm text-ink-text-muted">…</p>
              </div>
            )}
            {error && <p className="text-center text-xs text-ink-red">{error}</p>}
          </div>

          <form onSubmit={send} className="flex items-center gap-2 border-t border-ink-border p-2.5">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("bot.placeholder")}
              maxLength={500}
              className="min-w-0 flex-1 rounded-full border-none bg-ink-bg-input px-3.5 py-2 text-sm text-ink-text placeholder:text-ink-text-muted focus:outline-none focus:ring-2 focus:ring-ink-accent"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-ink-accent text-[rgb(var(--c-on-accent))] disabled:opacity-50"
              aria-label="Send"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 11.5 21 3l-7.5 18-3-7.5-7.5-2z" />
              </svg>
            </button>
          </form>
        </div>
      )}

      {/* Sized with clamp() on mobile — a fixed 56px button reads as
         oversized on a small phone and undersized on a large one relative
         to everything else on screen; clamp() scales it continuously with
         viewport width between a sensible floor and ceiling instead.
         Desktop keeps the original fixed 56px (md:) unchanged. */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        title={t("bot.name")}
        className="btn-chunky flex h-[clamp(2.75rem,13vw,3.5rem)] w-[clamp(2.75rem,13vw,3.5rem)] items-center justify-center rounded-full bg-ink-accent shadow-xl md:h-14 md:w-14"
      >
        {open ? (
          <span className="text-xl text-white">✕</span>
        ) : (
          <Mascot
            size={40}
            mood="excited"
            className="!h-[clamp(2rem,9.5vw,2.5rem)] !w-[clamp(2rem,9.5vw,2.5rem)] md:!h-10 md:!w-10"
          />
        )}
      </button>
    </div>
  );
}

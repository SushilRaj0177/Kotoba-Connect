"use client";

import { useState } from "react";
import { useToast } from "@/components/Toast";

// Lets an admin bootstrap the official bot account and post batches of its
// starter entries on demand, without needing shell/database access — the
// same /api/admin/bot/* routes a scheduled cron job would call.
export default function BotSeedPanel() {
  const { showToast } = useToast();
  const [settingUp, setSettingUp] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [count, setCount] = useState(5);
  const [lastResult, setLastResult] = useState<string | null>(null);

  async function handleSetup() {
    setSettingUp(true);
    try {
      const res = await fetch("/api/admin/bot/setup", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Setup failed.");
      showToast(data.created ? "Bot account created." : "Bot account already exists.");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Couldn't set up the bot account.", "error");
    }
    setSettingUp(false);
  }

  async function handleSeed() {
    setSeeding(true);
    setLastResult(null);
    try {
      const res = await fetch("/api/admin/bot/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Seeding failed.");
      setLastResult(`Posted ${data.posted} entr${data.posted === 1 ? "y" : "ies"}. ${data.remaining} left in the bank.`);
      showToast(`Bot posted ${data.posted} entr${data.posted === 1 ? "y" : "ies"}.`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Couldn't post bot entries.", "error");
    }
    setSeeding(false);
  }

  return (
    <div className="mb-6 rounded-2xl bg-ink-bg-secondary p-4 border border-ink-border/70 shadow-sm sm:p-5">
      <h2 className="font-display text-base font-bold text-ink-text-header">Bot account</h2>
      <p className="mt-1 text-sm text-ink-text-muted">
        Posts starter Japanese sentences (with real AI nuance + embeddings) as the official bot so the board
        doesn't feel empty. Run setup once, then seed batches whenever.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleSetup}
          disabled={settingUp}
          className="rounded-full bg-ink-bg-input px-3.5 py-1.5 text-xs font-semibold text-ink-text transition hover:bg-ink-bg-hover disabled:opacity-60"
        >
          {settingUp ? "Setting up…" : "Set up bot account"}
        </button>
        <input
          type="number"
          min={1}
          max={15}
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          className="w-16 rounded-lg border-none bg-ink-bg-input px-2 py-1.5 text-sm text-ink-text focus:outline-none focus:ring-2 focus:ring-ink-accent"
        />
        <button
          type="button"
          onClick={handleSeed}
          disabled={seeding}
          className="btn-chunky rounded-2xl bg-ink-accent px-4 py-1.5 text-xs font-bold text-white disabled:opacity-60"
        >
          {seeding ? "Posting…" : "Post bot entries"}
        </button>
      </div>
      {lastResult && <p className="mt-2 text-xs text-ink-text-muted">{lastResult}</p>}
    </div>
  );
}

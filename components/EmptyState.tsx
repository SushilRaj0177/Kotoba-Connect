import Mascot from "@/components/Mascot";
import { Obake } from "@/components/mascots/candidates";

// Kokeshi and Obake split empty-state duty — Kokeshi for "nothing here
// yet" (the board, a profile with no posts), Obake for "nothing found"
// (search, a tag with no matches) — so both co-mascots get real screen
// time instead of Kokeshi covering every case by default.
export default function EmptyState({
  title,
  description,
  variant = "kokeshi",
}: {
  title: string;
  description: string;
  variant?: "kokeshi" | "obake";
}) {
  return (
    <div className="rounded-2xl bg-ink-bg-secondary px-6 py-14 text-center border border-ink-border/70 shadow-sm">
      {variant === "obake" ? (
        <Obake size={88} className="mx-auto" />
      ) : (
        <Mascot size={88} mood="sleepy" className="mx-auto" />
      )}
      <h3 className="mt-4 font-display text-lg font-bold text-ink-text-header">{title}</h3>
      <p className="mt-1.5 text-sm text-ink-text-muted">{description}</p>
    </div>
  );
}

import Mascot from "@/components/Mascot";
import { Obake, Kitsune, Neko } from "@/components/mascots/candidates";
import { MASCOT_CATALOG } from "@/lib/mascot-registry";
import ThemeToggle from "@/components/theme/ThemeToggle";

const RENDER: Record<string, (props: { size?: number }) => React.ReactElement> = {
  kokeshi: Mascot,
  obake: Obake,
  kitsune: Kitsune,
  neko: Neko,
};

// Internal review page — not linked anywhere in the app nav. Ten named,
// animated mascot candidates side by side so a direction can be picked
// (or the current one, Kokeshi, kept) without guessing from descriptions.
export const metadata = { title: "Mascot gallery (internal)" };

export default function MascotGalleryPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-black text-ink-text-header">Mascot gallery</h1>
          <p className="mt-1 text-sm text-ink-text-muted">
            Internal review page — named, animated candidates. Kokeshi is the current default.
          </p>
        </div>
        <ThemeToggle />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {MASCOT_CATALOG.map(({ id, name, blurb }) => {
          const Comp = RENDER[id];
          return (
            <div
              key={id}
              className="flex flex-col items-center rounded-2xl bg-ink-bg-secondary p-4 text-center border border-ink-border/70 shadow-sm"
            >
              <Comp size={80} />
              <p className="mt-3 font-display text-sm font-bold text-ink-text-header">{name}</p>
              <p className="mt-1 text-xs leading-snug text-ink-text-muted">{blurb}</p>
            </div>
          );
        })}
      </div>
    </main>
  );
}

import NavbarSkeleton from "@/components/skeletons/NavbarSkeleton";
import { EntryCardSkeleton, EntryListSkeleton } from "@/components/Skeletons";

// Shared shape for the single-main-column routes (no RightRail): entry
// detail, profile, bookmarks, leaderboard, settings. `variant` picks the
// body content so each still roughly matches its real page instead of one
// generic box for everything.
export default function SingleColumnPageSkeleton({
  variant,
  maxWidth = "max-w-3xl lg:max-w-5xl",
}: {
  variant: "list" | "detail" | "profile" | "leaderboard" | "form";
  maxWidth?: string;
}) {
  return (
    <>
      <NavbarSkeleton />
      <main className={`mx-auto ${maxWidth} px-4 py-6 sm:px-6`}>
        {variant === "list" && <EntryListSkeleton />}

        {variant === "detail" && (
          <>
            <div className="skeleton mb-4 h-5 w-16 rounded bg-ink-bg-input" />
            <EntryCardSkeleton />
          </>
        )}

        {variant === "profile" && (
          <>
            <div className="skeleton mb-6 h-40 rounded-2xl bg-ink-bg-secondary" />
            <EntryListSkeleton />
          </>
        )}

        {variant === "leaderboard" && (
          <>
            <div className="skeleton mb-6 h-4 w-2/3 rounded bg-ink-bg-input" />
            <div className="mb-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              <div className="skeleton h-20 rounded-2xl bg-ink-bg-secondary" />
              <div className="skeleton h-20 rounded-2xl bg-ink-bg-secondary" />
              <div className="skeleton h-20 rounded-2xl bg-ink-bg-secondary" />
            </div>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton h-16 rounded-2xl bg-ink-bg-secondary" />
              ))}
            </div>
          </>
        )}

        {variant === "form" && (
          <div className="space-y-4">
            <div className="skeleton h-48 rounded-2xl bg-ink-bg-secondary" />
            <div className="skeleton h-32 rounded-2xl bg-ink-bg-secondary" />
            <div className="skeleton h-24 rounded-2xl bg-ink-bg-secondary" />
          </div>
        )}
      </main>
    </>
  );
}

import NavbarSkeleton from "@/components/skeletons/NavbarSkeleton";
import RightRailSkeleton from "@/components/skeletons/RightRailSkeleton";
import { EntryListSkeleton } from "@/components/Skeletons";

// Shared by Home, Board, and Search's loading.tsx — all three are the same
// "feed with a right rail" shape, so navigating between them (or to any of
// them for the first time) shows this instantly via Next's automatic
// Suspense boundary instead of a frozen screen while the server fetch runs.
export default function FeedPageSkeleton({ withSearchBar = false }: { withSearchBar?: boolean }) {
  return (
    <>
      <NavbarSkeleton />
      <main className="mx-auto flex max-w-5xl gap-6 px-4 py-6 sm:px-6">
        <div className="min-w-0 flex-1 space-y-5">
          {withSearchBar && <div className="skeleton h-10 rounded-full bg-ink-bg-input" />}
          <EntryListSkeleton />
        </div>
        <RightRailSkeleton />
      </main>
    </>
  );
}

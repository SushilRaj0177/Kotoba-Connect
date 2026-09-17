// Mirrors Navbar's exact markup/classes so a route's loading.tsx doesn't
// cause the header to visibly jump/resize the instant real data swaps in —
// same sticky header, same max-w-5xl row, same slot shapes.
export default function NavbarSkeleton() {
  return (
    <header className="sticky top-0 z-10 bg-ink-bg/90 shadow-[0_1px_0_0_rgb(var(--c-border)/0.6)] backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
        <div className="skeleton h-7 w-14 flex-none rounded bg-ink-bg-input md:hidden" />
        <div className="hidden items-center gap-2 md:flex">
          <div className="skeleton h-[26px] w-[26px] flex-none rounded-full bg-ink-bg-input" />
          <div className="skeleton h-5 w-28 rounded bg-ink-bg-input" />
        </div>
        <div className="ml-auto flex min-w-0 items-center gap-1.5 sm:gap-2.5">
          <div className="skeleton h-8 w-8 flex-none rounded-full bg-ink-bg-input" />
          <div className="skeleton h-7 w-14 flex-none rounded-full bg-ink-bg-input" />
          <div className="skeleton h-8 w-8 flex-none rounded-full bg-ink-bg-input" />
          <div className="skeleton h-8 w-8 flex-none rounded-full bg-ink-bg-input" />
        </div>
      </div>
    </header>
  );
}

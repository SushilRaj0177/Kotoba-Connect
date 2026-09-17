import FeedPageSkeleton from "@/components/skeletons/FeedPageSkeleton";

// Next.js wraps this segment's page.tsx in a Suspense boundary using this
// file automatically — without it, a fully dynamic route (see
// `dynamic = "force-dynamic"` in the root layout) shows nothing at all
// during navigation: the previous page just sits there, frozen, until the
// entire new page's data finishes fetching server-side, then snaps in.
// With this, the navigation itself is instant (Next prefetches this
// fallback on link hover/viewport-enter) and the real content streams in
// behind it — the whole difference between navigation feeling "static" and
// feeling alive.
export default function Loading() {
  return <FeedPageSkeleton />;
}

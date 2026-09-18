"use client";

import { useEffect } from "react";

// iOS Safari has a long-standing quirk: CSS `:active` styles don't fire on
// a tap at all — not delayed, not missing, just never applied — unless
// *some* element on the page has a touch event listener attached (even an
// empty one). Without this, every `active:scale-*`/`:active` press effect
// in the app (LikeButton, BookmarkButton, btn-chunky, nav items, etc.)
// silently does nothing on iPhone: buttons and links just sit there with
// zero visual response to a tap until whatever the tap triggered finishes
// loading, which reads as the whole app being unresponsive even when
// nothing is actually wrong. A single empty listener on <body> is the
// standard fix and makes every existing `:active` rule in the app start
// working immediately, with no per-component changes needed.
export default function EnableTapFeedback() {
  useEffect(() => {
    const noop = () => {};
    document.body.addEventListener("touchstart", noop, { passive: true });
    return () => document.body.removeEventListener("touchstart", noop);
  }, []);

  return null;
}

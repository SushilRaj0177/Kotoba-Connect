"use client";

import { useLayoutEffect, useState, type RefObject } from "react";

// Popovers anchored with a fixed left-0/right-0 only look right when their
// trigger happens to sit near that edge of the viewport — a badge or button
// placed anywhere else in a card's content (unlike a top-right navbar menu)
// can render its dropdown partly or fully off-screen. This nudges it back
// inside the viewport with a horizontal translate once it's open.
export function usePopoverClamp(open: boolean, popoverRef: RefObject<HTMLElement>): number {
  const [shift, setShift] = useState(0);

  useLayoutEffect(() => {
    if (!open || !popoverRef.current) {
      setShift(0);
      return;
    }
    const margin = 8;
    const rect = popoverRef.current.getBoundingClientRect();
    let delta = 0;
    if (rect.right > window.innerWidth - margin) {
      delta -= rect.right - (window.innerWidth - margin);
    }
    if (rect.left + delta < margin) {
      delta += margin - (rect.left + delta);
    }
    setShift(delta);
  }, [open, popoverRef]);

  return shift;
}

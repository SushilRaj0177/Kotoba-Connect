"use client";

// A single global mousemove listener, rAF-throttled, fanning out to any
// number of subscribers via direct callback (no React state, no re-render
// per pixel of mouse movement). Used by mascot eye-tracking — attaching a
// separate mousemove listener per mascot instance would be the "noob"
// version of this; one shared tracker with cheap subscribe/unsubscribe is
// the version that stays fast no matter how many mascots are on screen.
type Listener = (x: number, y: number) => void;

let x = -9999;
let y = -9999;
let rafHandle = 0;
let initialized = false;
const listeners = new Set<Listener>();

function handleMove(e: MouseEvent) {
  x = e.clientX;
  y = e.clientY;
  if (rafHandle) return;
  rafHandle = requestAnimationFrame(() => {
    rafHandle = 0;
    listeners.forEach((listener) => listener(x, y));
  });
}

function ensureInitialized() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  window.addEventListener("mousemove", handleMove, { passive: true });
}

export function subscribeCursor(listener: Listener): () => void {
  ensureInitialized();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

"use client";

import { useEffect, useState } from "react";
import Mascot from "@/components/Mascot";
import { Obake } from "@/components/mascots/candidates";

type Phase = "idle" | "out" | "in";

const IDLE_MS = 4200;
const OUT_MS = 340;
const IN_MS = 380;

// The SideRail logo used to be Kokeshi only, everywhere, while Obake only
// showed up once on the whole homepage — an unequal co-mascot billing. This
// alternates the two in the one shared "logo" slot instead: each sits doing
// its own idle bounce, then whooshes out and the other whooshes in to take
// its place, on a loop. Neither mascot is ever "the" logo — they take turns.
export default function MascotLogo({ size = 40 }: { size?: number }) {
  const [active, setActive] = useState<"kokeshi" | "obake">("kokeshi");
  const [phase, setPhase] = useState<Phase>("idle");

  useEffect(() => {
    let outTimer: ReturnType<typeof setTimeout>;
    let switchTimer: ReturnType<typeof setTimeout>;
    let settleTimer: ReturnType<typeof setTimeout>;
    let cancelled = false;

    function scheduleCycle() {
      outTimer = setTimeout(() => {
        if (cancelled) return;
        setPhase("out");
        switchTimer = setTimeout(() => {
          if (cancelled) return;
          setActive((a) => (a === "kokeshi" ? "obake" : "kokeshi"));
          setPhase("in");
          settleTimer = setTimeout(() => {
            if (cancelled) return;
            setPhase("idle");
            scheduleCycle();
          }, IN_MS);
        }, OUT_MS);
      }, IDLE_MS);
    }

    scheduleCycle();
    return () => {
      cancelled = true;
      clearTimeout(outTimer);
      clearTimeout(switchTimer);
      clearTimeout(settleTimer);
    };
  }, []);

  const motionClass = phase === "out" ? "m-whoosh-out" : phase === "in" ? "m-whoosh-in" : "m-bounce";

  return (
    <span className="relative flex h-12 w-12 flex-none items-center justify-center overflow-hidden">
      <span className={motionClass}>
        {active === "kokeshi" ? <Mascot size={size} /> : <Obake size={Math.round(size * 1.08)} />}
      </span>
    </span>
  );
}

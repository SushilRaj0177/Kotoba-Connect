"use client";

import { useEffect, useState } from "react";
import { useAnimate } from "framer-motion";
import Mascot from "@/components/Mascot";
import { Obake } from "@/components/mascots/candidates";

// The landing hero's mascot pair. A hand-tuned CSS @keyframes version of
// this (translate/rotate/scale between percentage stops) never looked
// alive — transform interpolation between two points is always a straight
// line no matter the easing curve, so it read as a flat cutout sliding
// around rather than something with real weight and momentum. This drives
// every leg with framer-motion's spring physics instead (real
// stiffness/damping/mass, with natural overshoot and settle), scripted as
// one plain async sequence — so the position animation and Kokeshi's mood
// swap (a real React state change; a spring can't cross-fade which SVG
// paths render) can never drift out of sync the way two independently
// clocked loops could: the mood flips exactly between two awaited steps
// in the same function, not on a separate timer.
export default function HeroDuo() {
  const [scope, animate] = useAnimate();
  const [excited, setExcited] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    async function loop() {
      while (!cancelled) {
        // Obake hovers at rest — a slow, slightly irregular bob so it
        // doesn't read as a metronome even before anything happens.
        animate(".hero-obake", { y: [0, -5, 0, -3, 0] }, { duration: 2.6, ease: "easeInOut" });
        await sleep(1500);
        if (cancelled) break;

        // Wind-up: leans back half a beat before launching in, like
        // gathering momentum for a hop — real physical motion has this
        // anticipation, a straight tween never does.
        await animate(".hero-obake", { x: 6, y: 4, rotate: 4 }, { type: "spring", stiffness: 400, damping: 14 });
        if (cancelled) break;

        // The lunge in — one springy hop with real overshoot (stiffness
        // high, damping low) so it snaps past its landing point and
        // settles back, instead of gliding to a stop.
        await animate(
          ".hero-obake",
          { x: -56, y: -6, rotate: -10, scale: 1.1 },
          { type: "spring", stiffness: 340, damping: 11, mass: 0.7 }
        );
        if (cancelled) break;

        // Contact — mood swap lands exactly here, between two awaited
        // steps, guaranteed in sync with the pose that's actually on
        // screen at this instant.
        setExcited(true);
        animate(
          ".hero-kokeshi",
          { x: [0, 5, -4, 3, -1, 0], rotate: [0, -6, 4, -2, 1, 0] },
          { duration: 0.55, ease: "easeOut" }
        );
        animate(
          ".hero-sparkle",
          { scale: [0, 1.2, 0], opacity: [0, 1, 0], rotate: [0, 90] },
          { duration: 0.7, ease: "easeOut", delay: 0.05 }
        );
        await sleep(220);
        if (cancelled) break;

        // Recoil — Obake bounces back and up, startled by its own bump,
        // another spring so the pull-away has the same springy quality
        // as the approach instead of feeling like a different animation.
        await animate(
          ".hero-obake",
          { x: -30, y: -30, rotate: 14, scale: 0.94 },
          { type: "spring", stiffness: 260, damping: 13 }
        );
        if (cancelled) break;
        await sleep(500);
        setExcited(false);
        if (cancelled) break;

        // Settle back to rest — softer spring, no overshoot, it's done.
        await animate(".hero-obake", { x: 0, y: 0, rotate: 0, scale: 1 }, { type: "spring", stiffness: 170, damping: 20 });
        if (cancelled) break;
        await sleep(300);
      }
    }

    loop();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={scope} className="relative h-32 w-64 sm:h-36 sm:w-72">
      <div className="hero-kokeshi absolute bottom-2 left-10 sm:left-12">
        <Mascot size={80} mood={excited ? "excited" : "happy"} />
      </div>
      <div className="hero-obake absolute bottom-4 left-[108px] sm:left-[122px]">
        <Obake size={64} />
      </div>
      <span className="hero-sparkle absolute opacity-0" style={{ left: "30%", top: "20%" }} />
      <span className="hero-sparkle absolute opacity-0" style={{ left: "40%", top: "8%" }} />
      <span className="hero-sparkle absolute opacity-0" style={{ left: "24%", top: "36%" }} />
    </div>
  );
}

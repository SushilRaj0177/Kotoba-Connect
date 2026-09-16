"use client";

import { useEffect, useRef, useState } from "react";
import Mascot from "@/components/Mascot";
import { Obake } from "@/components/mascots/candidates";

// The landing hero's mascot pair, previously just two independently
// idling characters standing next to each other. Obake's motion, Kokeshi's
// jolt, and the sparkle burst are one shared 4.4s CSS keyframe cycle
// (see .hero-obake / .hero-kokeshi / .hero-sparkle in globals.css) so
// they can never drift apart. Kokeshi's face (happy vs. startled) is the
// one piece that has to be real React state — a mood swap changes which
// SVG paths render, CSS alone can't cross-fade that — so it's synced to
// the exact same cycle via requestAnimationFrame instead of a second,
// separately-timed animation.
const CYCLE_MS = 4400;
const EXCITED_START = 0.5 * CYCLE_MS;
const EXCITED_END = 0.68 * CYCLE_MS;

export default function HeroDuo() {
  const [excited, setExcited] = useState(false);
  // The CSS motion loops (.hero-obake/.hero-kokeshi/.hero-sparkle) start
  // paused and only released here, at the exact same rAF tick that zeroes
  // the JS clock below — otherwise CSS starts animating the instant the
  // element paints (typically before this effect even runs), giving the
  // two loops a random few-hundred-ms startup skew that would make the
  // face swap land visibly before or after the actual moment of contact.
  const [started, setStarted] = useState(false);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    let raf: number;
    function tick(now: number) {
      if (startRef.current === null) {
        startRef.current = now;
        setStarted(true);
      }
      const phase = (now - startRef.current) % CYCLE_MS;
      const isExcited = phase >= EXCITED_START && phase <= EXCITED_END;
      setExcited((prev) => (prev === isExcited ? prev : isExcited));
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const playState = { animationPlayState: started ? "running" : "paused" } as const;

  return (
    <div className="relative h-32 w-64 sm:h-36 sm:w-72">
      <div className="hero-kokeshi absolute bottom-2 left-10 sm:left-12" style={playState}>
        <Mascot size={80} mood={excited ? "excited" : "happy"} />
      </div>
      <div className="hero-obake absolute bottom-4 left-[108px] sm:left-[122px]" style={playState}>
        <Obake size={64} />
      </div>
      <span className="hero-sparkle" style={{ ...playState, left: "30%", top: "20%", animationDelay: "0ms" }} />
      <span className="hero-sparkle" style={{ ...playState, left: "40%", top: "8%", animationDelay: "90ms" }} />
      <span className="hero-sparkle" style={{ ...playState, left: "24%", top: "36%", animationDelay: "170ms" }} />
    </div>
  );
}

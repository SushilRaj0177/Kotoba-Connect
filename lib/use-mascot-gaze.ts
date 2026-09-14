"use client";

import { useEffect, type RefObject } from "react";
import { subscribeCursor } from "@/lib/cursor-tracker";

// Makes a mascot's pupils track the cursor — the "reaction to cursor
// interaction" ask. Reads the shared cursor-tracker (one global listener
// for the whole page, see lib/cursor-tracker.ts) and writes the offset
// straight to each pupil's `transform` attribute via the DOM ref, bypassing
// React state entirely so this never triggers a re-render on mouse move.
export function useMascotGaze(
  svgRef: RefObject<SVGSVGElement>,
  eyeRefs: RefObject<SVGCircleElement>[],
  enabled: boolean
) {
  useEffect(() => {
    if (!enabled) return;

    return subscribeCursor((cursorX, cursorY) => {
      const svg = svgRef.current;
      if (!svg) return;

      const rect = svg.getBoundingClientRect();
      if (rect.width === 0) return;

      const originX = rect.left + rect.width / 2;
      const originY = rect.top + rect.height / 2;
      const dx = cursorX - originX;
      const dy = cursorY - originY;
      const dist = Math.hypot(dx, dy) || 1;

      // Offset in the SVG's own 0-100 viewBox units, not screen pixels.
      const maxOffset = 1.7;
      const ox = (dx / dist) * maxOffset;
      const oy = (dy / dist) * maxOffset;
      const transform = `translate(${ox.toFixed(2)} ${oy.toFixed(2)})`;

      for (const eyeRef of eyeRefs) {
        eyeRef.current?.setAttribute("transform", transform);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);
}

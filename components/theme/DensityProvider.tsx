"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { DENSITY_COOKIE, type CardDensity } from "@/lib/density-constants";

interface DensityContextValue {
  density: CardDensity;
  setDensity: (next: CardDensity) => void;
}

const DensityContext = createContext<DensityContextValue | null>(null);

// Same cookie-backed pattern as ThemeProvider, but this never touches
// data-theme/CSS variables — it's a plain preference consulted by
// individual components (EntryCard, EntryDetail) to decide whether to
// render the always-open AI insight box or the click-to-expand one.
export function DensityProvider({
  initialDensity,
  children,
}: {
  initialDensity: CardDensity;
  children: React.ReactNode;
}) {
  const [density, setDensityState] = useState<CardDensity>(initialDensity);

  const setDensity = useCallback((next: CardDensity) => {
    document.cookie = `${DENSITY_COOKIE}=${next}; path=/; max-age=31536000; SameSite=Lax`;
    setDensityState(next);
  }, []);

  const value = useMemo(() => ({ density, setDensity }), [density, setDensity]);

  return <DensityContext.Provider value={value}>{children}</DensityContext.Provider>;
}

export function useDensity() {
  const ctx = useContext(DensityContext);
  if (!ctx) throw new Error("useDensity must be used within DensityProvider");
  return ctx;
}

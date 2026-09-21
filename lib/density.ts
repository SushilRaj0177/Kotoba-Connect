import { cookies } from "next/headers";
import { DENSITY_COOKIE, type CardDensity } from "@/lib/density-constants";

export function getServerDensity(): CardDensity {
  const raw = cookies().get(DENSITY_COOKIE)?.value;
  return raw === "compact" ? raw : "comfortable";
}

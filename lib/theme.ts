import { cookies } from "next/headers";
import { THEME_COOKIE, type Theme } from "@/lib/theme-constants";

export function getServerTheme(): Theme {
  const raw = cookies().get(THEME_COOKIE)?.value;
  return raw === "dark" || raw === "edge" ? raw : "light";
}

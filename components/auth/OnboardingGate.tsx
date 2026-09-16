"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useClientAuth } from "@/components/auth/ClientAuthProvider";

// Email/password signup collects a display name directly (see
// app/login/page.tsx), but Google OAuth signups bypass that form entirely,
// so this is the one place that gap gets caught — for OAuth signups and any
// pre-existing account from before display name became mandatory.
const EXEMPT_PATHS = ["/onboarding/name", "/login", "/auth/callback", "/terms", "/privacy"];

export default function OnboardingGate() {
  const { userId, needsDisplayName } = useClientAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!userId || !needsDisplayName) return;
    if (EXEMPT_PATHS.some((p) => pathname.startsWith(p))) return;
    router.replace("/onboarding/name");
  }, [userId, needsDisplayName, pathname, router]);

  return null;
}

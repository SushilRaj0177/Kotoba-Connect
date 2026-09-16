"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface ClientAuthValue {
  userId: string | null | undefined; // undefined = not resolved yet
  isAdmin: boolean;
  needsDisplayName: boolean;
}

const ClientAuthContext = createContext<ClientAuthValue>({
  userId: undefined,
  isAdmin: false,
  needsDisplayName: false,
});

// SideRail and MobileNav each used to run their own supabase.auth.getUser()
// call plus their own onAuthStateChange subscription — two redundant
// parallel network round-trips and listeners doing the exact same thing on
// every page load. One shared subscription here, consumed via context,
// cuts that back to one.
export function ClientAuthProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null | undefined>(undefined);
  const [isAdmin, setIsAdmin] = useState(false);
  const [needsDisplayName, setNeedsDisplayName] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    async function loadProfile(uid: string | null) {
      setUserId(uid);
      if (!uid) {
        setIsAdmin(false);
        setNeedsDisplayName(false);
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("is_admin, display_name")
        .eq("id", uid)
        .single();
      setIsAdmin(!!data?.is_admin);
      // Google OAuth signups (and any pre-existing account from before
      // display name became mandatory) skip the signup form that collects
      // it — this is the one place their gap gets caught, everywhere else
      // that reads display_name already treats a blank one as optional.
      setNeedsDisplayName(!!data && !data.display_name?.trim());
    }

    supabase.auth.getUser().then(({ data }) => loadProfile(data.user?.id ?? null));

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      loadProfile(session?.user?.id ?? null);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <ClientAuthContext.Provider value={{ userId, isAdmin, needsDisplayName }}>{children}</ClientAuthContext.Provider>
  );
}

export function useClientAuth() {
  return useContext(ClientAuthContext);
}

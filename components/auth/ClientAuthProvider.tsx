"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface ClientAuthValue {
  userId: string | null | undefined; // undefined = not resolved yet
  isAdmin: boolean;
}

const ClientAuthContext = createContext<ClientAuthValue>({ userId: undefined, isAdmin: false });

// SideRail and MobileNav each used to run their own supabase.auth.getUser()
// call plus their own onAuthStateChange subscription — two redundant
// parallel network round-trips and listeners doing the exact same thing on
// every page load. One shared subscription here, consumed via context,
// cuts that back to one.
export function ClientAuthProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null | undefined>(undefined);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    async function loadProfile(uid: string | null) {
      setUserId(uid);
      if (!uid) {
        setIsAdmin(false);
        return;
      }
      const { data } = await supabase.from("profiles").select("is_admin").eq("id", uid).single();
      setIsAdmin(!!data?.is_admin);
    }

    supabase.auth.getUser().then(({ data }) => loadProfile(data.user?.id ?? null));

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      loadProfile(session?.user?.id ?? null);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  return <ClientAuthContext.Provider value={{ userId, isAdmin }}>{children}</ClientAuthContext.Provider>;
}

export function useClientAuth() {
  return useContext(ClientAuthContext);
}

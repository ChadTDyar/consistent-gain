import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AuthStatus = "loading" | "signed_in" | "signed_out";

/** Tracks whether a session exists. Starts as "loading" until known. */
export function useAuthStatus(): AuthStatus {
  const [status, setStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    let active = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setStatus(session ? "signed_in" : "signed_out");
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (active) setStatus(session ? "signed_in" : "signed_out");
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return status;
}

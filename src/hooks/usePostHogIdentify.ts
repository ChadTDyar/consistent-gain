import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import posthog from "posthog-js";

export function usePostHogIdentify() {
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const user = session.user;
        posthog.identify(user.email, {
          email: user.email,
          app_id: "momentum",
          user_id: user.id,
          created_at: user.created_at,
          auth_provider: user.app_metadata?.provider || "email",
        });
      }

      if (event === "SIGNED_OUT") {
        posthog.reset();
      }
    });

    return () => subscription.unsubscribe();
  }, []);
}

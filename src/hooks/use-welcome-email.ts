import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/** Only treat someone as a brand-new signup for their first 24 hours. */
const NEW_USER_WINDOW_MS = 24 * 60 * 60 * 1000;

export const useSendWelcomeEmail = (user: any) => {
  useEffect(() => {
    const sendWelcomeEmail = async () => {
      if (!user || !user.email) return;

      // Existing members opening the app on a new device/browser must never
      // be treated as new signups just because localStorage is empty.
      const createdAt = user.created_at ? new Date(user.created_at).getTime() : NaN;
      if (!Number.isFinite(createdAt) || Date.now() - createdAt > NEW_USER_WINDOW_MS) return;

      const welcomeSent = localStorage.getItem(`welcome_sent_${user.id}`);
      if (welcomeSent) return;

      try {
        await supabase.functions.invoke("send-welcome-email", {
          body: {
            email: user.email,
            name: user.user_metadata?.name || "",
            userId: user.id,
          },
        });
        localStorage.setItem(`welcome_sent_${user.id}`, "true");
      } catch (error) {
        console.error("Failed to send welcome email:", error);
      }
    };

    const timer = setTimeout(sendWelcomeEmail, 2000);
    return () => clearTimeout(timer);
  }, [user]);
};

import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useSendWelcomeEmail = (user: any) => {
  useEffect(() => {
    const sendWelcomeEmail = async () => {
      if (!user || !user.email) return;
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

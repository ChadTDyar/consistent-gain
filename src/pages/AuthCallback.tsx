import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Capacitor } from "@capacitor/core";
import { Loader2 } from "lucide-react";

/**
 * AuthCallback handles the /auth/callback route.
 *
 * - Web browser: extracts tokens from URL hash/query, calls setSession(), redirects to /dashboard.
 * - iOS universal link: Capacitor's appUrlOpen listener in Auth.tsx handles
 *   the session handoff; this page may never render, but we handle it gracefully.
 */
export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // On native platforms the App.addListener('appUrlOpen') in Auth.tsx
    // handles token extraction before this component mounts.
    // If the component does mount (e.g. deep link race), give the
    // listener a moment then fall through to dashboard.
    if (Capacitor.isNativePlatform()) {
      const timeout = setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 2000);
      return () => clearTimeout(timeout);
    }

    // Web: extract tokens from the URL hash that Supabase appends
    const handleWebCallback = async () => {
      try {
        const hash = window.location.hash.substring(1); // remove leading #
        const params = new URLSearchParams(hash);
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) {
            console.error("AuthCallback setSession error:", error);
          }
        } else {
          // Supabase may have already handled the session via onAuthStateChange
          // triggered by the URL hash. Check for an existing session.
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) {
            console.warn("AuthCallback: no tokens found and no active session");
          }
        }
      } catch (err) {
        console.error("AuthCallback error:", err);
      } finally {
        navigate("/dashboard", { replace: true });
      }
    };

    handleWebCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-cream">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
}

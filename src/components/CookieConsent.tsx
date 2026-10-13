import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Cookie } from "lucide-react";

const COOKIE_CONSENT_KEY = "momentum-cookie-consent";

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const { pathname } = useLocation();
  const barRef = useRef<HTMLDivElement>(null);
  const hidden = pathname.startsWith("/auth");
  const visible = showBanner && !hidden;

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) setShowBanner(true);
  }, []);

  // Reserve space at the bottom of the page equal to the banner height,
  // so primary CTAs can always be scrolled above it.
  useEffect(() => {
    const body = document.body;
    if (!visible || !barRef.current) {
      body.style.paddingBottom = "";
      return;
    }
    const el = barRef.current;
    const apply = () => { body.style.paddingBottom = `${el.offsetHeight}px`; };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => { ro.disconnect(); body.style.paddingBottom = ""; };
  }, [visible]);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    setShowBanner(false);
    if (typeof window.gtag !== "undefined") {
      window.gtag("consent", "update", { analytics_storage: "granted" });
    }
  };

  const handleDecline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "declined");
    setShowBanner(false);
    if (typeof window.gtag !== "undefined") {
      window.gtag("consent", "update", { analytics_storage: "denied" });
    }
  };

  if (!visible) return null;

  return (
    <div
      ref={barRef}
      role="region"
      aria-label="Cookie consent"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card shadow-lg md:bottom-4 md:left-4 md:right-4 md:mx-auto md:max-w-3xl md:rounded-xl md:border"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center gap-3 px-3 py-2 md:px-5 md:py-3">
        <Cookie className="hidden md:block h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
        <p className="flex-1 text-xs md:text-sm text-muted-foreground leading-snug">
          We use cookies for login and analytics.{" "}
          <a href="/privacy" className="font-medium text-primary hover:underline">Learn more</a>
        </p>
        <div className="flex shrink-0 gap-2">
          <Button onClick={handleDecline} variant="outline" size="sm" className="min-h-[44px] px-3">
            Decline
          </Button>
          <Button onClick={handleAccept} size="sm" className="min-h-[44px] px-3">
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}

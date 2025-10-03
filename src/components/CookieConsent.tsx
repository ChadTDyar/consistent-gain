import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Cookie } from "lucide-react";

const COOKIE_CONSENT_KEY = "momentum-cookie-consent";

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    setShowBanner(false);
    // Initialize analytics if user accepts
    if (typeof window.gtag !== "undefined") {
      window.gtag("consent", "update", {
        analytics_storage: "granted",
      });
    }
  };

  const handleDecline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "declined");
    setShowBanner(false);
    // Disable analytics if user declines
    if (typeof window.gtag !== "undefined") {
      window.gtag("consent", "update", {
        analytics_storage: "denied",
      });
    }
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 slide-up">
      <Card className="max-w-4xl mx-auto border-2 border-primary/20 shadow-2xl bg-card">
        <div className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Cookie className="h-6 w-6 text-primary" />
              </div>
            </div>
            
            <div className="flex-1 space-y-2">
              <h3 className="font-display font-semibold text-lg text-foreground">
                We value your privacy
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We use essential cookies to keep you logged in and analytics cookies to understand how you use our app. 
                You can choose to accept or decline non-essential cookies.{" "}
                <a href="/privacy" className="text-primary hover:underline font-medium">
                  Learn more
                </a>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Button
                onClick={handleDecline}
                variant="outline"
                className="border-2 font-semibold"
                size="lg"
              >
                Decline
              </Button>
              <Button
                onClick={handleAccept}
                className="shadow-sm hover:shadow-md font-semibold"
                size="lg"
              >
                Accept
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
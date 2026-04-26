import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CoachChat } from "@/components/CoachChat";
import { UpgradeWall } from "@/components/UpgradeWall";
import { MOMENTUM } from "@/constants/value-language";
import { calculateStreak, getUserActivityLogs, getDaysSinceLastActivity } from "@/lib/streakUtils";
import { SEO } from "@/components/SEO";
import { PLANS, type PlanTier } from "@/lib/plans";
import { Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isIOSNative } from "@/lib/platform";
import { purchaseAnnual, purchaseMonthly, restorePurchases } from "@/lib/purchases";
import { toast } from "sonner";

export default function Coach() {
  const navigate = useNavigate();
  const [streak, setStreak] = useState(0);
  const [goalsCount, setGoalsCount] = useState(0);
  const [daysSinceActivity, setDaysSinceActivity] = useState(0);
  const [plan, setPlan] = useState<PlanTier>("free");
  const [showUpgradeWall, setShowUpgradeWall] = useState(false);
  const [iapLoading, setIapLoading] = useState<null | 'monthly' | 'annual' | 'restore'>(null);

  const handleIAP = async (interval: 'monthly' | 'annual') => {
    setIapLoading(interval);
    try {
      const fn = interval === 'annual' ? purchaseAnnual : purchaseMonthly;
      const isActive = await fn();
      if (isActive) {
        toast.success("Welcome to Premium!");
        setPlan('pro');
      }
    } catch (err: any) {
      const msg = String(err?.message ?? err ?? '');
      // RevenueCat user-cancelled error code is 1; surface only real errors.
      if (!/cancel|userCancelled|1\b/i.test(msg)) {
        console.error('[Coach IAP] purchase error:', err);
        toast.error("Purchase failed. Please try again.");
      }
    } finally {
      setIapLoading(null);
    }
  };

  const handleRestore = async () => {
    setIapLoading('restore');
    try {
      const isActive = await restorePurchases();
      if (isActive) {
        toast.success("Subscription restored!");
        setPlan('pro');
      } else {
        toast.info("No active subscription found.");
      }
    } catch (err) {
      console.error('[Coach IAP] restore error:', err);
      toast.error("Could not restore purchases.");
    } finally {
      setIapLoading(null);
    }
  };

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }
      
      const user = session.user;
      
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_premium, plan")
        .eq("id", user.id)
        .single();
      setPlan((profile?.plan || 'free') as PlanTier);

      const { count } = await supabase
        .from("goals")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);
      setGoalsCount(count ?? 0);

      const logs = await getUserActivityLogs();
      setStreak(calculateStreak(logs));
      setDaysSinceActivity(getDaysSinceLastActivity(logs));
    };
    init();
  }, [navigate]);

  const isPremium = plan === 'pro';

  return (
    <>
      <SEO title="Coach - Momentum" description="Chat with your AI fitness coach." />
      <div className="min-h-screen bg-background-cream pb-24">
        <header className="sticky top-0 z-10 bg-card/95 backdrop-blur-md border-b border-border px-4 py-4">
          <h1 className="text-2xl font-display font-bold text-gradient">Coach</h1>
          <p className="text-sm text-muted-foreground">Your AI fitness companion</p>
        </header>

        <div className="container mx-auto px-4 py-4 max-w-2xl h-[calc(100vh-180px)]">
          {isPremium ? (
            <CoachChat
              userContext={{
                streak,
                goalsCount,
                lastActivity: daysSinceActivity === 0 ? "Active today" : 
                             daysSinceActivity === 1 ? "Active yesterday" : 
                             `${daysSinceActivity} days since last activity`,
                isPremium: true,
                plan: 'pro',
              }}
              fullPage
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full space-y-6 px-4">
              {/* Coach preview */}
              <div className="max-w-md w-full space-y-4">
                <p className="text-[0.7rem] uppercase tracking-wide text-muted-foreground font-semibold">
                  What AI Coach does
                </p>
                <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
                  <p className="text-sm text-foreground leading-relaxed">
                    <span className="font-semibold text-primary">Coach:</span>{" "}
                    "You've skipped your morning stretch three Mondays in a row. What happens on Mondays?"
                  </p>
                  <div className="text-sm text-muted-foreground leading-relaxed blur-sm select-none">
                    User response and coach follow-up...
                  </div>
                </div>

                <div className="text-center space-y-3 pt-2">
                  <div className="flex items-center justify-center gap-2">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                    <h3 className="font-semibold text-lg text-foreground">AI Coach is a Premium feature.</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    When you miss the same day three weeks running, Coach notices — and adjusts your plan around your actual life, not an ideal one.
                  </p>
                  {isIOSNative() ? (
                    <>
                      <Button
                        onClick={() => handleIAP('annual')}
                        disabled={iapLoading !== null}
                        className="w-full font-bold text-sm text-white min-h-[48px]"
                        style={{ background: '#0d3b5e' }}
                      >
                        {iapLoading === 'annual' ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          `Unlock Premium — $${PLANS.pro.annualPrice}/yr`
                        )}
                      </Button>
                      <Button
                        onClick={() => handleIAP('monthly')}
                        disabled={iapLoading !== null}
                        variant="outline"
                        className="w-full text-sm min-h-[44px]"
                      >
                        {iapLoading === 'monthly' ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          `Or $${PLANS.pro.price.toFixed(2)}/mo`
                        )}
                      </Button>
                      <button
                        onClick={handleRestore}
                        disabled={iapLoading !== null}
                        className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
                      >
                        {iapLoading === 'restore' ? 'Restoring…' : 'Restore Purchases'}
                      </button>
                      <p className="text-xs text-muted-foreground">Cancel anytime in Settings.</p>
                    </>
                  ) : (
                    <>
                      <Button
                        onClick={() => navigate("/pricing")}
                        className="w-full font-bold text-sm text-white"
                        style={{ background: '#0d3b5e' }}
                      >
                        🔒 Upgrade to Premium →
                      </Button>
                      <p className="text-xs text-muted-foreground">Cancel anytime.</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showUpgradeWall && (
        <UpgradeWall
          headline={MOMENTUM.walls.ai_coach.headline}
          body={MOMENTUM.walls.ai_coach.body}
          cta={MOMENTUM.walls.ai_coach.cta}
          accentColor="#0d3b5e"
          coachPreview
          onUpgrade={() => { setShowUpgradeWall(false); navigate("/pricing"); }}
          onDismiss={() => setShowUpgradeWall(false)}
        />
      )}
    </>
  );
}
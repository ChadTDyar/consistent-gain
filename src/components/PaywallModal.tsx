import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Crown, Loader2, CheckCircle } from "lucide-react";
import { useState } from "react";
import { Capacitor } from "@capacitor/core";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PLANS, type BillingInterval } from "@/lib/plans";
import { purchaseMonthly, purchaseAnnual, restorePurchases } from "@/lib/purchases";
import { handleCheckout } from "@/lib/checkout";

interface PaywallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature?: string;
  requiredPlan?: string;
}

type PlanChoice = 'monthly' | 'annual';

export default function PaywallModal({ open, onOpenChange, feature }: PaywallModalProps) {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<PlanChoice>('annual');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const isNative = Capacitor.isNativePlatform();
  const monthlyPrice = PLANS.pro.price;
  const annualPrice = PLANS.pro.annualPrice;
  const annualMonthly = (annualPrice / 12).toFixed(2);

  const handlePurchase = async () => {
    setLoading(true);
    try {
      if (isNative) {
        const isActive = selected === 'monthly'
          ? await purchaseMonthly()
          : await purchaseAnnual();

        if (isActive) {
          setSuccess(true);
          setTimeout(() => {
            onOpenChange(false);
            navigate("/dashboard");
          }, 1500);
        }
      } else {
        // Web: redirect to Stripe Checkout
        const priceIds = {
          monthly: 'price_1TLRRxL98dr6Pw0kdyFkEsEp',
          annual: 'price_1TLRT0L98dr6Pw0kBgfProeu',
        };
        const { data: { user } } = await supabase.auth.getUser();
        await handleCheckout(priceIds[selected], 'momentum', user?.email ?? undefined);
      }
    } catch (error) {
      console.error('[Paywall] Purchase error:', error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!isNative) {
      toast.info("Manage your subscription at momentumfit.app");
      return;
    }

    setLoading(true);
    try {
      const isActive = await restorePurchases();
      if (isActive) {
        toast.success("Subscription restored!");
        setSuccess(true);
        setTimeout(() => {
          onOpenChange(false);
          navigate("/dashboard");
        }, 1500);
      } else {
        toast.info("No active subscription found.");
      }
    } catch (error) {
      console.error('[Paywall] Restore error:', error);
      toast.error("Could not restore purchases. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const featureMessages: Record<string, string> = {
    goals: "Unlock unlimited goals",
    streak_repair: "Unlock Streak Repair",
    ai_coach: "Unlock AI Coach",
    history: "Unlock full history",
  };

  const subtitle = featureMessages[feature || ''] || "Unlock all premium features";

  if (success) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-success/10">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <DialogTitle className="text-2xl text-center">You're all set!</DialogTitle>
            <DialogDescription className="text-center text-base">
              Redirecting to your dashboard…
            </DialogDescription>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mx-auto mb-4">
            <Crown className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-2xl text-center">Go Premium</DialogTitle>
          <DialogDescription className="text-center text-base pt-1">
            {subtitle}
          </DialogDescription>
        </DialogHeader>

        {/* Plan options */}
        <div className="space-y-3 pt-2">
          <button
            onClick={() => setSelected('annual')}
            disabled={loading}
            className={`w-full flex items-center justify-between rounded-xl border-2 p-4 transition-all text-left ${
              selected === 'annual'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-muted-foreground/30'
            }`}
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">Annual</span>
                <span className="inline-flex items-center rounded-full bg-success/20 text-success px-2 py-0.5 text-xs font-bold">
                  Save 25%
                </span>
              </div>
              <span className="text-sm text-muted-foreground">${annualMonthly}/mo · billed ${annualPrice}/yr</span>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              selected === 'annual' ? 'border-primary' : 'border-muted-foreground/40'
            }`}>
              {selected === 'annual' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
            </div>
          </button>

          <button
            onClick={() => setSelected('monthly')}
            disabled={loading}
            className={`w-full flex items-center justify-between rounded-xl border-2 p-4 transition-all text-left ${
              selected === 'monthly'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-muted-foreground/30'
            }`}
          >
            <div>
              <span className="font-semibold text-foreground">Monthly</span>
              <br />
              <span className="text-sm text-muted-foreground">${monthlyPrice.toFixed(2)}/mo</span>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              selected === 'monthly' ? 'border-primary' : 'border-muted-foreground/40'
            }`}>
              {selected === 'monthly' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
            </div>
          </button>
        </div>

        {/* CTA */}
        <Button
          className="w-full mt-4 min-h-[48px] font-semibold text-base"
          size="lg"
          onClick={handlePurchase}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            `Continue — $${selected === 'annual' ? `${annualPrice}/yr` : `${monthlyPrice.toFixed(2)}/mo`}`
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">Cancel anytime. No commitments.</p>

        {/* Restore */}
        <button
          onClick={handleRestore}
          disabled={loading}
          className="text-xs text-center text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors w-full"
        >
          Restore Purchases
        </button>
      </DialogContent>
    </Dialog>
  );
}

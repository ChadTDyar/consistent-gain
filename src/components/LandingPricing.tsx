import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Star } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { handleCheckout } from "@/lib/checkout";
import { isIOSNative } from "@/lib/platform";

import type { BillingInterval } from "@/lib/plans";

const tiers = [
  {
    name: "Free",
    monthlyPrice: "$0",
    annualMonthlyPrice: "$0",
    annualTotal: null,
    savingsLabel: null,
    highlight: false,
    mostPopular: false,
    cta: "Get Started Free",
    plan: null as null | 'plus' | 'pro',
    priceIds: null as null | { monthly: string; annual: string },
    features: [
      "3 habits",
      "Daily check-ins",
      "7-day streaks",
    ],
  },
  {
    name: "Pro",
    monthlyPrice: "$3.99",
    annualMonthlyPrice: "$3.17",
    annualTotal: "$38",
    savingsLabel: "21%",
    highlight: true,
    mostPopular: true,
    cta: "Go Pro — $3.99/mo",
    plan: 'plus' as null | 'plus' | 'pro',
    priceIds: { monthly: 'price_1TLROuL98dr6Pw0kEFuhgPnA', annual: 'price_1TLRPCL98dr6Pw0kvyaljYet' },
    features: [
      "Unlimited goals",
      "30-day history",
      "Streak Repair",
      "Priority support",
    ],
  },
  {
    name: "Premium",
    monthlyPrice: "$7.99",
    annualMonthlyPrice: "$6.00",
    annualTotal: "$72",
    savingsLabel: "20%",
    highlight: false,
    mostPopular: false,
    cta: "Go Premium — $7.99/mo",
    plan: 'pro' as null | 'plus' | 'pro',
    priceIds: { monthly: 'price_1TLRRxL98dr6Pw0kdyFkEsEp', annual: 'price_1TLRT0L98dr6Pw0kBgfProeu' },
    features: [
      "AI Coach",
      "Unlimited history",
      "Data export",
      "Everything in Pro",
    ],
  },
];

export function LandingPricing() {
  const navigate = useNavigate();
  const [interval, setInterval] = useState<BillingInterval>("monthly");
  const [loading, setLoading] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | undefined>();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) setUserEmail(user.email);
    });
  }, []);

  // Apple IAP compliance: hide the entire pricing section on iOS native builds
  if (isIOSNative()) return null;

  const onCheckout = async (tier: typeof tiers[number]) => {
    if (!tier.plan || !tier.priceIds) return;
    const priceId = tier.priceIds[interval];
    const label = `${tier.plan}-${interval}`;
    setLoading(label);
    try {
      await handleCheckout(priceId, 'momentum', userEmail);
    } catch (error) {
      console.error('[LandingPricing] Checkout error:', error);
      toast.error('Checkout failed. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <section id="pricing" className="py-20 md:py-28 bg-background-cream">
      <div className="container mx-auto px-6 md:px-8 max-w-5xl">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-center text-foreground mb-4">
          Simple, honest pricing
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
          Start free. Upgrade when you're ready for more.
        </p>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex items-center gap-1 rounded-full bg-muted p-1">
            <button
              onClick={() => setInterval("monthly")}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                interval === "monthly"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setInterval("annual")}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
                interval === "annual"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Annual
              <span className="inline-flex items-center rounded-full bg-success/20 text-success px-2 py-0.5 text-xs font-bold">
                Save 20%+
              </span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {tiers.map((tier) => (
            <Card
              key={tier.name}
              className={`relative flex flex-col ${
                tier.mostPopular
                  ? "border-2 shadow-lg ring-2 ring-primary/20"
                  : "border-border"
              }`}
              style={tier.mostPopular ? { borderColor: '#0d3b5e' } : undefined}
            >
              {tier.mostPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full text-white flex items-center gap-1" style={{ background: '#0d3b5e' }}>
                  <Star className="h-3 w-3" /> Most Popular
                </div>
              )}
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-display">{tier.name}</CardTitle>
                <div className="mt-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-foreground">
                      {interval === "annual" ? tier.annualMonthlyPrice : tier.monthlyPrice}
                    </span>
                    <span className="text-muted-foreground text-sm">/mo</span>
                  </div>
                  {interval === "annual" && tier.annualTotal && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Billed annually at {tier.annualTotal}/yr — Save {tier.savingsLabel}
                    </p>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex flex-col flex-1 gap-4">
                <ul className="space-y-2 flex-1">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => tier.plan ? onCheckout(tier) : navigate("/auth")}
                  variant={tier.mostPopular ? "default" : "outline"}
                  className={tier.mostPopular ? "btn-gradient w-full" : "w-full"}
                  disabled={tier.plan ? loading === `${tier.plan}-${interval}` : false}
                >
                  {tier.plan && loading === `${tier.plan}-${interval}` ? 'Redirecting…' : tier.cta}
                </Button>
                {tier.plan && (
                  <p className="text-center mt-2 text-xs text-muted-foreground">
                    Cancel anytime.
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
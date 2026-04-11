import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

type BillingInterval = "monthly" | "annual";

const tiers = [
  {
    name: "Free",
    monthlyPrice: "$0",
    annualMonthlyPrice: "$0",
    annualTotal: null,
    savingsLabel: null,
    highlight: false,
    cta: "Get Started Free",
    href: null,
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
    highlight: false,
    cta: "Upgrade to Pro →",
    href: "https://buy.stripe.com/7sY5kE0xm5z08HK5f93ZK0c",
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
    annualMonthlyPrice: "$6.42",
    annualTotal: "$77",
    savingsLabel: "20%",
    highlight: true,
    cta: "Upgrade to Premium →",
    href: "https://buy.stripe.com/3cIfZicg43qS1fi3713ZK0d",
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
                tier.highlight
                  ? "border-primary shadow-lg ring-2 ring-primary/20"
                  : "border-border"
              }`}
            >
              {tier.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                  Most Popular
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
                  onClick={() => tier.href ? window.open(tier.href, '_blank') : navigate("/auth")}
                  variant={tier.highlight ? "default" : "outline"}
                  className={tier.highlight ? "btn-gradient w-full" : "w-full"}
                >
                  {tier.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

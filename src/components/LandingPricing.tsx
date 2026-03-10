import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "/mo",
    highlight: false,
    cta: "Get Started Free",
    features: [
      "1 activity",
      "Basic habit tracking",
      "Weekly summary",
    ],
  },
  {
    name: "Plus",
    price: "$3.99",
    period: "/mo",
    highlight: false,
    cta: "Start Plus",
    features: [
      "Unlimited activities",
      "AI plan adjustments",
      "Streak insights",
    ],
  },
  {
    name: "Premium",
    price: "$7.99",
    period: "/mo",
    highlight: true,
    cta: "Start Premium",
    features: [
      "Everything in Plus",
      "Nutrition tracking",
      "Coach mode",
      "Export data",
    ],
  },
];

export function LandingPricing() {
  const navigate = useNavigate();

  return (
    <section id="pricing" className="py-20 md:py-28 bg-background-cream">
      <div className="container mx-auto px-6 md:px-8 max-w-5xl">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-center text-foreground mb-4">
          Simple, honest pricing
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
          Start free. Upgrade when you're ready for more.
        </p>

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
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-4xl font-bold text-foreground">{tier.price}</span>
                  <span className="text-muted-foreground text-sm">{tier.period}</span>
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
                  onClick={() => navigate("/auth")}
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

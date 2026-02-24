import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X } from "lucide-react";

const comparisons = [
  {
    feature: "48-hour streak repair window",
    description: "Miss a day? Log it within 48hrs — no reset.",
    momentum: true,
    others: false,
  },
  {
    feature: "Joint-safe exercise alternatives",
    description: "Built-in library of low-impact swaps by body area.",
    momentum: true,
    others: false,
  },
  {
    feature: "Body-map pain tracking",
    description: "Log discomfort by body area; correlates with exercises.",
    momentum: true,
    others: false,
  },
  {
    feature: "Sleep & energy context",
    description: "Daily check-in adjusts expectations to how you actually feel.",
    momentum: true,
    others: false,
  },
  {
    feature: "10-min microblock workouts",
    description: "Pre-built routines when you only have a few minutes.",
    momentum: true,
    others: "Some apps",
  },
  {
    feature: "AI coaching from your data",
    description: "Suggestions based on your streaks, pain, and energy patterns.",
    momentum: "Pro plan",
    others: "Paid only",
  },
  {
    feature: "Free tier with no time limit",
    description: "3 goals, daily check-ins, 7-day streaks — forever free.",
    momentum: true,
    others: "Limited trials",
  },
];

export const ComparisonTable = () => {
  return (
    <section className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-6 md:px-8 max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            What Makes Momentum Different
          </h2>
          <p className="text-xl text-muted-foreground">
            Features built for bodies that need more recovery, not more intensity
          </p>
        </div>

        <Card className="border-primary/10 shadow-xl">
          <CardHeader>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div></div>
              <CardTitle className="text-primary">Momentum</CardTitle>
              <CardTitle className="text-muted-foreground">Typical Apps</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {comparisons.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-3 gap-4 items-start py-4 border-b border-primary/10 last:border-0"
                >
                  <div>
                    <div className="text-sm md:text-base font-medium text-foreground">
                      {item.feature}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {item.description}
                    </div>
                  </div>
                  <div className="flex justify-center pt-1">
                    {item.momentum === true ? (
                      <Check className="w-6 h-6 text-primary" />
                    ) : (
                      <span className="text-sm text-primary font-medium">{item.momentum}</span>
                    )}
                  </div>
                  <div className="flex justify-center pt-1">
                    {item.others === true ? (
                      <Check className="w-6 h-6 text-muted-foreground" />
                    ) : item.others === false ? (
                      <X className="w-6 h-6 text-muted-foreground/40" />
                    ) : (
                      <span className="text-sm text-muted-foreground">{item.others}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X } from "lucide-react";

const comparisons = [
  {
    feature: "Designed for 40+ adults",
    momentum: true,
    others: false
  },
  {
    feature: "No judgment for missed days",
    momentum: true,
    others: false
  },
  {
    feature: "Streak repair feature",
    momentum: true,
    others: false
  },
  {
    feature: "AI coaching support",
    momentum: true,
    others: "Paid only"
  },
  {
    feature: "Simple, focused interface",
    momentum: true,
    others: false
  },
  {
    feature: "Free tier available",
    momentum: true,
    others: "Limited"
  },
  {
    feature: "Built by someone who gets it",
    momentum: true,
    others: false
  }
];

export const ComparisonTable = () => {
  return (
    <section className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-6 md:px-8 max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            Why Momentum is Different
          </h2>
          <p className="text-xl text-muted-foreground">
            Built specifically for real life, not perfect life
          </p>
        </div>

        <Card className="border-primary/10 shadow-xl">
          <CardHeader>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div></div>
              <CardTitle className="text-primary">Momentum</CardTitle>
              <CardTitle className="text-muted-foreground">Other Apps</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {comparisons.map((item, index) => (
                <div 
                  key={index} 
                  className="grid grid-cols-3 gap-4 items-center py-4 border-b border-primary/10 last:border-0"
                >
                  <div className="text-sm md:text-base font-medium text-foreground">
                    {item.feature}
                  </div>
                  <div className="flex justify-center">
                    {item.momentum === true ? (
                      <Check className="w-6 h-6 text-primary" />
                    ) : (
                      <span className="text-sm text-muted-foreground">{item.momentum}</span>
                    )}
                  </div>
                  <div className="flex justify-center">
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

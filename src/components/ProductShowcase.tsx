import { Card, CardContent } from "@/components/ui/card";
import dashboardImage from "@/assets/app-screenshot-dashboard.png";
import trackingImage from "@/assets/app-screenshot-tracking.png";
import { Target, TrendingUp, Heart, Calendar } from "lucide-react";

const features = [
  {
    icon: Target,
    title: "Simple Goal Tracking",
    description: "Set up to 3 fitness goals on free plan. No complicated menus or settings."
  },
  {
    icon: TrendingUp,
    title: "Visual Progress",
    description: "Watch your consistency grow with clear graphs and streak counters."
  },
  {
    icon: Heart,
    title: "Streak Repair",
    description: "Premium feature: Life happens. Fix missed days without losing all progress."
  },
  {
    icon: Calendar,
    title: "Daily Check-ins",
    description: "One tap to log your action. Quick, easy, guilt-free."
  }
];

export const ProductShowcase = () => {
  return (
    <section className="py-20 md:py-32 bg-gradient-to-br from-primary/5 to-primary-warm/5">
      <div className="container mx-auto px-6 md:px-8 max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            See How Momentum Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A simple, clean interface designed for consistency, not complexity
          </p>
        </div>

        {/* Screenshots */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="border-primary/10 shadow-xl overflow-hidden">
            <CardContent className="p-0">
              <img 
                src={dashboardImage} 
                alt="Momentum dashboard showing goal cards, streak counters, and daily progress"
                className="w-full h-auto"
                loading="lazy"
                width="1024"
                height="768"
              />
            </CardContent>
          </Card>
          <Card className="border-primary/10 shadow-xl overflow-hidden">
            <CardContent className="p-0">
              <img 
                src={trackingImage} 
                alt="Goal tracking interface with weekly calendar and check-in history"
                className="w-full h-auto"
                loading="lazy"
                width="1024"
                height="768"
              />
            </CardContent>
          </Card>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="border-primary/10 bg-card hover:shadow-lg transition-shadow">
                <CardContent className="pt-6 text-center space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

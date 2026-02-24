import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, CalendarDays, Bot, TrendingUp, Bell, Trophy } from "lucide-react";

const features = [
  {
    icon: CheckCircle,
    title: "Daily Check-In",
    description: "One tap to log your workout. Fast enough that you'll actually do it.",
  },
  {
    icon: CalendarDays,
    title: "Streak Calendar",
    description: "Visual progress that makes every day count. See your consistency at a glance.",
  },
  {
    icon: Bot,
    title: "AI Coaching",
    description: "Personalized nudges that adapt to your schedule, energy, and real life.",
  },
  {
    icon: TrendingUp,
    title: "Progress Graphs",
    description: "Track trends over weeks and months. Watch consistency compound.",
  },
  {
    icon: Bell,
    title: "Smart Reminders",
    description: "Get a daily reminder at your chosen time. Miss a day? A 'get back on track' nudge, not guilt.",
  },
  {
    icon: Trophy,
    title: "Milestone Celebrations",
    description: "Hit 7, 30, 90, 365 days — Momentum celebrates with you.",
  },
];

export const FeatureGrid = () => {
  return (
    <section id="features" className="py-20 md:py-32 bg-gradient-to-br from-primary/5 to-primary-warm/5">
      <div className="container mx-auto px-6 md:px-8 max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            Everything You Need to Stay Consistent
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Simple tools designed for follow-through, not feature overload
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="border-primary/10 bg-card hover:shadow-lg transition-shadow card-lift">
                <CardContent className="pt-6 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

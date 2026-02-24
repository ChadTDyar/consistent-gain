import { Target, Zap, Flame } from "lucide-react";

const steps = [
  {
    number: 1,
    icon: Target,
    title: "Set your fitness goal",
    description: "Strength, cardio, flexibility, or all three.",
  },
  {
    number: 2,
    icon: Zap,
    title: "Log your first workout",
    description: "Takes 30 seconds.",
  },
  {
    number: 3,
    icon: Flame,
    title: "Start your streak",
    description: "Momentum reminds you daily and celebrates progress.",
  },
];

export const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 md:py-32">
      <div className="container mx-auto px-6 md:px-8 max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Three steps. No complexity. Just follow-through.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="text-center space-y-4">
                <div className="relative mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon className="w-7 h-7 text-primary" />
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                    {step.number}
                  </span>
                </div>
                <h3 className="text-xl font-display font-semibold text-foreground">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

import { ClipboardCheck, Gauge, CheckCircle } from "lucide-react";
import { ReadinessDemo } from "@/components/landing/ReadinessDemo";

const steps = [
  {
    number: 1,
    icon: ClipboardCheck,
    title: "Check in",
    description: "Six quick taps about how today feels. It takes under a minute.",
  },
  {
    number: 2,
    icon: Gauge,
    title: "Get today's plan",
    description: "Full workout, reduced workout, mobility and recovery, or a rest day.",
  },
  {
    number: 3,
    icon: CheckCircle,
    title: "Log what you did",
    description: "Tick off your fitness habits. A 5, 10 or 20 minute session still counts.",
  },
];

/** Homepage section 3: the daily readiness check-in, with a live try-it demo. */
export const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-16 md:py-24 scroll-mt-16">
      <div className="container mx-auto px-6 md:px-8 max-w-5xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
            A one-minute check-in sets today's plan
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Each day you rate six things from 1 to 5: sleep, energy, recovery, soreness, pain, and
            whether you want to train. The check-in is free on every account.
          </p>
        </div>
        <ol className="grid md:grid-cols-3 gap-8 mb-12 list-none p-0">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <li key={step.number} className="text-center space-y-3">
                <div className="relative mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon className="w-7 h-7 text-primary" aria-hidden="true" />
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                    {step.number}
                  </span>
                </div>
                <h3 className="text-xl font-display font-semibold text-foreground">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </li>
            );
          })}
        </ol>
        <ReadinessDemo />
      </div>
    </section>
  );
};

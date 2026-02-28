import { ShieldCheck } from "lucide-react";

export const DifferentiationCallout = () => {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-6 md:px-8 max-w-3xl">
        <div className="relative rounded-2xl border-2 border-primary/20 bg-primary/5 p-8 md:p-10">
          <div className="absolute -top-4 left-8 bg-background-cream px-3">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <p className="text-lg md:text-xl text-foreground leading-relaxed font-medium">
            <strong>Not another to-do list.</strong> Miss a day? You don't lose everything. Momentum uses streak psychology and adaptive coaching to keep busy professionals moving forward — even when work, travel, or life gets in the way.
          </p>
        </div>
      </div>
    </section>
  );
};

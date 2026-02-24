import { Flame, Dumbbell, Calendar } from "lucide-react";

export const SocialProofStrip = () => {
  return (
    <section className="bg-card border-y border-border">
      <div className="container mx-auto px-6 md:px-8 max-w-7xl py-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="flex items-center justify-center gap-3">
            <Flame className="w-6 h-6 text-primary" />
            <span className="text-lg font-semibold text-foreground">10,000+ active streaks</span>
          </div>
          <div className="flex items-center justify-center gap-3">
            <Dumbbell className="w-6 h-6 text-primary" />
            <span className="text-lg font-semibold text-foreground">2M workouts logged</span>
          </div>
          <div className="flex items-center justify-center gap-3">
            <Calendar className="w-6 h-6 text-primary" />
            <span className="text-lg font-semibold text-foreground">Average streak: 37 days</span>
          </div>
        </div>
        <div className="mt-6 text-center">
          <p className="text-muted-foreground italic text-lg">
            "I went from 0 to 90-day streak. Momentum made it feel achievable."
          </p>
        </div>
      </div>
    </section>
  );
};

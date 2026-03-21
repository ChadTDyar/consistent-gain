import { Flame, Target, Calendar } from "lucide-react";

export const SocialProofStrip = () => {
  return (
    <section className="bg-card border-y border-border">
      <div className="container mx-auto px-6 md:px-8 max-w-7xl py-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="flex items-center justify-center gap-3">
            <Flame className="w-6 h-6 text-primary" />
            <span className="text-lg font-semibold text-foreground">Daily streak tracking</span>
          </div>
          <div className="flex items-center justify-center gap-3">
            <Target className="w-6 h-6 text-primary" />
            <span className="text-lg font-semibold text-foreground">Built for consistency</span>
          </div>
          <div className="flex items-center justify-center gap-3">
            <Calendar className="w-6 h-6 text-primary" />
            <span className="text-lg font-semibold text-foreground">5-minute setup</span>
          </div>
        </div>
      </div>
    </section>
  );
};

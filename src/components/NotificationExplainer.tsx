import { Card, CardContent } from "@/components/ui/card";
import { Bell, Heart } from "lucide-react";

export const NotificationExplainer = () => {
  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-6 md:px-8 max-w-3xl">
        <Card className="border-primary/10 shadow-lg">
          <CardContent className="p-8 md:p-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-2xl font-display font-bold text-foreground">
                How does accountability actually work?
              </h3>
            </div>
            <p className="text-muted-foreground leading-relaxed text-lg">
              You set your preferred reminder time. Momentum sends a daily nudge. If you miss a day, you get a supportive "get back on track" message - not a guilt trip.
            </p>
            <div className="flex items-start gap-3 bg-primary/5 rounded-xl p-5">
              <Heart className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <p className="text-foreground leading-relaxed">
                Your streak doesn't reset on one bad day. Momentum uses a <strong>momentum score</strong> that rewards consistency over perfection.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

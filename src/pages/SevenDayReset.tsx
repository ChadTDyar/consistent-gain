import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SEO } from "@/components/SEO";
import { analytics } from "@/lib/analytics";
import momentumLogo from "@/assets/momentum-logo.png";

const days = [
  { title: "Sleep anchor", text: "Pick one bedtime and keep it tonight. Same time, give or take 15 minutes." },
  { title: "Morning light", text: "Step outside for a few minutes within an hour of waking." },
  { title: "Hydration", text: "Drink a glass of water before your first coffee." },
  { title: "Movement snack", text: "Two to five minutes of movement between tasks. A walk, stairs, or a few squats." },
  { title: "Evening shutdown", text: "Set a time to close the laptop and write tomorrow's first task down." },
  { title: "Reflection", text: "Look back at the week. Note which day felt easiest and why." },
  { title: "Plan next week", text: "Choose the one or two actions you want to keep and put them on your calendar." },
];

const schema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "The 7-Day Readiness Reset",
  url: "https://momentumfit.app/7-day-reset",
  description: "A free 7-day reset for busy people. One small action per day, with a daily prompt and simple streak tracking in MomentumFit.",
};

export default function SevenDayReset() {
  const navigate = useNavigate();

  useEffect(() => {
    analytics.resetPageView();
  }, []);

  const start = (position: "top" | "bottom") => {
    analytics.resetCtaClick(position);
    navigate("/auth");
  };

  return (
    <>
      <SEO
        title="The 7-Day Readiness Reset | MomentumFit"
        description="A free 7-day reset for busy people. One small action per day: sleep, light, water, movement, shutdown, reflection, planning. Daily prompts and streak tracking in the app."
        keywords="7 day reset, readiness reset, habit reset challenge, busy professionals routine, daily habit challenge"
        schema={schema}
      />
      <div className="min-h-screen bg-background">
        <nav className="sticky top-0 z-20 bg-card/80 backdrop-blur-md border-b border-border shadow-sm">
          <div className="container mx-auto px-6 md:px-8 max-w-7xl flex items-center justify-between py-3">
            <a href="/" onClick={(e) => { e.preventDefault(); navigate("/"); }} className="flex items-center gap-2">
              <img src={momentumLogo} alt="Momentum" className="h-8 w-auto" />
              <span className="font-display font-bold text-lg text-gradient">Momentum</span>
            </a>
            <Button size="sm" onClick={() => start("top")} className="btn-gradient min-h-[44px]">Start free</Button>
          </div>
        </nav>

        <section className="py-14 md:py-20">
          <div className="container mx-auto px-6 md:px-8 max-w-3xl">
            <p className="text-primary font-semibold text-sm uppercase tracking-wide mb-4">Free 7-day challenge</p>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground leading-tight mb-6">
              The 7-Day Readiness Reset
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              One small action a day for a week. Nothing to buy, nothing to overhaul. Just a simple way to start again.
            </p>
            <Button size="lg" onClick={() => start("top")} className="btn-gradient h-12 md:h-14 px-8 text-base md:text-lg">
              Start the 7-day reset free
            </Button>
          </div>
        </section>

        <section className="pb-12">
          <div className="container mx-auto px-6 md:px-8 max-w-3xl">
            <h2 className="text-2xl font-display font-bold text-foreground mb-6">What each day asks of you</h2>
            <ol className="space-y-3">
              {days.map((d, i) => (
                <li key={d.title}>
                  <Card>
                    <CardContent className="p-5 flex gap-4">
                      <span className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <div>
                        <h3 className="font-semibold text-foreground">Day {i + 1}: {d.title}</h3>
                        <p className="text-muted-foreground">{d.text}</p>
                      </div>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="pb-12">
          <div className="container mx-auto px-6 md:px-8 max-w-3xl grid gap-8 md:grid-cols-2">
            <div>
              <h2 className="text-2xl font-display font-bold text-foreground mb-3">Who it's for</h2>
              <p className="text-muted-foreground leading-relaxed">
                People with full calendars who fell off their routines and want an easy way back in. If you have five minutes a day, you have enough.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold text-foreground mb-3">What you get</h2>
              <ul className="text-muted-foreground space-y-2 list-disc pl-5">
                <li>A daily prompt inside the app telling you today's action</li>
                <li>Simple streak tracking so you can see the week add up</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="py-14 bg-muted/30">
          <div className="container mx-auto px-6 md:px-8 max-w-3xl text-center">
            <h2 className="text-3xl font-display font-bold text-foreground mb-6">Ready for day one?</h2>
            <Button size="lg" onClick={() => start("bottom")} className="btn-gradient h-12 md:h-14 px-8 text-base md:text-lg">
              Start the 7-day reset free
            </Button>
            <p className="text-xs text-muted-foreground mt-8">
              This is general wellness information, not medical advice.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}

import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SEO } from "@/components/SEO";
import { CheckCircle, Target, TrendingUp, Brain, ArrowRight } from "lucide-react";
import momentumLogo from "@/assets/momentum-logo.png";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "How to Build a Fitness Habit After 40 That Actually Sticks",
  "description": "Science-backed strategies for building lasting fitness habits after 40. Learn why consistency beats intensity and how streak tracking changes behavior.",
  "author": { "@type": "Organization", "name": "Momentum" },
  "publisher": { "@type": "Organization", "name": "Momentum", "url": "https://momentumfit.app" },
  "datePublished": "2026-02-28",
  "mainEntityOfPage": "https://momentumfit.app/fitness-habit-after-40"
};

export default function BuildFitnessHabitAfter40() {
  const navigate = useNavigate();

  return (
    <>
      <SEO
        title="How to Build a Fitness Habit After 40 | Momentum"
        description="Science-backed strategies for building lasting fitness habits after 40. Learn why consistency beats intensity and how streak tracking changes behavior."
        keywords="fitness habit after 40, workout consistency over 40, build exercise habit, fitness for adults, sustainable fitness routine"
        schema={structuredData}
      />

      <div className="min-h-screen bg-background-cream">
        {/* Nav */}
        <nav className="sticky top-0 z-20 bg-card/80 backdrop-blur-md border-b border-border shadow-sm">
          <div className="container mx-auto px-6 md:px-8 max-w-7xl flex items-center justify-between py-3">
            <a href="/" onClick={(e) => { e.preventDefault(); navigate("/"); }} className="flex items-center gap-2">
              <img src={momentumLogo} alt="Momentum" className="h-8 w-auto" />
              <span className="font-display font-bold text-lg text-gradient">Momentum</span>
            </a>
            <Button size="sm" onClick={() => navigate("/auth")} className="btn-gradient">
              Start Free
            </Button>
          </div>
        </nav>

        {/* Hero */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-6 md:px-8 max-w-3xl">
            <p className="text-primary font-semibold text-sm uppercase tracking-wide mb-4">Fitness After 40</p>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground leading-tight mb-6">
              How to Build a Fitness Habit After 40 That Actually Sticks
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              You know what to do. The problem isn't information - it's consistency. Here's why most fitness plans fail after 40, and the science-backed approach that works.
            </p>
          </div>
        </section>

        {/* Content */}
        <article className="pb-16">
          <div className="container mx-auto px-6 md:px-8 max-w-3xl prose prose-lg">
            
            <h2 className="text-2xl font-display font-bold text-foreground mt-12 mb-4">The Real Problem Isn't Motivation</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              After 40, your body recovers differently. Your schedule is fuller. The all-or-nothing approach that worked at 25 doesn't work anymore. Research from the European Journal of Social Psychology shows habit formation takes an average of 66 days - not 21. Most apps don't account for this.
            </p>

            <h2 className="text-2xl font-display font-bold text-foreground mt-12 mb-4">Why Consistency Beats Intensity</h2>
            <div className="grid sm:grid-cols-3 gap-4 my-8 not-prose">
              {[
                { icon: Target, title: "Show Up Daily", desc: "A 10-minute walk counts. What matters is the chain, not the workout." },
                { icon: TrendingUp, title: "Track the Streak", desc: "Visual streaks tap into loss aversion - you won't want to break the chain." },
                { icon: Brain, title: "Adapt to Life", desc: "Bad sleep? Sore knee? Adjust the plan, keep the habit." },
              ].map(({ icon: Icon, title, desc }) => (
                <Card key={title} className="border-none shadow-md">
                  <CardContent className="pt-6">
                    <Icon className="h-8 w-8 text-primary mb-3" />
                    <h3 className="font-display font-bold text-foreground mb-2">{title}</h3>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <h2 className="text-2xl font-display font-bold text-foreground mt-12 mb-4">The 3-Step Framework</h2>
            <ol className="space-y-4 my-6 not-prose">
              {[
                { step: "1", title: "Set 1-3 small goals", body: "Don't overcommit. 'Move for 15 minutes' beats 'train for a marathon.' Momentum's free tier lets you track up to 3 goals." },
                { step: "2", title: "Log daily, no matter what", body: "Check in even on rest days. The habit is checking in, not crushing PRs. The streak is the product." },
                { step: "3", title: "Use the streak as your scoreboard", body: "After 7 days you'll feel ownership. After 21 you'll feel loss aversion. After 66 it's automatic." },
              ].map(({ step, title, body }) => (
                <li key={step} className="flex gap-4">
                  <span className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">{step}</span>
                  <div>
                    <h3 className="font-display font-bold text-foreground">{title}</h3>
                    <p className="text-muted-foreground mt-1">{body}</p>
                  </div>
                </li>
              ))}
            </ol>

            <h2 className="text-2xl font-display font-bold text-foreground mt-12 mb-4">What Makes Momentum Different</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Most fitness apps track reps, sets, and calories. Momentum tracks the one thing that predicts long-term success: whether you showed up. Daily check-ins take 10 seconds. Streak tracking keeps you accountable. And when life gets in the way, Plus members can repair their streak within 48 hours.
            </p>

            <div className="not-prose my-8">
              <Card className="border-2 border-primary shadow-xl overflow-hidden">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-display font-bold text-foreground mb-2">Plans that grow with you</h3>
                  <p className="text-muted-foreground mb-6">Start free. Upgrade when you're ready.</p>
                  <div className="space-y-3">
                    {[
                      "Free - 3 goals, 7-day streaks, daily check-ins",
                      "Plus ($4.99/mo) - Unlimited goals, Streak Repair, 30-day history",
                      "Pro ($9.99/mo) - AI Coach, unlimited history, data export",
                    ].map((line) => (
                      <div key={line} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground">{line}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 mt-6">
                    <Button onClick={() => navigate("/auth")} className="btn-gradient" size="lg">
                      Start free <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button variant="outline" onClick={() => navigate("/pricing")} size="lg">
                      Compare plans
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

          </div>
        </article>

        {/* Footer */}
        <footer className="py-12 border-t border-primary/10 bg-card/50">
          <div className="container mx-auto px-6 text-center">
            <p className="text-muted-foreground">
              Built by <a href="https://www.chadtdyar.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Chad T Dyar</a>
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}

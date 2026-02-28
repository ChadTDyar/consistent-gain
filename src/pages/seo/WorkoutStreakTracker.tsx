import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SEO } from "@/components/SEO";
import { CheckCircle, ArrowRight, Flame, Calendar, TrendingUp, Heart } from "lucide-react";
import momentumLogo from "@/assets/momentum-logo.png";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "The Workout Streak Tracker Built for Real Life (Not Perfect Conditions)",
  description: "Track your workout streak and never break the chain. Momentum's streak tracker is designed for real life — rest days count, and you can repair a missed day.",
  author: { "@type": "Organization", name: "Momentum" },
  publisher: { "@type": "Organization", name: "Momentum", url: "https://momentumfit.app" },
  datePublished: "2026-02-28",
  mainEntityOfPage: "https://momentumfit.app/workout-streak-tracker",
};

export default function WorkoutStreakTracker() {
  const navigate = useNavigate();

  return (
    <>
      <SEO
        title="Workout Streak Tracker | Build a 30, 60, 90-Day Fitness Streak"
        description="Track your workout streak and never break the chain. Momentum's streak tracker is designed for real life — rest days count, and you can repair a missed day."
        keywords="workout streak tracker, fitness streak app, 30 day workout streak, don't break the chain fitness, streak tracking app"
        schema={structuredData}
      />

      <div className="min-h-screen bg-background">
        <nav className="sticky top-0 z-20 bg-card/80 backdrop-blur-md border-b border-border shadow-sm">
          <div className="container mx-auto px-6 md:px-8 max-w-7xl flex items-center justify-between py-3">
            <a href="/" onClick={(e) => { e.preventDefault(); navigate("/"); }} className="flex items-center gap-2">
              <img src={momentumLogo} alt="Momentum" className="h-8 w-auto" />
              <span className="font-display font-bold text-lg text-gradient">Momentum</span>
            </a>
            <Button size="sm" onClick={() => navigate("/auth")} className="btn-gradient">Start Free</Button>
          </div>
        </nav>

        <section className="py-16 md:py-24">
          <div className="container mx-auto px-6 md:px-8 max-w-3xl">
            <p className="text-primary font-semibold text-sm uppercase tracking-wide mb-4">Streak Tracking</p>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground leading-tight mb-6">
              The Workout Streak Tracker Built for Real Life (Not Perfect Conditions)
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              A 90-day workout streak sounds impossible. That's because you're thinking about it wrong. The streak isn't about perfect workouts — it's about showing up.
            </p>
          </div>
        </section>

        <article className="pb-16">
          <div className="container mx-auto px-6 md:px-8 max-w-3xl">

            <h2 className="text-2xl font-display font-bold text-foreground mt-12 mb-4">The Science Behind Streak Tracking</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              James Clear's <em>Atomic Habits</em> framework shows that identity-based habits are the most durable. When you maintain a streak, you're not just tracking behavior — you're building proof that you're "someone who shows up." Research from the European Journal of Social Psychology confirms it takes an average of 66 days for a behavior to become automatic. Streak tracking gives you a visual countdown to that tipping point.
            </p>

            <h2 className="text-2xl font-display font-bold text-foreground mt-12 mb-4">What Counts as "Showing Up"</h2>
            <div className="grid sm:grid-cols-2 gap-4 my-8">
              {[
                { icon: Heart, title: "Rest Days Count", desc: "Recovery is part of training. Checking in on a rest day keeps the streak alive." },
                { icon: Calendar, title: "10-Minute Walks", desc: "A short walk is infinitely better than nothing. Movement is movement." },
                { icon: TrendingUp, title: "Mobility Work", desc: "Stretching, foam rolling, yoga — it all counts toward your streak." },
                { icon: Flame, title: "Low-Intensity Days", desc: "Bad sleep? Sore joints? Scale down, but still show up." },
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

            <h2 className="text-2xl font-display font-bold text-foreground mt-12 mb-4">How Momentum's Streak Tracker Works</h2>
            <ol className="space-y-4 my-6">
              {[
                { step: "1", title: "Daily check-in", body: "Open the app, tap the goals you completed. It takes 10 seconds." },
                { step: "2", title: "Visual chain grows", body: "Watch your streak counter climb. The longer the chain, the harder it is to break." },
                { step: "3", title: "Streak repair (Plus)", body: "Missed a day? Repair it within 48 hours. One bad day doesn't erase weeks of progress." },
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

            <h2 className="text-2xl font-display font-bold text-foreground mt-12 mb-4">Streak Milestones That Matter</h2>
            <div className="grid sm:grid-cols-3 gap-4 my-8">
              {[
                { days: "7 Days", label: "Habit Forming", desc: "You've proven you can show up for a full week. The neural pathway is being carved." },
                { days: "21 Days", label: "Becoming Automatic", desc: "The behavior is starting to feel natural. Skipping feels wrong." },
                { days: "66 Days", label: "Identity Shift", desc: "Research says this is when a habit becomes part of who you are. You're not trying anymore — you just do it." },
              ].map(({ days, label, desc }) => (
                <Card key={days} className="border-none shadow-md">
                  <CardContent className="pt-6 text-center">
                    <p className="text-3xl font-display font-bold text-primary mb-1">{days}</p>
                    <p className="font-bold text-foreground mb-2">{label}</p>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="my-8">
              <Card className="border-2 border-primary shadow-xl overflow-hidden">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-display font-bold text-foreground mb-2">Plans that grow with you</h3>
                  <p className="text-muted-foreground mb-6">Start free. Upgrade when you're ready.</p>
                  <div className="space-y-3">
                    {["Free — 3 goals, 7-day streaks, daily check-ins", "Plus ($4.99/mo) — Unlimited goals, Streak Repair, 30-day history", "Pro ($9.99/mo) — AI Coach, unlimited history, data export"].map((line) => (
                      <div key={line} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground">{line}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 mt-6">
                    <Button onClick={() => navigate("/auth")} className="btn-gradient" size="lg">Start free <ArrowRight className="ml-2 h-4 w-4" /></Button>
                    <Button variant="outline" onClick={() => navigate("/pricing")} size="lg">Compare plans</Button>
                  </div>
                </CardContent>
              </Card>
            </div>

          </div>
        </article>

        <footer className="py-12 border-t border-primary/10 bg-card/50">
          <div className="container mx-auto px-6 text-center">
            <p className="text-muted-foreground">Built by <a href="https://www.chadtdyar.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Chad T Dyar</a></p>
          </div>
        </footer>
      </div>
    </>
  );
}

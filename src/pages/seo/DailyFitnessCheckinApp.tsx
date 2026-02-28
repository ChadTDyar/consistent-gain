import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SEO } from "@/components/SEO";
import { CheckCircle, ArrowRight, Zap, BarChart3, Fingerprint, Timer } from "lucide-react";
import momentumLogo from "@/assets/momentum-logo.png";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "The Daily Fitness Check-In App That Takes 10 Seconds (and Actually Works)",
  description: "A daily fitness check-in app that takes 10 seconds. Momentum's check-in builds accountability, streaks, and habit identity — without logging every rep and calorie.",
  author: { "@type": "Organization", name: "Momentum" },
  publisher: { "@type": "Organization", name: "Momentum", url: "https://momentumfit.app" },
  datePublished: "2026-02-28",
  mainEntityOfPage: "https://momentumfit.app/daily-fitness-checkin-app",
};

export default function DailyFitnessCheckinApp() {
  const navigate = useNavigate();

  return (
    <>
      <SEO
        title="Daily Fitness Check-In App | 10 Seconds a Day to Build Lasting Habits"
        description="A daily fitness check-in app that takes 10 seconds. Momentum's check-in builds accountability, streaks, and habit identity — without logging every rep and calorie."
        keywords="daily fitness check-in app, daily workout check in, fitness accountability app, simple habit tracker, quick fitness log"
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
            <p className="text-primary font-semibold text-sm uppercase tracking-wide mb-4">Daily Check-In</p>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground leading-tight mb-6">
              The Daily Fitness Check-In App That Takes 10 Seconds (and Actually Works)
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              You don't need to log every rep, set, and calorie. You need to answer one question every day: did you show up? That's it. That's the whole system.
            </p>
          </div>
        </section>

        <article className="pb-16">
          <div className="container mx-auto px-6 md:px-8 max-w-3xl">

            <h2 className="text-2xl font-display font-bold text-foreground mt-12 mb-4">Why Daily Check-Ins Beat Detailed Logging</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Detailed logging creates friction. Friction kills consistency. When your fitness app asks you to enter weight, reps, sets, rest time, RPE, and notes for every exercise, you're spending more energy on the app than on the workout. Studies show that the simpler a tracking system is, the higher the long-term compliance rate. A daily check-in removes all friction and focuses on the only metric that matters: did you show up?
            </p>
            <div className="grid sm:grid-cols-2 gap-4 my-8">
              {[
                { icon: Timer, title: "Low Friction", desc: "10 seconds to check in vs. 5 minutes to log a detailed workout. Guess which one you'll do for 6 months." },
                { icon: BarChart3, title: "Higher Compliance", desc: "Simple systems get used. Complex systems get abandoned. The data backs this up consistently." },
                { icon: Zap, title: "Sustainable", desc: "You'll still be checking in on day 90. Can you say that about your current logging system?" },
                { icon: Fingerprint, title: "Identity-Building", desc: "Each check-in is a vote for who you're becoming. The streak is proof of your identity." },
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

            <h2 className="text-2xl font-display font-bold text-foreground mt-12 mb-4">What Momentum Tracks</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Momentum doesn't track reps, calories, or body measurements. It tracks three things: whether you showed up today, how long your current streak is, and which goals you completed. That's it. Because the research shows that those three data points predict long-term success better than any amount of workout detail.
            </p>

            <h2 className="text-2xl font-display font-bold text-foreground mt-12 mb-4">The 10-Second Check-In Flow</h2>
            <ol className="space-y-4 my-6">
              {[
                { step: "1", title: "Open the app", body: "Your goals are right there on the dashboard. No digging through menus." },
                { step: "2", title: "Tap goals you completed", body: "Did you walk? Tap. Did you stretch? Tap. Did you go to the gym? Tap. Done." },
                { step: "3", title: "Streak updates automatically", body: "Your streak counter climbs, your chain grows, and you get visual proof that you're someone who shows up." },
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

            <h2 className="text-2xl font-display font-bold text-foreground mt-12 mb-4">How Check-Ins Build Identity Over Time</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              James Clear calls it "proof accumulation." Every time you check in, you're casting a vote for the type of person you want to become. After 7 days, you have a week of proof. After 30 days, you have a month. After 66 days — the research-backed tipping point — the behavior becomes part of who you are. You're not "trying to exercise." You're "someone who moves every day." The check-in is the mechanism that makes that identity shift happen.
            </p>

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

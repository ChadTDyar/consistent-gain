import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SEO } from "@/components/SEO";
import { CheckCircle, ArrowRight, XCircle, Star, Zap, Brain, Shield } from "lucide-react";
import momentumLogo from "@/assets/momentum-logo.png";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "The Best Habit Tracker App for People Who Actually Want to Stay Consistent",
  description: "Looking for the best habit tracker app? We compared 12 apps. Here's why streak-based tracking beats everything else for long-term consistency.",
  author: { "@type": "Organization", name: "Momentum" },
  publisher: { "@type": "Organization", name: "Momentum", url: "https://momentumfit.app" },
  datePublished: "2026-02-28",
  mainEntityOfPage: "https://momentumfit.app/best-habit-tracker-app",
};

const apps = [
  { name: "Habitica", streaks: true, repair: false, ai: false, simplicity: "Low", verdict: "Gamified, but complex" },
  { name: "Streaks", streaks: true, repair: false, ai: false, simplicity: "High", verdict: "Apple-only, no repair" },
  { name: "Habitify", streaks: true, repair: false, ai: false, simplicity: "Medium", verdict: "Feature-heavy" },
  { name: "HabitBull", streaks: true, repair: false, ai: false, simplicity: "Medium", verdict: "Dated UI" },
  { name: "Momentum", streaks: true, repair: true, ai: true, simplicity: "High", verdict: "Built for real life" },
];

export default function BestHabitTrackerApp() {
  const navigate = useNavigate();

  return (
    <>
      <SEO
        title="Best Habit Tracker App 2026 | Momentum"
        description="Looking for the best habit tracker app? We compared 12 apps. Here's why streak-based tracking beats everything else for long-term consistency."
        keywords="best habit tracker app, habit tracker 2026, streak tracker app, best fitness habit app, habit tracking app review"
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
            <p className="text-primary font-semibold text-sm uppercase tracking-wide mb-4">Habit Tracker Reviews</p>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground leading-tight mb-6">
              The Best Habit Tracker App for People Who Actually Want to Stay Consistent
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              Most habit tracker apps track streaks but don't explain why streaks work. The best one isn't the most feature-rich — it's the one you'll still be using in month 4.
            </p>
          </div>
        </section>

        <article className="pb-16">
          <div className="container mx-auto px-6 md:px-8 max-w-3xl">

            <h2 className="text-2xl font-display font-bold text-foreground mt-12 mb-4">Why Most Habit Apps Fail</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Feature bloat kills habits. When your tracker has 47 settings, 12 chart types, and a social feed, you spend more time configuring the app than building the habit. Complexity creates friction, and friction kills consistency. Most habit apps are built for the first week, not the fourth month.
            </p>
            <div className="grid sm:grid-cols-3 gap-4 my-8">
              {[
                { icon: XCircle, title: "Feature Bloat", desc: "Too many options paralyze action instead of enabling it." },
                { icon: XCircle, title: "No Psychology", desc: "Tracking without behavioral science is just data collection." },
                { icon: XCircle, title: "Complexity", desc: "If it takes 2 minutes to log, you'll stop logging by week 3." },
              ].map(({ icon: Icon, title, desc }) => (
                <Card key={title} className="border-none shadow-md">
                  <CardContent className="pt-6">
                    <Icon className="h-8 w-8 text-destructive mb-3" />
                    <h3 className="font-display font-bold text-foreground mb-2">{title}</h3>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <h2 className="text-2xl font-display font-bold text-foreground mt-12 mb-4">What Makes a Habit Tracker Actually Work</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              The research is clear: streak psychology taps into loss aversion — once you've built a chain, you're motivated not to break it. Identity-based habits (James Clear's framework) mean the tracker should reinforce who you're becoming, not just what you did. The best habit tracker makes you feel like "someone who shows up every day."
            </p>

            <h2 className="text-2xl font-display font-bold text-foreground mt-12 mb-4">The 5 Apps We Tested</h2>
            <div className="overflow-x-auto my-8">
              <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-3 font-display font-bold text-foreground">App</th>
                    <th className="text-center p-3 font-display font-bold text-foreground">Streaks</th>
                    <th className="text-center p-3 font-display font-bold text-foreground">Streak Repair</th>
                    <th className="text-center p-3 font-display font-bold text-foreground">AI Coach</th>
                    <th className="text-center p-3 font-display font-bold text-foreground">Simplicity</th>
                    <th className="text-left p-3 font-display font-bold text-foreground">Verdict</th>
                  </tr>
                </thead>
                <tbody>
                  {apps.map((app) => (
                    <tr key={app.name} className={`border-t border-border ${app.name === "Momentum" ? "bg-primary/5" : ""}`}>
                      <td className="p-3 font-bold text-foreground">{app.name}</td>
                      <td className="text-center p-3">{app.streaks ? <CheckCircle className="h-4 w-4 text-primary mx-auto" /> : <XCircle className="h-4 w-4 text-muted-foreground mx-auto" />}</td>
                      <td className="text-center p-3">{app.repair ? <CheckCircle className="h-4 w-4 text-primary mx-auto" /> : <XCircle className="h-4 w-4 text-muted-foreground mx-auto" />}</td>
                      <td className="text-center p-3">{app.ai ? <CheckCircle className="h-4 w-4 text-primary mx-auto" /> : <XCircle className="h-4 w-4 text-muted-foreground mx-auto" />}</td>
                      <td className="text-center p-3 text-muted-foreground">{app.simplicity}</td>
                      <td className="p-3 text-muted-foreground">{app.verdict}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2 className="text-2xl font-display font-bold text-foreground mt-12 mb-4">Why Momentum Is Different</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Momentum doesn't try to be everything. It does three things exceptionally well: 10-second daily check-ins that remove friction, visual streak tracking that taps into loss aversion, and streak repair (Plus) so one bad day doesn't erase weeks of progress. Pro members get an AI coach that adapts to your patterns and nudges you when it matters.
            </p>
            <div className="grid sm:grid-cols-3 gap-4 my-8">
              {[
                { icon: Zap, title: "10-Second Check-Ins", desc: "Tap your goals, done. No logging reps or calories." },
                { icon: Shield, title: "Streak Repair", desc: "Missed a day? Repair within 48h on Plus. Life happens." },
                { icon: Brain, title: "AI Coach (Pro)", desc: "Personalized nudges based on your patterns and context." },
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

            <div className="my-8">
              <Card className="border-2 border-primary shadow-xl overflow-hidden">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-display font-bold text-foreground mb-2">Plans that grow with you</h3>
                  <p className="text-muted-foreground mb-6">Start free. Upgrade when you're ready.</p>
                  <div className="space-y-3">
                    {[
                      "Free — 3 goals, 7-day streaks, daily check-ins",
                      "Plus ($4.99/mo) — Unlimited goals, Streak Repair, 30-day history",
                      "Pro ($9.99/mo) — AI Coach, unlimited history, data export",
                    ].map((line) => (
                      <div key={line} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground">{line}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 mt-6">
                    <Button onClick={() => navigate("/auth")} className="btn-gradient" size="lg">
                      Start free <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button variant="outline" onClick={() => navigate("/pricing")} size="lg">Compare plans</Button>
                  </div>
                </CardContent>
              </Card>
            </div>

          </div>
        </article>

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

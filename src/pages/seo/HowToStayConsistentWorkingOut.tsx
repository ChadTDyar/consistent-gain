import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SEO } from "@/components/SEO";
import { CheckCircle, ArrowRight, Target, RefreshCw, UserCheck, ShieldCheck } from "lucide-react";
import momentumLogo from "@/assets/momentum-logo.png";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "How to Stay Consistent Working Out (Even When Life Gets in the Way)",
  description: "Can't stay consistent with working out? You don't need more motivation — you need a better system. Here's the exact 3-step framework used by people who never miss.",
  author: { "@type": "Organization", name: "Momentum" },
  publisher: { "@type": "Organization", name: "Momentum", url: "https://momentumfit.app" },
  datePublished: "2026-02-28",
  mainEntityOfPage: "https://momentumfit.app/how-to-stay-consistent-working-out",
};

export default function HowToStayConsistentWorkingOut() {
  const navigate = useNavigate();

  return (
    <>
      <SEO
        title="How to Stay Consistent Working Out | The Only System That Works Long-Term"
        description="Can't stay consistent with working out? You don't need more motivation — you need a better system. Here's the exact 3-step framework used by people who never miss."
        keywords="how to stay consistent working out, workout consistency, exercise consistency tips, never miss a workout, consistent exercise habit"
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
            <p className="text-primary font-semibold text-sm uppercase tracking-wide mb-4">Workout Consistency</p>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground leading-tight mb-6">
              How to Stay Consistent Working Out (Even When Life Gets in the Way)
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              You've started and stopped more times than you can count. So has everyone. The difference between people who stay consistent and people who don't isn't willpower — it's identity.
            </p>
          </div>
        </section>

        <article className="pb-16">
          <div className="container mx-auto px-6 md:px-8 max-w-3xl">

            <h2 className="text-2xl font-display font-bold text-foreground mt-12 mb-4">The Real Reason You're Inconsistent</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              It's not laziness. It's all-or-nothing thinking. You tell yourself you need 60 minutes at the gym, and when you can't do that, you do nothing. Then one missed day becomes two, which becomes a week, which becomes "I'll start again Monday." James Clear calls this the "missing twice rule" — missing once is an accident, missing twice is the start of a new habit. The fix isn't more motivation. It's a lower bar.
            </p>

            <h2 className="text-2xl font-display font-bold text-foreground mt-12 mb-4">The Identity Shift That Changes Everything</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Stop trying to "get motivated to work out." Instead, decide: <strong>"I am someone who moves every day."</strong> That's the identity shift. When exercise is part of who you are — not something you do when you feel like it — consistency follows naturally. Every check-in is a vote for that identity. Every streak day is proof.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 my-8">
              {[
                { icon: UserCheck, title: "Identity Over Outcome", desc: "\"I am someone who shows up\" beats \"I want to lose 20 pounds\" every time." },
                { icon: Target, title: "Lower the Bar", desc: "Make showing up so easy you can't say no. 10 minutes counts." },
                { icon: RefreshCw, title: "Never Miss Twice", desc: "One bad day is fine. Two in a row is a pattern. Break the pattern." },
                { icon: ShieldCheck, title: "Streak as Proof", desc: "Your streak is evidence of your identity. Protect it." },
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

            <h2 className="text-2xl font-display font-bold text-foreground mt-12 mb-4">The 3-Step Consistency System</h2>
            <ol className="space-y-4 my-6">
              {[
                { step: "1", title: "Choose 1-3 small goals", body: "Not \"get ripped.\" Try \"move for 15 minutes\" or \"stretch after work.\" Momentum's free tier tracks up to 3 goals — enough to build a foundation." },
                { step: "2", title: "Check in daily, no matter what", body: "Even if you didn't work out. Even on rest days. The habit is the check-in. It takes 10 seconds and it keeps the chain alive." },
                { step: "3", title: "Never miss twice", body: "You will miss days. That's life. The rule is simple: never miss two in a row. Plus members can repair a missed day within 48 hours." },
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

            <h2 className="text-2xl font-display font-bold text-foreground mt-12 mb-4">What To Do When You Miss a Day</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              First: don't panic. One missed day doesn't erase your progress. Your streak might break, but your identity doesn't. On Momentum Plus, you can repair a missed day within 48 hours — because real life happens. The important thing is getting back on track immediately. Show up the next day, even if it's just a 10-minute walk. The streak is recoverable. The habit is what matters.
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

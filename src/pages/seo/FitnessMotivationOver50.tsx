import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SEO } from "@/components/SEO";
import { CheckCircle, ArrowRight, Battery, Clock, Heart, RefreshCw } from "lucide-react";
import momentumLogo from "@/assets/momentum-logo.png";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Fitness Motivation Over 50: Stop Relying on Willpower, Build a System Instead",
  description: "Fitness motivation over 50 isn't about willpower. It's about systems. Here's the science-backed approach that works when your schedule, body, and priorities have changed.",
  author: { "@type": "Organization", name: "Momentum" },
  publisher: { "@type": "Organization", name: "Momentum", url: "https://momentumfit.app" },
  datePublished: "2026-02-28",
  mainEntityOfPage: "https://momentumfit.app/fitness-motivation-over-50",
};

export default function FitnessMotivationOver50() {
  const navigate = useNavigate();

  return (
    <>
      <SEO
        title="Fitness Motivation Over 50 | How to Stay Consistent When Life Is Full"
        description="Fitness motivation over 50 isn't about willpower. It's about systems. Here's the science-backed approach that works when your schedule, body, and priorities have changed."
        keywords="fitness motivation over 50, exercise over 50, staying fit after 50, workout motivation older adults, fitness habits over 50"
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
            <p className="text-primary font-semibold text-sm uppercase tracking-wide mb-4">Fitness Over 50</p>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground leading-tight mb-6">
              Fitness Motivation Over 50: Stop Relying on Willpower, Build a System Instead
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              You've been motivated before. Multiple times. The problem isn't motivation - motivation is temporary. What works at 50+ is a system that runs even when you don't feel like it.
            </p>
          </div>
        </section>

        <article className="pb-16">
          <div className="container mx-auto px-6 md:px-8 max-w-3xl">

            <h2 className="text-2xl font-display font-bold text-foreground mt-12 mb-4">Why Motivation Fails After 50</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              After 50, the game changes. Hormonal shifts affect energy and recovery. Your schedule is packed with career responsibilities, family obligations, and the reality that your body doesn't bounce back like it used to. Willpower is a finite resource - and you're spending it on a hundred other things before you even think about exercise.
            </p>
            <div className="grid sm:grid-cols-3 gap-4 my-8">
              {[
                { icon: Battery, title: "Energy Changes", desc: "Hormonal shifts mean your energy patterns are different. Morning motivation isn't guaranteed." },
                { icon: Clock, title: "Schedule Complexity", desc: "Work, family, health appointments - your calendar is fuller than it was at 30." },
                { icon: RefreshCw, title: "Recovery Time", desc: "Your body needs more time between intense sessions. That's biology, not weakness." },
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

            <h2 className="text-2xl font-display font-bold text-foreground mt-12 mb-4">The Shift From Intensity to Consistency</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Here's the counterintuitive truth: 10 minutes every day beats 60 minutes twice a week. Research consistently shows that frequency of movement matters more than intensity for long-term health outcomes over 50. The goal isn't to crush a workout - it's to move your body every single day, even if it's just a walk around the block.
            </p>

            <h2 className="text-2xl font-display font-bold text-foreground mt-12 mb-4">Building Your System in 3 Steps</h2>
            <ol className="space-y-4 my-6">
              {[
                { step: "1", title: "Set 1-3 small goals", body: "\"Move for 15 minutes\" is better than \"train for a marathon.\" Momentum's free tier lets you track up to 3 goals - that's enough to start." },
                { step: "2", title: "Check in daily, no matter what", body: "Even on rest days. The habit is the check-in itself, not the workout intensity. It takes 10 seconds." },
                { step: "3", title: "Let the streak be your scoreboard", body: "After 7 days you'll feel ownership. After 21 it becomes automatic. After 66 days, it's who you are." },
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

            <h2 className="text-2xl font-display font-bold text-foreground mt-12 mb-4">Why Rest Days Are Part of the Streak</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              At 50+, recovery isn't optional - it's the workout. Your muscles rebuild during rest, your joints need time to recover, and your nervous system needs downtime. Momentum lets you check in on rest days because showing up mentally is just as important as showing up physically. The streak doesn't break because you took a recovery day.
            </p>

            <div className="my-8">
              <Card className="border-2 border-primary shadow-xl overflow-hidden">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-display font-bold text-foreground mb-2">Plans that grow with you</h3>
                  <p className="text-muted-foreground mb-6">Start free. Upgrade when you're ready.</p>
                  <div className="space-y-3">
                    {["Free - 3 goals, 7-day streaks, daily check-ins", "Plus ($4.99/mo) - Unlimited goals, Streak Repair, 30-day history", "Pro ($9.99/mo) - AI Coach, unlimited history, data export"].map((line) => (
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

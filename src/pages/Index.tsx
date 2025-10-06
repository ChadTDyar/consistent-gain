import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, TrendingUp, Award } from "lucide-react";
import heroRunner from "@/assets/hero-runner.png";
import groupRunning from "@/assets/group-running.png";
import momentumLogo from "@/assets/momentum-logo.png";
import { SEO } from "@/components/SEO";
import { FAQ } from "@/components/FAQ";

const Index = () => {
  const navigate = useNavigate();

  return (
    <>
      <SEO 
        title="Momentum - Fitness Habit Tracker for Adults 40+ | Build Lasting Habits"
        description="Build sustainable fitness habits without judgment. Track goals, build streaks, stay motivated. Designed for adults 40+ who want consistency, not perfection. Start free today."
        keywords="fitness tracker adults 40+, habit tracker over 40, fitness habits, workout consistency app, health tracker seniors, streak tracker, goal setting app, fitness motivation, sustainable fitness, middle age fitness"
      />
      <div className="min-h-screen bg-background-cream">
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:font-semibold"
      >
        Skip to main content
      </a>
      <section id="main-content" className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{background: 'var(--gradient-accent)'}} role="presentation" />
        <div className="container mx-auto px-6 md:px-8 max-w-7xl relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center py-16 md:py-24 lg:py-32">
            {/* Left Content */}
            <div className="space-y-6 text-center lg:text-left fade-in">
              <div className="inline-flex items-center gap-3 mb-2">
                <img src={momentumLogo} alt="Momentum" className="h-14 w-auto drop-shadow-sm" />
                <h2 className="text-2xl font-display font-bold text-gradient">Momentum</h2>
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-foreground leading-[1.1] tracking-tight">
                Build habits that last longer than <span className="text-gradient">motivation.</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                Momentum helps you stay consistent when life gets complicated.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-6">
                <Button 
                  size="lg" 
                  onClick={() => navigate("/auth")} 
                  className="btn-large shadow-xl hover:shadow-2xl transition-all hover:scale-105 text-lg h-14 px-10 btn-gradient"
                >
                  Start your streak
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={() => navigate("/pricing")}
                  className="border-2 border-primary hover:bg-primary/10 text-lg h-14 px-10"
                >
                  View Plans
                </Button>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-primary/10">
                <img 
                  src={heroRunner} 
                  alt="Runner preparing for workout at sunset" 
                  className="w-full h-auto object-cover"
                  loading="eager"
                  width="800"
                  height="600"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent" role="presentation" />
              </div>
              <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
              <div className="absolute -top-8 -left-8 w-56 h-56 bg-primary-warm/5 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-6 md:px-8 max-w-4xl">
          <div className="text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground">
              How It Works
            </h2>
            <p className="text-2xl md:text-3xl font-display font-semibold text-foreground leading-relaxed">
              Pick your focus. Log your action. Watch your graph grow.
            </p>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Small steps, tracked daily, add up. No guilt. No complexity. Just follow-through.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-primary/5 to-primary-warm/5">
        <div className="container mx-auto px-6 md:px-8 max-w-4xl">
          <Card className="border-none shadow-xl bg-card">
            <CardContent className="p-8 md:p-12 space-y-6">
              <p className="text-lg text-muted-foreground leading-relaxed">
                When I was 30, I lost over a hundred pounds. Keeping it off for twenty years has been the harder part.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                In the last few years, time and recovery haven't worked the way they used to. I had to rebuild my entire approach to fitness. Momentum came out of that process. A simple, personal system for showing up even when the spark is gone.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                It's not about hype or streaks. It's about keeping promises to yourself.
              </p>
              <p className="text-xl font-semibold text-primary">
                Why it exists: Fitness gets harder with age, not because we care less, but because life gets heavier. Momentum is how I've learned to carry it better.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQ />

      {/* CTA Section */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={groupRunning} 
            alt="Diverse group of people running together at sunset" 
            className="w-full h-full object-cover"
            loading="lazy"
            width="1920"
            height="600"
          />
          <div className="absolute inset-0 backdrop-blur-[2px]" style={{background: 'linear-gradient(135deg, hsl(248 57% 58% / 0.9) 0%, hsl(256 31% 36% / 0.9) 100%)'}} role="presentation" />
        </div>
        <div className="container mx-auto px-6 md:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-8 text-white drop-shadow-lg slide-up">
            Start building momentum today.
          </h2>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => navigate("/auth")}
            className="btn-large shadow-2xl hover:shadow-[0_30px_60px_rgba(255,255,255,0.5)] bg-white text-primary hover:bg-white hover:scale-110 transition-all text-lg h-16 px-12 font-semibold slide-up"
            style={{animationDelay: '0.1s'}}
          >
            Create your first habit
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-primary/10 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <p className="text-muted-foreground font-medium">© 2025 Momentum. Building better habits, one day at a time.</p>
            <nav className="flex gap-6 text-sm" aria-label="Footer navigation">
              <a href="/about" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                About
              </a>
              <a href="/privacy" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                Privacy Policy
              </a>
              <a href="/terms" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                Terms of Service
              </a>
              <a href="mailto:support@momentumfit.app" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                Contact
              </a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
};

export default Index;

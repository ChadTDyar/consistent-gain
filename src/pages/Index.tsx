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
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{background: 'var(--gradient-accent)'}} />
        <div className="container mx-auto px-6 md:px-8 max-w-7xl relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center py-16 md:py-24 lg:py-32">
            {/* Left Content */}
            <div className="space-y-6 text-center lg:text-left fade-in">
              <div className="inline-flex items-center gap-3 mb-2">
                <img src={momentumLogo} alt="Momentum" className="h-14 w-auto drop-shadow-sm" />
                <h2 className="text-2xl font-display font-bold text-gradient">Momentum</h2>
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-foreground leading-[1.1] tracking-tight">
                Build momentum.<br />
                <span className="text-gradient">Not burnout.</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                Fitness is not about breaking yourself. It's about building momentum. Create routines you'll actually stick to. No pressure. No shame. Just small, consistent steps that turn into real results.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-6">
                <Button 
                  size="lg" 
                  onClick={() => navigate("/auth")} 
                  className="btn-large shadow-xl hover:shadow-2xl transition-all hover:scale-105 text-lg h-14 px-10 btn-gradient"
                >
                  Start Free
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
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent" />
              </div>
              <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
              <div className="absolute -top-8 -left-8 w-56 h-56 bg-primary-warm/5 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-6 md:px-8 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4 text-foreground">
              Why Choose Momentum?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to build lasting fitness habits
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
            <Card className="text-center card-lift-heavy border-none shadow-xl hover:shadow-2xl transition-all" style={{background: 'var(--gradient-card)'}}>
              <CardHeader className="pb-4 pt-8">
                <div className="mx-auto mb-6 w-20 h-20 rounded-2xl flex items-center justify-center shadow-glow" style={{background: 'var(--gradient-primary)'}}>
                  <Target className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-2xl font-display font-semibold">Track Your Goals</CardTitle>
              </CardHeader>
              <CardContent className="pb-8">
                <CardDescription className="text-base leading-relaxed text-muted-foreground">
                  Set up to 3 fitness goals and track your progress with simple daily check-ins.
                  No complicated metrics, just consistent action.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center card-lift-heavy border-none shadow-xl hover:shadow-2xl transition-all" style={{background: 'var(--gradient-card)'}}>
              <CardHeader className="pb-4 pt-8">
                <div className="mx-auto mb-6 w-20 h-20 rounded-2xl flex items-center justify-center shadow-glow" style={{background: 'var(--gradient-secondary)'}}>
                  <TrendingUp className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-2xl font-display font-semibold">Build Streaks</CardTitle>
              </CardHeader>
              <CardContent className="pb-8">
                <CardDescription className="text-base leading-relaxed text-muted-foreground">
                  Watch your streak grow day by day. Visual feedback keeps you motivated and
                  accountable to your fitness journey.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center card-lift-heavy border-none shadow-xl hover:shadow-2xl transition-all" style={{background: 'var(--gradient-card)'}}>
              <CardHeader className="pb-4 pt-8">
                <div className="mx-auto mb-6 w-20 h-20 rounded-2xl flex items-center justify-center shadow-glow" style={{background: 'var(--gradient-primary)'}}>
                  <Award className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-2xl font-display font-semibold">Stay Motivated</CardTitle>
              </CardHeader>
              <CardContent className="pb-8">
                <CardDescription className="text-base leading-relaxed text-muted-foreground">
                  Celebrate every win with streak counters and progress calendars. Build habits
                  that last through positive reinforcement.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-primary/5 to-primary-warm/5">
        <div className="container mx-auto px-6 md:px-8 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4 text-foreground">
              Built by Someone Who Gets It
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Momentum wasn't created by fitness influencers or tech giants
            </p>
          </div>
          
          <Card className="border-none shadow-xl bg-card">
            <CardContent className="p-8 md:p-12 space-y-6">
              <p className="text-lg text-muted-foreground leading-relaxed">
                I'm approaching 50, and like many people my age, I realized I couldn't keep putting off my health.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                For years, I'd start fitness routines with great intentions—gym memberships, personal trainers, 
                complicated programs—only to lose momentum after a few weeks. The guilt of missed days would compound, 
                and I'd give up entirely.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                I needed something different. Not a drill sergeant. Not another app telling me I "crushed it" or "failed." 
                <strong className="text-foreground"> Just a simple way to build sustainable habits without judgment.</strong>
              </p>
              <p className="text-xl font-semibold text-primary">
                Momentum was built for me. And it turns out, I'm not alone.
              </p>
              <div className="pt-4">
                <Button
                  onClick={() => navigate("/about")}
                  variant="outline"
                  size="lg"
                  className="border-2 font-semibold"
                >
                  Read My Full Story
                </Button>
              </div>
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
          />
          <div className="absolute inset-0 backdrop-blur-[2px]" style={{background: 'linear-gradient(135deg, hsl(248 57% 58% / 0.9) 0%, hsl(256 31% 36% / 0.9) 100%)'}} />
        </div>
        <div className="container mx-auto px-6 md:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-8 text-white drop-shadow-lg slide-up">
            Start Your Journey Today
          </h2>
          <p className="text-xl md:text-2xl mb-12 max-w-2xl mx-auto text-white font-medium leading-relaxed drop-shadow-md slide-up" style={{animationDelay: '0.1s'}}>
            Build strength. Build confidence. Build your momentum.
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => navigate("/auth")}
            className="btn-large shadow-2xl hover:shadow-[0_30px_60px_rgba(255,255,255,0.5)] bg-white text-primary hover:bg-white hover:scale-110 transition-all text-lg h-16 px-12 font-semibold slide-up"
            style={{animationDelay: '0.2s'}}
          >
            Start Your Journey Today
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-primary/10 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <p className="text-muted-foreground font-medium">© 2025 Momentum. Building better habits, one day at a time.</p>
            <div className="flex gap-6 text-sm">
              <button onClick={() => navigate("/about")} className="text-muted-foreground hover:text-primary transition-colors font-medium">
                About
              </button>
              <button onClick={() => navigate("/privacy")} className="text-muted-foreground hover:text-primary transition-colors font-medium">
                Privacy Policy
              </button>
              <button onClick={() => navigate("/terms")} className="text-muted-foreground hover:text-primary transition-colors font-medium">
                Terms of Service
              </button>
              <a href="mailto:support@momentumfit.app" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
};

export default Index;

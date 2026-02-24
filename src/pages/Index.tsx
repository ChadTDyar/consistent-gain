import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import momentumLogo from "@/assets/momentum-logo.png";
import heroRunner from "@/assets/hero-runner.png";
import groupRunning from "@/assets/group-running.png";
import { SEO } from "@/components/SEO";
import { FAQ } from "@/components/FAQ";
import { Testimonials } from "@/components/Testimonials";
import { ProductShowcase } from "@/components/ProductShowcase";
import { ComparisonTable } from "@/components/ComparisonTable";
import { DemoPreview } from "@/components/DemoPreview";
import { FeatureGrid } from "@/components/FeatureGrid";
import { NotificationExplainer } from "@/components/NotificationExplainer";
import { HowItWorks } from "@/components/HowItWorks";
import { SocialProofStrip } from "@/components/SocialProofStrip";
import { DifferentiationCallout } from "@/components/DifferentiationCallout";

const Index = () => {
  const navigate = useNavigate();

  return (
    <>
      <SEO 
        title="Momentum — Fitness Habit Tracker & Daily Streak App"
        description="Build unstoppable fitness habits with daily check-ins, streak tracking, and AI coaching. Join 10,000+ people who show up every day."
        keywords="fitness habit tracker, daily streak app, workout consistency, habit tracker over 40, fitness habits, streak tracking, AI coaching, fitness motivation, sustainable fitness"
      />
      <div className="min-h-screen bg-background-cream">
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:font-semibold"
        >
          Skip to main content
        </a>

        {/* Hero Section */}
        <section id="main-content" className="relative overflow-hidden">
          <div className="absolute inset-0 opacity-30" style={{background: 'var(--gradient-accent)'}} role="presentation" />
          <div className="container mx-auto px-6 md:px-8 max-w-7xl relative">
            <div className="grid lg:grid-cols-2 gap-16 items-center py-16 md:py-24 lg:py-32">
              <div className="space-y-6 text-center lg:text-left fade-in">
                <div className="inline-flex items-center gap-3 mb-2">
                  <img src={momentumLogo} alt="Momentum" className="h-14 w-auto drop-shadow-sm" />
                  <h2 className="text-2xl font-display font-bold text-gradient">Momentum</h2>
                </div>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-foreground leading-[1.1] tracking-tight">
                  Build Unstoppable Fitness Habits — <span className="text-gradient">One Day at a Time</span>
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                  Not another workout logger. Momentum tracks what matters: showing up. Daily check-ins, streak tracking, and AI coaching that adapts to real life.
                </p>
                <div className="bg-card border border-border rounded-xl p-5 max-w-xl mx-auto lg:mx-0">
                  <p className="text-muted-foreground leading-relaxed">
                    You've tried 5 fitness apps. You know what to do. The problem isn't information — it's <strong className="text-foreground">consistency</strong>. Most people quit in 3 weeks. Momentum is designed for week 4 and beyond.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                  <Button 
                    size="lg" 
                    onClick={() => navigate("/auth")} 
                    className="btn-large shadow-xl hover:shadow-2xl transition-all hover:scale-105 text-lg h-14 px-10 btn-gradient"
                  >
                    Start your streak — free for 30 days
                  </Button>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start text-sm text-muted-foreground">
                  <span>No credit card required</span>
                  <span className="hidden sm:inline">•</span>
                  <span className="font-semibold text-foreground">Free for 30 days. Then $5/month or $40/year.</span>
                </div>
              </div>

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

        {/* Social Proof Strip */}
        <SocialProofStrip />

        {/* Navigation */}
        <nav className="sticky top-0 z-20 bg-card/80 backdrop-blur-md border-b border-border shadow-sm">
          <div className="container mx-auto px-6 md:px-8 max-w-7xl flex items-center justify-between py-3">
            <div className="flex items-center gap-2">
              <img src={momentumLogo} alt="Momentum" className="h-8 w-auto" />
              <span className="font-display font-bold text-lg text-gradient">Momentum</span>
            </div>
            <div className="hidden md:flex items-center gap-6 text-sm font-medium">
              <a href="#how-it-works" className="text-muted-foreground hover:text-primary transition-colors">How It Works</a>
              <a href="#features" className="text-muted-foreground hover:text-primary transition-colors">Features</a>
              <a href="/pricing" className="text-muted-foreground hover:text-primary transition-colors" onClick={(e) => { e.preventDefault(); navigate("/pricing"); }}>Pricing</a>
              <a href="/resources/habit-streaks-science" className="text-muted-foreground hover:text-primary transition-colors" onClick={(e) => { e.preventDefault(); navigate("/resources/habit-streaks-science"); }}>Resources</a>
              <a href="/blog" className="text-muted-foreground hover:text-primary transition-colors" onClick={(e) => { e.preventDefault(); navigate("/blog"); }}>Blog</a>
              <a href="/story" className="text-muted-foreground hover:text-primary transition-colors" onClick={(e) => { e.preventDefault(); navigate("/story"); }}>Our Story</a>
              <a href="#faq" className="text-muted-foreground hover:text-primary transition-colors">FAQ</a>
            </div>
            <Button size="sm" onClick={() => navigate("/auth")} className="btn-gradient">
              Start Free
            </Button>
          </div>
        </nav>

        {/* How It Works */}
        <HowItWorks />

        {/* Differentiation Callout */}
        <DifferentiationCallout />

        {/* Feature Grid */}
        <FeatureGrid />

        {/* Product Showcase */}
        <ProductShowcase />

        {/* Interactive Demo */}
        <DemoPreview />

        {/* Notification Explainer */}
        <NotificationExplainer />

        {/* Testimonials */}
        <Testimonials />

        {/* Comparison Table */}
        <ComparisonTable />

        {/* FAQ */}
        <div id="faq">
          <FAQ />
        </div>

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
            <div className="absolute inset-0 backdrop-blur-[2px]" style={{background: 'linear-gradient(135deg, hsl(182 82% 26% / 0.9) 0%, hsl(184 90% 18% / 0.9) 100%)'}} role="presentation" />
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
              Start your streak — free for 30 days
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 border-t border-primary/10 bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
              <p className="text-muted-foreground font-medium">Built by <a href="https://www.chadtdyar.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Chad T Dyar</a></p>
              <nav className="flex gap-6 text-sm" aria-label="Footer navigation">
                <a href="/blog" className="text-muted-foreground hover:text-primary transition-colors font-medium">Blog</a>
                <a href="/story" className="text-muted-foreground hover:text-primary transition-colors font-medium">Our Story</a>
                <a href="/resources/habit-streaks-science" className="text-muted-foreground hover:text-primary transition-colors font-medium">Resources</a>
                <a href="mailto:support@momentumfit.app" className="text-muted-foreground hover:text-primary transition-colors font-medium">Contact</a>
                <a href="/privacy" className="text-muted-foreground hover:text-primary transition-colors font-medium">Privacy</a>
              </nav>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Index;

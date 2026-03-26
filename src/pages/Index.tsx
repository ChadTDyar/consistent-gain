import { useNavigate } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import { Button } from "@/components/ui/button";
import momentumLogo from "@/assets/momentum-logo.png";
import heroRunner from "@/assets/hero-runner.png";
import groupRunning from "@/assets/group-running.png";
import { SEO } from "@/components/SEO";
import { SocialProofStrip } from "@/components/SocialProofStrip";
import { analytics } from "@/lib/analytics";
import { Star } from "lucide-react";

// Lazy load below-the-fold sections
const FAQ = lazy(() => import("@/components/FAQ").then(m => ({ default: m.FAQ })));
const Testimonials = lazy(() => import("@/components/Testimonials").then(m => ({ default: m.Testimonials })));
const ProductShowcase = lazy(() => import("@/components/ProductShowcase").then(m => ({ default: m.ProductShowcase })));
const ComparisonTable = lazy(() => import("@/components/ComparisonTable").then(m => ({ default: m.ComparisonTable })));
const DemoPreview = lazy(() => import("@/components/DemoPreview").then(m => ({ default: m.DemoPreview })));
const FeatureGrid = lazy(() => import("@/components/FeatureGrid").then(m => ({ default: m.FeatureGrid })));
const NotificationExplainer = lazy(() => import("@/components/NotificationExplainer").then(m => ({ default: m.NotificationExplainer })));
const HowItWorks = lazy(() => import("@/components/HowItWorks").then(m => ({ default: m.HowItWorks })));
const DifferentiationCallout = lazy(() => import("@/components/DifferentiationCallout").then(m => ({ default: m.DifferentiationCallout })));
const LandingPricing = lazy(() => import("@/components/LandingPricing").then(m => ({ default: m.LandingPricing })));

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    analytics.visitLanding();
  }, []);

  return (
    <>
      <SEO 
        title="Momentum - Build Fitness Habits That Actually Stick"
        description="AI-guided movement plans for adults 40+ and busy professionals. No gym required. No guilt. Just clarity."
        keywords="fitness habits over 40, habit tracker for professionals, AI fitness coach, build habits, consistency app, no gym workout, fitness habits"
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
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center py-8 md:py-24 lg:py-32">
              <div className="space-y-4 md:space-y-6 text-center lg:text-left fade-in">
                <div className="inline-flex items-center gap-3 mb-1 md:mb-2">
                  <img src={momentumLogo} alt="Momentum" className="h-10 md:h-14 w-auto drop-shadow-sm" width="56" height="56" />
                  <h2 className="text-xl md:text-2xl font-display font-bold text-gradient">Momentum</h2>
                </div>
                <h1 className="text-3xl md:text-6xl lg:text-7xl font-display font-bold text-foreground leading-[1.1] tracking-tight">
                  Fitness Habit Tracker for <span className="text-gradient">Adults 40+</span>
                </h1>
                <p className="text-base md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                  AI-guided movement plans for adults 40+ and busy professionals. No gym required. No guilt. Just clarity.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-2">
                  <Button 
                    size="lg" 
                    onClick={() => { analytics.startSignup(); navigate("/auth"); }} 
                    className="btn-large shadow-xl hover:shadow-2xl transition-all hover:scale-105 text-base md:text-lg h-12 md:h-14 px-8 md:px-10 btn-gradient"
                  >
                    Start Free
                  </Button>
                </div>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Free forever for one activity. Upgrade for unlimited.
                </p>
                <div className="flex items-center gap-2 justify-center lg:justify-start text-xs md:text-sm text-muted-foreground pt-1">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-primary text-primary" />
                    ))}
                  </div>
                  <span>Built for people who want consistency, not intensity.</span>
                </div>
                <p className="sm:hidden text-xs text-muted-foreground">Built for people who want consistency, not intensity.</p>
              </div>

              <div className="relative">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-primary/10">
                  <img 
                    src={heroRunner} 
                    alt="Professional starting their morning routine" 
                    className="w-full h-auto object-cover"
                    loading="eager"
                    fetchPriority="high"
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
              <img src={momentumLogo} alt="Momentum" className="h-8 w-auto" width="32" height="32" />
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

        {/* Below-the-fold lazy-loaded sections */}
        <Suspense fallback={<div className="py-16" />}>
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

          {/* Pricing */}
          <LandingPricing />

          {/* Comparison Table */}
          <ComparisonTable />

          {/* FAQ */}
          <div id="faq">
            <FAQ />
          </div>
        </Suspense>

        {/* CTA Section */}
        <section className="relative py-24 md:py-32 overflow-hidden">
          <div className="absolute inset-0">
            <img 
              src={groupRunning} 
              alt="Diverse group of professionals building habits together" 
              className="w-full h-full object-cover"
              loading="lazy"
              width="1920"
              height="600"
              decoding="async"
            />
            <div className="absolute inset-0 backdrop-blur-[2px]" style={{background: 'linear-gradient(135deg, hsl(182 82% 26% / 0.9) 0%, hsl(184 90% 18% / 0.9) 100%)'}} role="presentation" />
          </div>
          <div className="container mx-auto px-6 md:px-8 text-center relative z-10">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-4 text-white drop-shadow-lg slide-up">
              Your streak starts today.
            </h2>
            <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
              Set up your habit plan in under 5 minutes. No credit card, no commitment.
            </p>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => navigate("/auth")}
              className="btn-large shadow-2xl hover:shadow-[0_30px_60px_rgba(255,255,255,0.5)] bg-white text-primary hover:bg-white hover:scale-110 transition-all text-lg h-16 px-12 font-semibold slide-up"
              style={{animationDelay: '0.1s'}}
            >
              Start my habit plan - free
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 border-t border-primary/10 bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
              <div>
                <p className="text-muted-foreground font-medium">Built by <a href="https://www.chadtdyar.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Chad T Dyar</a></p>
                <p className="text-xs text-muted-foreground mt-1">
                  Also by Chad: tools for <a href="https://www.chadtdyar.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">pets, health, design, and gardening</a>.
                </p>
              </div>
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

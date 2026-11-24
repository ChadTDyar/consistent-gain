import { useNavigate } from "react-router-dom";
import { useEffect, useState, Suspense } from "react";
import { lazyWithRetry } from "@/lib/lazyWithRetry";

import { Button } from "@/components/ui/button";
import momentumLogo from "@/assets/momentum-logo.png";
import { HeroTodayPreview } from "@/components/HeroTodayPreview";
import { SEO } from "@/components/SEO";
import { analytics } from "@/lib/analytics";
import { LogIn, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppStoreBadge } from "@/components/AppStoreBadge";
// Above-the-fold sections: bundled eagerly (main bundle) since they render
// immediately on load — no benefit to lazy-loading these.
import { HowItWorks } from "@/components/HowItWorks";
import { ConsistencyProblem } from "@/components/landing/ConsistencyProblem";

// Lazy load below-the-fold sections (retry-aware: survives stale chunks after deploys).
// These are grouped into a single "landing-below-fold" chunk via manualChunks
// in vite.config.ts, so they still load on demand but as one request.
const FAQ = lazyWithRetry(() => import("@/components/FAQ").then(m => ({ default: m.FAQ })));
const Testimonials = lazyWithRetry(() => import("@/components/Testimonials").then(m => ({ default: m.Testimonials })));
const DemoPreview = lazyWithRetry(() => import("@/components/DemoPreview").then(m => ({ default: m.DemoPreview })));
const LandingPricing = lazyWithRetry(() => import("@/components/LandingPricing").then(m => ({ default: m.LandingPricing })));
const StreakRepairDemo = lazyWithRetry(() => import("@/components/StreakRepairDemo").then(m => ({ default: m.StreakRepairDemo })));
const GuidanceSection = lazyWithRetry(() => import("@/components/landing/Sections").then(m => ({ default: m.GuidanceSection })));
const ExampleDays = lazyWithRetry(() => import("@/components/landing/Sections").then(m => ({ default: m.ExampleDays })));
const ResetTeaser = lazyWithRetry(() => import("@/components/landing/Sections").then(m => ({ default: m.ResetTeaser })));
const LandingDisclaimer = lazyWithRetry(() => import("@/components/landing/Sections").then(m => ({ default: m.LandingDisclaimer })));


const Index = () => {
  const navigate = useNavigate();
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    analytics.visitLanding();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsSignedIn(!!session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsSignedIn(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsSignedIn(false);
    setTimeout(() => navigate("/auth", { replace: true }), 50);
  };

  return (
    <>
      <SEO
        title="Momentum: Fitness Consistency for Adults 40+"
        canonical="https://momentumfit.app/"
        description="Build sustainable fitness habits with a daily readiness check-in, guidance that fits how you feel today, and streaks that survive a missed day. Free to start."
        keywords="fitness habit tracker for adults over 40, workout consistency, daily readiness check-in, recovery-aware fitness, streak repair, momentumfit"
        ogImage="https://momentumfit.app/og-share.jpg"
      />
      <div className="min-h-screen bg-background-cream">
        {/* Skip-to-content link is rendered globally in App.tsx; targets the
            <main id="main-content"> wrapper in AppLayout. */}

        {/* Navigation */}
        <nav aria-label="Page sections" className="sticky top-0 z-20 bg-card/80 backdrop-blur-md border-b border-border shadow-sm">
          <div className="container mx-auto px-6 md:px-8 max-w-7xl flex items-center justify-between py-3">
            <div className="flex items-center gap-2">
              <img src={momentumLogo} alt="Momentum" className="h-8 w-auto" width="32" height="32" />
              <span className="font-display font-bold text-lg text-gradient">Momentum</span>
            </div>
            <div className="hidden md:flex items-center gap-6 text-sm font-medium">
              <a href="#how-it-works" className="text-muted-foreground hover:text-primary transition-colors">Daily Check-In</a>
              <a href="#features" className="text-muted-foreground hover:text-primary transition-colors">Guidance</a>
              <a href="/pricing" className="text-muted-foreground hover:text-primary transition-colors" onClick={(e) => { e.preventDefault(); navigate("/pricing"); }}>Pricing</a>
              <a href="/resources/habit-streaks-science" className="text-muted-foreground hover:text-primary transition-colors" onClick={(e) => { e.preventDefault(); navigate("/resources/habit-streaks-science"); }}>Resources</a>
              <a href="#faq" className="text-muted-foreground hover:text-primary transition-colors">FAQ</a>
            </div>
            <div className="flex items-center gap-2">
              {isSignedIn ? (
                <>
                  <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")} className="border-2">
                    Dashboard
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-1" /> Sign Out
                  </Button>
                </>
              ) : (
                <Button variant="outline" size="sm" onClick={() => navigate("/auth")} className="border-2">
                  <LogIn className="h-4 w-4 mr-1" /> Sign In
                </Button>
              )}
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 opacity-30" style={{background: 'var(--gradient-accent)'}} role="presentation" />
           <div className="container mx-auto px-6 md:px-8 max-w-7xl relative">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center py-8 md:py-12 lg:py-14">
              <div className="space-y-4 md:space-y-5 text-center lg:text-left fade-in">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground leading-[1.15] tracking-tight">
                  Fitness consistency for the life you actually live.
                </h1>
                <p className="text-base md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                  Build sustainable fitness habits with daily check-ins, recovery-aware guidance, and progress tracking designed for adults 40+.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start items-center pt-2">
                  <Button
                    size="lg"
                    onClick={() => {
                      analytics.heroCtaClick();
                      analytics.startSignup();
                      const params = new URLSearchParams({ mode: "signup" });
                      new URLSearchParams(window.location.search).forEach((v, k) => {
                        if (k.startsWith("utm_")) params.set(k, v);
                      });
                      navigate(`/auth?${params.toString()}`);
                    }}
                    className="btn-large shadow-xl hover:shadow-2xl transition-all text-base md:text-lg h-12 md:h-14 px-6 md:px-8 btn-gradient w-full sm:w-auto"
                  >
                    Start My Free Fitness Routine
                  </Button>
                  <AppStoreBadge />
                </div>
                <p className="text-sm">
                  <a
                    href="/7-day-reset"
                    onClick={(e) => { e.preventDefault(); navigate("/7-day-reset"); }}
                    className="text-primary font-semibold underline underline-offset-4 inline-flex items-center min-h-[44px]"
                  >
                    Try the 7-Day Readiness Reset
                  </a>
                </p>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Free for up to 3 habits. No credit card. Tap a sample day to see the plan change.
                </p>
              </div>

              <div className="relative pt-3 lg:pt-0">
                <HeroTodayPreview />
                <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -top-8 -left-8 w-56 h-56 bg-primary-warm/5 rounded-full blur-3xl pointer-events-none" />
              </div>
            </div>
          </div>
        </section>



        {/* 2. The consistency problem after 40 */}
        <ConsistencyProblem />

        {/* 3. Daily readiness check-in, with the try-it demo */}
        <HowItWorks />

        {/* Below-the-fold lazy-loaded sections (single grouped chunk) */}
        <Suspense fallback={<div className="py-16" />}>
          {/* 4. Adaptive guidance and AI Coach */}
          <GuidanceSection />

          {/* 5. Streak repair and progress tracking */}
          <StreakRepairDemo />
          <DemoPreview />

          {/* 6. Realistic example days */}
          <ExampleDays />

          {/* 7. Free versus Premium */}
          <LandingPricing />

          {/* Real approved testimonials if any exist, otherwise plain trust facts */}
          <Testimonials />

          {/* 8. 7-Day Readiness Reset */}
          <ResetTeaser />

          {/* 9. FAQ and disclaimers */}
          <div id="faq" className="scroll-mt-16">
            <FAQ />
          </div>
          <LandingDisclaimer />
        </Suspense>

        {/* 10. Final CTA */}
        <section className="relative py-20 md:py-28 overflow-hidden" style={{ background: 'var(--gradient-primary)' }}>
          <div className="container mx-auto px-6 md:px-8 text-center relative z-10">
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4 text-white">
              Start with today, whatever kind of day it is.
            </h2>
            <p className="text-lg text-white/90 mb-8 max-w-xl mx-auto">
              Check in, get today's plan, log what you did. Free for up to 3 habits, no credit card.
            </p>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => navigate("/auth?mode=signup")}
              className="btn-large shadow-2xl bg-white text-primary hover:bg-white/90 transition-all text-base md:text-lg h-14 px-8 md:px-12 font-semibold"
            >
              Start My Free Fitness Routine
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 border-t border-primary/10 bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
              <div>
                <p className="text-muted-foreground font-medium">Built by <a href="https://chadtdyar.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Chad T. Dyar</a></p>
                <p className="text-xs text-muted-foreground mt-1">&copy; 2026 Momentum. All rights reserved.</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Also by Chad:{" "}
                  <a href="https://pawformance.app" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">tools for pets</a>,{" "}
                  <a href="https://carecadence.app" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">health</a>,{" "}
                  <a href="https://palettepro.design" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">design</a>, and{" "}
                  <a href="https://thehomegrown.app" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">gardening</a>
                </p>
              </div>
              <nav className="flex flex-wrap gap-6 text-sm justify-center" aria-label="Footer navigation">
                <a href="/features" className="text-muted-foreground hover:text-primary transition-colors font-medium">Features</a>
                <a href="/blog" className="text-muted-foreground hover:text-primary transition-colors font-medium">Blog</a>
                <a href="/resources/habit-streaks-science" className="text-muted-foreground hover:text-primary transition-colors font-medium">Resources</a>
                <a href="mailto:support@momentumfit.app" className="text-muted-foreground hover:text-primary transition-colors font-medium">Contact</a>
                <a href="/privacy" className="text-muted-foreground hover:text-primary transition-colors font-medium">Privacy Policy</a>
                <a href="/terms" className="text-muted-foreground hover:text-primary transition-colors font-medium">Terms of Service</a>
              </nav>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Index;

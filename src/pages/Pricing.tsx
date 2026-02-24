import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Star, Crown, Zap } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { analytics } from "@/lib/analytics";
import { SEO } from "@/components/SEO";
import { PLANS, type PlanTier } from "@/lib/plans";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Pricing() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<PlanTier>('free');

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', user.id)
        .single();
      if (profile?.plan) setCurrentPlan(profile.plan as PlanTier);
    }
  };

  const handleUpgrade = async (plan: 'plus' | 'pro') => {
    analytics.upgradeClicked();
    setLoading(plan);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in first");
        navigate("/auth");
        return;
      }
      analytics.checkoutStarted();
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan }
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  const freeFeatures = [
    "Track up to 3 fitness goals",
    "Daily check-ins",
    "7-day streak tracking",
    "Basic progress graphs",
  ];

  const plusFeatures = [
    "Everything in Free",
    "Unlimited fitness goals",
    "Streak Repair (fix missed days)",
    "30-day progress history",
    "Weekly progress email summary",
  ];

  const proFeatures = [
    "Everything in Plus",
    "AI Coach (personalized suggestions)",
    "Unlimited progress history",
    "Priority support",
    "CSV data export",
  ];

  const faqData = [
    {
      question: "Is Momentum really free?",
      answer: "Yes, the free tier is free forever with up to 3 goals. No credit card required, no hidden fees.",
    },
    {
      question: "What is Streak Repair?",
      answer: "Life happens. Plus and Pro members can retroactively log missed days within 48 hours so one bad day doesn't reset weeks of progress.",
    },
    {
      question: "How does the AI Coach work?",
      answer: "Pro members get personalized suggestions based on their check-in patterns, goal types, and consistency data. It learns what works for you.",
    },
    {
      question: "Can I cancel anytime?",
      answer: "Yes. Cancel from Settings. You keep access through the end of your billing period.",
    },
  ];

  return (
    <>
      <SEO
        title="Pricing - Momentum | Free, Plus & Pro Plans"
        description="Start free with 3 goals and daily check-ins. Upgrade to Plus ($4.99/mo) for unlimited goals or Pro ($9.99/mo) for AI coaching and unlimited history."
        keywords="fitness app pricing, habit tracker cost, premium fitness features, affordable fitness app"
      />
      <div className="min-h-screen bg-background-cream py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-8 max-w-6xl">
          <div className="text-center mb-12 md:mb-16">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 text-gradient">
              Choose your plan
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Sustainable fitness starts here. Pick what works for you.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {/* Free Plan */}
            <Card className="border-none shadow-md card-lift">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl font-display font-bold text-foreground">Free</CardTitle>
                <CardDescription className="text-base">Perfect for getting started</CardDescription>
                <div className="mt-6">
                  <span className="text-5xl font-display font-bold text-foreground">$0</span>
                  <span className="text-lg text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {freeFeatures.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant="outline"
                  className="w-full border-2 min-h-[44px]"
                  size="lg"
                  onClick={() => navigate(currentPlan === 'free' ? "/auth" : "/dashboard")}
                >
                  {currentPlan === 'free' ? "Start free" : "Current Plan"}
                </Button>
              </CardContent>
            </Card>

            {/* Plus Plan - Most Popular */}
            <Card className="border-2 border-primary shadow-xl card-lift-heavy relative overflow-hidden" style={{ background: 'var(--gradient-card)' }}>
              <div className="absolute top-0 right-0 px-4 py-1 text-sm font-semibold text-primary-foreground flex items-center gap-1" style={{ background: 'var(--gradient-primary)' }}>
                <Star className="h-3 w-3" /> Most Popular
              </div>
              <CardHeader className="pb-6 pt-8">
                <CardTitle className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
                  Plus <span className="badge-premium text-xs px-2 py-0.5">PLUS</span>
                </CardTitle>
                <CardDescription className="text-base">Unlimited goals & streak repair</CardDescription>
                <div className="mt-6">
                  <span className="text-5xl font-display font-bold text-primary">$4.99</span>
                  <span className="text-lg text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plusFeatures.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full shadow-lg hover:shadow-xl transition-all font-semibold btn-gradient min-h-[44px]"
                  size="lg"
                  onClick={() => handleUpgrade('plus')}
                  disabled={loading !== null || currentPlan === 'plus' || currentPlan === 'pro'}
                >
                  {loading === 'plus' ? "Loading..." : currentPlan === 'plus' ? "Current Plan" : currentPlan === 'pro' ? "Included in Pro" : "Start 7-day free trial"}
                </Button>
                <p className="text-xs text-center text-muted-foreground">7-day free trial, cancel anytime</p>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="border-2 border-secondary shadow-xl card-lift-heavy relative overflow-hidden">
              <div className="absolute top-0 right-0 px-4 py-1 text-sm font-semibold text-secondary-foreground flex items-center gap-1" style={{ background: 'var(--gradient-secondary)' }}>
                <Crown className="h-3 w-3" /> Full Suite
              </div>
              <CardHeader className="pb-6 pt-8">
                <CardTitle className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
                  Pro <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'var(--gradient-secondary)', color: 'white' }}>PRO</span>
                </CardTitle>
                <CardDescription className="text-base">AI Coach & unlimited everything</CardDescription>
                <div className="mt-6">
                  <span className="text-5xl font-display font-bold text-secondary">$9.99</span>
                  <span className="text-lg text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {proFeatures.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full shadow-lg hover:shadow-xl transition-all font-semibold min-h-[44px] bg-secondary text-secondary-foreground hover:bg-secondary/90"
                  size="lg"
                  onClick={() => handleUpgrade('pro')}
                  disabled={loading !== null || currentPlan === 'pro'}
                >
                  {loading === 'pro' ? "Loading..." : currentPlan === 'pro' ? "Current Plan" : "Start 7-day free trial"}
                </Button>
                <p className="text-xs text-center text-muted-foreground">7-day free trial, cancel anytime</p>
              </CardContent>
            </Card>
          </div>

          {/* Trust line */}
          <p className="text-center text-muted-foreground mt-10 text-base font-medium">
            No ads. No data selling. Cancel anytime.
          </p>

          {/* FAQ Section */}
          <div className="mt-20 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-8 text-foreground">
              Frequently Asked Questions
            </h2>
            <Accordion type="single" collapsible className="w-full space-y-4">
              {faqData.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="bg-card border border-border rounded-lg px-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline hover:text-primary py-6 transition-colors">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-6 pt-2">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </>
  );
}

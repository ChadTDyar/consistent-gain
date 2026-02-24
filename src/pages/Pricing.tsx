import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Star, Crown } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { analytics } from "@/lib/analytics";
import { SEO } from "@/components/SEO";
import { PLANS, type PlanTier, type BillingInterval } from "@/lib/plans";
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
  const [billingInterval, setBillingInterval] = useState<BillingInterval>('monthly');

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
        body: { plan, interval: billingInterval }
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

  const getPrice = (plan: 'plus' | 'pro') => {
    if (billingInterval === 'annual') {
      const monthlyEquiv = (PLANS[plan].annualPrice / 12).toFixed(2);
      return monthlyEquiv;
    }
    return PLANS[plan].price.toFixed(2);
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
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              Sustainable fitness starts here. Pick what works for you.
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center gap-1 rounded-full bg-muted p-1">
              <button
                onClick={() => setBillingInterval('monthly')}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                  billingInterval === 'monthly'
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingInterval('annual')}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
                  billingInterval === 'annual'
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Annual
                <span className="inline-flex items-center rounded-full bg-success/20 text-success px-2 py-0.5 text-xs font-bold">
                  Save 20%
                </span>
              </button>
            </div>
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
                  <span className="text-5xl font-display font-bold text-primary">${getPrice('plus')}</span>
                  <span className="text-lg text-muted-foreground">/mo</span>
                  {billingInterval === 'annual' && (
                    <div className="mt-1">
                      <span className="text-sm text-muted-foreground line-through">${PLANS.plus.price.toFixed(2)}/mo</span>
                      <span className="text-sm font-semibold text-success ml-2">
                        ${PLANS.plus.annualPrice.toFixed(2)}/yr
                      </span>
                    </div>
                  )}
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
                  <span className="text-5xl font-display font-bold text-secondary">${getPrice('pro')}</span>
                  <span className="text-lg text-muted-foreground">/mo</span>
                  {billingInterval === 'annual' && (
                    <div className="mt-1">
                      <span className="text-sm text-muted-foreground line-through">${PLANS.pro.price.toFixed(2)}/mo</span>
                      <span className="text-sm font-semibold text-success ml-2">
                        ${PLANS.pro.annualPrice.toFixed(2)}/yr
                      </span>
                    </div>
                  )}
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

          {/* Feature Comparison Table */}
          <div className="mt-20 max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-8 text-foreground">
              Compare All Features
            </h2>
            <Card className="border-primary/10 shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 font-semibold text-foreground">Feature</th>
                      <th className="text-center p-4 font-semibold text-foreground">Free</th>
                      <th className="text-center p-4 font-semibold text-primary">Plus</th>
                      <th className="text-center p-4 font-semibold text-secondary relative">
                        <div className="absolute -top-0 left-1/2 -translate-x-1/2 -translate-y-full">
                          <span className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-t-lg font-bold text-secondary-foreground" style={{ background: 'var(--gradient-secondary)' }}>
                            <Crown className="h-3 w-3" /> Best Value
                          </span>
                        </div>
                        Pro
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { feature: "Fitness goals", free: "Up to 3", plus: "Unlimited", pro: "Unlimited" },
                      { feature: "Daily check-ins", free: true, plus: true, pro: true },
                      { feature: "Streak tracking", free: "7 days", plus: "30 days", pro: "Unlimited" },
                      { feature: "Progress graphs", free: "Basic", plus: "Enhanced", pro: "Full" },
                      { feature: "Streak Repair", free: false, plus: true, pro: true },
                      { feature: "Weekly email summary", free: false, plus: true, pro: true },
                      { feature: "AI Coach", free: false, plus: false, pro: true },
                      { feature: "CSV data export", free: false, plus: false, pro: true },
                      { feature: "Priority support", free: false, plus: false, pro: true },
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="p-4 font-medium text-foreground">{row.feature}</td>
                        {[row.free, row.plus, row.pro].map((val, j) => (
                          <td key={j} className={`p-4 text-center ${j === 2 ? 'bg-secondary/5' : ''}`}>
                            {val === true ? (
                              <CheckCircle className="h-5 w-5 text-success mx-auto" />
                            ) : val === false ? (
                              <span className="text-muted-foreground/40">—</span>
                            ) : (
                              <span className="text-muted-foreground">{val}</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

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

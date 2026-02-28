import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Star, Crown, Shield } from "lucide-react";
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

  const getPrice = (plan: 'plus' | 'pro') => {
    if (billingInterval === 'annual') {
      const monthlyEquiv = (PLANS[plan].annualPrice / 12).toFixed(2);
      return monthlyEquiv;
    }
    return PLANS[plan].price.toFixed(2);
  };

  const freeFeatures = [
    "Track up to 3 habits",
    "Daily check-ins",
    "7-day streak tracking",
    "Basic progress graphs",
  ];

  const starterFeatures = [
    "Everything in Free",
    "Unlimited habits",
    "Streak Repair (fix missed days within 48hrs)",
    "30-day progress history",
    "Weekly progress email summary",
  ];

  const proFeatures = [
    "Everything in Starter",
    "AI Coach — personalized habit guidance",
    "Unlimited progress history",
    "Priority support",
    "CSV data export",
  ];

  const faqData = [
    {
      question: "Is Momentum really free?",
      answer: "Yes. The Free plan includes up to 3 habits, daily check-ins, and 7-day streaks — forever free, no credit card required.",
    },
    {
      question: "What is Streak Repair?",
      answer: "Life happens. Starter and Pro members can retroactively log missed days within 48 hours so one bad day doesn't reset weeks of progress.",
    },
    {
      question: "How does the AI Coach work?",
      answer: "Pro members get personalized suggestions based on their check-in patterns, habit types, and consistency data. It learns what works for you and adjusts recommendations to your schedule.",
    },
    {
      question: "Can I cancel anytime?",
      answer: "Absolutely. Cancel from Settings anytime. You keep access through the end of your billing period. No commitments, no questions asked.",
    },
    {
      question: "What happens in my first week?",
      answer: "You'll set up 1–3 realistic habits, configure reminders that fit your schedule, and complete your first 7-day streak. Most users are set up in under 5 minutes.",
    },
  ];

  return (
    <>
      <SEO
        title="Pricing - Momentum | Free, Starter & Pro Plans"
        description="Start free with 3 habits. Upgrade to Starter ($9/mo) for unlimited habits or Pro ($19/mo) for AI coaching and unlimited history."
        keywords="habit tracker pricing, habit app cost, premium habit features, affordable habit tracker"
      />
      <div className="min-h-screen bg-background-cream py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-8 max-w-6xl">
          <div className="text-center mb-12 md:mb-16">
            <p className="text-sm font-semibold text-primary uppercase tracking-wide mb-3">
              For busy professionals who need habits that stick
            </p>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 text-gradient">
              Pick the plan that fits your life
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Set up in under 5 minutes. Complete your first 7-day streak this week. Cancel anytime.
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
                <CardDescription className="text-base">Try the basics, no strings attached</CardDescription>
                <div className="mt-6">
                  <span className="text-5xl font-display font-bold text-foreground">$0</span>
                  <span className="text-lg text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-foreground mb-1">This is for you if…</p>
                  <p className="text-xs text-muted-foreground">You want to test whether daily check-ins work before committing.</p>
                </div>
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
                  onClick={() => navigate("/auth")}
                >
                  Start free
                </Button>
              </CardContent>
            </Card>

            {/* Starter Plan */}
            <Card className="border-2 border-primary shadow-xl card-lift-heavy relative overflow-hidden" style={{ background: 'var(--gradient-card)' }}>
              <div className="absolute top-0 right-0 px-4 py-1 text-sm font-semibold text-primary-foreground flex items-center gap-1" style={{ background: 'var(--gradient-primary)' }}>
                <Star className="h-3 w-3" /> Most Popular
              </div>
              <CardHeader className="pb-6 pt-8">
                <CardTitle className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
                  Starter <span className="badge-premium text-xs px-2 py-0.5">STARTER</span>
                </CardTitle>
                <CardDescription className="text-base">Unlimited habits & streak protection</CardDescription>
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
                <div className="bg-primary/10 rounded-lg p-3">
                  <p className="text-xs font-semibold text-foreground mb-1">This is for you if…</p>
                  <p className="text-xs text-muted-foreground">You're building 2–3 core habits, want light reminders, and need streak protection so one bad day doesn't erase your progress.</p>
                </div>
                <ul className="space-y-3">
                  {starterFeatures.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full shadow-lg hover:shadow-xl transition-all font-semibold btn-gradient min-h-[44px]"
                  size="lg"
                  onClick={() => { analytics.startCheckout('starter'); window.open('https://buy.stripe.com/7sYbJ2a7W1iK2jmazt', '_blank'); }}
                >
                  Start 7-day free trial
                </Button>
                <p className="text-xs text-center text-muted-foreground">7-day free trial, cancel anytime</p>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="border-2 border-secondary shadow-xl card-lift-heavy relative overflow-hidden">
              <div className="absolute top-0 right-0 px-4 py-1 text-sm font-semibold text-secondary-foreground flex items-center gap-1" style={{ background: 'var(--gradient-secondary)' }}>
                <Crown className="h-3 w-3" /> Best Value
              </div>
              <CardHeader className="pb-6 pt-8">
                <CardTitle className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
                  Pro <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'var(--gradient-secondary)', color: 'white' }}>PRO</span>
                </CardTitle>
                <CardDescription className="text-base">AI coaching & unlimited everything</CardDescription>
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
                <div className="bg-secondary/10 rounded-lg p-3">
                  <p className="text-xs font-semibold text-foreground mb-1">This is for you if…</p>
                  <p className="text-xs text-muted-foreground">You want multiple routines, deeper analytics, and an AI coach that adapts to your schedule, energy, and real life.</p>
                </div>
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
                  onClick={() => { analytics.startCheckout('pro'); window.open('https://buy.stripe.com/5kQeVe3Jyd1s5vy0YT3ZK03', '_blank'); }}
                >
                  Upgrade for Pro coaching
                </Button>
                <p className="text-xs text-center text-muted-foreground">7-day free trial, cancel anytime</p>
              </CardContent>
            </Card>
          </div>

          {/* Guarantee & First Week */}
          <div className="mt-12 grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card className="border-primary/10 shadow-md">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Our guarantee</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Cancel anytime, no commitments. No ads, no data selling. You keep access through the end of your billing period — no questions asked.
                </p>
              </CardContent>
            </Card>
            <Card className="border-primary/10 shadow-md">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-foreground mb-3">What you'll accomplish in week 1</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-success flex-shrink-0" /> Set up 1–3 realistic daily habits</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-success flex-shrink-0" /> Configure reminders that fit your schedule</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-success flex-shrink-0" /> Complete your first 7-day streak</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-success flex-shrink-0" /> See your consistency visualized</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Trust line */}
          <p className="text-center text-muted-foreground mt-10 text-base font-medium">
            No ads. No data selling. Cancel anytime, no commitments.
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
                      <th className="text-center p-4 font-semibold text-primary">Starter</th>
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
                      { feature: "Habits", free: "Up to 3", plus: "Unlimited", pro: "Unlimited" },
                      { feature: "Daily check-ins", free: true, plus: true, pro: true },
                      { feature: "Streak tracking", free: "7 days", plus: "30 days", pro: "Unlimited" },
                      { feature: "Progress graphs", free: "Basic", plus: "Enhanced", pro: "Full" },
                      { feature: "Streak Repair (48hr window)", free: false, plus: true, pro: true },
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
                              <span className="text-muted-foreground/40">-</span>
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

          {/* Cross-promo footer */}
          <div className="mt-16 text-center">
            <p className="text-xs text-muted-foreground">
              Also by <a href="https://www.chadtdyar.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Chad</a>: tools for pets, health, design, and gardening.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

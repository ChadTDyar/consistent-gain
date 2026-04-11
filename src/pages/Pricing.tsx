import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Star, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { analytics } from "@/lib/analytics";
import { SEO } from "@/components/SEO";
import { MOMENTUM, RULES } from "@/constants/value-language";
import { type PlanTier } from "@/lib/plans";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Pricing() {
  const navigate = useNavigate();
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

  const freeFeatures = [
    "Track up to 3 habits",
    "Daily check-ins",
    "7-day streak tracking",
    "Weekly summary",
  ];

  const proFeatures = [
    "Everything in Free",
    "Unlimited habits",
    "Accountability partner",
    "AI coaching prompts",
    "Trend analytics",
    "Streak Repair (48hr window)",
    "Unlimited history",
    "CSV data export",
    "Priority support",
  ];

  const faqData = [
    {
      question: "Is Momentum really free?",
      answer: "Yes. The Free plan includes up to 3 habits, daily check-ins, and 7-day streaks — forever free, no credit card required.",
    },
    {
      question: "What do I get with Pro?",
      answer: "Unlimited habits, an accountability partner, AI coaching prompts, trend analytics, Streak Repair, unlimited history, data export, and priority support. Everything you need to build lasting habits.",
    },
    {
      question: "Can I cancel anytime?",
      answer: "Absolutely. Cancel from Settings anytime. You keep access through the end of your billing period. No commitments, no questions asked.",
    },
    {
      question: "What happens in my first week?",
      answer: "You'll set up 1-3 realistic habits, configure reminders that fit your schedule, and complete your first 7-day streak. Most users are set up in under 5 minutes.",
    },
  ];

  return (
    <>
      <SEO
        title="Pricing - Momentum | Free & Pro Plans"
        description="Start free with 3 habits. Upgrade to Pro ($4.99/mo) for unlimited habits, accountability partner, AI coaching, and trend analytics."
        keywords="habit tracker pricing, habit app cost, premium habit features, affordable habit tracker"
      />
      <div className="min-h-screen bg-background-cream py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl">
          <div className="text-center mb-12 md:mb-16">
            <p className="text-sm font-semibold text-primary uppercase tracking-wide mb-3">
              Simple pricing, no surprises
            </p>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 text-gradient">
              {MOMENTUM.tagline}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Start with 3 habits. Upgrade when you're ready for the rest.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <Card className="border-none shadow-md card-lift">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl font-display font-bold text-foreground">Free</CardTitle>
                <CardDescription className="text-base">{MOMENTUM.free.headline}</CardDescription>
                <div className="mt-6">
                  <span className="text-5xl font-display font-bold text-foreground">$0</span>
                  <span className="text-lg text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-sm text-muted-foreground">{MOMENTUM.free.desc}</p>
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
                  {MOMENTUM.ctas.hero}
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="border-2 border-primary shadow-xl card-lift-heavy relative overflow-hidden" style={{ background: 'var(--gradient-card)' }}>
              <div className="absolute top-0 right-0 px-4 py-1 text-sm font-semibold text-primary-foreground flex items-center gap-1" style={{ background: 'var(--gradient-primary)' }}>
                <Star className="h-3 w-3" /> Recommended
              </div>
              <CardHeader className="pb-6 pt-8">
                <CardTitle className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
                  Pro <span className="badge-premium text-xs px-2 py-0.5">PRO</span>
                </CardTitle>
                <CardDescription className="text-base">{MOMENTUM.pro.headline}</CardDescription>
                <div className="mt-6">
                  <span className="text-5xl font-display font-bold text-primary">${MOMENTUM.pro.price.toFixed(2)}</span>
                  <span className="text-lg text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-sm text-muted-foreground">{MOMENTUM.pro.desc}</p>
                <ul className="space-y-3">
                  {proFeatures.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full shadow-lg hover:shadow-xl transition-all font-semibold btn-gradient min-h-[44px]"
                  size="lg"
                  onClick={() => { analytics.startCheckout('pro'); window.open('https://buy.stripe.com/7sY5kE0xm5z08HK5f93ZK0c', '_blank'); }}
                >
                  {MOMENTUM.ctas.upgrade}
                </Button>
                <p className="text-xs text-center text-muted-foreground">{RULES.cancel_note}</p>
              </CardContent>
            </Card>
          </div>

          {/* Guarantee */}
          <div className="mt-12 max-w-2xl mx-auto">
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
          </div>

          {/* Trust line */}
          <p className="text-center text-muted-foreground mt-10 text-base font-medium">
            No ads. No data selling. Cancel anytime, no commitments.
          </p>

          {/* Feature Comparison Table */}
          <div className="mt-20 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-8 text-foreground">
              Compare Plans
            </h2>
            <Card className="border-primary/10 shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 font-semibold text-foreground">Feature</th>
                      <th className="text-center p-4 font-semibold text-foreground">Free</th>
                      <th className="text-center p-4 font-semibold text-primary">Pro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { feature: "Habits", free: "Up to 3", pro: "Unlimited" },
                      { feature: "Daily check-ins", free: true, pro: true },
                      { feature: "Streak tracking", free: "7 days", pro: "Unlimited" },
                      { feature: "Weekly summary", free: true, pro: true },
                      { feature: "Accountability partner", free: false, pro: true },
                      { feature: "AI coaching prompts", free: false, pro: true },
                      { feature: "Trend analytics", free: false, pro: true },
                      { feature: "Streak Repair (48hr)", free: false, pro: true },
                      { feature: "CSV data export", free: false, pro: true },
                      { feature: "Priority support", free: false, pro: true },
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="p-4 font-medium text-foreground">{row.feature}</td>
                        {[row.free, row.pro].map((val, j) => (
                          <td key={j} className={`p-4 text-center ${j === 1 ? 'bg-primary/5' : ''}`}>
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

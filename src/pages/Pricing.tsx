import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Star, Crown } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { analytics } from "@/lib/analytics";
import { SEO } from "@/components/SEO";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// Stripe price IDs
const PRICES = {
  premium_monthly: "price_1T3mjQLnv14mW4wIXlyIaXP1",
  premium_annual: "price_1T3mkCLnv14mW4wIyiapEvA9",
  plus_monthly: "price_1T3mjmLnv14mW4wIIr3fC29d",
  plus_annual: "price_1T3mkSLnv14mW4wIeVK4gOos",
};

export default function Pricing() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [isAnnual, setIsAnnual] = useState(false);

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_premium')
        .eq('id', user.id)
        .single();
      if (profile) setIsPremium(profile.is_premium ?? false);
    }
  };

  const handleUpgrade = async (priceId: string) => {
    analytics.upgradeClicked();
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to upgrade");
        navigate("/auth");
        return;
      }
      analytics.checkoutStarted();
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId }
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, '_blank');
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const freeFeatures = [
    "Daily workout of the day (joint-safe)",
    "Basic exercise library (50 exercises)",
    "Weekly wellness tip from Coach",
    "Basic activity log & streak counter",
    "Up to 3 fitness goals",
  ];

  const premiumFeatures = [
    "Everything in Free",
    "Pain tracking with body map",
    "Weather-aware workout suggestions",
    "Workout buddy check-in system",
    "Custom workout builder",
    "Full Coach AI access (unlimited)",
    "Progress charts & trends",
    "Calendar integration",
  ];

  const plusFeatures = [
    "Everything in Premium",
    "Doctor-shareable progress reports (PDF)",
    "Medication-aware exercise flags",
    "Nutrition guidance integration",
    "Priority Coach responses",
    "Family account (share with partner)",
  ];

  return (
    <>
      <SEO 
        title="Pricing Plans - Momentum | Free, Premium & Premium+ Fitness Tracker"
        description="Start free with joint-safe workouts. Upgrade to Premium ($3.99/mo) for pain tracking & AI coaching, or Premium+ ($7.99/mo) for doctor reports & family accounts."
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
            
            <div className="flex items-center justify-center gap-4 mb-2">
              <Label htmlFor="annual-toggle" className={`text-base font-medium ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
                Monthly
              </Label>
              <Switch 
                id="annual-toggle"
                checked={isAnnual} 
                onCheckedChange={setIsAnnual}
                aria-label="Toggle between monthly and annual pricing"
              />
              <Label htmlFor="annual-toggle" className={`text-base font-medium ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
                Annual
              </Label>
            </div>
            {isAnnual && (
              <p className="text-sm text-primary font-semibold">Save 20% with annual billing</p>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {/* Free Plan */}
            <Card className="border-none shadow-md card-lift">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl font-display font-bold text-foreground">
                  Free
                </CardTitle>
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
                  onClick={() => navigate("/dashboard")}
                >
                  Current Plan
                </Button>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="border-2 border-primary shadow-xl card-lift-heavy relative overflow-hidden" style={{background: 'var(--gradient-card)'}}>
              <div className="absolute top-0 right-0 px-4 py-1 text-sm font-semibold text-primary-foreground flex items-center gap-1" style={{background: 'var(--gradient-primary)'}}>
                <Star className="h-3 w-3" /> Most Popular
              </div>
              <CardHeader className="pb-6 pt-8">
                <CardTitle className="text-2xl font-display font-bold text-foreground">
                  Premium
                </CardTitle>
                <CardDescription className="text-base">Full coaching & pain tracking</CardDescription>
                <div className="mt-6">
                  {isAnnual ? (
                    <>
                      <span className="text-5xl font-display font-bold text-primary">$38</span>
                      <span className="text-lg text-muted-foreground">/year</span>
                      <p className="text-sm text-muted-foreground mt-1">($3.17/mo billed annually)</p>
                    </>
                  ) : (
                    <>
                      <span className="text-5xl font-display font-bold text-primary">$3.99</span>
                      <span className="text-lg text-muted-foreground">/month</span>
                    </>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {premiumFeatures.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full shadow-lg hover:shadow-xl transition-all font-semibold btn-gradient min-h-[44px]" 
                  size="lg"
                  onClick={() => handleUpgrade(isAnnual ? PRICES.premium_annual : PRICES.premium_monthly)}
                  disabled={loading || isPremium}
                >
                  {isPremium ? "Current Plan" : "Start 7-Day Free Trial"}
                </Button>
                <p className="text-xs text-center text-muted-foreground">7-day free trial, cancel anytime</p>
              </CardContent>
            </Card>

            {/* Premium+ Plan */}
            <Card className="border-2 border-secondary shadow-xl card-lift-heavy relative overflow-hidden">
              <div className="absolute top-0 right-0 px-4 py-1 text-sm font-semibold text-secondary-foreground flex items-center gap-1" style={{background: 'var(--gradient-secondary)'}}>
                <Crown className="h-3 w-3" /> Full Suite
              </div>
              <CardHeader className="pb-6 pt-8">
                <CardTitle className="text-2xl font-display font-bold text-foreground">
                  Premium+
                </CardTitle>
                <CardDescription className="text-base">Medical reports & family sharing</CardDescription>
                <div className="mt-6">
                  {isAnnual ? (
                    <>
                      <span className="text-5xl font-display font-bold text-secondary">$77</span>
                      <span className="text-lg text-muted-foreground">/year</span>
                      <p className="text-sm text-muted-foreground mt-1">($6.42/mo billed annually)</p>
                    </>
                  ) : (
                    <>
                      <span className="text-5xl font-display font-bold text-secondary">$7.99</span>
                      <span className="text-lg text-muted-foreground">/month</span>
                    </>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plusFeatures.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full shadow-lg hover:shadow-xl transition-all font-semibold min-h-[44px] bg-secondary text-secondary-foreground hover:bg-secondary/90" 
                  size="lg"
                  onClick={() => handleUpgrade(isAnnual ? PRICES.plus_annual : PRICES.plus_monthly)}
                  disabled={loading || isPremium}
                >
                  {isPremium ? "Current Plan" : "Start 7-Day Free Trial"}
                </Button>
                <p className="text-xs text-center text-muted-foreground">7-day free trial, cancel anytime</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

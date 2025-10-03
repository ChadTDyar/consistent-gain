import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

export default function Pricing() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Please sign in to upgrade");
        navigate("/auth");
        return;
      }

      toast.info("Stripe integration coming soon! Premium features will be available shortly.");
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-cream py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-8 max-w-5xl">
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 text-foreground">
            Choose Your Plan
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            Start free, upgrade when you're ready
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {/* Free Plan */}
          <Card className="border-none shadow-md card-lift">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl md:text-3xl font-display font-bold text-foreground">
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
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                  <span className="text-base">1 fitness goal</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                  <span className="text-base">7-day activity history</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                  <span className="text-base">Streak tracking</span>
                </li>
              </ul>
              <Button 
                variant="outline" 
                className="w-full border-2" 
                size="lg" 
                onClick={() => navigate("/dashboard")}
              >
                Current Plan
              </Button>
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className="border-2 border-primary shadow-xl card-lift bg-gradient-to-br from-card to-primary/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1 text-sm font-semibold">
              Most Popular
            </div>
            <CardHeader className="pb-6 pt-8">
              <CardTitle className="text-2xl md:text-3xl font-display font-bold text-foreground">
                Premium
              </CardTitle>
              <CardDescription className="text-base">For serious habit builders</CardDescription>
              <div className="mt-6">
                <span className="text-5xl font-display font-bold text-primary">$9.99</span>
                <span className="text-lg text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                  <span className="font-semibold text-base">3 fitness goals</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                  <span className="font-semibold text-base">Unlimited history</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                  <span className="text-base">Advanced streak tracking</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                  <span className="text-base">Export your data</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                  <span className="text-base">Priority support</span>
                </li>
              </ul>
              <Button 
                className="w-full shadow-md hover:shadow-lg transition-all font-semibold" 
                size="lg"
                onClick={handleUpgrade}
                disabled={loading}
              >
                Upgrade Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

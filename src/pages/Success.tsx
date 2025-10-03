import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { analytics } from "@/lib/analytics";

export default function Success() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    try {
      // Track successful purchase
      analytics.purchaseCompleted(9.99);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Wait a moment for webhook to process
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_premium')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          setIsPremium(profile.is_premium);
        }
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-cream flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-none shadow-xl">
        <CardHeader className="text-center pb-6">
          {loading ? (
            <>
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
              <CardTitle className="text-3xl font-display font-bold">
                Processing...
              </CardTitle>
              <CardDescription className="text-base">
                Please wait while we activate your premium membership
              </CardDescription>
            </>
          ) : (
            <>
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <CardTitle className="text-3xl font-display font-bold text-foreground">
                {isPremium ? "Welcome to Premium! 🎉" : "Payment Successful!"}
              </CardTitle>
              <CardDescription className="text-base">
                {isPremium 
                  ? "Your premium features are now active. Let's build some momentum!"
                  : "Your payment was successful. Premium features will activate shortly."
                }
              </CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {!loading && (
            <>
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-6 space-y-3">
                <h3 className="font-display font-semibold text-lg text-foreground">
                  You now have access to:
                </h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>Unlimited fitness goals</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>AI Coach for personalized guidance</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>Priority support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>Advanced analytics (coming soon)</span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => navigate("/dashboard")}
                  className="flex-1 shadow-sm hover:shadow-md font-semibold"
                  size="lg"
                >
                  Go to Dashboard
                </Button>
                <Button
                  onClick={() => navigate("/settings")}
                  variant="outline"
                  className="flex-1 border-2 font-semibold"
                  size="lg"
                >
                  View Settings
                </Button>
              </div>

              {!isPremium && (
                <p className="text-sm text-muted-foreground text-center mt-4">
                  If your premium features don't activate within a few minutes, please{" "}
                  <a href="mailto:support@momentumfit.app" className="text-primary hover:underline">
                    contact support
                  </a>
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
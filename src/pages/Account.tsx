import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function Account() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const success = searchParams.get('success');

  useEffect(() => {
    // Refresh profile to get updated subscription status
    const refreshProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .select('is_premium')
          .eq('id', user.id)
          .single();
      }
      setLoading(false);
    };

    if (success) {
      refreshProfile();
    } else {
      setLoading(false);
    }
  }, [success]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your account...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background-cream py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-8 max-w-2xl">
          <Card className="border-none shadow-xl text-center">
            <CardHeader className="pb-6">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-success/10 mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-success" />
              </div>
              <CardTitle className="text-3xl md:text-4xl font-display font-bold text-foreground">
                Welcome to Premium!
              </CardTitle>
              <CardDescription className="text-base md:text-lg mt-4">
                Your subscription is now active. You have access to all premium features.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted/50 rounded-lg p-6 text-left space-y-3">
                <p className="flex items-center gap-3 text-base">
                  <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                  Unlimited goals
                </p>
                <p className="flex items-center gap-3 text-base">
                  <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                  AI coaching and adaptive programs
                </p>
                <p className="flex items-center gap-3 text-base">
                  <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                  Advanced analytics and insights
                </p>
                <p className="flex items-center gap-3 text-base">
                  <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                  Priority support
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  onClick={() => navigate("/dashboard")}
                  size="lg"
                  className="flex-1 shadow-md hover:shadow-lg font-semibold"
                >
                  Go to Dashboard
                </Button>
                <Button
                  onClick={() => navigate("/settings")}
                  size="lg"
                  variant="outline"
                  className="flex-1 border-2"
                >
                  Manage Subscription
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Default account view (when not coming from successful checkout)
  return (
    <div className="min-h-screen bg-background-cream py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-8 max-w-2xl">
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl font-display font-bold">
              Account
            </CardTitle>
            <CardDescription className="text-base">
              Manage your account and subscription
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => navigate("/settings")}
              size="lg"
              className="w-full shadow-sm hover:shadow-md font-semibold"
            >
              Go to Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

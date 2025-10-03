import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ArrowLeft } from "lucide-react";
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-xl text-muted-foreground">
            Start free, upgrade when you're ready
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Free</CardTitle>
              <CardDescription>Perfect for getting started</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-success" />
                  <span>1 active goal</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-success" />
                  <span>7-day activity history</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-success" />
                  <span>Streak tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-success" />
                  <span>Daily check-ins</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full" onClick={() => navigate("/dashboard")}>
                Current Plan
              </Button>
            </CardContent>
          </Card>

          <Card className="border-primary shadow-lg relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </span>
            </div>
            <CardHeader>
              <CardTitle className="text-2xl">Premium</CardTitle>
              <CardDescription>For serious habit builders</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">$9.99</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-success" />
                  <span className="font-semibold">Up to 3 active goals</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-success" />
                  <span className="font-semibold">Unlimited activity history</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-success" />
                  <span>Advanced progress charts</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-success" />
                  <span>Export your data</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-success" />
                  <span>Priority support</span>
                </li>
              </ul>
              <Button className="w-full" onClick={handleUpgrade} disabled={loading}>
                Upgrade to Premium
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

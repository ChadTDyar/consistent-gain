import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Target, TrendingUp, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import momentumLogo from "@/assets/momentum-logo.png";

export default function Welcome() {
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
    }
  };

  return (
    <div className="min-h-screen bg-background-cream flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-none shadow-xl">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-4">
            <img src={momentumLogo} alt="Momentum" className="h-16 w-auto" />
          </div>
          <CardTitle className="text-4xl font-display font-bold text-foreground">
            Welcome to Momentum! 🎉
          </CardTitle>
          <CardDescription className="text-lg mt-2">
            Let's get you started on your fitness journey
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-6 space-y-4">
            <h3 className="font-display font-semibold text-xl text-foreground">
              Here's how Momentum works:
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">1. Set Your Goals</h4>
                  <p className="text-sm text-muted-foreground">
                    Create up to 3 fitness goals (unlimited with Premium). Whether it's strength training, cardio, or yoga - you choose.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">2. Log Your Progress</h4>
                  <p className="text-sm text-muted-foreground">
                    Simple daily check-ins. No complicated tracking - just mark when you complete your activity.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">3. Build Your Streak</h4>
                  <p className="text-sm text-muted-foreground">
                    Watch your consistency grow. Streaks keep you motivated and celebrate your progress.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">4. Stay Motivated</h4>
                  <p className="text-sm text-muted-foreground">
                    Get personalized guidance from our AI Coach (Premium) and daily reminders to keep you on track.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Pro tip:</strong> Start with just one goal and build from there. 
              Consistency beats perfection every time.
            </p>
          </div>

          <Button
            onClick={() => navigate("/dashboard")}
            size="lg"
            className="w-full shadow-xl hover:shadow-2xl transition-all hover:scale-105 text-lg h-14 btn-gradient font-semibold"
          >
            Get Started
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
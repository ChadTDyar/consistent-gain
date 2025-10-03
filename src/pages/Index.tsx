import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, TrendingUp, Award } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background-cream">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32 bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="container mx-auto px-4 md:px-8 max-w-6xl">
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground leading-tight">
              Build Lasting Fitness Habits
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              For adults who want sustainable progress, not extreme programs. Track goals, celebrate
              streaks, stay consistent.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button 
                size="lg" 
                onClick={() => navigate("/auth")} 
                className="btn-large shadow-md hover:shadow-lg transition-all"
              >
                Start Free
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => navigate("/pricing")}
                className="border-2 border-primary hover:bg-primary/10"
              >
                View Plans
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 md:px-8 max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-12 text-foreground">
            Why Choose Momentum?
          </h2>
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            <Card className="text-center card-lift border-none shadow-md">
              <CardHeader className="pb-4">
                <div className="mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl font-display font-semibold">Track Your Goals</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed text-muted-foreground">
                  Set up to 3 fitness goals and track your progress with simple daily check-ins.
                  No complicated metrics, just consistent action.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center card-lift border-none shadow-md">
              <CardHeader className="pb-4">
                <div className="mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br from-streak/20 to-streak/10">
                  <TrendingUp className="h-8 w-8 text-streak" />
                </div>
                <CardTitle className="text-xl font-display font-semibold">Build Streaks</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed text-muted-foreground">
                  Watch your streak grow day by day. Visual feedback keeps you motivated and
                  accountable to your fitness journey.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center card-lift border-none shadow-md">
              <CardHeader className="pb-4">
                <div className="mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br from-success/20 to-success/10">
                  <Award className="h-8 w-8 text-success" />
                </div>
                <CardTitle className="text-xl font-display font-semibold">Stay Motivated</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed text-muted-foreground">
                  Celebrate every win with streak counters and progress calendars. Build habits
                  that last through positive reinforcement.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 bg-gradient-to-r from-primary to-primary-deep text-primary-foreground">
        <div className="container mx-auto px-4 md:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">Ready to Build Lasting Habits?</h2>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-95 leading-relaxed">
            Join others who are building sustainable fitness routines. Start tracking your first
            goal today, completely free.
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => navigate("/auth")}
            className="btn-large shadow-lg hover:shadow-xl bg-white text-primary hover:bg-white/90"
          >
            Get Started Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border bg-background">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p className="text-sm">© 2025 Momentum. Building better habits, one day at a time.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, TrendingUp, Award } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Build Lasting Fitness Habits
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            For adults who want sustainable progress, not extreme programs. Track goals, celebrate
            streaks, stay consistent.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => navigate("/auth")} className="text-lg px-8">
              Start Free
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/pricing")}>
              View Plans
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Why Choose Momentum?
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Track Your Goals</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Set up to 3 fitness goals and track your progress with simple daily check-ins.
                  No complicated metrics, just consistent action.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto mb-4 w-16 h-16 bg-streak/10 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-8 w-8 text-streak" />
                </div>
                <CardTitle>Build Streaks</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Watch your streak grow day by day. Visual feedback keeps you motivated and
                  accountable to your fitness journey.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto mb-4 w-16 h-16 bg-success/10 rounded-full flex items-center justify-center">
                  <Award className="h-8 w-8 text-success" />
                </div>
                <CardTitle>Stay Motivated</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Celebrate every win with streak counters and progress calendars. Build habits
                  that last through positive reinforcement.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Build Lasting Habits?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Join others who are building sustainable fitness routines. Start tracking your first
            goal today, completely free.
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => navigate("/auth")}
            className="text-lg px-8"
          >
            Get Started Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 Momentum. Building better habits, one day at a time.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

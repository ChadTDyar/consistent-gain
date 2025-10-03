import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, TrendingUp, Award } from "lucide-react";
import heroRunner from "@/assets/hero-runner.png";
import groupRunning from "@/assets/group-running.png";
import momentumLogo from "@/assets/momentum-logo.png";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background-cream">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="container mx-auto px-4 md:px-8 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center py-12 md:py-20 lg:py-28">
            {/* Left Content */}
            <div className="space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-3 mb-4">
                <img src={momentumLogo} alt="Momentum" className="h-12 w-auto" />
                <h2 className="text-2xl font-display font-bold text-foreground">Momentum</h2>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground leading-tight">
                Your next goal.<br />
                Your best growth.
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
                For adults who want sustainable progress, not extreme programs. Track goals, celebrate
                streaks, stay consistent.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
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

            {/* Right Image */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src={heroRunner} 
                  alt="Runner preparing for workout at sunset" 
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
              <div className="absolute -top-6 -left-6 w-40 h-40 bg-streak/10 rounded-full blur-3xl" />
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
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={groupRunning} 
            alt="Diverse group of people running together at sunset" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/95 to-primary-deep/95" />
        </div>
        <div className="container mx-auto px-4 md:px-8 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-6 text-white">
            Ready to Build Lasting Habits?
          </h2>
          <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto text-white/95 leading-relaxed">
            Join others who are building sustainable fitness routines. Start tracking your first
            goal today, completely free.
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => navigate("/auth")}
            className="btn-large shadow-xl hover:shadow-2xl bg-white text-primary hover:bg-white/90 hover:scale-105 transition-all"
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

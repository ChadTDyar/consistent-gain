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
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary-warm/5" />
        <div className="container mx-auto px-6 md:px-8 max-w-7xl relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center py-16 md:py-24 lg:py-32">
            {/* Left Content */}
            <div className="space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-3 mb-2">
                <img src={momentumLogo} alt="Momentum" className="h-14 w-auto drop-shadow-sm" />
                <h2 className="text-2xl font-display font-bold text-foreground">Momentum</h2>
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-foreground leading-[1.1] tracking-tight">
                Your next goal.<br />
                <span className="text-primary">Your best growth.</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                For adults who want sustainable progress, not extreme programs. Track goals, celebrate
                streaks, stay consistent.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-6">
                <Button 
                  size="lg" 
                  onClick={() => navigate("/auth")} 
                  className="btn-large shadow-lg hover:shadow-xl transition-all hover:scale-105 text-lg h-14 px-10"
                >
                  Start Free
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={() => navigate("/pricing")}
                  className="border-2 border-primary hover:bg-primary/10 text-lg h-14 px-10"
                >
                  View Plans
                </Button>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-primary/10">
                <img 
                  src={heroRunner} 
                  alt="Runner preparing for workout at sunset" 
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent" />
              </div>
              <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
              <div className="absolute -top-8 -left-8 w-56 h-56 bg-primary-warm/5 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-6 md:px-8 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4 text-foreground">
              Why Choose Momentum?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to build lasting fitness habits
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
            <Card className="text-center card-lift border border-primary/10 shadow-lg hover:shadow-xl transition-all bg-card/80 backdrop-blur-sm">
              <CardHeader className="pb-4 pt-8">
                <div className="mx-auto mb-6 w-20 h-20 rounded-2xl flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10 shadow-md">
                  <Target className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-2xl font-display font-semibold">Track Your Goals</CardTitle>
              </CardHeader>
              <CardContent className="pb-8">
                <CardDescription className="text-base leading-relaxed text-muted-foreground">
                  Set up to 3 fitness goals and track your progress with simple daily check-ins.
                  No complicated metrics, just consistent action.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center card-lift border border-streak/20 shadow-lg hover:shadow-xl transition-all bg-card/80 backdrop-blur-sm">
              <CardHeader className="pb-4 pt-8">
                <div className="mx-auto mb-6 w-20 h-20 rounded-2xl flex items-center justify-center bg-gradient-to-br from-streak/20 to-streak/10 shadow-md">
                  <TrendingUp className="h-10 w-10 text-streak" />
                </div>
                <CardTitle className="text-2xl font-display font-semibold">Build Streaks</CardTitle>
              </CardHeader>
              <CardContent className="pb-8">
                <CardDescription className="text-base leading-relaxed text-muted-foreground">
                  Watch your streak grow day by day. Visual feedback keeps you motivated and
                  accountable to your fitness journey.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center card-lift border border-success/20 shadow-lg hover:shadow-xl transition-all bg-card/80 backdrop-blur-sm">
              <CardHeader className="pb-4 pt-8">
                <div className="mx-auto mb-6 w-20 h-20 rounded-2xl flex items-center justify-center bg-gradient-to-br from-success/20 to-success/10 shadow-md">
                  <Award className="h-10 w-10 text-success" />
                </div>
                <CardTitle className="text-2xl font-display font-semibold">Stay Motivated</CardTitle>
              </CardHeader>
              <CardContent className="pb-8">
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
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={groupRunning} 
            alt="Diverse group of people running together at sunset" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary-deep/90 backdrop-blur-[2px]" />
        </div>
        <div className="container mx-auto px-6 md:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-8 text-white drop-shadow-lg">
            Ready to Build Lasting Habits?
          </h2>
          <p className="text-xl md:text-2xl mb-12 max-w-2xl mx-auto text-white font-medium leading-relaxed drop-shadow-md">
            Join others who are building sustainable fitness routines. Start tracking your first
            goal today, completely free.
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => navigate("/auth")}
            className="btn-large shadow-2xl hover:shadow-[0_20px_50px_rgba(255,255,255,0.4)] bg-white text-primary hover:bg-white hover:scale-110 transition-all text-lg h-16 px-12 font-semibold"
          >
            Get Started Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-primary/10 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 text-center">
          <p className="text-muted-foreground font-medium">© 2025 Momentum. Building better habits, one day at a time.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

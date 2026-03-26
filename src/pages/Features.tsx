import { useNavigate } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { CheckCircle, BarChart3, Bell, Target, Flame, Calendar } from "lucide-react";

const features = [
  {
    icon: Flame,
    title: "Streak Tracking That Keeps You Going",
    description: "Every day you check in, your streak grows. MomentumFit tracks your daily fitness habits and shows your longest streaks. Visual streak counters make consistency feel rewarding. Miss a day? The 48-hour streak repair feature helps you bounce back without starting over."
  },
  {
    icon: BarChart3,
    title: "Progress Charts and Visual Reports",
    description: "See your fitness journey on a clear timeline. Weekly and monthly progress charts show exactly how consistent you have been. Track completion rates, spot patterns, and celebrate milestones with data you can actually understand."
  },
  {
    icon: Bell,
    title: "Daily Reminders to Stay on Track",
    description: "Set custom reminders for your daily habit check-ins. MomentumFit sends gentle nudges at the times you choose so you never forget to log your activity. Morning, evening, or any time that fits your routine."
  },
  {
    icon: Target,
    title: "Goal Setting for Any Fitness Habit",
    description: "Track any fitness activity: walking, running, yoga, gym sessions, stretching, or custom goals. Set your target days per week and let MomentumFit measure your consistency. One goal is free forever."
  },
  {
    icon: CheckCircle,
    title: "Quick Daily Check-Ins",
    description: "Logging your activity takes seconds. Tap to check in, add optional notes or photos, and you are done. No complicated forms or data entry. The fastest daily habit app for people with busy schedules."
  },
  {
    icon: Calendar,
    title: "Calendar View and History",
    description: "See your entire habit history on a calendar. Green days mean you showed up. Spot your best weeks, identify gaps, and use that insight to build healthy habits that stick month after month."
  }
];

const Features = () => {
  const navigate = useNavigate();

  return (
    <>
      <SEO
        title="MomentumFit Features — Streak Tracking, Progress Charts & Daily Reminders"
        description="Track daily fitness habits, build streaks, and visualize progress with MomentumFit. Free habit tracker app with reminders, charts, and streak repair."
        keywords="streak tracking, progress charts, daily reminders, habit tracker app features, fitness habit tracker, daily habit app, momentumfit"
        canonical="https://momentumfit.app/features"
        ogImage="https://momentumfit.app/og-share.jpg"
      />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 md:px-8 max-w-4xl py-16 md:py-24">
          <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground text-center mb-4">
            What Can MomentumFit Do?
          </h1>
          <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto mb-16">
            A fitness habit tracker app built for consistency. Here is everything MomentumFit offers to help you build streaks and stay on track.
          </p>

          <div className="space-y-12">
            {features.map((feature) => (
              <div key={feature.title} className="flex gap-5 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-display font-semibold text-foreground mb-2">
                    {feature.title}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Comparison callout */}
          <div className="mt-16 bg-primary/5 rounded-xl p-8 border border-primary/20 text-center">
            <h2 className="text-xl md:text-2xl font-display font-bold text-foreground mb-3">
              Why MomentumFit Instead of a General Habit Tracker?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm leading-relaxed">
              Apps like Streaks, Habitify, Loop, and HabitNow are built for any habit. MomentumFit is purpose-built for fitness: body-map pain tracking, joint-safe exercise alternatives, AI coaching that adapts to your energy levels, and a 48-hour streak repair window so one missed day does not erase weeks of progress.
            </p>
          </div>

          <div className="text-center mt-16">
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="btn-gradient btn-large"
            >
              Start Free
            </Button>
            <p className="text-sm text-muted-foreground mt-3">Free forever for one activity. No credit card required.</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Features;

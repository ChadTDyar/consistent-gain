import { SiteFooter } from "@/components/SiteFooter";
import { useNavigate } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { CheckCircle, BarChart3, ClipboardCheck, Target, Flame, MessageCircle } from "lucide-react";
import { getGoalLimit, getHistoryDays } from "@/lib/plans";
import { useAuthStatus } from "@/hooks/useAuthStatus";

const FREE_GOAL_LIMIT = getGoalLimit("free");
const FREE_HISTORY_DAYS = getHistoryDays("free");

const features = [
  {
    icon: ClipboardCheck,
    title: "Daily Readiness Check-In",
    description: "Six taps, each on a 1 to 5 scale: sleep, energy, recovery, soreness, pain, and whether you want to train. It takes under a minute and it is free on every account."
  },
  {
    icon: Target,
    title: "A Plan That Fits Today",
    description: "Your answers return one of four plans: full workout, reduced workout, mobility and recovery, or rest day. Report notable pain and the app will not recommend a full workout. It is a simple score of your own answers, not a diagnosis."
  },
  {
    icon: Flame,
    title: "Streaks That Survive a Missed Day",
    description: "Every day you check in or log a habit, your streak grows. Miss a single day and you get a 48-hour window to repair it with a 5, 10 or 20 minute makeup session or a grace token. You earn one token for every 7 days you log."
  },
  {
    icon: CheckCircle,
    title: "Fitness Habits, Logged in Seconds",
    description: `Track walking, strength work, stretching, swimming, a class, or any activity you name. Set your target days per week and tick it off. Short on time? A 5, 10 or 20 minute session still counts. Free for up to ${FREE_GOAL_LIMIT} habits.`
  },
  {
    icon: BarChart3,
    title: "Progress You Can Read",
    description: `See streaks and weekly consistency for each habit. The Free plan shows the last ${FREE_HISTORY_DAYS} days. Premium shows your full history and adds the Weekly Insights report.`
  },
  {
    icon: MessageCircle,
    title: "AI Coach (Premium)",
    description: "A chat inside the app. The coach is given your current streak, how many habits you track, when you last logged and, right after you check in, today's plan. It keeps answers short and sends pain or medical questions to your doctor. It is an AI, not a trainer or a clinician."
  }
];

const Features = () => {
  const navigate = useNavigate();
  const authStatus = useAuthStatus();

  return (
    <>
      <SEO
        title="Momentum Features: Daily Readiness Check-In, Streak Repair and Progress"
        description="What Momentum does for adults 40+: a daily readiness check-in, a plan that fits today, streaks with a 48-hour repair window, and progress tracking."
        keywords="daily readiness check-in, streak repair, fitness habit tracker for adults over 40, workout consistency, momentumfit"
        canonical="https://momentumfit.app/features"
        ogImage="https://momentumfit.app/og-share.jpg"
      />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 md:px-8 max-w-4xl py-16 md:py-24">
          <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground text-center mb-4">
            What Can Momentum Do?
          </h1>
          <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto mb-16">
            Fitness consistency for adults 40+. Here is what the app does today, and which parts are Free or Premium.
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
              Why Momentum Instead of a General Habit Tracker?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm leading-relaxed">
              General habit trackers are built for any habit. Momentum is built for fitness after 40: a daily readiness check-in that sets how hard today should be, body-map pain logging when your check-in flags pain, an exercise library, and a 48-hour repair window so one missed day does not end a streak. Momentum is not medical advice. Talk to your doctor before changing your exercise routine.
            </p>
          </div>

          <div className="text-center mt-16">
            <Button
              size="lg"
              onClick={() => navigate("/auth?mode=signup")}
              className="btn-gradient btn-large"
            >
              Start Free
            </Button>
            {authStatus !== "signed_in" && (
              <p className="text-sm text-muted-foreground mt-3">Free for up to {FREE_GOAL_LIMIT} habits. No credit card required.</p>
            )}
          </div>
        </div>
      </div>
      <SiteFooter />
    </>
  );
};

export default Features;

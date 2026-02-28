import { useNavigate, Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const HabitStreaksScience = () => {
  const navigate = useNavigate();

  return (
    <>
      <SEO
        title="The Science of Habit Streaks: Why 30 Days Isn't Enough | Momentum"
        description="Discover the real science behind habit formation. Learn why the 21-day myth is wrong and how Momentum's streak system aligns with behavioral research."
        keywords="habit streaks science, habit formation research, 66 day habit, UCL habit study, streak psychology, fitness habit science"
      />
      <div className="min-h-screen bg-background-cream">
        <div className="container mx-auto px-6 md:px-8 max-w-3xl py-12 md:py-20">
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <article className="prose-custom space-y-6">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground leading-tight">
              The Science of Habit Streaks: Why 30 Days Isn't Enough
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed">
              You've probably heard the claim: "It takes 21 days to form a habit." It's repeated everywhere - blogs, podcasts, Instagram graphics. There's just one problem: it's not true.
            </p>

            <h2 className="text-2xl font-display font-bold text-foreground">The 21-Day Myth</h2>
            <p className="text-muted-foreground leading-relaxed">
              The 21-day figure traces back to a 1960 observation by plastic surgeon Maxwell Maltz, who noticed patients took about 21 days to adjust to a new physical feature. It was never a controlled study on habits. Yet it became gospel.
            </p>

            <h2 className="text-2xl font-display font-bold text-foreground">What the Research Actually Says</h2>
            <p className="text-muted-foreground leading-relaxed">
              In 2009, Phillippa Lally and her team at University College London published one of the most rigorous studies on habit formation. They tracked 96 participants over 12 weeks as they tried to build a single new habit. The result? On average, it took <strong className="text-foreground">66 days</strong> for a behavior to become automatic - and the range was enormous, from 18 to 254 days depending on the person and the complexity of the habit.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              This is why the "30-day challenge" approach fails so many people. You finish the challenge, feel done, and stop. But the habit hasn't actually solidified. You were just getting started.
            </p>

            <h2 className="text-2xl font-display font-bold text-foreground">Why Streaks Work (When Designed Right)</h2>
            <p className="text-muted-foreground leading-relaxed">
              Streak tracking taps into what psychologists call the "endowed progress effect." When you can see your effort accumulating, you're more motivated to continue. The critical design choice: what happens when you miss a day?
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Most apps reset your streak to zero. This is devastating psychologically - it punishes a single bad day by erasing weeks of progress. Research on goal disruption shows this is one of the fastest ways to trigger complete abandonment.
            </p>

            <h2 className="text-2xl font-display font-bold text-foreground">How Momentum Applies This Science</h2>
            <p className="text-muted-foreground leading-relaxed">
              Momentum's streak system is designed around the real research. Instead of a fragile all-or-nothing streak, Momentum uses a <strong className="text-foreground">momentum score</strong> that accounts for consistency over time. Miss a day? Your overall trajectory still matters. With the <Link to="/pricing" className="text-primary hover:underline font-semibold">Streak Repair</Link> feature, you can acknowledge missed days without losing everything - just like real life.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The goal isn't a perfect streak. The goal is building an identity as someone who shows up. That takes longer than 21 days - and Momentum is built for the long game.
            </p>

            <div className="border-t border-border pt-8 mt-8 space-y-4">
              <p className="text-foreground font-semibold text-lg">Ready to build a streak that sticks?</p>
              <Button onClick={() => navigate("/auth")} className="btn-gradient">
                Start your streak - free for 30 days
              </Button>
            </div>

            <div className="text-sm text-muted-foreground space-y-1 pt-4">
              <p>Related reading:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><Link to="/resources/fitness-habit-guide" className="text-primary hover:underline">How to Build a Fitness Habit That Actually Sticks</Link></li>
                <li><Link to="/resources/fitness-tracker-vs-habit-tracker" className="text-primary hover:underline">Fitness Tracker Apps vs Habit Trackers: Which One Works?</Link></li>
              </ul>
            </div>
          </article>
        </div>
      </div>
    </>
  );
};

export default HabitStreaksScience;

import { useNavigate, Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const FitnessHabitGuide = () => {
  const navigate = useNavigate();

  return (
    <>
      <SEO
        title="How to Build a Fitness Habit That Actually Sticks | Momentum"
        description="Actionable advice on building a lasting fitness habit: start small, anchor to existing routines, track visually, and build identity. No gym required."
        keywords="build fitness habit, fitness consistency, habit stacking, workout habit tips, exercise routine, fitness motivation tips"
      />
      <div className="min-h-screen bg-background-cream">
        <div className="container mx-auto px-6 md:px-8 max-w-3xl py-12 md:py-20">
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <article className="prose-custom space-y-6">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground leading-tight">
              How to Build a Fitness Habit That Actually Sticks
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed">
              The fitness industry sells intensity. Go harder. Longer. Faster. But the people who stay fit for decades? They mastered something far less glamorous: consistency.
            </p>

            <h2 className="text-2xl font-display font-bold text-foreground">1. Start Embarrassingly Small</h2>
            <p className="text-muted-foreground leading-relaxed">
              The biggest mistake is starting with the workout you <em>wish</em> you could do. Instead, start with one you can't say no to. A 10-minute walk. Five push-ups. One set of stretches. Stanford researcher BJ Fogg calls these "tiny habits" - the minimum viable effort that gets you moving. The habit of showing up matters more than the workout itself.
            </p>

            <h2 className="text-2xl font-display font-bold text-foreground">2. Anchor to an Existing Routine</h2>
            <p className="text-muted-foreground leading-relaxed">
              "Habit stacking" is one of the most reliable techniques in behavioral science. Instead of scheduling a workout in the abstract, attach it to something you already do: after your morning coffee, before your shower, during your lunch break. The existing habit becomes the trigger.
            </p>

            <h2 className="text-2xl font-display font-bold text-foreground">3. Track Visually</h2>
            <p className="text-muted-foreground leading-relaxed">
              Don't rely on memory. When you can see your consistency - a row of check marks, a growing streak, a graph trending upward - it changes your relationship with effort. Visual tracking creates what psychologists call "implementation evidence." It's proof that you're becoming the person you want to be.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              This is why Momentum's streak calendar and progress graphs exist. They turn invisible effort into visible progress.
            </p>

            <h2 className="text-2xl font-display font-bold text-foreground">4. Build Identity, Not Just Routine</h2>
            <p className="text-muted-foreground leading-relaxed">
              James Clear's <em>Atomic Habits</em> framework makes this distinction: instead of "I want to exercise more" (outcome-based), shift to "I am someone who moves every day" (identity-based). Every workout, no matter how small, becomes a vote for the person you're becoming. Over time, the habit isn't something you <em>do</em> - it's who you <em>are</em>.
            </p>

            <h2 className="text-2xl font-display font-bold text-foreground">5. Plan for Failure</h2>
            <p className="text-muted-foreground leading-relaxed">
              You will miss days. That's not a bug - it's life. The difference between people who build lasting habits and those who don't isn't perfection; it's recovery speed. How quickly do you get back after a miss? Tools like Momentum's <Link to="/pricing" className="text-primary hover:underline font-semibold">Streak Repair</Link> are designed for exactly this: acknowledge the miss, then keep moving.
            </p>

            <div className="border-t border-border pt-8 mt-8 space-y-4">
              <p className="text-foreground font-semibold text-lg">Ready to start?</p>
              <Button onClick={() => navigate("/auth")} className="btn-gradient">
                Start your streak - free for 30 days
              </Button>
            </div>

            <div className="text-sm text-muted-foreground space-y-1 pt-4">
              <p>Related reading:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><Link to="/resources/habit-streaks-science" className="text-primary hover:underline">The Science of Habit Streaks: Why 30 Days Isn't Enough</Link></li>
                <li><Link to="/resources/fitness-tracker-vs-habit-tracker" className="text-primary hover:underline">Fitness Tracker Apps vs Habit Trackers: Which One Works?</Link></li>
              </ul>
            </div>
          </article>
        </div>
      </div>
    </>
  );
};

export default FitnessHabitGuide;

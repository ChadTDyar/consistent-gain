import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { scoreReadiness, RECOMMENDATION_LABEL, type ReadinessInputs } from "@/lib/readiness";
import { RESET_DAYS } from "@/lib/sevenDayReset";

/* Every plan shown below is computed by the app's own readiness scoring from
   the listed answers. Nothing on this page is hand-written product output. */

const LEVELS: { inputs: ReadinessInputs; when: string }[] = [
  { inputs: { sleep: 4, energy: 4, recovery: 5, soreness: 4, pain: 5, desire: 4 }, when: "When sleep, energy and recovery line up." },
  { inputs: { sleep: 2, energy: 3, recovery: 3, soreness: 3, pain: 4, desire: 3 }, when: "When you are a bit short on sleep or still feeling the last session." },
  { inputs: { sleep: 2, energy: 2, recovery: 2, soreness: 2, pain: 4, desire: 2 }, when: "When you are sore, tired and not recovered." },
  { inputs: { sleep: 1, energy: 1, recovery: 2, soreness: 2, pain: 3, desire: 1 }, when: "When almost everything says no." },
];

/** Homepage section 4: what the check-in changes, and what the AI Coach is. */
export const GuidanceSection = () => (
  <section id="features" className="py-16 md:py-24 bg-background-cream scroll-mt-16">
    <div className="container mx-auto px-6 md:px-8 max-w-5xl">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
          Guidance that fits the day you are having
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Your check-in returns one of four plans. Not every day is a full-effort day, and the app
          says so.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
        {LEVELS.map(({ inputs, when }) => {
          const r = scoreReadiness(inputs);
          return (
            <Card key={r.recommendation} className="border-border">
              <CardContent className="pt-6 space-y-2">
                <p className="inline-block rounded-full bg-primary/10 text-primary px-3 py-1 text-sm font-semibold">
                  {RECOMMENDATION_LABEL[r.recommendation]}
                </p>
                <h3 className="text-base font-semibold text-foreground">{r.headline}</h3>
                <p className="text-sm text-muted-foreground">{when}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-8 mt-12">
        <div>
          <h3 className="text-xl font-display font-semibold text-foreground mb-3">What the plan changes</h3>
          <ul className="space-y-2 text-muted-foreground list-disc pl-5">
            <li>Your dashboard shows today's plan in plain words.</li>
            <li>After a lighter check-in, the short-session logger points you to a 5 or 10 minute session.</li>
            <li>Report notable pain and the app will not recommend a full workout. You can log where it hurts on a body map.</li>
            <li>A rest day is a plan, not a missed day. Your check-in still counts toward your streak.</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-4">
            What it does not do: write your workout. Momentum tells you how hard today should be. You
            choose the session, and the exercise library in the app is there for ideas.
          </p>
        </div>

        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" aria-hidden="true" />
              <h3 className="text-xl font-display font-semibold text-foreground">AI Coach, on Premium</h3>
            </div>
            <p className="text-muted-foreground">
              A chat inside the app for when you want to talk a day through. The coach is given your
              current streak, how many habits you track, when you last logged and, right after you
              check in, today's plan.
            </p>
            <p className="text-muted-foreground">
              It keeps answers short, backs the lighter day when that is your plan, and sends pain or
              medical questions to your doctor. It is an AI, not a trainer or a clinician.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  </section>
);

const EXAMPLE_DAYS: { title: string; answers: string; inputs: ReadinessInputs }[] = [
  {
    title: "Five hours of sleep and an early meeting",
    answers: "Sleep 2, energy 2, recovery 4, soreness 4, pain 5, want to train 3",
    inputs: { sleep: 2, energy: 2, recovery: 4, soreness: 4, pain: 5, desire: 3 },
  },
  {
    title: "Feeling strong, but the knee is sore from yard work",
    answers: "Sleep 5, energy 5, recovery 4, soreness 4, pain 2, want to train 5",
    inputs: { sleep: 5, energy: 5, recovery: 4, soreness: 4, pain: 2, desire: 5 },
  },
  {
    title: "Home from a red-eye flight",
    answers: "Sleep 1, energy 1, recovery 2, soreness 2, pain 3, want to train 1",
    inputs: { sleep: 1, energy: 1, recovery: 2, soreness: 2, pain: 3, desire: 1 },
  },
];

/** Homepage section 6: realistic example days, scored live. */
export const ExampleDays = () => (
  <section className="py-16 md:py-24 bg-card border-y border-border">
    <div className="container mx-auto px-6 md:px-8 max-w-5xl">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
          Three ordinary days
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Examples, not customer stories. Each plan is what the app returns for the answers shown.
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {EXAMPLE_DAYS.map((day) => {
          const r = scoreReadiness(day.inputs);
          return (
            <Card key={day.title} className="border-border bg-background">
              <CardContent className="pt-6 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Example</p>
                <h3 className="text-lg font-semibold text-foreground">{day.title}</h3>
                <p className="text-sm text-muted-foreground">{day.answers}</p>
                <div className="border-t border-border pt-3 space-y-1.5">
                  <p className="inline-block rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-semibold">
                    {RECOMMENDATION_LABEL[r.recommendation]}
                  </p>
                  <p className="text-sm font-semibold text-foreground">{r.headline}</p>
                  <p className="text-sm text-muted-foreground">{r.detail}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  </section>
);

/** Homepage section 8: the free 7-Day Readiness Reset page. */
export const ResetTeaser = () => {
  const navigate = useNavigate();
  return (
    <section id="reset" className="py-16 md:py-24 bg-background scroll-mt-16">
      <div className="container mx-auto px-6 md:px-8 max-w-3xl">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
          Want a smaller first step? Try the 7-Day Readiness Reset.
        </h2>
        <p className="text-lg text-muted-foreground leading-relaxed mb-6">
          Seven small actions, one a day, all listed on one page. It is a routine reset built around
          sleep, light, water and short bursts of movement. It is not a workout program, and there is
          no email series to sign up for.
        </p>
        <ol className="grid sm:grid-cols-2 gap-x-8 gap-y-2 mb-8 list-decimal pl-5 text-foreground">
          {RESET_DAYS.map((d) => (
            <li key={d.title}>{d.title}</li>
          ))}
        </ol>
        <Button asChild variant="outline" size="lg" className="border-2 min-h-[48px]">
          <a
            href="/7-day-reset"
            onClick={(e) => { e.preventDefault(); navigate("/7-day-reset"); }}
          >
            See the 7-Day Readiness Reset
          </a>
        </Button>
      </div>
    </section>
  );
};

/** Exercise and medical disclaimer shown under the FAQ. */
export const LandingDisclaimer = () => (
  <section aria-labelledby="disclaimer-heading" className="pb-16 md:pb-24 bg-background-cream">
    <div className="container mx-auto px-6 md:px-8 max-w-4xl">
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 id="disclaimer-heading" className="text-base font-semibold text-foreground mb-2">
          Exercise and health disclaimer
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Momentum is a general fitness and habit tool. It does not give medical advice and it does
          not diagnose or treat any condition. The daily plan is a simple score of your own answers,
          and the AI Coach is an AI. Talk to your doctor before you start or change an exercise
          routine, especially if you have a health condition, an injury, or pain that does not ease.
          If something hurts, stop.
        </p>
      </div>
    </div>
  </section>
);

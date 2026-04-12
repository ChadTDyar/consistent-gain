import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export function StreakRepairIntro() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem("mom_streak_intro_seen");
    if (!seen) {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem("mom_streak_intro_seen", "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-2">
      <div className="flex items-center gap-2">
        <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
        <h4 className="font-semibold text-sm text-foreground">About Streak Repair</h4>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">
        Miss a day? Your streak is safe for 48 hours. Pick it back up and keep going. Streaks end when you stop, not when life happens.
      </p>
      <Button variant="outline" size="sm" onClick={dismiss} className="text-xs">
        Got it
      </Button>
    </div>
  );
}
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import momentumLogo from "@/assets/momentum-logo.png";

export default function Welcome() {
  const navigate = useNavigate();
  const [habitText, setHabitText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    if (!habitText.trim()) return;
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      await supabase.from("goals").insert({
        user_id: user.id,
        title: habitText.trim(),
        target_days_per_week: 3,
      });

      toast.success("Let's build momentum.");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-cream flex items-center justify-center p-4">
      <Card className="w-full max-w-lg border-none shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <img src={momentumLogo} alt="Momentum" className="h-12 w-auto" />
          </div>
          <CardTitle className="text-2xl md:text-3xl font-display leading-tight">
            What's one thing you want to do more often?
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground mt-2">
            Start with one. We'll build from there.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pb-8">
          <Input
            placeholder="Walk 30 minutes, stretch in the morning, lift 3x a week..."
            value={habitText}
            onChange={(e) => setHabitText(e.target.value)}
            autoFocus
            className="text-base h-12"
            onKeyDown={(e) => {
              if (e.key === "Enter" && habitText.trim()) handleStart();
            }}
          />

          <Button
            onClick={handleStart}
            disabled={!habitText.trim() || loading}
            className="w-full btn-gradient h-12 text-base font-semibold"
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Start With This
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

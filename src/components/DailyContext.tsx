import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Moon, Battery } from "lucide-react";
import { toast } from "sonner";

export function DailyContext() {
  const [sleepQuality, setSleepQuality] = useState<number | null>(null);
  const [energyLevel, setEnergyLevel] = useState<number | null>(null);
  const [sleepNotes, setSleepNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasLogged, setHasLogged] = useState(false);

  useEffect(() => {
    loadTodayContext();
  }, []);

  const loadTodayContext = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from("daily_context")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", today)
        .single();

      if (data) {
        setSleepQuality(data.sleep_quality);
        setEnergyLevel(data.energy_level);
        setSleepNotes(data.sleep_notes || "");
        setHasLogged(true);
      }
    } catch (error) {
      console.error("Error loading context:", error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      
      const { error } = await supabase
        .from("daily_context")
        .upsert({
          user_id: user.id,
          date: today,
          sleep_quality: sleepQuality,
          energy_level: energyLevel,
          sleep_notes: sleepNotes,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,date'
        });

      if (error) throw error;

      setHasLogged(true);
      toast.success("Daily context saved!");
    } catch (error) {
      console.error("Error saving context:", error);
      toast.error("Failed to save context");
    } finally {
      setLoading(false);
    }
  };

  const StarRating = ({ 
    value, 
    onChange, 
    icon: Icon, 
    label 
  }: { 
    value: number | null; 
    onChange: (val: number) => void; 
    icon: any; 
    label: string;
  }) => (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <Icon className="h-4 w-4" />
        {label}
      </Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => onChange(rating)}
            className={`h-10 w-10 rounded-full border-2 transition-all ${
              value && rating <= value
                ? "bg-primary border-primary text-primary-foreground"
                : "border-muted-foreground/30 hover:border-primary/50"
            }`}
            aria-label={`Rate ${rating} out of 5`}
          >
            {rating}
          </button>
        ))}
      </div>
    </div>
  );

  if (hasLogged) {
    return (
      <Card className="border-border">
        <CardContent className="py-6">
          <p className="text-sm text-muted-foreground text-center">
            ✓ Daily check-in complete. Come back tomorrow!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-lg">Daily Check-in</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <StarRating
          value={sleepQuality}
          onChange={setSleepQuality}
          icon={Moon}
          label="Sleep Quality"
        />
        
        <StarRating
          value={energyLevel}
          onChange={setEnergyLevel}
          icon={Battery}
          label="Energy Level"
        />

        <div className="space-y-2">
          <Label htmlFor="sleep-notes">Notes (optional)</Label>
          <Textarea
            id="sleep-notes"
            placeholder="Any relevant context about your sleep or recovery..."
            value={sleepNotes}
            onChange={(e) => setSleepNotes(e.target.value)}
            rows={2}
          />
        </div>

        <Button 
          onClick={handleSave} 
          disabled={loading || !sleepQuality || !energyLevel}
          className="w-full"
        >
          {loading ? "Saving..." : "Save Check-in"}
        </Button>
      </CardContent>
    </Card>
  );
}
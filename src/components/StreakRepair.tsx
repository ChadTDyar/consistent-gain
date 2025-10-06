import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface StreakRepairProps {
  daysMissed: number;
  open: boolean;
  onClose: () => void;
}

export function StreakRepair({ daysMissed, open, onClose }: StreakRepairProps) {
  const [response, setResponse] = useState("");
  const [saving, setSaving] = useState(false);

  const getCompassionateMessage = (days: number) => {
    if (days <= 3) {
      return {
        title: "Hey there, you're okay 👋",
        message: `I noticed you haven't checked in for ${days} day${days > 1 ? 's' : ''}. Life happens—meetings pile up, energy dips, or you just needed a break. No judgment here. Want to ease back in with a gentle 10-minute session?`,
      };
    } else if (days <= 7) {
      return {
        title: "Welcome back 🌱",
        message: `It's been ${days} days. Maybe you were dealing with something, or maybe movement just didn't fit. Either way, you're here now. What feels manageable today? Even 5 minutes counts.`,
      };
    } else {
      return {
        title: "No pressure, just support 💙",
        message: `${days} days is a while, and that's completely okay. You don't need to jump back to where you were. Let's start with the gentlest option—something that feels more like waking up than working out. You've got this.`,
      };
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const message = getCompassionateMessage(daysMissed);
      
      const { error } = await supabase.from("streak_repairs").insert({
        user_id: user.id,
        days_missed: daysMissed,
        repair_message: message.message,
        user_response: response || null,
      });

      if (error) throw error;

      toast.success("Thanks for checking in!");
      onClose();
    } catch (error) {
      console.error("Error saving streak repair:", error);
      toast.error("Failed to save response");
    } finally {
      setSaving(false);
    }
  };

  const { title, message } = getCompassionateMessage(daysMissed);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Heart className="h-5 w-5 text-primary" />
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">{message}</p>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Want to share what happened? (Optional)
            </label>
            <Textarea
              placeholder="No explanation needed, but I'm here to listen..."
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Just browsing
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1"
            >
              {saving ? "Saving..." : "Let's go"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
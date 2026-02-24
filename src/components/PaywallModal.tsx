import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Crown, Zap } from "lucide-react";
import { type PlanTier } from "@/lib/plans";

interface PaywallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature?: string;
  requiredPlan?: PlanTier;
}

export default function PaywallModal({ open, onOpenChange, feature, requiredPlan = 'plus' }: PaywallModalProps) {
  const navigate = useNavigate();

  const planName = requiredPlan === 'pro' ? 'Pro' : 'Plus';
  const Icon = requiredPlan === 'pro' ? Crown : Zap;

  const messages: Record<string, { title: string; description: string }> = {
    goals: {
      title: "Goal Limit Reached",
      description: "You've reached the free tier limit of 3 goals. Upgrade to Plus for unlimited goals.",
    },
    streak_repair: {
      title: "Streak Repair is a Plus Feature",
      description: "Upgrade to Plus to repair missed days without losing your progress.",
    },
    ai_coach: {
      title: "AI Coach is a Pro Feature",
      description: "Upgrade to Pro to get personalized fitness suggestions based on your patterns.",
    },
    history: {
      title: "Extended History",
      description: `Upgrade to ${planName} to see more progress history.`,
    },
    default: {
      title: `Upgrade to ${planName}`,
      description: `This feature requires the ${planName} plan.`,
    },
  };

  const msg = messages[feature || 'default'] || messages.default;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mx-auto mb-4">
            <Icon className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-2xl text-center">{msg.title}</DialogTitle>
          <DialogDescription className="text-center text-base pt-2">
            {msg.description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Maybe Later
          </Button>
          <Button onClick={() => { onOpenChange(false); navigate("/pricing"); }} className="flex-1">
            Upgrade
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

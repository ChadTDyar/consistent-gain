import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2, Copy, Check, X } from "lucide-react";
import { toast } from "sonner";

interface ReferralPromptProps {
  streak: number;
  onDismiss: () => void;
}

const REFERRAL_URL = "https://momentumfit.app";
const SHARE_TEXT = (streak: number) =>
  `I just hit a ${streak}-day streak on Momentum! Building real habits, one day at a time. Try it free:`;

export function ReferralPrompt({ streak, onDismiss }: ReferralPromptProps) {
  const [copied, setCopied] = useState(false);

  const shareText = SHARE_TEXT(streak);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Momentum - Build Better Habits",
          text: shareText,
          url: REFERRAL_URL,
        });
      } catch (e) {
        // User cancelled share - not an error
      }
    } else {
      handleCopy();
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText} ${REFERRAL_URL}`);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy - try sharing instead");
    }
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 animate-fade-in">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="font-semibold text-base">
              {streak} days strong! Know someone who'd benefit?
            </p>
            <p className="text-sm text-muted-foreground">
              Share Momentum with a friend. Habits stick better with accountability.
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onDismiss} className="shrink-0 -mt-1 -mr-1">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleShare} className="flex-1" size="sm">
            <Share2 className="mr-2 h-4 w-4" />
            Share Momentum
          </Button>
          <Button onClick={handleCopy} variant="outline" size="sm">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

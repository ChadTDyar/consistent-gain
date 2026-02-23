import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, Send, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const feedbackSchema = z.object({
  displayName: z.string().trim().min(1, "Name is required").max(100),
  location: z.string().trim().max(100).optional(),
  quote: z.string().trim().min(10, "Please write at least 10 characters").max(500, "Please keep it under 500 characters"),
  achievement: z.string().trim().max(100).optional(),
});

export function FeedbackForm() {
  const [displayName, setDisplayName] = useState("");
  const [location, setLocation] = useState("");
  const [quote, setQuote] = useState("");
  const [achievement, setAchievement] = useState("");
  const [rating, setRating] = useState(5);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = feedbackSchema.safeParse({ displayName, location, quote, achievement });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to submit feedback");
        return;
      }

      const { error } = await supabase.from("testimonials").insert({
        user_id: user.id,
        display_name: parsed.data.displayName,
        location: parsed.data.location || null,
        quote: parsed.data.quote,
        achievement: parsed.data.achievement || null,
        rating,
      });

      if (error) throw error;
      setSubmitted(true);
      toast.success("Thank you! Your feedback has been submitted for review.");
    } catch (err) {
      console.error("Feedback submission error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Card className="border-none shadow-md">
        <CardContent className="py-12 text-center space-y-4">
          <CheckCircle className="h-12 w-12 text-success mx-auto" />
          <h3 className="text-xl font-display font-bold">Thank you!</h3>
          <p className="text-muted-foreground">
            Your feedback has been submitted and will appear on the site once reviewed.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-md">
      <CardHeader>
        <CardTitle className="text-xl font-display">Share Your Experience</CardTitle>
        <CardDescription>
          Your story could inspire someone else. Submissions are reviewed before publishing.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fb-name">Display Name *</Label>
            <Input
              id="fb-name"
              placeholder="First name or nickname"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fb-location">Location (optional)</Label>
            <Input
              id="fb-location"
              placeholder="City, State"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label>Rating *</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  className="p-0.5 transition-transform hover:scale-110"
                  aria-label={`Rate ${star} stars`}
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= (hoveredStar || rating)
                        ? "fill-primary text-primary"
                        : "text-muted-foreground/30"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fb-quote">Your experience *</Label>
            <Textarea
              id="fb-quote"
              placeholder="What has Momentum helped you with? How has it changed your routine?"
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              maxLength={500}
              rows={4}
            />
            <p className="text-xs text-muted-foreground text-right">{quote.length}/500</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fb-achievement">Your achievement (optional)</Label>
            <Input
              id="fb-achievement"
              placeholder="e.g., 30-day streak, lost 10 lbs"
              value={achievement}
              onChange={(e) => setAchievement(e.target.value)}
              maxLength={100}
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full btn-gradient min-h-[44px]">
            <Send className="h-4 w-4 mr-2" />
            {loading ? "Submitting..." : "Submit Feedback"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

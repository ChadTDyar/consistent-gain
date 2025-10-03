import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import PaywallModal from "./PaywallModal";
import { analytics } from "@/lib/analytics";

const CATEGORIES = [
  "Strength",
  "Cardio",
  "Mobility",
  "Mindset",
  "Recovery",
  "Nutrition",
  "Other"
];

interface AddGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGoalAdded: () => void;
}

export function AddGoalDialog({
  open,
  onOpenChange,
  onGoalAdded,
}: AddGoalDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [targetDays, setTargetDays] = useState("5");
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Check goal count and premium status
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_premium")
      .eq("id", user.id)
      .single();

    const { data: goals } = await supabase
      .from("goals")
      .select("id")
      .eq("user_id", user.id);

    const goalCount = goals?.length || 0;
    const isPremium = profile?.is_premium || false;

    // Enforce 3-goal limit for free users
    if (!isPremium && goalCount >= 3) {
      setLoading(false);
      onOpenChange(false);
      setShowPaywall(true);
      return;
    }

    const { error } = await supabase.from("goals").insert({
      user_id: user.id,
      title,
      description: description || null,
      category: category || null,
      target_days_per_week: parseInt(targetDays),
      start_date: startDate,
    });

    if (error) {
      toast.error("Failed to create goal");
      console.error(error);
    } else {
      analytics.goalCreated();
      toast.success("Goal created successfully!");
      setTitle("");
      setDescription("");
      setCategory("");
      setTargetDays("5");
      setStartDate(new Date().toISOString().split('T')[0]);
      onOpenChange(false);
      onGoalAdded();
    }

    setLoading(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display font-semibold">Add New Goal</DialogTitle>
            <DialogDescription className="text-base">
              Create a new fitness goal to track your progress
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-base font-medium">Goal Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Morning Walk"
                required
                className="h-11 text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-base font-medium">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add any details about your goal..."
                rows={3}
                className="text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-base font-medium">Category (Optional)</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-11 text-base">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat.toLowerCase()}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetDays" className="text-base font-medium">
                Target Days per Week
              </Label>
              <Select value={targetDays} onValueChange={setTargetDays}>
                <SelectTrigger className="h-11 text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                    <SelectItem key={num} value={String(num)}>
                      {num} {num === 1 ? 'day' : 'days'} per week
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-base font-medium">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="h-11 text-base"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="border-2"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="shadow-sm hover:shadow-md font-semibold"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Goal"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <PaywallModal open={showPaywall} onOpenChange={setShowPaywall} />
    </>
  );
}

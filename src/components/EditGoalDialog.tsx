import { useState, useEffect } from "react";
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
import { goalSchema } from "@/lib/validations";

const CATEGORIES = [
  "Strength",
  "Cardio",
  "Mobility",
  "Mindset",
  "Recovery",
  "Nutrition",
  "Other"
];

interface EditGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGoalUpdated: () => void;
  goalId: string | null;
}

export function EditGoalDialog({
  open,
  onOpenChange,
  onGoalUpdated,
  goalId,
}: EditGoalDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [targetDays, setTargetDays] = useState("5");
  const [startDate, setStartDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingGoal, setLoadingGoal] = useState(false);

  useEffect(() => {
    if (open && goalId) {
      loadGoal();
    }
  }, [open, goalId]);

  const loadGoal = async () => {
    if (!goalId) return;
    
    setLoadingGoal(true);
    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .eq("id", goalId)
      .single();

    if (error) {
      toast.error("Failed to load goal");
      console.error(error);
    } else if (data) {
      setTitle(data.title);
      setDescription(data.description || "");
      setCategory(data.category || "");
      setTargetDays(String(data.target_days_per_week || 5));
      setStartDate(data.start_date || new Date().toISOString().split('T')[0]);
    }
    
    setLoadingGoal(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalId) return;
    
    setLoading(true);

    try {
      // Validate input
      const validationResult = goalSchema.safeParse({
        title,
        description: description || null,
        category: category || null,
        target_days_per_week: parseInt(targetDays),
        start_date: startDate,
      });

      if (!validationResult.success) {
        const firstError = validationResult.error.errors[0];
        toast.error(firstError.message);
        setLoading(false);
        return;
      }

      const { error } = await supabase
        .from("goals")
        .update({
          title: validationResult.data.title,
          description: validationResult.data.description,
          category: validationResult.data.category,
          target_days_per_week: validationResult.data.target_days_per_week,
          start_date: validationResult.data.start_date,
        })
        .eq("id", goalId);

      if (error) {
        toast.error("Failed to update goal");
        console.error(error);
      } else {
        toast.success("Goal updated successfully!");
        onOpenChange(false);
        onGoalUpdated();
      }
    } catch (error) {
      console.error('Error updating goal:', error);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (loadingGoal) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display font-semibold">Edit Goal</DialogTitle>
          <DialogDescription className="text-base">
            Update your goal details and preferences
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
            <Label htmlFor="category" className="text-base font-medium">Category</Label>
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
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

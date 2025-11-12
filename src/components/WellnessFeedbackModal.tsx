import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface WellnessFeedbackModalProps {
  open: boolean;
  onRating: (rating: number) => void;
}

const ratings = [
  { value: 1, label: "Exhausted", color: "bg-destructive hover:bg-destructive/90" },
  { value: 2, label: "Tired", color: "bg-orange-500 hover:bg-orange-600" },
  { value: 3, label: "Okay", color: "bg-yellow-500 hover:bg-yellow-600" },
  { value: 4, label: "Good", color: "bg-green-500 hover:bg-green-600" },
  { value: 5, label: "Energized", color: "bg-success hover:bg-success/90" },
];

export function WellnessFeedbackModal({ open, onRating }: WellnessFeedbackModalProps) {
  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display text-center">
            How do you feel?
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-4">
          {ratings.map((rating) => (
            <Button
              key={rating.value}
              onClick={() => onRating(rating.value)}
              className={`${rating.color} text-white h-14 text-lg font-semibold shadow-md hover:shadow-lg transition-all`}
            >
              {rating.label} ({rating.value})
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

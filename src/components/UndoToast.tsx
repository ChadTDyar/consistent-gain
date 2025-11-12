import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UndoToastProps {
  activityId: string;
  onUndo: () => void;
}

export function useUndoToast() {
  const showUndoToast = (activityId: string, onSuccess: () => void) => {
    let undone = false;

    const handleUndo = async () => {
      if (undone) return;
      undone = true;

      try {
        // Soft delete the activity
        const { error } = await supabase
          .from("activity_logs")
          .update({
            is_deleted: true,
            deleted_at: new Date().toISOString(),
          })
          .eq("id", activityId);

        if (error) throw error;

        toast.success("Activity removed");
        onSuccess();
      } catch (error) {
        console.error("Error undoing activity:", error);
        toast.error("Failed to undo");
      }
    };

    toast("Activity logged", {
      description: "Tap to undo if this was a mistake",
      duration: 5000,
      action: {
        label: "Undo",
        onClick: handleUndo,
      },
    });
  };

  return { showUndoToast };
}

import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function DataExport() {
  const [exporting, setExporting] = useState(false);

  const exportData = async () => {
    setExporting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in");
        return;
      }

      // Fetch all user data
      const [goals, activities, painReports, costs, profile] = await Promise.all([
        supabase.from("goals").select("*").eq("user_id", user.id),
        supabase.from("activity_logs").select("*").eq("user_id", user.id),
        supabase.from("pain_reports").select("*").eq("user_id", user.id),
        supabase.from("cost_tracking").select("*").eq("user_id", user.id),
        supabase.from("profiles").select("*").eq("id", user.id).single(),
      ]);

      const exportData = {
        exported_at: new Date().toISOString(),
        user_id: user.id,
        profile: profile.data,
        goals: goals.data || [],
        activity_logs: activities.data || [],
        pain_reports: painReports.data || [],
        cost_tracking: costs.data || [],
      };

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `momentum-data-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Data exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export data");
    } finally {
      setExporting(false);
    }
  };

  return (
    <Card className="border-none shadow-md">
      <CardHeader>
        <CardTitle className="text-xl font-display font-semibold">
          Export Your Data
        </CardTitle>
        <CardDescription>
          Download all your Momentum data in JSON format
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={exportData}
          disabled={exporting}
          className="w-full"
        >
          {exporting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Export All Data
        </Button>
        <p className="text-xs text-muted-foreground mt-2">
          Includes goals, activity logs, pain reports, and cost tracking
        </p>
      </CardContent>
    </Card>
  );
}

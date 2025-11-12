import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format, subMonths } from "date-fns";

export function DoctorReport() {
  const [generating, setGenerating] = useState(false);

  const generateReport = async () => {
    setGenerating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const threeMonthsAgo = subMonths(new Date(), 3);

      // Fetch data
      const [activities, painReports, profile] = await Promise.all([
        supabase.from("activity_logs").select("*").eq("user_id", user.id).gte("completed_at", threeMonthsAgo.toISOString()),
        supabase.from("pain_reports").select("*").eq("user_id", user.id).gte("report_date", threeMonthsAgo.toISOString()),
        supabase.from("profiles").select("*").eq("id", user.id).single(),
      ]);

      const totalWorkouts = activities.data?.length || 0;
      const avgRating = activities.data?.reduce((sum, a) => sum + (a.rpe_rating || 0), 0) / totalWorkouts || 0;
      const painCount = painReports.data?.length || 0;

      // Generate text report
      const reportText = `
MOMENTUM FITNESS - 3-MONTH ACTIVITY SUMMARY
Generated: ${format(new Date(), "MMMM d, yyyy")}
Patient: ${profile.data?.name || "User"}

ACTIVITY CONSISTENCY:
- Total Workouts: ${totalWorkouts} sessions over 3 months
- Average Wellness Rating: ${avgRating.toFixed(1)}/5.0
- Consistency: ${(totalWorkouts / 90 * 100).toFixed(0)}% of days active

PAIN & MOBILITY:
- Pain Reports: ${painCount} instances logged
- Most Common Areas: ${painReports.data?.slice(0, 3).map(p => p.body_area).join(", ") || "None reported"}

MOBILITY IMPROVEMENTS:
- Tracking shows ${totalWorkouts > 30 ? "consistent" : "developing"} activity pattern
- Wellness ratings trending ${avgRating > 3.5 ? "positive" : "stable"}

NOTES FOR PHYSICIAN:
This patient is actively engaged in fitness tracking and demonstrates ${totalWorkouts > 30 ? "strong" : "developing"} consistency with exercise routines.
      `.trim();

      const blob = new Blob([reportText], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `doctor-report-${format(new Date(), "yyyy-MM-dd")}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Doctor report generated");
    } catch (error) {
      console.error("Report error:", error);
      toast.error("Failed to generate report");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card className="border-none shadow-md">
      <CardHeader>
        <CardTitle className="text-xl font-display font-semibold">Doctor Report</CardTitle>
        <CardDescription>Generate 3-month summary for your physician</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={generateReport} disabled={generating} className="w-full">
          {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
          Generate Report
        </Button>
      </CardContent>
    </Card>
  );
}

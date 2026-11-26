import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { type PlanTier, canAccessFeature } from "@/lib/plans";
import { isIOSNative } from "@/lib/platform";
import { exportUserData } from "@/lib/exportUserData";

interface DataExportProps {
  plan?: PlanTier;
}

export function DataExport({ plan = 'free' }: DataExportProps) {
  const [exporting, setExporting] = useState(false);
  const isAllowed = canAccessFeature(plan, 'pro');

  const exportData = async () => {
    if (!isAllowed) return;
    setExporting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in");
        return;
      }

      await exportUserData(user.id);

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
        {isAllowed ? (
          <>
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
              Includes goals, activity logs, wellness reports, cost tracking, and coach chat
            </p>
          </>
        ) : (
          <>
            {!isIOSNative() && (
              <Button
                onClick={() => window.location.href = '/pricing'}
                variant="secondary"
                className="w-full"
              >
                <Lock className="mr-2 h-4 w-4" />
                Upgrade to Premium to Export
              </Button>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              JSON data export is available on the Premium plan. On any plan, you can download your data from Delete Account before you delete.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

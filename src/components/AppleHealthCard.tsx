import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, CheckCircle2 } from "lucide-react";
import { healthKitService } from "@/services/healthkit.service";
import { toast } from "sonner";

const STORAGE_KEY = "momentum.healthkit.connected";

export function AppleHealthCard() {
  const [supported, setSupported] = useState(false);
  const [connected, setConnected] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setSupported(healthKitService.isSupported());
    setConnected(localStorage.getItem(STORAGE_KEY) === "1");
  }, []);

  if (!supported) return null;

  if (connected) {
    return (
      <p className="text-sm text-muted-foreground flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 text-success" />
        Apple Health: Connected
      </p>
    );
  }

  const handleConnect = async () => {
    setBusy(true);
    try {
      const ok = await healthKitService.requestAuthorization();
      if (ok) {
        localStorage.setItem(STORAGE_KEY, "1");
        setConnected(true);
        toast.success("Apple Health connected");
      } else {
        toast.error("Apple Health permission denied");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="border-border">
      <CardContent className="py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-start gap-3">
          <Heart className="h-6 w-6 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Apple Health</p>
            <p className="text-sm text-muted-foreground">
              Connect Apple Health to automatically log workouts and track your progress.
            </p>
          </div>
        </div>
        <Button
          onClick={handleConnect}
          disabled={busy}
          className="min-h-[44px] touch-manipulation shrink-0"
        >
          {busy ? "Connecting..." : "Connect"}
        </Button>
      </CardContent>
    </Card>
  );
}

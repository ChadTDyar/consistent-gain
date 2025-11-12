import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const BODY_AREAS = [
  { id: "neck", label: "Neck", x: 50, y: 15 },
  { id: "left_shoulder", label: "Left Shoulder", x: 30, y: 25 },
  { id: "right_shoulder", label: "Right Shoulder", x: 70, y: 25 },
  { id: "upper_back", label: "Upper Back", x: 50, y: 30 },
  { id: "lower_back", label: "Lower Back", x: 50, y: 45 },
  { id: "left_elbow", label: "Left Elbow", x: 20, y: 35 },
  { id: "right_elbow", label: "Right Elbow", x: 80, y: 35 },
  { id: "left_wrist", label: "Left Wrist", x: 15, y: 48 },
  { id: "right_wrist", label: "Right Wrist", x: 85, y: 48 },
  { id: "left_hip", label: "Left Hip", x: 45, y: 52 },
  { id: "right_hip", label: "Right Hip", x: 55, y: 52 },
  { id: "left_knee", label: "Left Knee", x: 45, y: 70 },
  { id: "right_knee", label: "Right Knee", x: 55, y: 70 },
  { id: "left_ankle", label: "Left Ankle", x: 45, y: 90 },
  { id: "right_ankle", label: "Right Ankle", x: 55, y: 90 },
];

export function BodyMapPainReport({ onComplete }: { onComplete: () => void }) {
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [intensity, setIntensity] = useState([5]);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedArea) {
      toast.error("Please select a body area");
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in");
        return;
      }

      const { error } = await supabase.from("pain_reports").insert({
        user_id: user.id,
        body_area: selectedArea,
        intensity: intensity[0],
        notes: notes || null,
      });

      if (error) throw error;

      toast.success("Pain report logged successfully");
      setSelectedArea(null);
      setIntensity([5]);
      setNotes("");
      onComplete();
    } catch (error) {
      console.error("Error logging pain:", error);
      toast.error("Failed to log pain report");
    } finally {
      setSubmitting(false);
    }
  };

  const getAreaColor = (areaId: string) => {
    if (selectedArea === areaId) return "hsl(var(--error))";
    return "hsl(var(--muted))";
  };

  return (
    <Card className="border-none shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl font-display font-semibold">
          Daily Body Check-In
        </CardTitle>
        <CardDescription className="text-base">
          Tap where you feel discomfort today
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Body Map SVG */}
        <div className="relative w-full max-w-md mx-auto">
          <svg
            viewBox="0 0 100 100"
            className="w-full h-auto"
            style={{ maxHeight: "400px" }}
          >
            {/* Simple body outline */}
            <ellipse cx="50" cy="12" rx="8" ry="10" fill="hsl(var(--muted))" />
            <rect x="44" y="20" width="12" height="25" rx="3" fill="hsl(var(--muted))" />
            <line x1="44" y1="25" x2="20" y2="50" stroke="hsl(var(--border))" strokeWidth="6" strokeLinecap="round" />
            <line x1="56" y1="25" x2="80" y2="50" stroke="hsl(var(--border))" strokeWidth="6" strokeLinecap="round" />
            <rect x="42" y="45" width="16" height="15" rx="3" fill="hsl(var(--muted))" />
            <line x1="45" y1="60" x2="45" y2="95" stroke="hsl(var(--border))" strokeWidth="5" strokeLinecap="round" />
            <line x1="55" y1="60" x2="55" y2="95" stroke="hsl(var(--border))" strokeWidth="5" strokeLinecap="round" />

            {/* Interactive pain points */}
            {BODY_AREAS.map((area) => (
              <g key={area.id}>
                <circle
                  cx={area.x}
                  cy={area.y}
                  r="4"
                  fill={getAreaColor(area.id)}
                  stroke="hsl(var(--foreground))"
                  strokeWidth="0.5"
                  style={{ cursor: "pointer", transition: "all 0.2s" }}
                  onClick={() => setSelectedArea(area.id)}
                  className="hover:opacity-80"
                />
                {selectedArea === area.id && (
                  <text
                    x={area.x}
                    y={area.y - 6}
                    textAnchor="middle"
                    fontSize="3"
                    fill="hsl(var(--foreground))"
                    fontWeight="bold"
                  >
                    {area.label}
                  </text>
                )}
              </g>
            ))}
          </svg>
        </div>

        {selectedArea && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <p className="text-sm font-semibold mb-2">
                Selected: {BODY_AREAS.find(a => a.id === selectedArea)?.label}
              </p>
              <p className="text-sm text-muted-foreground mb-3">
                Pain Intensity: {intensity[0]}/10
              </p>
              <Slider
                value={intensity}
                onValueChange={setIntensity}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
            </div>

            <div>
              <Textarea
                placeholder="Any notes about this pain? (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Log Pain Report"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedArea(null);
                  setNotes("");
                }}
              >
                Clear
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

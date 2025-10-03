import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle, ArrowLeft } from "lucide-react";

export default function Cancel() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background-cream flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-none shadow-xl">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center">
            <XCircle className="h-10 w-10 text-orange-600" />
          </div>
          <CardTitle className="text-3xl font-display font-bold text-foreground">
            Payment Cancelled
          </CardTitle>
          <CardDescription className="text-base">
            Your upgrade was cancelled. No charges were made.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-6 space-y-3">
            <h3 className="font-display font-semibold text-lg text-foreground">
              Changed your mind?
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              You can still upgrade to Premium anytime to unlock unlimited goals and AI Coach features. 
              Your current goals and progress are saved and waiting for you.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => navigate("/dashboard")}
              variant="outline"
              className="flex-1 border-2 font-semibold"
              size="lg"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to Dashboard
            </Button>
            <Button
              onClick={() => navigate("/pricing")}
              className="flex-1 shadow-sm hover:shadow-md font-semibold"
              size="lg"
            >
              View Plans
            </Button>
          </div>

          <p className="text-sm text-muted-foreground text-center mt-4">
            Questions about premium features?{" "}
            <a href="mailto:support@momentum-app.com" className="text-primary hover:underline">
              Contact support
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
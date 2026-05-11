import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";

export default function Goodbye() {
  return (
    <>
      <SEO
        title="Account Deleted | MomentumFit"
        description="Your MomentumFit account has been permanently deleted."
      />
      <div className="min-h-screen bg-background-cream flex items-center justify-center px-4 py-12">
        <div className="max-w-xl w-full text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-6 text-foreground">
            Account Deleted
          </h1>
          <div className="space-y-4 text-muted-foreground leading-relaxed mb-8">
            <p>
              Your account and all data have been permanently removed from MomentumFit. The deletion is complete and final. We do not retain any backups.
            </p>
            <p>
              If you ever want to come back, you can create a fresh account.
            </p>
            <p>Thank you for trying MomentumFit.</p>
          </div>
          <Button asChild size="lg">
            <a href="/">Return to homepage</a>
          </Button>
        </div>
      </div>
    </>
  );
}

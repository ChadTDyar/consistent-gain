import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import momentumLogo from "@/assets/momentum-logo.png";
import { SEO } from "@/components/SEO";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    const trimmed = email.trim();
    if (!trimmed) {
      setEmailError("Please enter your email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(trimmed, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
      toast.success("Reset email sent. Check your inbox.");
    } catch (err: any) {
      // Don't leak whether the email exists — show generic success.
      setSent(true);
      toast.success("If an account exists for that email, a reset link is on the way.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO title="Reset Password - Momentum" description="Request a password reset link for your Momentum account." />
      <div className="min-h-screen flex items-center justify-center bg-background-cream p-4">
        <Card className="w-full max-w-md border-none shadow-xl">
          <CardHeader className="space-y-4 pb-6">
            <div className="flex justify-center">
              <img src={momentumLogo} alt="Momentum" className="h-16 w-auto" />
            </div>
            <CardTitle className="text-2xl md:text-3xl font-display font-bold text-center text-foreground">
              Forgot your password?
            </CardTitle>
            <CardDescription className="text-center text-base leading-relaxed">
              Enter the email associated with your account and we'll send you a link to reset your password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="space-y-4 text-center">
                <p className="text-sm text-foreground" role="status" aria-live="polite">
                  If an account exists for <strong>{email.trim()}</strong>, you'll receive a reset link shortly.
                </p>
                <p className="text-xs text-muted-foreground">
                  Didn't get it? Check your spam folder, or try again in a minute.
                </p>
                <Button variant="outline" className="w-full" onClick={() => navigate("/auth")}>
                  Back to Sign In
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div className="space-y-2">
                  <Label htmlFor="forgot-email">Email</Label>
                  <Input
                    id="forgot-email"
                    name="email"
                    type="email"
                    inputMode="email"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setEmailError(null); }}
                    aria-invalid={!!emailError}
                    aria-describedby={emailError ? "forgot-email-error" : undefined}
                    autoFocus
                  />
                  {emailError && (
                    <p id="forgot-email-error" role="alert" aria-live="polite" className="text-sm text-destructive">
                      {emailError}
                    </p>
                  )}
                </div>
                <Button type="submit" className="w-full font-semibold" size="lg" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                  Send Reset Link
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => navigate("/auth")}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Sign In
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Loader2, LogOut } from "lucide-react";

interface Profile {
  id: string;
  name: string | null;
  reminder_enabled: boolean;
  is_premium: boolean;
  subscription_status: string | null;
  current_period_end: string | null;
}

export default function Settings() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      navigate("/auth");
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Error loading profile:", error);
    } else if (data) {
      setProfile(data);
      setName(data.name || "");
      setRemindersEnabled(data.reminder_enabled);
    }

    setLoading(false);
  };

  const handleUpdateProfile = async () => {
    if (!profile) return;

    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({ name })
      .eq("id", profile.id);

    if (error) {
      toast.error("Failed to update profile");
      console.error(error);
    } else {
      toast.success("Profile updated!");
    }

    setSaving(false);
  };

  const handleToggleReminders = async (checked: boolean) => {
    if (!profile) return;

    setRemindersEnabled(checked);

    const { error } = await supabase
      .from("profiles")
      .update({ reminder_enabled: checked })
      .eq("id", profile.id);

    if (error) {
      toast.error("Failed to update reminders");
      console.error(error);
      setRemindersEnabled(!checked);
    } else {
      toast.success(checked ? "Reminders enabled" : "Reminders disabled");
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Portal error:', error);
      toast.error("Failed to open subscription management");
    } finally {
      setPortalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-cream">
      <div className="container mx-auto px-4 md:px-8 py-8 md:py-12 max-w-3xl">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/dashboard")} 
          className="mb-8 hover:bg-muted"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <h1 className="text-4xl md:text-5xl font-display font-bold mb-8 md:mb-12 text-foreground">
          Settings
        </h1>

        <div className="space-y-6 md:space-y-8">
          {/* Profile Section */}
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl font-display font-semibold">Profile</CardTitle>
              <CardDescription className="text-base">Manage your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base font-medium">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="h-11 text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-base font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile?.id || ""}
                  disabled
                  className="bg-muted h-11 text-base"
                />
              </div>
              <Button 
                onClick={handleUpdateProfile} 
                disabled={saving}
                size="lg"
                className="shadow-sm hover:shadow-md font-semibold"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Reminders Section */}
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl font-display font-semibold">Daily Reminders</CardTitle>
              <CardDescription className="text-base">Get notified to log your daily activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <Label htmlFor="reminders" className="flex-1 text-base cursor-pointer">
                  Enable daily reminder notifications
                </Label>
                <Switch
                  id="reminders"
                  checked={remindersEnabled}
                  onCheckedChange={handleToggleReminders}
                />
              </div>
            </CardContent>
          </Card>

          {/* Subscription Section */}
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl font-display font-semibold">Subscription</CardTitle>
              <CardDescription className="text-base">Manage your premium membership</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border-l-4 border-l-primary">
                  <div>
                    <p className="font-display font-semibold text-lg text-foreground">
                      {profile?.is_premium ? "Premium" : "Free"} Plan
                    </p>
                    <p className="text-base text-muted-foreground mt-1">
                      {profile?.is_premium
                        ? "You have access to all premium features"
                        : "Upgrade to unlock all features"}
                    </p>
                    {profile?.current_period_end && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {profile.subscription_status === 'active' 
                          ? `Renews on ${new Date(profile.current_period_end).toLocaleDateString()}`
                          : `Expires on ${new Date(profile.current_period_end).toLocaleDateString()}`
                        }
                      </p>
                    )}
                  </div>
                </div>
                {profile?.is_premium ? (
                  <Button 
                    onClick={handleManageSubscription}
                    size="lg"
                    variant="outline"
                    disabled={portalLoading}
                    className="w-full border-2 font-semibold"
                  >
                    {portalLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "Manage Subscription"
                    )}
                  </Button>
                ) : (
                  <Button 
                    onClick={() => navigate("/pricing")}
                    size="lg"
                    className="w-full shadow-sm hover:shadow-md font-semibold"
                  >
                    Upgrade to Premium
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Sign Out */}
          <Button 
            variant="outline" 
            onClick={handleSignOut} 
            className="w-full border-2 hover:bg-muted"
            size="lg"
          >
            <LogOut className="mr-2 h-5 w-5" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}

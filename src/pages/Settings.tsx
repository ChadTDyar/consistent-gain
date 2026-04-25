import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Loader2, LogOut, Download, Trash2, AlertTriangle, ShieldCheck } from "lucide-react";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DataExport } from "@/components/DataExport";
import { WorkoutBuddies } from "@/components/WorkoutBuddies";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DoctorReport } from "@/components/DoctorReport";
import { FeedbackForm } from "@/components/FeedbackForm";
import { IntegrationHooks } from "@/components/IntegrationHooks";
import { localNotificationsService } from "@/services/localNotifications.service";
import { healthKitService } from "@/services/healthkit.service";
import { isIOSNative } from "@/lib/platform";
import { Heart } from "lucide-react";

interface Profile {
  id: string;
  name: string | null;
  email?: string;
  reminder_enabled: boolean;
  is_premium: boolean;
  subscription_status: string | null;
  plan: string;
}

export default function Settings() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState("09:00");
  const [healthKitConnected, setHealthKitConnected] = useState(false);
  const [healthLoading, setHealthLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    loadProfile();
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    const hasAdmin = roles?.some((r: any) => r.role === "admin") ?? false;
    setIsAdmin(hasAdmin);

    if (hasAdmin) {
      const { count } = await supabase
        .from("testimonials")
        .select("*", { count: "exact", head: true })
        .eq("is_approved", false);
      setPendingCount(count ?? 0);
    }
  };

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
      setProfile({ ...data, email: user.email || "" });
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

  const applyReminderSchedule = async (enabled: boolean, time: string) => {
    if (!isIOSNative()) return;
    if (enabled) {
      const [h, m] = time.split(":").map(Number);
      const ok = await localNotificationsService.scheduleDailyReminder(h, m);
      if (!ok) toast.error("Couldn't schedule reminder. Check notification permissions.");
    } else {
      await localNotificationsService.cancelDailyReminder();
    }
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
      return;
    }
    await applyReminderSchedule(checked, reminderTime);
    toast.success(checked ? "Reminders enabled" : "Reminders disabled");
  };

  const handleReminderTimeChange = async (value: string) => {
    setReminderTime(value);
    if (remindersEnabled) {
      await applyReminderSchedule(true, value);
      toast.success(`Reminder set for ${value}`);
    }
  };

  const handleConnectHealthKit = async () => {
    setHealthLoading(true);
    const ok = await healthKitService.requestAuthorization();
    setHealthLoading(false);
    if (ok) {
      setHealthKitConnected(true);
      toast.success("Apple Health connected. Workouts will sync automatically.");
    } else {
      toast.error("Couldn't connect to Apple Health.");
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

  const handleExportData = async () => {
    if (!profile) return;
    
    setExporting(true);
    try {
      const { data: goalsData } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", profile.id);
      
      const { data: logsData } = await supabase
        .from("activity_logs")
        .select("*")
        .eq("user_id", profile.id);

      const { data: messagesData } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("user_id", profile.id);
      
      const exportData = {
        profile,
        goals: goalsData,
        activity_logs: logsData,
        chat_messages: messagesData,
        exported_at: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `momentum-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success("Data exported successfully");
    } catch (error) {
      console.error('Export error:', error);
      toast.error("Failed to export data");
    } finally {
      setExporting(false);
    }
  };

  // Multi-step delete confirmation (3 steps inside a single React-controlled AlertDialog).
  // Replaces window.confirm() which is unreliable in iOS WKWebView via Capacitor.
  const [deleteStep, setDeleteStep] = useState<0 | 1 | 2 | 3>(0);

  const handleDeleteAccount = async () => {
    try {
      setDeleting(true);

      const { error } = await supabase.functions.invoke('delete-account', {
        method: 'POST'
      });

      if (error) {
        throw error;
      }

      // Sign out client-side so the session cookie/local storage is cleared
      // before navigation. Otherwise the auth listener may bounce the user
      // back to /dashboard with a stale session.
      try { await supabase.auth.signOut(); } catch { /* ignore */ }

      toast.success("Account deleted successfully");
      setDeleteStep(0);
      navigate('/auth');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error("Failed to delete account. Please try again or contact support.");
    } finally {
      setDeleting(false);
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
          {/* Admin Link */}
          {isAdmin && (
            <Card
              className="border-none shadow-md cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate("/admin")}
            >
              <CardContent className="flex items-center justify-between py-5">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-display font-semibold text-foreground">Admin Dashboard</p>
                    <p className="text-sm text-muted-foreground">Manage testimonials & feedback</p>
                  </div>
                </div>
                {pendingCount > 0 && (
                  <Badge variant="destructive" className="text-sm px-2.5 py-0.5">
                    {pendingCount} pending
                  </Badge>
                )}
              </CardContent>
            </Card>
          )}
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
                  value={profile?.email || ""}
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
            <CardContent className="space-y-4">
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
              {isIOSNative() && remindersEnabled && (
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <Label htmlFor="reminder-time" className="flex-1 text-base">
                    Reminder time
                  </Label>
                  <Input
                    id="reminder-time"
                    type="time"
                    value={reminderTime}
                    onChange={(e) => handleReminderTimeChange(e.target.value)}
                    className="w-32 h-11"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Apple Health (iOS native only) */}
          {isIOSNative() && (
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-2xl font-display font-semibold flex items-center gap-2">
                  <Heart className="h-6 w-6 text-primary" />
                  Apple Health
                </CardTitle>
                <CardDescription className="text-base">
                  Save completed workouts to the Health app automatically.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleConnectHealthKit}
                  disabled={healthLoading || healthKitConnected}
                  size="lg"
                  variant={healthKitConnected ? "outline" : "default"}
                  className="w-full font-semibold"
                >
                  {healthLoading ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Connecting...</>
                  ) : healthKitConnected ? (
                    "Connected to Apple Health"
                  ) : (
                    "Connect Apple Health"
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Subscription Section */}
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl font-display font-semibold">Subscription</CardTitle>
              <CardDescription className="text-base">Manage your membership</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border-l-4 border-l-primary">
                  <div>
                    <p className="font-display font-semibold text-lg text-foreground flex items-center gap-2">
                      {(profile?.plan || 'free').charAt(0).toUpperCase() + (profile?.plan || 'free').slice(1)} Plan
                      {profile?.plan && profile.plan !== 'free' && (
                        <Badge className="text-xs uppercase">{profile.plan}</Badge>
                      )}
                    </p>
                    <p className="text-base text-muted-foreground mt-1">
                    {profile?.plan === 'pro' 
                        ? "You have access to all features including AI Coach"
                        : profile?.plan === 'plus'
                        ? "You have access to unlimited goals & Streak Repair"
                        : "Upgrade to unlock more features"}
                    </p>
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
                ) : !isIOSNative() ? (
                  <Button 
                    onClick={() => navigate("/pricing")}
                    size="lg"
                    className="w-full shadow-sm hover:shadow-md font-semibold"
                  >
                    Upgrade
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <div className="grid gap-6 md:grid-cols-2">
            <DataExport plan={(profile?.plan || 'free') as any} />
            <DoctorReport />
          </div>

          {/* Workout Buddies */}
          <WorkoutBuddies />

          {/* Integrations Roadmap */}
          <IntegrationHooks />

          {/* Original Data Management Card - keeping for delete account */}
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl font-display font-semibold">Danger Zone</CardTitle>
              <CardDescription className="text-base">Permanent account actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="destructive"
                size="lg"
                className="w-full font-semibold"
                onClick={() => setDeleteStep(1)}
              >
                <Trash2 className="mr-2 h-5 w-5" />
                Delete Account
              </Button>

              <AlertDialog
                open={deleteStep > 0}
                onOpenChange={(open) => {
                  if (!open && !deleting) setDeleteStep(0);
                }}
              >
                <AlertDialogContent key={deleteStep}>
                  {deleteStep === 1 && (
                    <>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-destructive" />
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-base">
                          This action cannot be undone. This will permanently delete your account and remove all your data from our servers, including goals, activity logs, and chat history.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <Button variant="outline" onClick={() => setDeleteStep(0)}>
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => setDeleteStep(2)}
                        >
                          Continue
                        </Button>
                      </AlertDialogFooter>
                    </>
                  )}

                  {deleteStep === 2 && (
                    <>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-destructive" />
                          This is your final warning
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-base">
                          All your goals, progress, and data will be permanently deleted. Continue?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <Button variant="outline" onClick={() => setDeleteStep(0)}>
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => setDeleteStep(3)}
                        >
                          I understand, continue
                        </Button>
                      </AlertDialogFooter>
                    </>
                  )}

                  {deleteStep === 3 && (
                    <>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-destructive" />
                          Confirm permanent deletion
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-base">
                          Tap <strong>Delete my account</strong> below to permanently delete your account. You will be signed out immediately.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setDeleteStep(0)}
                          disabled={deleting}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={handleDeleteAccount}
                          disabled={deleting}
                        >
                          {deleting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            "Delete my account"
                          )}
                        </Button>
                      </AlertDialogFooter>
                    </>
                  )}
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>

          {/* Feedback */}
          <FeedbackForm />

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

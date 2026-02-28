import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SEO } from "@/components/SEO";
import {
  ArrowLeft, Loader2, Target, Activity, Flame, Calendar,
  Crown, Mail, User, Edit2, Check, X, Trophy, Camera
} from "lucide-react";
import { toast } from "sonner";
import { calculateStreak, getUserActivityLogs } from "@/lib/streakUtils";

interface ProfileData {
  id: string;
  name: string | null;
  avatar_url: string | null;
  is_premium: boolean | null;
  subscription_status: string | null;
  created_at: string | null;
}

interface ProfileStats {
  totalGoals: number;
  totalActivities: number;
  currentStreak: number;
  totalDaysActive: number;
  longestStreak: number;
}

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [email, setEmail] = useState("");
  const [stats, setStats] = useState<ProfileStats>({
    totalGoals: 0,
    totalActivities: 0,
    currentStreak: 0,
    totalDaysActive: 0,
    longestStreak: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    setEmail(user.email || "");

    const [profileRes, goalsRes, activitiesRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("goals").select("id").eq("user_id", user.id),
      supabase.from("activity_logs")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_deleted", false)
        .order("completed_at", { ascending: false }),
    ]);

    if (profileRes.data) {
      setProfile(profileRes.data);
      setEditName(profileRes.data.name || "");
    }

    const activityLogs = activitiesRes.data || [];
    const logs = await getUserActivityLogs();
    const currentStreak = calculateStreak(logs);

    // Calculate unique active days
    const uniqueDays = new Set(activityLogs.map((a) => a.completed_at));

    // Calculate longest streak from activity logs
    let longest = 0;
    let tempStreak = 0;
    const sortedDays = Array.from(uniqueDays).sort();
    for (let i = 0; i < sortedDays.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prev = new Date(sortedDays[i - 1]);
        const curr = new Date(sortedDays[i]);
        const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
        tempStreak = diffDays === 1 ? tempStreak + 1 : 1;
      }
      longest = Math.max(longest, tempStreak);
    }

    setStats({
      totalGoals: goalsRes.data?.length ?? 0,
      totalActivities: activityLogs.length,
      currentStreak,
      totalDaysActive: uniqueDays.size,
      longestStreak: longest,
    });

    setRecentActivity(activityLogs.slice(0, 10));
    setLoading(false);
  };

  const handleSaveName = async () => {
    if (!profile) return;
    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({ name: editName })
      .eq("id", profile.id);

    if (error) {
      toast.error("Failed to update name");
    } else {
      toast.success("Name updated!");
      setProfile({ ...profile, name: editName });
      setEditing(false);
    }
    setSaving(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const filePath = `${profile.id}/avatar.${ext}`;

      // Remove old avatar if exists
      await supabase.storage.from("avatars").remove([filePath]);

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: avatarUrl })
        .eq("id", profile.id);

      if (updateError) throw updateError;

      setProfile({ ...profile, avatar_url: avatarUrl });
      toast.success("Profile photo updated!");
    } catch (err: any) {
      console.error("Avatar upload error:", err);
      toast.error("Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const initials = (profile?.name || email || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "Unknown";

  const statCards = [
    { label: "Current Streak", value: `${stats.currentStreak}d`, icon: Flame, color: "text-orange-500" },
    { label: "Longest Streak", value: `${stats.longestStreak}d`, icon: Trophy, color: "text-yellow-500" },
    { label: "Days Active", value: stats.totalDaysActive, icon: Calendar, color: "text-blue-500" },
    { label: "Total Activities", value: stats.totalActivities, icon: Activity, color: "text-green-500" },
    { label: "Active Goals", value: stats.totalGoals, icon: Target, color: "text-primary" },
  ];

  return (
    <>
      <SEO title="My Profile - Momentum" description="View your profile and fitness stats" />
      <div className="min-h-screen bg-background pb-24">
        {/* Hero header */}
        <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-background pt-8 pb-16">
          <div className="container mx-auto px-4 max-w-3xl">
            <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>

            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
              {/* Avatar with upload */}
              <label className="relative group cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                />
                <div className="w-24 h-24 rounded-full border-4 border-background shadow-lg overflow-hidden bg-primary/20 flex items-center justify-center">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Profile photo"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-primary text-3xl font-bold">{initials}</span>
                  )}
                </div>
                <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {uploading ? (
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                  ) : (
                    <Camera className="h-6 w-6 text-white" />
                  )}
                </div>
              </label>

              <div className="text-center sm:text-left flex-1">
                {editing ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="text-xl font-bold h-10 max-w-xs"
                      autoFocus
                    />
                    <Button size="icon" variant="ghost" onClick={handleSaveName} disabled={saving}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => { setEditing(false); setEditName(profile?.name || ""); }}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <h1 className="text-3xl font-display font-bold text-foreground">
                      {profile?.name || "Unnamed User"}
                    </h1>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditing(true)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3 mt-2 justify-center sm:justify-start">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" /> {email}
                  </span>
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <User className="h-3.5 w-3.5" /> Member since {memberSince}
                  </span>
                </div>

                <div className="mt-3">
                  {profile?.is_premium ? (
                    <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
                      <Crown className="h-3 w-3 mr-1" /> Premium Member
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="cursor-pointer" onClick={() => navigate("/pricing")}>
                      Free Plan - Upgrade
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 max-w-3xl -mt-8 space-y-6">
          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {statCards.map((s) => (
              <Card key={s.label} className="text-center">
                <CardContent className="pt-5 pb-4 px-3">
                  <s.icon className={`h-5 w-5 mx-auto mb-1.5 ${s.color}`} />
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-display">Recent Activity</CardTitle>
              <CardDescription>Your last 10 logged sessions</CardDescription>
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <p className="text-muted-foreground text-center py-6">No activity logged yet. Start tracking to see your history!</p>
              ) : (
                <div className="space-y-3">
                  {recentActivity.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <div>
                          <p className="text-sm font-medium">
                            {a.session_type === "regular" ? "Workout" : a.session_type || "Session"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(a.completed_at).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        {a.duration_minutes && <span>{a.duration_minutes} min</span>}
                        {a.intensity_level && (
                          <Badge variant="outline" className="text-xs capitalize">
                            {a.intensity_level}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick links */}
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-auto py-4" onClick={() => navigate("/settings")}>
              <div className="text-center">
                <p className="font-medium">Settings</p>
                <p className="text-xs text-muted-foreground mt-0.5">Preferences & account</p>
              </div>
            </Button>
            <Button variant="outline" className="h-auto py-4" onClick={() => navigate("/progress")}>
              <div className="text-center">
                <p className="font-medium">Progress</p>
                <p className="text-xs text-muted-foreground mt-0.5">Charts & analytics</p>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

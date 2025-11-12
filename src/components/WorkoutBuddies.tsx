import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, CheckCircle, XCircle, Clock, Plus } from "lucide-react";
import { toast } from "sonner";

interface BuddyRequest {
  id: string;
  buddy_id: string;
  status: string;
  created_at: string;
  profiles: {
    name: string;
  };
}

export function WorkoutBuddies() {
  const [buddies, setBuddies] = useState<BuddyRequest[]>([]);
  const [requests, setRequests] = useState<BuddyRequest[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    loadBuddies();
  }, []);

  const loadBuddies = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get accepted buddies - simplified query
    const { data: acceptedData } = await supabase
      .from("workout_buddies")
      .select("id, buddy_id, status, created_at")
      .eq("user_id", user.id)
      .eq("status", "accepted");

    // Get pending requests (received) - simplified query
    const { data: pendingData } = await supabase
      .from("workout_buddies")
      .select("id, user_id, status, created_at")
      .eq("buddy_id", user.id)
      .eq("status", "pending");

    // Fetch buddy names separately
    const buddiesWithNames = await Promise.all(
      (acceptedData || []).map(async (buddy) => {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("name")
          .eq("id", buddy.buddy_id)
          .single();
        
        return {
          ...buddy,
          profiles: { name: profileData?.name || "User" }
        };
      })
    );

    const requestsWithNames = await Promise.all(
      (pendingData || []).map(async (request) => {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("name")
          .eq("id", request.user_id)
          .single();
        
        return {
          ...request,
          buddy_id: request.user_id,
          profiles: { name: profileData?.name || "User" }
        };
      })
    );

    setBuddies(buddiesWithNames);
    setRequests(requestsWithNames);
  };

  const sendRequest = async () => {
    if (!email) {
      toast.error("Please enter an email");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Find user by email (this requires a custom RPC function for security)
    // For now, we'll just show a message
    toast("Buddy invites coming soon!", {
      description: "We're working on the invite system. Stay tuned!",
    });
    setShowForm(false);
    setEmail("");
  };

  const handleRequest = async (requestId: string, accept: boolean) => {
    const { error } = await supabase
      .from("workout_buddies")
      .update({ status: accept ? "accepted" : "declined" })
      .eq("id", requestId);

    if (error) {
      toast.error("Failed to update request");
    } else {
      toast.success(accept ? "Buddy added!" : "Request declined");
      loadBuddies();
    }
  };

  return (
    <Card className="border-none shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-display font-semibold flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              Workout Buddies
            </CardTitle>
            <CardDescription className="text-base">
              Stay accountable together
            </CardDescription>
          </div>
          <Button
            size="icon"
            onClick={() => setShowForm(!showForm)}
            className="min-w-[44px] min-h-[44px]"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <div className="space-y-3 p-4 bg-muted/30 rounded-lg animate-fade-in">
            <Input
              placeholder="Friend's email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button onClick={sendRequest} className="w-full">
              Send Invite
            </Button>
          </div>
        )}

        {requests.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold">Pending Requests</p>
            {requests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{request.profiles?.name || "User"}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRequest(request.id, true)}
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRequest(request.id, false)}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2">
          <p className="text-sm font-semibold">Your Buddies ({buddies.length})</p>
          {buddies.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No workout buddies yet. Invite someone!
            </p>
          ) : (
            buddies.map((buddy) => (
              <div
                key={buddy.id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-success" />
                  <span>{buddy.profiles?.name || "Buddy"}</span>
                </div>
                <Badge className="bg-success">Active</Badge>
              </div>
            ))
          )}
        </div>

        <div className="text-xs text-muted-foreground bg-primary/5 p-3 rounded-lg">
          💡 <strong>Private accountability:</strong> Your buddies only see that you completed a workout - 
          never performance comparisons or competition
        </div>
      </CardContent>
    </Card>
  );
}

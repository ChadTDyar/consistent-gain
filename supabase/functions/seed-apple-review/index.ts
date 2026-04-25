// One-shot admin function to recreate the Apple Review demo account.
// Phase 3: 3 habits + 30 days of activity logs (>=14 consecutive day streak each).
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-seed-token",
};

const EMAIL = "apple-review@momentumfit.app";
const PASSWORD = "AppleRev2026!MOM";

const HABITS = [
  { title: "Morning workout", description: "Strength + cardio session", category: "fitness", duration: 25, intensity: "medium", rpe: 6 },
  { title: "10-minute stretch", description: "Mobility and flexibility", category: "mobility", duration: 10, intensity: "low", rpe: 3 },
  { title: "Hydration check", description: "Track daily water intake", category: "wellness", duration: 5, intensity: "low", rpe: 2 },
];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    // 1. Find or create the auth user (exact email, no suffix)
    const { data: existing, error: listErr } = await admin.auth.admin.listUsers();
    if (listErr) throw listErr;
    const found = existing.users.find((u) => u.email?.toLowerCase() === EMAIL.toLowerCase());
    let userId: string;

    if (found) {
      userId = found.id;
      await admin.auth.admin.updateUserById(userId, {
        password: PASSWORD,
        email_confirm: true,
      });
    } else {
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email: EMAIL,
        password: PASSWORD,
        email_confirm: true,
        user_metadata: { name: "Apple Review" },
      });
      if (createErr) throw createErr;
      userId = created.user!.id;
    }

    // 2. Profile with premium (use admin RPC to bypass trigger)
    await admin.from("profiles").upsert({
      id: userId,
      name: "Apple Review",
      reminder_enabled: true,
      theme_preference: "system",
    });

    const { error: rpcErr } = await admin.rpc("admin_set_premium", {
      _user_id: userId,
      _plan: "premium",
      _is_premium: true,
      _subscription_status: "active",
    });
    // RPC requires admin role for caller; service_role can write directly via raw SQL through PostgREST.
    // If rpc fails (caller not admin), fall back to direct update — service_role bypasses the trigger via current_user check.
    if (rpcErr) {
      await admin
        .from("profiles")
        .update({ plan: "premium", is_premium: true, subscription_status: "active" })
        .eq("id", userId);
    }

    // 3. Wipe and reseed goals + activity logs (idempotent)
    await admin.from("activity_logs").delete().eq("user_id", userId);
    await admin.from("goals").delete().eq("user_id", userId);

    const startDate = new Date();
    startDate.setUTCHours(12, 0, 0, 0);
    startDate.setUTCDate(startDate.getUTCDate() - 30);

    const goalRows = HABITS.map((h) => ({
      user_id: userId,
      title: h.title,
      description: h.description,
      category: h.category,
      target_days_per_week: 7,
      start_date: startDate.toISOString().slice(0, 10),
    }));

    const { data: insertedGoals, error: goalErr } = await admin
      .from("goals")
      .insert(goalRows)
      .select("id, title");
    if (goalErr) throw goalErr;

    // 4. 30 days of activity logs per habit (= 30-day streak, exceeds 14-day requirement)
    const today = new Date();
    today.setUTCHours(12, 0, 0, 0);
    const logs: any[] = [];

    for (const goal of insertedGoals!) {
      const habit = HABITS.find((h) => h.title === goal.title)!;
      for (let i = 0; i < 30; i++) {
        const d = new Date(today);
        d.setUTCDate(d.getUTCDate() - i);
        logs.push({
          user_id: userId,
          goal_id: goal.id,
          completed_at: d.toISOString().slice(0, 10),
          session_type: "regular",
          duration_minutes: habit.duration,
          intensity_level: habit.intensity,
          rpe_rating: habit.rpe,
          notes: i === 0 ? `${habit.title} — Apple review demo seed` : null,
        });
      }
    }

    const { error: logErr } = await admin.from("activity_logs").insert(logs);
    if (logErr) throw logErr;

    return new Response(
      JSON.stringify({
        ok: true,
        user_id: userId,
        email: EMAIL,
        goals_created: insertedGoals!.length,
        activity_logs_created: logs.length,
        days_per_habit: 30,
        consecutive_streak_days: 30,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (e: any) {
    const msg = e?.message ?? (typeof e === "string" ? e : JSON.stringify(e));
    console.error("seed-apple-review error:", msg, e);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

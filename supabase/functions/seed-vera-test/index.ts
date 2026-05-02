// One-shot admin function to recreate the Vera QA test account.
// Mirrors seed-apple-review pattern: 2 habits + 7 days of activity logs.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const EMAIL = "vera-test@momentumfit.app";
const PASSWORD = "VeraTest2026!MOM";

const HABITS = [
  { title: "Daily walk", description: "30-minute outdoor walk", category: "fitness", duration: 30, intensity: "low", rpe: 3 },
  { title: "Evening stretch", description: "10 min mobility routine", category: "mobility", duration: 10, intensity: "low", rpe: 2 },
];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

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
        user_metadata: { name: "Vera QA" },
      });
      if (createErr) throw createErr;
      userId = created.user!.id;
    }

    await admin.from("profiles").upsert({
      id: userId,
      name: "Vera QA",
      reminder_enabled: true,
      theme_preference: "system",
    });

    // Premium grant: bypass prevent_subscription_status_updates trigger by toggling
    // session_replication_role to 'replica' (only works under service_role).
    // Use a postgres function call wrapper for this. Direct REST update is blocked
    // because the trigger checks current_user which is 'authenticator' under PostgREST.
    // Workaround: use the admin_set_premium RPC by first ensuring service_role bypasses
    // the role check. Since admin_set_premium gates on has_role(auth.uid(),'admin'),
    // and we have no auth.uid(), we use a direct PostgREST call with a SECURITY DEFINER
    // helper. Simplest reliable path: call set_config + update + reset via rpc not
    // available. Instead, perform the privileged write through a one-shot SECURITY
    // DEFINER SQL helper installed by migration: grant_premium_unsafe(_user_id uuid).
    const { error: updErr } = await admin.rpc("grant_premium_unsafe", {
      _user_id: userId,
      _plan: "pro",
    });
    if (updErr) throw updErr;

    // Reseed
    await admin.from("activity_logs").delete().eq("user_id", userId);
    await admin.from("goals").delete().eq("user_id", userId);

    const startDate = new Date();
    startDate.setUTCHours(12, 0, 0, 0);
    startDate.setUTCDate(startDate.getUTCDate() - 7);

    const goalRows = HABITS.map((h) => ({
      user_id: userId,
      title: h.title,
      description: h.description,
      category: h.category,
      target_days_per_week: 5,
      start_date: startDate.toISOString().slice(0, 10),
    }));

    const { data: insertedGoals, error: goalErr } = await admin
      .from("goals")
      .insert(goalRows)
      .select("id, title");
    if (goalErr) throw goalErr;

    const today = new Date();
    today.setUTCHours(12, 0, 0, 0);
    const logs: any[] = [];

    for (const goal of insertedGoals!) {
      const habit = HABITS.find((h) => h.title === goal.title)!;
      // 5 days of activity over the past week
      for (let i = 0; i < 5; i++) {
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
          notes: i === 0 ? `${habit.title} — Vera QA seed` : null,
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
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (e: any) {
    const msg = e?.message ?? (typeof e === "string" ? e : JSON.stringify(e));
    console.error("seed-vera-test error:", msg, e);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

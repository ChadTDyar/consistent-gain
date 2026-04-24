// One-shot admin function to recreate the Apple Review demo account.
// SECURITY: protected by a shared secret header; uses service role key.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-seed-token",
};

const EMAIL = "apple-review@momentumfit.app";
const PASSWORD = "MomentumDemo2025!";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    // Check if user exists
    const { data: existing } = await admin.auth.admin.listUsers();
    const found = existing.users.find((u) => u.email === EMAIL);
    let userId: string;

    if (found) {
      userId = found.id;
      // Ensure password + confirmation
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

    // Ensure profile exists with Premium tier
    await admin.from("profiles").upsert({
      id: userId,
      name: "Apple Review",
      plan: "premium",
      is_premium: true,
      subscription_status: "active",
      reminder_enabled: true,
      theme_preference: "system",
    });

    // Ensure a goal exists
    let { data: goals } = await admin
      .from("goals")
      .select("id")
      .eq("user_id", userId)
      .limit(1);

    let goalId: string;
    if (!goals || goals.length === 0) {
      const { data: newGoal, error: goalErr } = await admin
        .from("goals")
        .insert({
          user_id: userId,
          title: "Daily Movement",
          description: "10-minute daily habit session",
          category: "fitness",
          target_days_per_week: 7,
          start_date: new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10),
        })
        .select("id")
        .single();
      if (goalErr) throw goalErr;
      goalId = newGoal!.id;
    } else {
      goalId = goals[0].id;
    }

    // Wipe and reseed activity logs for last 30 days
    await admin.from("activity_logs").delete().eq("user_id", userId);

    const today = new Date();
    today.setUTCHours(12, 0, 0, 0);
    const rows = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setUTCDate(d.getUTCDate() - i);
      rows.push({
        user_id: userId,
        goal_id: goalId,
        completed_at: d.toISOString().slice(0, 10),
        session_type: "regular",
        duration_minutes: 12,
        intensity_level: "moderate",
        rpe_rating: 6,
        notes: i === 0 ? "Apple review demo seed" : null,
      });
    }
    const { error: logErr } = await admin.from("activity_logs").insert(rows);
    if (logErr) throw logErr;

    return new Response(
      JSON.stringify({
        ok: true,
        user_id: userId,
        email: EMAIL,
        seeded_days: rows.length,
        goal_id: goalId,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

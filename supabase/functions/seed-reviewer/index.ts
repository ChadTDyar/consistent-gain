// One-off function to seed Apple App Store reviewer account.
// Call once via curl, then delete the function.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const REVIEWER_EMAIL = "reviewer@momentumfit.app";
const REVIEWER_PASSWORD = "MomentumDemo2025!";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 1. Create or fetch auth user (email pre-confirmed)
    let userId: string;
    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      email: REVIEWER_EMAIL,
      password: REVIEWER_PASSWORD,
      email_confirm: true,
      user_metadata: { name: "App Store Reviewer" },
    });

    if (createErr && !createErr.message.toLowerCase().includes("already")) {
      throw createErr;
    }

    if (created?.user) {
      userId = created.user.id;
    } else {
      // Already exists, look it up
      const { data: list } = await supabase.auth.admin.listUsers();
      const existing = list.users.find((u) => u.email === REVIEWER_EMAIL);
      if (!existing) throw new Error("Could not find or create reviewer user");
      userId = existing.id;
    }

    // 2. Ensure profile exists and is set to Premium so reviewer sees full app
    await supabase.from("profiles").upsert(
      {
        id: userId,
        name: "App Store Reviewer",
        plan: "premium",
        is_premium: true,
        subscription_status: "active",
        reminder_enabled: true,
        theme_preference: "system",
      },
      { onConflict: "id" }
    );

    // 3. Wipe any prior demo data for idempotency
    await supabase.from("activity_logs").delete().eq("user_id", userId);
    await supabase.from("goals").delete().eq("user_id", userId);
    await supabase.from("daily_context").delete().eq("user_id", userId);

    // 4. Seed three habits
    const habits = [
      { title: "Morning workout", category: "fitness", target_days_per_week: 5 },
      { title: "10-minute walk", category: "movement", target_days_per_week: 7 },
      { title: "Stretch routine", category: "mobility", target_days_per_week: 4 },
    ];
    const { data: insertedGoals, error: goalErr } = await supabase
      .from("goals")
      .insert(habits.map((h) => ({ ...h, user_id: userId })))
      .select();
    if (goalErr) throw goalErr;

    // 5. Seed 30 days of activity logs (skip occasional days for realism)
    const logs: Array<Record<string, unknown>> = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dow = d.getDay();

      for (const goal of insertedGoals!) {
        // Morning workout: skip Sat & Sun
        if (goal.title === "Morning workout" && (dow === 0 || dow === 6)) continue;
        // Stretch: only Mon/Wed/Fri/Sun
        if (goal.title === "Stretch routine" && ![0, 1, 3, 5].includes(dow)) continue;
        // Skip ~10% of days for realism
        if (Math.random() < 0.1 && i > 2) continue;

        logs.push({
          user_id: userId,
          goal_id: goal.id,
          completed_at: dateStr,
          duration_minutes: goal.title === "10-minute walk" ? 10 : 15,
          intensity_level: "moderate",
          session_type: "regular",
        });
      }
    }
    const { error: logErr } = await supabase.from("activity_logs").insert(logs);
    if (logErr) throw logErr;

    // 6. Seed a few daily context entries
    const contexts = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      contexts.push({
        user_id: userId,
        date: d.toISOString().split("T")[0],
        sleep_quality: 3 + Math.floor(Math.random() * 3),
        energy_level: 3 + Math.floor(Math.random() * 3),
      });
    }
    await supabase.from("daily_context").insert(contexts);

    return new Response(
      JSON.stringify({
        success: true,
        user_id: userId,
        email: REVIEWER_EMAIL,
        password: REVIEWER_PASSWORD,
        goals_created: insertedGoals!.length,
        logs_created: logs.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Seed error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

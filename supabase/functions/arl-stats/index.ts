import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

Deno.serve(async (_req: Request) => {
  try {
    const { count: totalUsers } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
    const { count: newUsers30d } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", thirtyDaysAgo);

    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    const { count: activeUsers7d } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("updated_at", sevenDaysAgo);

    // Momentum tracks premium on profiles directly
    const { count: paidCount } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("is_premium", true);
    const paidUsers = paidCount || 0;

    return new Response(JSON.stringify({
      app_id: "momentum",
      total_users: totalUsers || 0,
      paid_users: paidUsers,
      free_users: (totalUsers || 0) - paidUsers,
      new_users_30d: newUsers30d || 0,
      active_users_7d: activeUsers7d || 0,
    }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

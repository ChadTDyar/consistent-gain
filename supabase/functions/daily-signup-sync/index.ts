import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const DEST = "https://skaeklayghuqwakrbemy.supabase.co/functions/v1/sync-app-metrics";

Deno.serve(async (_req) => {
  try {
    const { count: total } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count: today } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", since);

    const payload = {
      app_name: "Momentum",
      total_users: total ?? 0,
      signups_today: today ?? 0,
      synced_at: new Date().toISOString(),
    };

    const secret = Deno.env.get("AGENT_SHARED_SECRET") ?? "";
    const res = await fetch(DEST, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    console.log("sync-app-metrics response", res.status, text);

    return new Response(
      JSON.stringify({ ok: res.ok, status: res.status, payload }),
      { headers: { "Content-Type": "application/json" }, status: res.ok ? 200 : 502 },
    );
  } catch (err) {
    console.error("daily-signup-sync error", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
